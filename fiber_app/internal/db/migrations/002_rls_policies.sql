-- Migration 002: Row Level Security policies
-- Users can only access their own data; global content is readable by all authenticated users

-- ─────────────────────────────────────────────
-- Enable RLS
-- ─────────────────────────────────────────────
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE abbreviations ENABLE ROW LEVEL SECURITY;
ALTER TABLE tutorials ENABLE ROW LEVEL SECURITY;
ALTER TABLE tips ENABLE ROW LEVEL SECURITY;
ALTER TABLE yarn_weights ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────
-- PROFILES
-- ─────────────────────────────────────────────
CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE USING (auth.uid() = id);

-- ─────────────────────────────────────────────
-- PATTERNS
-- ─────────────────────────────────────────────
CREATE POLICY "Users can CRUD own patterns"
    ON patterns FOR ALL USING (auth.uid() = user_id);

-- ─────────────────────────────────────────────
-- USER PROJECTS
-- ─────────────────────────────────────────────
CREATE POLICY "Users can CRUD own projects"
    ON user_projects FOR ALL USING (auth.uid() = user_id);

-- ─────────────────────────────────────────────
-- ABBREVIATIONS
-- ─────────────────────────────────────────────
-- Everyone can read global abbreviations
CREATE POLICY "Read global abbreviations"
    ON abbreviations FOR SELECT USING (is_global = TRUE);

-- Users can CRUD their own custom abbreviations
CREATE POLICY "Users can CRUD own abbreviations"
    ON abbreviations FOR ALL USING (auth.uid() = user_id);

-- ─────────────────────────────────────────────
-- TUTORIALS
-- ─────────────────────────────────────────────
-- Approved free tutorials visible to all authenticated users
CREATE POLICY "Read approved free tutorials"
    ON tutorials FOR SELECT
    USING (approved = TRUE AND premium_only = FALSE);

-- Approved premium tutorials visible to premium users
-- (subscription_tier check handled in app layer via JWT claims or profile lookup)
CREATE POLICY "Read approved premium tutorials"
    ON tutorials FOR SELECT
    USING (
        approved = TRUE
        AND premium_only = TRUE
        AND EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND subscription_tier = 'premium'
        )
    );

-- Premium users can submit tutorials (approved = false by default)
CREATE POLICY "Premium users can submit tutorials"
    ON tutorials FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND subscription_tier = 'premium'
        )
    );

-- ─────────────────────────────────────────────
-- TIPS
-- ─────────────────────────────────────────────
CREATE POLICY "Read free tips"
    ON tips FOR SELECT USING (premium_only = FALSE);

CREATE POLICY "Read premium tips"
    ON tips FOR SELECT
    USING (
        premium_only = TRUE
        AND EXISTS (
            SELECT 1 FROM profiles
            WHERE id = auth.uid() AND subscription_tier = 'premium'
        )
    );

-- ─────────────────────────────────────────────
-- YARN WEIGHTS (read-only reference data)
-- ─────────────────────────────────────────────
CREATE POLICY "Anyone can read yarn weights"
    ON yarn_weights FOR SELECT USING (TRUE);
