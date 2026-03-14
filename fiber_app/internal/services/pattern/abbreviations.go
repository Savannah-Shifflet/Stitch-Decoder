package pattern

import (
	"context"
	"regexp"
	"strings"

	"github.com/jackc/pgx/v5"
	"github.com/savan/stitch-api/internal/db"
	"github.com/savan/stitch-api/internal/models"
)

// wordBoundary wraps a term in a case-insensitive word-boundary regex.
func wordBoundary(term string) *regexp.Regexp {
	escaped := regexp.QuoteMeta(term)
	return regexp.MustCompile(`(?i)\b` + escaped + `\b`)
}

// ExpandResult holds an abbreviation match found in pattern text.
type ExpandResult struct {
	Term      string `json:"term"`
	Expansion string `json:"expansion"`
	Category  string `json:"category"`
}

// ExpandAbbreviations scans rawText and returns all recognized abbreviations found.
// It loads the global glossary + user-specific overrides from the DB.
// Unknown terms can be sent to Claude Haiku as a fallback (see ExpandUnknown).
func ExpandAbbreviations(ctx context.Context, rawText, userID, region string) ([]ExpandResult, error) {
	glossary, err := loadGlossary(ctx, userID, region)
	if err != nil {
		return nil, err
	}

	seen := map[string]bool{}
	var results []ExpandResult

	for _, abbr := range glossary {
		re := wordBoundary(abbr.Term)
		if re.MatchString(rawText) {
			key := strings.ToLower(abbr.Term)
			if !seen[key] {
				seen[key] = true
				results = append(results, ExpandResult{
					Term:      abbr.Term,
					Expansion: abbr.Expansion,
					Category:  abbr.Category,
				})
			}
		}
	}

	return results, nil
}

func loadGlossary(ctx context.Context, userID, region string) ([]models.Abbreviation, error) {
	rows, err := db.Pool.Query(ctx, `
		SELECT id, term, expansion, category, region, is_global, user_id
		FROM abbreviations
		WHERE is_global = TRUE
		  AND (region = $1 OR region = 'both')
		UNION ALL
		SELECT id, term, expansion, category, region, is_global, user_id
		FROM abbreviations
		WHERE user_id = $2
		ORDER BY term
	`, region, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	return pgx.CollectRows(rows, pgx.RowToStructByName[models.Abbreviation])
}
