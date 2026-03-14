package tips

import (
	"context"
	"strings"

	"github.com/jackc/pgx/v5"
	"github.com/savan/stitch-api/internal/db"
	"github.com/savan/stitch-api/internal/models"
)

// Match scans patternText and returns tips whose trigger_keywords appear in the text.
// isPremium determines whether premium-only tips are included.
func Match(ctx context.Context, patternText string, craftType string, isPremium bool) ([]models.Tip, error) {
	lower := strings.ToLower(patternText)

	rows, err := db.Pool.Query(ctx, `
		SELECT id, body, trigger_keywords, craft_type, premium_only, category
		FROM tips
		WHERE (craft_type = $1 OR craft_type = 'both')
		  AND ($2 = TRUE OR premium_only = FALSE)
	`, craftType, isPremium)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	allTips, err := pgx.CollectRows(rows, pgx.RowToStructByName[models.Tip])
	if err != nil {
		return nil, err
	}

	var matched []models.Tip
	for _, tip := range allTips {
		if keywordMatch(lower, tip.TriggerKeywords) {
			matched = append(matched, tip)
		}
	}

	return matched, nil
}

// keywordMatch returns true if any keyword from the list appears in text.
func keywordMatch(text string, keywords []string) bool {
	for _, kw := range keywords {
		if strings.Contains(text, strings.ToLower(kw)) {
			return true
		}
	}
	return false
}
