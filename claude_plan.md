# Crochet & Knitting App — Execution Plan

## App Identity
- **Working Name:** TBD (options: Loopwise / Knitwise / StitchStack)
- **Platforms:** iOS + Android (simultaneous launch via Expo)
- **Model:** Freemium — free tier with ads, premium subscription ~$4.99/mo or $39.99/yr

---

## Confirmed Stack

| Layer | Technology | Notes |
|---|---|---|
| Mobile | React Native + Expo (managed workflow) | Single codebase iOS + Android |
| Navigation | Expo Router | File-based, deep linking |
| State | Zustand | Lightweight global state |
| UI | NativeWind (Tailwind for RN) | Design system, dark mode ready |
| Offline DB | WatermelonDB | SQLite-backed, syncs when online |
| Backend API | Go + Fiber | Hosted on Railway |
| Database | Supabase (PostgreSQL) | Auth, storage, real-time |
| Auth | Supabase Auth | Apple + Google OAuth + magic link |
| Cache | Upstash Redis | Serverless Redis, pattern cache |
| PDF Gen | gofpdf (Go library) | Server-side, stored in Supabase Storage |
| AI | Claude Haiku | Abbreviation fallback ONLY — NOT pattern sizing |
| Subscriptions | RevenueCat | iOS + Android subscription lifecycle |
| Ads | Google AdMob | Free tier monetization |
| Email | Resend | Transactional email |
| Analytics | PostHog | Product analytics + feature flags |
| Monitoring | Sentry | Error tracking |
| CDN | Cloudflare | Free, edge caching |

### Pattern Sizing: NOT AI
Pattern resizing is pure deterministic math based on gauge ratios.
User will walk through the exact logic during Phase 2 implementation.
Core concept: (user_gauge / pattern_gauge) x stitch_count = new_stitch_count
Must handle: stitch repeats, ease, rounding rules, yarn weight compatibility.

---

## Database Schema

```sql
profiles
  id uuid PK (references auth.users)
  username text
  subscription_tier text DEFAULT 'free'   -- free | premium
  ravelry_access_token text               -- encrypted at rest
  ravelry_username text
  craft_preference text                   -- crochet | knitting | both
  skill_level text                        -- beginner | intermediate | advanced
  created_at timestamptz

patterns
  id uuid PK
  user_id uuid FK -> profiles.id
  title text
  raw_text text           -- original pasted/imported text
  processed_json jsonb    -- structured parsed pattern
  size_params jsonb       -- {original_size, target_size, gauge_pattern, gauge_user}
  content_hash text       -- SHA256 for dedup/cache keying
  source text             -- manual | ravelry | ocr
  ravelry_pattern_id text
  region text DEFAULT 'us'  -- us | uk (affects abbreviation interpretation)
  created_at timestamptz
  updated_at timestamptz

user_projects
  id uuid PK
  user_id uuid FK -> profiles.id
  pattern_id uuid FK -> patterns.id
  name text
  status text DEFAULT 'queued'  -- queued | in_progress | completed
  notes text
  ravelry_project_id text
  progress_row int DEFAULT 0
  created_at timestamptz

abbreviations
  id uuid PK
  term text NOT NULL
  expansion text NOT NULL
  category text           -- crochet | knitting | both
  region text DEFAULT 'us'  -- us | uk
  is_global bool DEFAULT true
  user_id uuid FK -> profiles.id  -- null = global, set = user custom

tutorials
  id uuid PK
  youtube_id text NOT NULL  -- ID only, URL reconstructed client-side
  title text
  description text
  technique_tags text[]     -- e.g. ['sc', 'single crochet', 'foundation chain']
  craft_type text           -- crochet | knitting | both
  difficulty text           -- beginner | intermediate | advanced
  premium_only bool DEFAULT false
  approved bool DEFAULT false
  submitted_by uuid FK -> profiles.id
  created_at timestamptz

tips
  id uuid PK
  body text NOT NULL
  trigger_keywords text[]
  craft_type text
  premium_only bool DEFAULT false
  category text             -- technique | yarn | tools | finishing

yarn_weights
  id uuid PK
  name text   -- Lace | Fingering | Sport | DK | Worsted | Bulky | Super Bulky
  wpi_min int
  wpi_max int
  typical_gauge_st_4in_min numeric
  typical_gauge_st_4in_max numeric
  needle_size_us_min text
  needle_size_us_max text
  hook_size_mm_min numeric
  hook_size_mm_max numeric
```

---

## API Routes (Go/Fiber)

```
Auth
  POST   /auth/ravelry/oauth/init
  POST   /auth/ravelry/oauth/callback
  DELETE /auth/ravelry/disconnect

Patterns
  POST   /patterns/parse           -- expand abbreviations, structure raw text
  POST   /patterns/resize          -- deterministic gauge-based math resize
  GET    /patterns/:id
  DELETE /patterns/:id
  GET    /patterns/ravelry/:id     -- proxy Ravelry pattern fetch

Export
  POST   /export/pdf/:pattern_id   -- generate PDF (watermarked free / clean premium)

Tutorials
  GET    /tutorials                -- filter: craft_type, difficulty, tags
  GET    /tutorials/search?q=
  POST   /tutorials/suggest        -- premium: submit for moderation

Tips
  POST   /tips/match               -- send pattern text, receive matched tips

Ravelry Proxy
  GET    /ravelry/favorites
  GET    /ravelry/projects
  GET    /ravelry/stash

Webhooks
  POST   /webhooks/revenuecat      -- subscription lifecycle events
```

---

## Mobile App Screen Structure (Expo Router)

```
app/
  (auth)/
    login.tsx
    signup.tsx
    onboarding.tsx       -- craft preference, skill level
  (tabs)/
    index.tsx            -- Home: My Patterns dashboard
    explore.tsx          -- Tutorial repository (filterable)
    projects.tsx         -- Active projects + row progress tracking
    profile.tsx          -- Account, subscription status, Ravelry link
  pattern/
    [id].tsx             -- Pattern viewer (abbreviations expanded inline)
    [id]/resize.tsx      -- Gauge input + size adjustment flow
    [id]/export.tsx      -- Export options (PDF, share)
    import.tsx           -- Paste text or OCR import
  tutorials/
    [id].tsx             -- Tutorial detail with YouTube embed
  swatch-calculator.tsx  -- Standalone gauge/swatch tool
  paywall.tsx            -- Subscription upsell
```

---

## Build Phases

### Phase 0 — Prerequisites (BLOCKED — see What I Need From You below)

### Phase 1 — Foundation
- [ ] Expo project scaffold + Expo Router
- [ ] Go/Fiber scaffold with middleware (CORS, rate limiting, JWT verification)
- [ ] Supabase schema migration files + Row Level Security policies
- [ ] Supabase Auth in app (Apple + Google OAuth)
- [ ] WatermelonDB schema + sync adapter
- [ ] NativeWind design tokens (brand colors, typography, spacing)
- [ ] Zustand store structure (auth, patterns, settings)
- [ ] Base navigation shell (tabs + auth flow)

### Phase 2 — Pattern Processing (Core Value Prop)
- [ ] Pattern import screen (paste text)
- [ ] Abbreviation expansion engine (regex + DB glossary)
  - [ ] Seed 300+ standard abbreviations (US + UK sets)
  - [ ] Claude Haiku fallback for unrecognized terms
  - [ ] User custom abbreviation CRUD
- [ ] Pattern viewer: formatted display, abbreviations expanded inline
- [ ] Pattern resize flow — WALK THROUGH WITH USER BEFORE BUILDING
  - [ ] Gauge input UI (pattern gauge + your gauge)
  - [ ] Resize calculation engine (pure math)
  - [ ] Show original vs resized stitch counts side-by-side
- [ ] Contextual tips engine: keyword scan -> matched tips as dismissible cards
- [ ] Seed 150+ tips in DB

### Phase 3 — Tutorials
- [ ] Tutorial repository screen (grid, filterable by craft/difficulty/tag)
- [ ] Tutorial detail screen (YouTube embed)
- [ ] Technique tag -> tutorial mapping (inline links in pattern viewer)
- [ ] Seed ~50 curated tutorials

### Phase 4 — Swatch Calculator
- [ ] Swatch input: measured size + stitch/row count
- [ ] Output: stitches per inch + rows per inch
- [ ] Gauge comparison: your swatch vs pattern requirements
- [ ] Yarn weight reference chart
- [ ] Needle/hook size recommendations based on yarn weight

### Phase 5 — Export
- [ ] Server-side PDF generation (gofpdf)
- [ ] PDF template: title, formatted sections, abbreviation legend page
- [ ] Upload to Supabase Storage, return time-limited signed URL
- [ ] Share sheet integration in app
- [ ] Free: watermarked PDF | Premium: clean PDF

### Phase 6 — Ravelry Integration
- [ ] Ravelry OAuth proxy in Go backend
- [ ] Sync user favorites to local DB
- [ ] Import pattern from Ravelry URL
- [ ] Link app project to Ravelry project record
- [ ] Display Ravelry yardage/yarn info inline

### Phase 7 — Monetization
- [ ] RevenueCat SDK in Expo app
- [ ] Paywall screen (monthly vs annual comparison)
- [ ] Premium gates: PDF export, Ravelry sync, resize limit for free tier, premium tips
- [ ] AdMob banner (list screens) + interstitial (after export for free users)
- [ ] RevenueCat webhook -> Go -> update subscription_tier in Supabase

### Phase 8 — App Store Launch
- [ ] App icon set + splash screen (all required sizes)
- [ ] Privacy Policy + Terms of Service (hosted URL, required by stores)
- [ ] Expo EAS Build configuration (dev/preview/production profiles)
- [ ] TestFlight internal + external beta
- [ ] App Store Connect: screenshots (all device sizes), description, keywords, age rating
- [ ] Google Play Console: listing, content rating, data safety form
- [ ] Sentry + PostHog live in production builds

### Phase 9 — Post-Launch
- [ ] Pattern OCR input (Expo Camera + Google Vision API)
- [ ] Push notifications (project reminders, new tutorial alerts)
- [ ] Community tutorial submissions with moderation queue
- [ ] User-submitted pattern corrections/notes
- [ ] Pattern marketplace groundwork

---

## What I Need From You

### Required Before Writing Any Code

| # | What | Details |
|---|---|---|
| 1 | **App name** | Final decision — sets bundle ID, App Store listing, branding throughout |
| 2 | **Apple Developer account** | $99/yr — do you have one? Needed for iOS builds + App Store |
| 3 | **Google Play account** | $25 one-time — do you have one? Needed for Android |
| 4 | **Supabase project** | Create free account + new project at supabase.com |
| 5 | **Railway account** | Create at railway.app — will host Go API |
| 6 | **RevenueCat account** | Create at revenuecat.com, set up iOS + Android apps |
| 7 | **Ravelry API credentials** | Register app at ravelry.com/groups/ravelry-api — need client_id + secret |

### Required During Phase 2

| # | What |
|---|---|
| 8 | **Pattern sizing walkthrough** — the math for stitch counts, stitch repeat handling, ease, rounding rules, edge cases |

### Nice to Have (Can Run in Parallel)

| # | What |
|---|---|
| 9 | **Brand direction** — color palette vibe? (soft/cozy yarny tones vs clean modern minimal) |
| 10 | **Tutorial seed list** — YouTube channels or specific videos you know are high quality |
| 11 | **Abbreviation edge cases** — designer-specific terms or US/UK differences to handle specially |

---

## Environment Variables Reference

### Go API (.env)
```
SUPABASE_URL=
SUPABASE_PUBLISHABLE_KEY=     # safe for client use (also set in Expo app)
SUPABASE_SECRET_KEY=          # ⚠️ server-side only, bypasses RLS
SUPABASE_JWT_SECRET=
UPSTASH_REDIS_URL=
UPSTASH_REDIS_TOKEN=
RAVELRY_CLIENT_ID=
RAVELRY_CLIENT_SECRET=
RAVELRY_REDIRECT_URI=
ANTHROPIC_API_KEY=            # abbreviation AI fallback only
REVENUECAT_WEBHOOK_SECRET=
RESEND_API_KEY=
APP_SECRET=                   # AES key for encrypting Ravelry tokens at rest
PORT=8080
```

### Expo App (.env)
```
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
EXPO_PUBLIC_API_BASE_URL=
EXPO_PUBLIC_POSTHOG_KEY=
EXPO_PUBLIC_ADMOB_BANNER_ID=
EXPO_PUBLIC_ADMOB_INTERSTITIAL_ID=
REVENUECAT_API_KEY_IOS=
REVENUECAT_API_KEY_ANDROID=
```

---

## Folder Structure

```
fiber_app/                       -- this repo (Go/Fiber backend)
  cmd/
    server/
      main.go
  internal/
    handlers/
      auth.go
      patterns.go
      tutorials.go
      tips.go
      export.go
      ravelry.go
      webhooks.go
    middleware/
      auth.go          -- JWT verification via Supabase
      ratelimit.go
      premium.go       -- subscription tier checks
    services/
      pattern/
        abbreviations.go   -- glossary matching + Claude Haiku fallback
        resize.go          -- gauge math engine (no AI)
        parser.go          -- structure raw text into sections/rows
      pdf/
        generator.go
        templates.go
      ravelry/
        oauth.go
        client.go
      tips/
        matcher.go
    db/
      migrations/      -- numbered .sql migration files
      client.go        -- Supabase connection pool
    models/
      pattern.go
      user.go
      tutorial.go
  go.mod
  .env

stitch-app/                      -- NEW repo (React Native / Expo)
  app/
    (auth)/
    (tabs)/
    pattern/
    tutorials/
    swatch-calculator.tsx
    paywall.tsx
  components/
    ui/                -- Button, Card, Input, Badge, Modal, etc.
    pattern/           -- PatternViewer, AbbreviationChip, TipCard, ResizePanel
    tutorials/         -- TutorialCard, YouTubeEmbed
  stores/
    auth.ts
    patterns.ts
    settings.ts
  lib/
    supabase.ts
    api.ts             -- typed API client for Go backend
    watermelon.ts      -- WatermelonDB config + sync
  assets/
  .env
```

---

## Key Technical Decisions

| Decision | Chosen | Rationale |
|---|---|---|
| Pattern sizing | Pure math (no AI) | Gauge ratio math is deterministic, faster, zero cost |
| AI scope | Abbreviation fallback only | Near-zero AI cost; only fires on unrecognized terms |
| Offline | WatermelonDB | Crafters frequently work without wifi |
| Auth providers | Apple + Google via Supabase | App Store requires Apple Sign In when any social auth exists |
| PDF generation | Server-side gofpdf | Consistent output, protects premium gate, no client bloat |
| Ravelry tokens | Encrypted in Supabase | Never stored in app, never in plaintext |
| US vs UK terms | Both supported | Region selector per pattern; separate rows in abbreviations table |
| Tutorial storage | YouTube ID only | Zero storage cost; URL reconstructed client-side |
| Subscription mgmt | RevenueCat | Handles App Store/Play billing complexity; free until $10k MRR |
