package models

import "time"

type Tutorial struct {
	ID            string    `json:"id" db:"id"`
	YoutubeID     string    `json:"youtube_id" db:"youtube_id"`
	Title         string    `json:"title" db:"title"`
	Description   *string   `json:"description,omitempty" db:"description"`
	TechniqueTags []string  `json:"technique_tags" db:"technique_tags"`
	CraftType     string    `json:"craft_type" db:"craft_type"`
	Difficulty    string    `json:"difficulty" db:"difficulty"`
	PremiumOnly   bool      `json:"premium_only" db:"premium_only"`
	Approved      bool      `json:"approved" db:"approved"`
	SubmittedBy   *string   `json:"submitted_by,omitempty" db:"submitted_by"`
	CreatedAt     time.Time `json:"created_at" db:"created_at"`

	// Derived — not stored
	YoutubeURL      string `json:"youtube_url"`
	YoutubeThumbnail string `json:"youtube_thumbnail"`
}

func (t *Tutorial) PopulateDerived() {
	t.YoutubeURL = "https://www.youtube.com/watch?v=" + t.YoutubeID
	t.YoutubeThumbnail = "https://img.youtube.com/vi/" + t.YoutubeID + "/mqdefault.jpg"
}

type Tip struct {
	ID              string   `json:"id" db:"id"`
	Body            string   `json:"body" db:"body"`
	TriggerKeywords []string `json:"trigger_keywords" db:"trigger_keywords"`
	CraftType       string   `json:"craft_type" db:"craft_type"`
	PremiumOnly     bool     `json:"premium_only" db:"premium_only"`
	Category        string   `json:"category" db:"category"`
}
