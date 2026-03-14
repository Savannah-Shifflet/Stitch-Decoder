package handlers

import (
	"crypto/sha256"
	"fmt"

	"github.com/gofiber/fiber/v2"
	"github.com/savan/stitch-api/internal/db"
	"github.com/savan/stitch-api/internal/middleware"
	"github.com/savan/stitch-api/internal/models"
	patternSvc "github.com/savan/stitch-api/internal/services/pattern"
)

type ParseRequest struct {
	Title  string `json:"title"`
	Text   string `json:"text" validate:"required"`
	Region string `json:"region"` // "us" | "uk" — defaults to "us"
}

type ParseResponse struct {
	Pattern       *models.Pattern            `json:"pattern"`
	Abbreviations []patternSvc.ExpandResult  `json:"abbreviations"`
}

// POST /patterns/parse
func ParsePattern(c *fiber.Ctx) error {
	userID := middleware.UserID(c)

	var req ParseRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid request body"})
	}
	if req.Text == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "text is required"})
	}
	if req.Region == "" {
		req.Region = "us"
	}
	if req.Title == "" {
		req.Title = "Untitled Pattern"
	}

	// Hash the raw text for dedup/cache keying
	hash := fmt.Sprintf("%x", sha256.Sum256([]byte(req.Text)))

	// Expand abbreviations
	abbrs, err := patternSvc.ExpandAbbreviations(c.Context(), req.Text, userID, req.Region)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to expand abbreviations"})
	}

	// Persist pattern
	var patternID string
	err = db.Pool.QueryRow(c.Context(), `
		INSERT INTO patterns (user_id, title, raw_text, content_hash, source, region)
		VALUES ($1, $2, $3, $4, 'manual', $5)
		RETURNING id
	`, userID, req.Title, req.Text, hash, req.Region).Scan(&patternID)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to save pattern"})
	}

	pattern := &models.Pattern{
		ID:     patternID,
		UserID: userID,
		Title:  req.Title,
		Source: models.SourceManual,
		Region: models.PatternRegion(req.Region),
	}

	return c.Status(fiber.StatusCreated).JSON(ParseResponse{
		Pattern:       pattern,
		Abbreviations: abbrs,
	})
}

type ResizeRequest struct {
	PatternID  string             `json:"pattern_id" validate:"required"`
	SizeParams models.SizeParams  `json:"size_params" validate:"required"`
}

// POST /patterns/resize
func ResizePattern(c *fiber.Ctx) error {
	// TODO: Phase 2 — implement after walking through sizing math with user
	// Will call patternSvc.AdjustStitchCount() section by section
	return c.Status(fiber.StatusNotImplemented).JSON(fiber.Map{
		"error": "pattern resize not yet implemented — coming in Phase 2",
	})
}

// GET /patterns/:id
func GetPattern(c *fiber.Ctx) error {
	userID := middleware.UserID(c)
	patternID := c.Params("id")

	var p models.Pattern
	err := db.Pool.QueryRow(c.Context(), `
		SELECT id, user_id, title, raw_text, processed_json, size_params,
		       content_hash, source, ravelry_pattern_id, region, created_at, updated_at
		FROM patterns
		WHERE id = $1 AND user_id = $2
	`, patternID, userID).Scan(
		&p.ID, &p.UserID, &p.Title, &p.RawText, &p.ProcessedJSON, &p.SizeParams,
		&p.ContentHash, &p.Source, &p.RavelryPatternID, &p.Region, &p.CreatedAt, &p.UpdatedAt,
	)
	if err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "pattern not found"})
	}

	return c.JSON(p)
}

// DELETE /patterns/:id
func DeletePattern(c *fiber.Ctx) error {
	userID := middleware.UserID(c)
	patternID := c.Params("id")

	result, err := db.Pool.Exec(c.Context(), `
		DELETE FROM patterns WHERE id = $1 AND user_id = $2
	`, patternID, userID)
	if err != nil || result.RowsAffected() == 0 {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "pattern not found"})
	}

	return c.SendStatus(fiber.StatusNoContent)
}
