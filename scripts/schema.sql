-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Enums
CREATE TYPE platform_type AS ENUM ('instagram', 'youtube', 'tiktok');
CREATE TYPE niche_type AS ENUM (
  'fashion', 'beauty', 'fitness', 'food', 'travel',
  'tech', 'gaming', 'lifestyle', 'business', 'education'
);

-- Core influencers table
CREATE TABLE influencers (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username        VARCHAR(100) NOT NULL,
  display_name    VARCHAR(200),
  bio             TEXT,
  avatar_url      TEXT,
  platform        platform_type NOT NULL,
  platform_id     VARCHAR(200) UNIQUE NOT NULL,
  niche           TEXT[],
  country         CHAR(2),
  language        CHAR(2),
  is_verified     BOOLEAN DEFAULT false,
  is_active       BOOLEAN DEFAULT true,
  last_synced_at  TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Metrics snapshots
CREATE TABLE influencer_metrics (
  id                     UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  influencer_id          UUID REFERENCES influencers(id) ON DELETE CASCADE,
  followers_count        BIGINT NOT NULL DEFAULT 0,
  following_count        BIGINT,
  posts_count            INTEGER,
  avg_likes              NUMERIC(12,2),
  avg_comments           NUMERIC(12,2),
  avg_views              NUMERIC(12,2),
  engagement_rate        NUMERIC(5,4),
  audience_quality_score NUMERIC(4,2),
  snapshotted_at         TIMESTAMPTZ DEFAULT NOW()
);

-- Audience demographics
CREATE TABLE audience_demographics (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  influencer_id  UUID REFERENCES influencers(id) ON DELETE CASCADE,
  age_13_17      NUMERIC(5,2),
  age_18_24      NUMERIC(5,2),
  age_25_34      NUMERIC(5,2),
  age_35_44      NUMERIC(5,2),
  age_45_plus    NUMERIC(5,2),
  gender_male    NUMERIC(5,2),
  gender_female  NUMERIC(5,2),
  top_countries  JSONB,
  snapshotted_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for search performance
CREATE INDEX idx_influencers_platform ON influencers(platform);
CREATE INDEX idx_influencers_country ON influencers(country);
CREATE INDEX idx_influencers_username_trgm ON influencers USING GIN(username gin_trgm_ops);
CREATE INDEX idx_influencers_display_name_trgm ON influencers USING GIN(display_name gin_trgm_ops);
CREATE INDEX idx_metrics_influencer ON influencer_metrics(influencer_id);
CREATE INDEX idx_metrics_snapshot ON influencer_metrics(snapshotted_at DESC);
CREATE INDEX idx_metrics_engagement ON influencer_metrics(engagement_rate DESC);
CREATE INDEX idx_metrics_followers ON influencer_metrics(followers_count DESC);

-- Materialized view for fast search queries
CREATE MATERIALIZED VIEW influencer_latest_metrics AS
SELECT DISTINCT ON (influencer_id)
  influencer_id,
  followers_count,
  following_count,
  posts_count,
  avg_likes,
  avg_comments,
  avg_views,
  engagement_rate,
  audience_quality_score,
  snapshotted_at
FROM influencer_metrics
ORDER BY influencer_id, snapshotted_at DESC;

CREATE UNIQUE INDEX ON influencer_latest_metrics(influencer_id);