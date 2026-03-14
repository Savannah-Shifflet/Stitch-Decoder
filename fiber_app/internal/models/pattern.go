package models

import (
	"encoding/json"
	"time"
)

type PatternSource string
type PatternRegion string

const (
	SourceManual  PatternSource = "manual"
	SourceRavelry PatternSource = "ravelry"
	SourceOCR     PatternSource = "ocr"

	RegionUS PatternRegion = "us"
	RegionUK PatternRegion = "uk"
)

// SizeParams holds gauge and sizing information for pattern resizing.
// All gauge values are stitches or rows per 4 inches (standard gauge measurement).
type SizeParams struct {
	OriginalSize  string  `json:"original_size"`            // e.g. "Medium (M)"
	TargetSize    string  `json:"target_size"`              // e.g. "Large (L)"
	PatternGaugeSt float64 `json:"pattern_gauge_st"`        // stitches per 4in from pattern
	PatternGaugeRow float64 `json:"pattern_gauge_row"`       // rows per 4in from pattern
	UserGaugeSt   float64  `json:"user_gauge_st"`           // stitches per 4in from user's swatch
	UserGaugeRow  float64  `json:"user_gauge_row"`          // rows per 4in from user's swatch
}

type Pattern struct {
	ID               string          `json:"id" db:"id"`
	UserID           string          `json:"user_id" db:"user_id"`
	Title            string          `json:"title" db:"title"`
	RawText          *string         `json:"raw_text,omitempty" db:"raw_text"`
	ProcessedJSON    json.RawMessage `json:"processed_json,omitempty" db:"processed_json"`
	SizeParams       *SizeParams     `json:"size_params,omitempty" db:"size_params"`
	ContentHash      *string         `json:"-" db:"content_hash"`
	Source           PatternSource   `json:"source" db:"source"`
	RavelryPatternID *string         `json:"ravelry_pattern_id,omitempty" db:"ravelry_pattern_id"`
	Region           PatternRegion   `json:"region" db:"region"`
	CreatedAt        time.Time       `json:"created_at" db:"created_at"`
	UpdatedAt        time.Time       `json:"updated_at" db:"updated_at"`
}

type Abbreviation struct {
	ID        string  `json:"id" db:"id"`
	Term      string  `json:"term" db:"term"`
	Expansion string  `json:"expansion" db:"expansion"`
	Category  string  `json:"category" db:"category"`
	Region    string  `json:"region" db:"region"`
	IsGlobal  bool    `json:"is_global" db:"is_global"`
	UserID    *string `json:"user_id,omitempty" db:"user_id"`
}
