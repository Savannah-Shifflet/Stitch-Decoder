-- Migration 001: Initial schema
-- Run in Supabase SQL editor or via migration tool

-- ─────────────────────────────────────────────
-- PROFILES (extends Supabase auth.users)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE,
    subscription_tier TEXT NOT NULL DEFAULT 'free' CHECK (subscription_tier IN ('free', 'premium')),
    ravelry_access_token TEXT,    -- AES-encrypted
    ravelry_username TEXT,
    craft_preference TEXT CHECK (craft_preference IN ('crochet', 'knitting', 'both')),
    skill_level TEXT CHECK (skill_level IN ('beginner', 'intermediate', 'advanced')),
    revenuecat_customer_id TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id)
    VALUES (NEW.id)
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ─────────────────────────────────────────────
-- PATTERNS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS patterns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL DEFAULT 'Untitled Pattern',
    raw_text TEXT,
    processed_json JSONB,
    size_params JSONB,
    content_hash TEXT,
    source TEXT NOT NULL DEFAULT 'manual' CHECK (source IN ('manual', 'ravelry', 'ocr')),
    ravelry_pattern_id TEXT,
    region TEXT NOT NULL DEFAULT 'us' CHECK (region IN ('us', 'uk')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS patterns_user_id_idx ON patterns(user_id);
CREATE INDEX IF NOT EXISTS patterns_content_hash_idx ON patterns(content_hash);

-- ─────────────────────────────────────────────
-- USER PROJECTS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    pattern_id UUID REFERENCES patterns(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'in_progress', 'completed')),
    notes TEXT,
    ravelry_project_id TEXT,
    progress_row INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS user_projects_user_id_idx ON user_projects(user_id);

-- ─────────────────────────────────────────────
-- ABBREVIATIONS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS abbreviations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    term TEXT NOT NULL,
    expansion TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'both' CHECK (category IN ('crochet', 'knitting', 'both')),
    region TEXT NOT NULL DEFAULT 'us' CHECK (region IN ('us', 'uk', 'both')),
    is_global BOOLEAN NOT NULL DEFAULT TRUE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(term, region, user_id)
);

CREATE INDEX IF NOT EXISTS abbreviations_term_idx ON abbreviations(LOWER(term));
CREATE INDEX IF NOT EXISTS abbreviations_global_idx ON abbreviations(is_global) WHERE is_global = TRUE;

-- ─────────────────────────────────────────────
-- TUTORIALS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tutorials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    youtube_id TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    description TEXT,
    technique_tags TEXT[] NOT NULL DEFAULT '{}',
    craft_type TEXT NOT NULL DEFAULT 'both' CHECK (craft_type IN ('crochet', 'knitting', 'both')),
    difficulty TEXT NOT NULL DEFAULT 'beginner' CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
    premium_only BOOLEAN NOT NULL DEFAULT FALSE,
    approved BOOLEAN NOT NULL DEFAULT FALSE,
    submitted_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS tutorials_craft_type_idx ON tutorials(craft_type);
CREATE INDEX IF NOT EXISTS tutorials_difficulty_idx ON tutorials(difficulty);
CREATE INDEX IF NOT EXISTS tutorials_approved_idx ON tutorials(approved) WHERE approved = TRUE;
CREATE INDEX IF NOT EXISTS tutorials_tags_idx ON tutorials USING GIN(technique_tags);

-- ─────────────────────────────────────────────
-- TIPS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS tips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    body TEXT NOT NULL,
    trigger_keywords TEXT[] NOT NULL DEFAULT '{}',
    craft_type TEXT NOT NULL DEFAULT 'both' CHECK (craft_type IN ('crochet', 'knitting', 'both')),
    premium_only BOOLEAN NOT NULL DEFAULT FALSE,
    category TEXT NOT NULL DEFAULT 'technique' CHECK (category IN ('technique', 'yarn', 'tools', 'finishing')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS tips_keywords_idx ON tips USING GIN(trigger_keywords);

-- ─────────────────────────────────────────────
-- YARN WEIGHTS
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS yarn_weights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    sort_order INT NOT NULL,
    wpi_min INT,
    wpi_max INT,
    typical_gauge_st_4in_min NUMERIC,
    typical_gauge_st_4in_max NUMERIC,
    needle_size_us_min TEXT,
    needle_size_us_max TEXT,
    hook_size_mm_min NUMERIC,
    hook_size_mm_max NUMERIC
);

-- ─────────────────────────────────────────────
-- updated_at triggers
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER patterns_updated_at BEFORE UPDATE ON patterns
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER user_projects_updated_at BEFORE UPDATE ON user_projects
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
