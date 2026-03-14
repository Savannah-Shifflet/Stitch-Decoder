package handlers

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"os"

	"github.com/gofiber/fiber/v2"
	"github.com/savan/stitch-api/internal/db"
)

// RevenueCat webhook event types we care about
const (
	rcEventInitialPurchase   = "INITIAL_PURCHASE"
	rcEventRenewal           = "RENEWAL"
	rcEventCancellation      = "CANCELLATION"
	rcEventExpiration        = "EXPIRATION"
	rcEventProductChange     = "PRODUCT_CHANGE"
	rcEventBillingIssue      = "BILLING_ISSUE"
)

type rcWebhookPayload struct {
	Event struct {
		Type           string `json:"type"`
		AppUserID      string `json:"app_user_id"`       // our user UUID
		ProductID      string `json:"product_id"`
		ExpirationAt   *int64 `json:"expiration_at_ms"`
	} `json:"event"`
}

// POST /webhooks/revenuecat
func RevenueCatWebhook(c *fiber.Ctx) error {
	// Verify webhook signature
	secret := os.Getenv("REVENUECAT_WEBHOOK_SECRET")
	if secret != "" {
		sig := c.Get("X-RevenueCat-Signature")
		if !verifyRevenueCatSig(c.Body(), secret, sig) {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "invalid signature"})
		}
	}

	var payload rcWebhookPayload
	if err := c.BodyParser(&payload); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid payload"})
	}

	userID := payload.Event.AppUserID
	if userID == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "missing app_user_id"})
	}

	switch payload.Event.Type {
	case rcEventInitialPurchase, rcEventRenewal, rcEventProductChange:
		// Grant premium
		_, err := db.Pool.Exec(c.Context(), `
			UPDATE profiles SET subscription_tier = 'premium', updated_at = NOW()
			WHERE id = $1
		`, userID)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to update subscription"})
		}

	case rcEventCancellation, rcEventExpiration, rcEventBillingIssue:
		// Downgrade to free
		_, err := db.Pool.Exec(c.Context(), `
			UPDATE profiles SET subscription_tier = 'free', updated_at = NOW()
			WHERE id = $1
		`, userID)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to update subscription"})
		}
	}

	return c.SendStatus(fiber.StatusOK)
}

func verifyRevenueCatSig(body []byte, secret, signature string) bool {
	mac := hmac.New(sha256.New, []byte(secret))
	mac.Write(body)
	expected := hex.EncodeToString(mac.Sum(nil))
	return hmac.Equal([]byte(expected), []byte(signature))
}
