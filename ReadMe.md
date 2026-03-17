# Influx — Influencer Analytics Platform

A full-stack influencer discovery and analytics platform built with Next.js, tRPC, PostgreSQL and Redis. Search, filter and analyse influencers across Instagram, YouTube and TikTok.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [API Reference](#api-reference)
- [Instagram API Setup](#instagram-api-setup)
- [YouTube API Setup](#youtube-api-setup)
- [Seeding Data](#seeding-data)
- [Features](#features)
- [Roadmap](#roadmap)

---

## Overview

Influencer Analytics is a SaaS-style influencer analytics platform. It allows brands and agencies to discover influencers, analyse their engagement metrics, and manage influencer campaigns — all from a single dashboard.

### Key capabilities

- Search influencers by name, niche, platform, country and engagement rate
- Sync real influencer data from Instagram Graph API and YouTube Data API
- Store historical metrics snapshots for trend analysis
- Filter by followers range, engagement rate, niche and location
- View detailed influencer profiles with audience demographics

---

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | Next.js 15 (App Router) | React framework with SSR |
| Language | TypeScript | End-to-end type safety |
| Styling | Tailwind CSS + shadcn/ui | UI components and design system |
| API | tRPC v11 | Type-safe API layer |
| Server State | TanStack React Query | Data fetching and caching |
| Database | PostgreSQL 16 | Primary data store |
| Cache | Redis 7 | API response caching |
| Queue | BullMQ | Background sync jobs |
| Validation | Zod | Runtime input validation |
| Serialization | SuperJSON | Handles Date, BigInt in JSON |

---

## Project Structure

```
influencer-analytics/
├── app/
│   ├── api/
│   │   └── trpc/
│   │       └── [[...trpc]]/
│   │           └── route.ts          # tRPC HTTP handler
│   ├── search/
│   │   └── page.tsx                  # Search & discovery page
│   ├── influencer/
│   │   └── [id]/
│   │       └── page.tsx              # Influencer profile page
│   ├── test-sync/
│   │   └── page.tsx                  # Instagram sync test page
│   ├── layout.tsx                    # Root layout with navbar
│   ├── page.tsx                      # Landing page
│   └── providers.tsx                 # tRPC + React Query providers
├── components/
│   └── search/
│       ├── SearchBar.tsx             # Search input component
│       ├── FilterPanel.tsx           # Filter dropdowns and inputs
│       ├── InfluencerCard.tsx        # Influencer result card
│       └── InfluencerCardSkeleton.tsx# Loading skeleton
├── hooks/
│   └── useDebounce.ts                # Debounce hook for search
├── lib/
│   ├── db.ts                         # PostgreSQL connection pool
│   ├── redis.ts                      # Redis client + cache helpers
│   ├── trpc/
│   │   ├── client.ts                 # Frontend tRPC client
│   │   └── server.ts                 # tRPC context + init
│   ├── db/
│   │   └── influencer-queries.ts     # DB upsert + query functions
│   └── services/
│       ├── instagram.ts              # Instagram API service
│       └── youtube.ts                # YouTube API service
├── server/
│   └── routers/
│       ├── _app.ts                   # Root tRPC router
│       └── influencer.ts             # Influencer procedures
├── scripts/
│   └── seed.ts                       # Database seed script
├── docker-compose.yml                # Postgres + Redis containers
├── tsconfig.seed.json                # TypeScript config for scripts
├── tailwind.config.ts                # Tailwind + brand colors
└── .env.local                        # Environment variables
```

---

## Getting Started

### Prerequisites

- Node.js v20+
- Docker Desktop
- Git

### 1. Clone the repository

```bash
git clone https://github.com/your-username/influencer-analytics.git
cd influencer-analytics
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

```bash
cp .env.example .env.local
# Fill in your values (see Environment Variables section below)
```

### 4. Start database and cache

```bash
docker-compose up -d
```

### 5. Run database migrations

Open pgAdmin4 or connect via psql and run the schema:

```bash
psql -U postgres -d influencer-analytics -f scripts/schema.sql
```

### 6. Seed with mock data

```bash
npm run seed
```

### 7. Start the dev server

```bash
npm run dev
```

Visit `http://localhost:3000` — the app is running.

---

## Environment Variables

Create a `.env.local` file in the project root:

```bash
# ── Database ──────────────────────────────────────────
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/influencer-analytics

# ── Redis ─────────────────────────────────────────────
REDIS_URL=redis://localhost:6379

# ── Instagram Graph API ───────────────────────────────
INSTAGRAM_APP_ID=your_meta_app_id
INSTAGRAM_APP_SECRET=your_meta_app_secret
INSTAGRAM_ACCESS_TOKEN=your_long_lived_access_token
INSTAGRAM_USER_ID=your_instagram_user_id
INSTAGRAM_BUSINESS_ACCOUNT_ID=your_instagram_business_account_id

# ── YouTube Data API v3 ───────────────────────────────
YOUTUBE_API_KEY=your_youtube_api_key

# ── Next.js Auth ──────────────────────────────────────
NEXTAUTH_SECRET=your_generated_secret
NEXTAUTH_URL=http://localhost:3000

# ── Public vars (exposed to browser) ─────────────────
NEXT_PUBLIC_INSTAGRAM_USER_ID=your_instagram_user_id
```

Generate `NEXTAUTH_SECRET` with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Database Setup

### Schema

The database uses the following tables:

```
influencers                  — core influencer profiles
influencer_metrics           — historical metrics snapshots
audience_demographics        — age, gender, location breakdowns
influencer_latest_metrics    — materialized view for fast queries
```

### Key design decisions

**Materialized view** — `influencer_latest_metrics` pre-computes the most recent snapshot per influencer. This makes search queries 10–50x faster compared to subquery-based approaches.

**Metrics snapshots** — metrics are never overwritten, they are appended as new rows. This enables trend analysis over time.

**pg_trgm extension** — enables fuzzy text search on username and display name with GIN indexes.

### Refresh the materialized view

After syncing new data, the view refreshes automatically. To refresh manually:

```sql
REFRESH MATERIALIZED VIEW CONCURRENTLY influencer_latest_metrics;
```

---

## API Reference

All API endpoints are exposed via tRPC at `/api/trpc`.

### `influencer.search`

Search and filter influencers.

```typescript
// Input
{
  query?:         string          // search by username or name
  platform?:      'instagram' | 'youtube' | 'tiktok'
  followersMin?:  number
  followersMax?:  number
  engagementMin?: number          // percentage e.g. 3 = 3%
  country?:       string          // ISO 3166 e.g. "US", "IN"
  niche?:         string          // e.g. "fitness", "tech"
  sortBy:         'followers' | 'engagement' | 'relevance'
  page:           number          // default: 1
  limit:          number          // default: 20, max: 50
}

// Output
{
  influencers: Influencer[]
  total:       number
  page:        number
  totalPages:  number
}
```

### `influencer.getById`

Get a single influencer profile with full metrics.

```typescript
// Input
{ id: string }  // UUID

// Output
Influencer & Metrics
```

### `influencer.syncFromInstagram`

Fetch an Instagram account and save to database.

```typescript
// Input
{
  userId:               string   // Instagram User ID
  country?:             string   // manual country override
  useBusinessDiscovery?: boolean // fetch other accounts via Business Discovery API
}

// Output
{
  success:        boolean
  influencerId:   string
  username:       string
  country:        string | null
  followersCount: number
  engagementRate: string
}
```

---

## Instagram API Setup

### 1. Create a Meta Developer account

Go to `https://developers.facebook.com` → My Apps → Create App → Select **Other** → Select **Business**.

### 2. Add Instagram product

App Dashboard → Add Product → Instagram Graph API → Set Up.

### 3. Switch your Instagram to a Business/Creator account

```
Instagram app → Settings & Privacy
→ Account type and tools
→ Switch to Professional Account
→ Choose Creator or Business
```

### 4. Add yourself as a tester

```
developers.facebook.com → Your App
→ App Roles → Roles
→ Instagram Testers → Add Instagram Testers
```

Accept the invite at `instagram.com/accounts/manage_access/`.

### 5. Generate an access token

```
App Dashboard → Instagram → API Setup with Instagram Login
→ Generate Token
```

### 6. Exchange for a long-lived token (60 days)

```bash
curl "https://graph.instagram.com/access_token \
  ?grant_type=ig_exchange_token \
  &client_id=YOUR_APP_ID \
  &client_secret=YOUR_APP_SECRET \
  &access_token=YOUR_SHORT_LIVED_TOKEN"
```

### 7. Get your Instagram User ID

```bash
curl "https://graph.instagram.com/v25.0/me \
  ?fields=id,username \
  &access_token=YOUR_LONG_LIVED_TOKEN"
```

### Notes

- Instagram Basic API only returns data for your own account
- To fetch other accounts, you need Business Discovery API (requires Meta App Review)
- Personal accounts do not expose `followers_count` — switch to Business/Creator
- Tokens expire after 60 days — refresh before expiry with `ig_refresh_token`

---

## YouTube API Setup

### 1. Create a Google Cloud project

Go to `https://console.cloud.google.com` → New Project → Name it `influencer-analytics`.

### 2. Enable YouTube Data API v3

APIs & Services → Library → Search "YouTube Data API v3" → Enable.

### 3. Create an API key

APIs & Services → Credentials → Create Credentials → API Key.

Restrict the key to YouTube Data API v3 only.

### 4. Add to `.env.local`

```bash
YOUTUBE_API_KEY=AIzaSy_your_key_here
```

### 5. Test it

```
https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&id=UCVHFbw7woebKtJFqHFiDqOA&key=YOUR_KEY
```

**Quota:** 10,000 units/day free. A channel lookup costs 1 unit.

---

## Seeding Data

The seed script populates the database with 12 realistic mock influencers across Instagram and YouTube.

```bash
npm run seed
```

### Seeded influencers

| Username | Platform | Followers | Country | Niche |
|---|---|---|---|---|
| fitness_mike | Instagram | 245K | US | Fitness, Lifestyle |
| travel_with_sara | Instagram | 89K | GB | Travel, Lifestyle |
| techreview_hub | YouTube | 520K | IN | Tech |
| foodie_adventures | Instagram | 132K | AU | Food, Travel |
| beauty_by_priya | Instagram | 67K | IN | Beauty, Fashion |
| gaming_with_alex | YouTube | 890K | US | Gaming |
| business_mindset | Instagram | 310K | US | Business, Education |
| fashion_forward_nyc | Instagram | 178K | US | Fashion |
| yoga_with_anjali | Instagram | 54K | IN | Fitness, Lifestyle |
| finance_with_james | YouTube | 1.2M | US | Business, Education |
| photography_by_leo | Instagram | 43K | FR | Travel, Lifestyle |
| cooking_with_maria | Instagram | 98K | IT | Food |

---

## Features

### Completed

- [x] Next.js 15 App Router setup
- [x] tRPC v11 end-to-end type-safe API
- [x] PostgreSQL schema with materialized views
- [x] Redis caching layer
- [x] Instagram Graph API integration (Basic + Business Discovery)
- [x] Influencer search with filters
- [x] Mock data seeding
- [x] Brand design system (purple/yellow/pink palette)
- [x] Responsive influencer card grid
- [x] Debounced search input
- [x] Pagination

### In Progress

- [ ] Influencer profile page with charts
- [ ] YouTube Data API integration
- [ ] Audience demographics visualization
- [ ] Campaign management module

### Planned

- [ ] User authentication (NextAuth)
- [ ] Saved influencer lists
- [ ] PDF report export
- [ ] Stripe subscription billing
- [ ] Email scheduled reports
- [ ] BullMQ background sync jobs
- [ ] Multi-platform comparison
- [ ] Fake follower detection score

---

## Roadmap

| Phase | Focus | Status |
|---|---|---|
| Phase 1 | Foundations — Next.js, tRPC, PostgreSQL, Redis | ✅ Done |
| Phase 2 | Core Architecture — Search, Filters, Instagram API | ✅ Done |
| Phase 3 | Analytics Engine — Charts, Demographics, Metrics | 🔄 In Progress |
| Phase 4 | Platform Features — Auth, Campaigns, Reports | 🔲 Planned |
| Phase 5 | Scale & Production — Docker, CI/CD, Stripe | 🔲 Planned |

---

## Contributing

1. Fork the repository
2. Create a feature branch — `git checkout -b feature/your-feature`
3. Commit your changes — `git commit -m 'Add your feature'`
4. Push to the branch — `git push origin feature/your-feature`
5. Open a Pull Request