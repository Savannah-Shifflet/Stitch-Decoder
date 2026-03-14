package handlers

import (
	"github.com/gofiber/fiber/v2"
)

// POST /export/pdf/:pattern_id
// TODO: Phase 5 — implement PDF generation with gofpdf
// Will: fetch pattern, generate PDF, upload to Supabase Storage, return signed URL
// Free users get watermarked PDF; premium users get clean export
func ExportPDF(c *fiber.Ctx) error {
	return c.Status(fiber.StatusNotImplemented).JSON(fiber.Map{
		"error": "PDF export not yet implemented — coming in Phase 5",
	})
}
