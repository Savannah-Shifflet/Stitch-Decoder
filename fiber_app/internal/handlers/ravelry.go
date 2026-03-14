package handlers

import (
	"github.com/gofiber/fiber/v2"
)

// GET /ravelry/favorites
// TODO: Phase 6 — proxy authenticated Ravelry API calls using stored token
func RavelryFavorites(c *fiber.Ctx) error {
	return c.Status(fiber.StatusNotImplemented).JSON(fiber.Map{
		"error": "Ravelry integration not yet implemented — coming in Phase 6",
	})
}

// GET /ravelry/projects
func RavelryProjects(c *fiber.Ctx) error {
	return c.Status(fiber.StatusNotImplemented).JSON(fiber.Map{
		"error": "Ravelry integration not yet implemented — coming in Phase 6",
	})
}

// GET /ravelry/stash
func RavelryStash(c *fiber.Ctx) error {
	return c.Status(fiber.StatusNotImplemented).JSON(fiber.Map{
		"error": "Ravelry integration not yet implemented — coming in Phase 6",
	})
}

// POST /auth/ravelry/oauth/init
func RavelryOAuthInit(c *fiber.Ctx) error {
	return c.Status(fiber.StatusNotImplemented).JSON(fiber.Map{
		"error": "Ravelry OAuth not yet implemented — coming in Phase 6",
	})
}

// POST /auth/ravelry/oauth/callback
func RavelryOAuthCallback(c *fiber.Ctx) error {
	return c.Status(fiber.StatusNotImplemented).JSON(fiber.Map{
		"error": "Ravelry OAuth not yet implemented — coming in Phase 6",
	})
}
