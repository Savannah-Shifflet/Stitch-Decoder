package models

import "time"

type SubscriptionTier string

const (
	TierFree    SubscriptionTier = "free"
	TierPremium SubscriptionTier = "premium"
)

type Profile struct {
	ID                  string           `json:"id" db:"id"`
	Username            *string          `json:"username" db:"username"`
	SubscriptionTier    SubscriptionTier `json:"subscription_tier" db:"subscription_tier"`
	RavelyAccessToken   *string          `json:"-" db:"ravelry_access_token"` // never serialized
	RavelryUsername     *string          `json:"ravelry_username" db:"ravelry_username"`
	CraftPreference     *string          `json:"craft_preference" db:"craft_preference"`
	SkillLevel          *string          `json:"skill_level" db:"skill_level"`
	RevenueCatCustomerID *string         `json:"revenuecat_customer_id,omitempty" db:"revenuecat_customer_id"`
	CreatedAt           time.Time        `json:"created_at" db:"created_at"`
	UpdatedAt           time.Time        `json:"updated_at" db:"updated_at"`
}

func (p *Profile) IsPremium() bool {
	return p.SubscriptionTier == TierPremium
}
