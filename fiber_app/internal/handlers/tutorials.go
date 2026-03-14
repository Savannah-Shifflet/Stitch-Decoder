package handlers

import (
	"fmt"

	"github.com/gofiber/fiber/v2"
	"github.com/jackc/pgx/v5"
	"github.com/savan/stitch-api/internal/db"
	"github.com/savan/stitch-api/internal/middleware"
	"github.com/savan/stitch-api/internal/models"
)

// GET /tutorials?craft_type=crochet&difficulty=beginner&tag=sc
func ListTutorials(c *fiber.Ctx) error {
	craftType := c.Query("craft_type")
	difficulty := c.Query("difficulty")
	tag := c.Query("tag")

	query := `
		SELECT id, youtube_id, title, description, technique_tags,
		       craft_type, difficulty, premium_only, approved, submitted_by, created_at
		FROM tutorials
		WHERE approved = TRUE
	`
	args := []interface{}{}
	argIdx := 1

	if craftType != "" {
		query += ` AND (craft_type = $` + itoa(argIdx) + ` OR craft_type = 'both')`
		args = append(args, craftType)
		argIdx++
	}
	if difficulty != "" {
		query += ` AND difficulty = $` + itoa(argIdx)
		args = append(args, difficulty)
		argIdx++
	}
	if tag != "" {
		query += ` AND $` + itoa(argIdx) + ` = ANY(technique_tags)`
		args = append(args, tag)
		argIdx++
	}

	// Premium filter handled via RLS — the DB policy restricts what rows are visible
	query += ` ORDER BY created_at DESC LIMIT 100`

	rows, err := db.Pool.Query(c.Context(), query, args...)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to fetch tutorials"})
	}
	defer rows.Close()

	tutorials, err := pgx.CollectRows(rows, pgx.RowToStructByName[models.Tutorial])
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to scan tutorials"})
	}

	for i := range tutorials {
		tutorials[i].PopulateDerived()
	}

	return c.JSON(fiber.Map{"tutorials": tutorials})
}

// GET /tutorials/search?q=slip+stitch
func SearchTutorials(c *fiber.Ctx) error {
	q := c.Query("q")
	if q == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "q is required"})
	}

	rows, err := db.Pool.Query(c.Context(), `
		SELECT id, youtube_id, title, description, technique_tags,
		       craft_type, difficulty, premium_only, approved, submitted_by, created_at
		FROM tutorials
		WHERE approved = TRUE
		  AND (
		    title ILIKE $1
		    OR description ILIKE $1
		    OR EXISTS (
		      SELECT 1 FROM UNNEST(technique_tags) t WHERE t ILIKE $1
		    )
		  )
		ORDER BY created_at DESC
		LIMIT 50
	`, "%"+q+"%")
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "search failed"})
	}
	defer rows.Close()

	tutorials, err := pgx.CollectRows(rows, pgx.RowToStructByName[models.Tutorial])
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to scan tutorials"})
	}

	for i := range tutorials {
		tutorials[i].PopulateDerived()
	}

	return c.JSON(fiber.Map{"tutorials": tutorials})
}

type SuggestTutorialRequest struct {
	YoutubeID     string   `json:"youtube_id" validate:"required"`
	Title         string   `json:"title" validate:"required"`
	Description   string   `json:"description"`
	TechniqueTags []string `json:"technique_tags"`
	CraftType     string   `json:"craft_type"`
	Difficulty    string   `json:"difficulty"`
}

// POST /tutorials/suggest — premium users only
func SuggestTutorial(c *fiber.Ctx) error {
	userID := middleware.UserID(c)

	var req SuggestTutorialRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid request body"})
	}
	if req.YoutubeID == "" || req.Title == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "youtube_id and title are required"})
	}
	if req.CraftType == "" {
		req.CraftType = "both"
	}
	if req.Difficulty == "" {
		req.Difficulty = "beginner"
	}

	var id string
	err := db.Pool.QueryRow(c.Context(), `
		INSERT INTO tutorials (youtube_id, title, description, technique_tags, craft_type, difficulty, submitted_by, approved)
		VALUES ($1, $2, $3, $4, $5, $6, $7, FALSE)
		RETURNING id
	`, req.YoutubeID, req.Title, req.Description, req.TechniqueTags, req.CraftType, req.Difficulty, userID).Scan(&id)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "failed to submit tutorial"})
	}

	return c.Status(fiber.StatusCreated).JSON(fiber.Map{
		"id":      id,
		"message": "tutorial submitted for review, thank you!",
	})
}

func itoa(n int) string {
	return fmt.Sprintf("%d", n)
}
