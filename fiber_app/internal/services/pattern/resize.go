package pattern

import (
	"math"

	"github.com/savan/stitch-api/internal/models"
)

// ResizeResult holds a single adjusted stitch or row count.
type ResizeResult struct {
	Label       string  `json:"label"`        // e.g. "Cast on", "Row 1"
	Original    int     `json:"original"`
	Adjusted    int     `json:"adjusted"`
	RepeatSize  int     `json:"repeat_size"`  // 0 if no stitch repeat detected
	Note        string  `json:"note,omitempty"`
}

// GaugeRatio calculates the stitch ratio and row ratio from SizeParams.
// Returns (stitchRatio, rowRatio).
func GaugeRatio(p *models.SizeParams) (float64, float64) {
	var stRatio, rowRatio float64

	if p.PatternGaugeSt > 0 {
		stRatio = p.UserGaugeSt / p.PatternGaugeSt
	} else {
		stRatio = 1.0
	}

	if p.PatternGaugeRow > 0 {
		rowRatio = p.UserGaugeRow / p.PatternGaugeRow
	} else {
		rowRatio = 1.0
	}

	return stRatio, rowRatio
}

// AdjustStitchCount scales a stitch count by the gauge ratio and rounds to
// the nearest multiple of repeatSize (if repeatSize > 0).
// Plus stitches (e.g. selvedge, turning chains) are preserved separately.
func AdjustStitchCount(original int, ratio float64, repeatSize int, plusStitches int) ResizeResult {
	// Scale the working stitches (excluding plus stitches)
	workingOriginal := original - plusStitches
	scaled := float64(workingOriginal) * ratio

	var adjusted int
	var note string

	if repeatSize > 0 {
		// Round to nearest repeat
		adjusted = roundToRepeat(scaled, repeatSize)
		note = roundingNote(workingOriginal, adjusted, repeatSize)
	} else {
		adjusted = int(math.Round(scaled))
	}

	// Enforce minimum of 1
	if adjusted < 1 {
		adjusted = 1
	}

	return ResizeResult{
		Original:   original,
		Adjusted:   adjusted + plusStitches,
		RepeatSize: repeatSize,
		Note:       note,
	}
}

// roundToRepeat rounds n to the nearest multiple of repeat.
func roundToRepeat(n float64, repeat int) int {
	r := float64(repeat)
	return int(math.Round(n/r) * r)
}

func roundingNote(original, adjusted, repeat int) string {
	if original == adjusted {
		return ""
	}
	if adjusted > original {
		return "rounded up to maintain stitch repeat"
	}
	return "rounded down to maintain stitch repeat"
}

// TODO: Phase 2 — the user will walk through the full pattern parsing logic.
// This file will be expanded to handle:
//   - Section-by-section parsing (cast on, body rows, shaping rows, etc.)
//   - Detecting stitch repeats from pattern notation: e.g. *sc, ch2* repeat
//   - Ease adjustments
//   - Graded sizing (pattern lists multiple sizes inline)
