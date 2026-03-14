package handlers

import (
	"github.com/gofiber/fiber/v2"
	tipsSvc "github.com/savan/stitch-api/internal/services/tips"
)

type TipsMatchRequest struct {
	PatternText string `json:"pattern_text" validate:"required"`
	CraftType   string `json:"craft_type"` // crochet | knitting
}

// POST /tips/match
func MatchTips(c *fiber.Ctx) error {
	var req TipsMatchRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid request body"})
	}
	if req.PatternText == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "pattern_text is required"})
	}
	if req.CraftType == "" {
		req.CraftType = "both"
	}

	isPremium, _ := c.Locals("subscriptionTier").(string)

	tips, err := tipsSvc.Match(c.Context(), req.PatternText, req.CraftType, isPremium == "premium")
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to match tips"})
	}

	return c.JSON(fiber.Map{"tips": tips})
}
