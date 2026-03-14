package main

import (
	"context"
	"log"
	"os"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"
	"github.com/joho/godotenv"

	"github.com/savan/stitch-api/internal/db"
	"github.com/savan/stitch-api/internal/handlers"
	"github.com/savan/stitch-api/internal/middleware"
)

func main() {
	// Load .env in development
	if os.Getenv("ENV") != "production" {
		if err := godotenv.Load(); err != nil {
			log.Println("No .env file found, using environment variables")
		}
	}

	// Use a background context for long-lived services (JWKS auto-refresh, DB pool)
	bgCtx := context.Background()

	// Initialize JWKS client — fetches Supabase's public JWT signing keys
	if err := middleware.InitJWKS(bgCtx); err != nil {
		log.Fatalf("JWKS initialization failed: %v", err)
	}
	log.Println("✓ JWKS client initialized")

	// Connect to database
	dbCtx, cancel := context.WithTimeout(bgCtx, 10*time.Second)
	defer cancel()

	if err := db.Connect(dbCtx); err != nil {
		log.Fatalf("Database connection failed: %v", err)
	}
	defer db.Close()
	log.Println("✓ Database connected")

	// Create Fiber app
	app := fiber.New(fiber.Config{
		AppName:      "Stitch API v0.1",
		ReadTimeout:  30 * time.Second,
		WriteTimeout: 30 * time.Second,
		ErrorHandler: func(c *fiber.Ctx, err error) error {
			code := fiber.StatusInternalServerError
			if e, ok := err.(*fiber.Error); ok {
				code = e.Code
			}
			return c.Status(code).JSON(fiber.Map{"error": err.Error()})
		},
	})

	// Global middleware
	app.Use(recover.New())
	app.Use(logger.New(logger.Config{
		Format: "[${time}] ${status} ${method} ${path} (${latency})\n",
	}))
	app.Use(cors.New(cors.Config{
		AllowOrigins: "*", // Tighten in production
		AllowHeaders: "Origin, Content-Type, Accept, Authorization",
	}))

	// Health check
	app.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{"status": "ok", "service": "stitch-api"})
	})

	// ── Auth routes ────────────────────────────────────────────────
	auth := app.Group("/auth")
	auth.Post("/ravelry/oauth/init", middleware.RequireAuth(), handlers.RavelryOAuthInit)
	auth.Post("/ravelry/oauth/callback", middleware.RequireAuth(), handlers.RavelryOAuthCallback)

	// ── Pattern routes ─────────────────────────────────────────────
	patterns := app.Group("/patterns", middleware.RequireAuth())
	patterns.Post("/parse", handlers.ParsePattern)
	patterns.Post("/resize", handlers.ResizePattern)
	patterns.Get("/:id", handlers.GetPattern)
	patterns.Delete("/:id", handlers.DeletePattern)

	// ── Tutorial routes ────────────────────────────────────────────
	tutorials := app.Group("/tutorials", middleware.RequireAuth())
	tutorials.Get("/", handlers.ListTutorials)
	tutorials.Get("/search", handlers.SearchTutorials)
	tutorials.Post("/suggest", middleware.RequirePremium(), handlers.SuggestTutorial)

	// ── Tips routes ────────────────────────────────────────────────
	app.Post("/tips/match", middleware.RequireAuth(), handlers.MatchTips)

	// ── Export routes ──────────────────────────────────────────────
	app.Post("/export/pdf/:pattern_id", middleware.RequireAuth(), handlers.ExportPDF)

	// ── Ravelry proxy ──────────────────────────────────────────────
	ravelry := app.Group("/ravelry", middleware.RequireAuth())
	ravelry.Get("/favorites", handlers.RavelryFavorites)
	ravelry.Get("/projects", handlers.RavelryProjects)
	ravelry.Get("/stash", handlers.RavelryStash)

	// ── Webhooks (no auth — verified by signature) ─────────────────
	app.Post("/webhooks/revenuecat", handlers.RevenueCatWebhook)

	// Start server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	log.Printf("✓ Server starting on :%s", port)
	if err := app.Listen(":" + port); err != nil {
		log.Fatalf("Server failed: %v", err)
	}
}
