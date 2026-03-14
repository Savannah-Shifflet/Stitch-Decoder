package middleware

import (
	"context"
	"fmt"
	"os"
	"strings"
	"time"

	"github.com/MicahParks/keyfunc/v3"
	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
)

// jwks is the shared JWKS client, initialized once at startup via InitJWKS.
var jwks keyfunc.Keyfunc

// Claims represents the JWT payload Supabase includes in user tokens.
type Claims struct {
	Sub   string `json:"sub"`   // user UUID
	Email string `json:"email"`
	Role  string `json:"role"`  // "authenticated" for logged-in users
	jwt.RegisteredClaims
}

// InitJWKS fetches Supabase's public signing keys and sets up auto-refresh.
// Call this once during server startup before any requests are handled.
func InitJWKS(ctx context.Context) error {
	supabaseURL := os.Getenv("SUPABASE_URL")
	if supabaseURL == "" {
		return fmt.Errorf("SUPABASE_URL is not set")
	}

	jwksURL := supabaseURL + "/auth/v1/.well-known/jwks.json"

	k, err := keyfunc.NewDefaultCtx(ctx, []string{jwksURL})
	if err != nil {
		return fmt.Errorf("failed to initialize JWKS client: %w", err)
	}

	jwks = k
	return nil
}

// RequireAuth validates the Supabase JWT using the JWKS public keys.
// Supports RS256 and ES256 (Supabase's asymmetric signing methods).
func RequireAuth() fiber.Handler {
	return func(c *fiber.Ctx) error {
		authHeader := c.Get("Authorization")
		if authHeader == "" || !strings.HasPrefix(authHeader, "Bearer ") {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "missing or invalid authorization header",
			})
		}

		tokenStr := strings.TrimPrefix(authHeader, "Bearer ")

		token, err := jwt.ParseWithClaims(tokenStr, &Claims{},
			jwks.Keyfunc,
			jwt.WithLeeway(30*time.Second),
		)
		if err != nil || !token.Valid {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "invalid or expired token",
			})
		}

		claims, ok := token.Claims.(*Claims)
		if !ok || claims.Sub == "" {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "invalid token claims",
			})
		}

		// Reject anonymous / service role tokens — require a real user session
		if claims.Role != "authenticated" {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
				"error": "user authentication required",
			})
		}

		c.Locals("userID", claims.Sub)
		return c.Next()
	}
}

// RequirePremium gates a route to premium subscribers only.
// Must be called after RequireAuth (relies on subscriptionTier local set by profile lookup).
func RequirePremium() fiber.Handler {
	return func(c *fiber.Ctx) error {
		tier, _ := c.Locals("subscriptionTier").(string)
		if tier != "premium" {
			return c.Status(fiber.StatusPaymentRequired).JSON(fiber.Map{
				"error":   "premium subscription required",
				"upgrade": true,
			})
		}
		return c.Next()
	}
}

// UserID extracts the authenticated user's UUID from fiber locals.
func UserID(c *fiber.Ctx) string {
	id, _ := c.Locals("userID").(string)
	return id
}
