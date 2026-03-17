import { Pool } from 'pg';
import type { NormalizedProfile, NormalizedMetrics } from '@/lib/services/instagram';

export async function upsertInfluencer(
  db: Pool,
  profile: NormalizedProfile,
  platform: 'instagram' | 'youtube' | 'tiktok'
): Promise<string> {
  const result = await db.query(`
    INSERT INTO influencers (
      username, display_name, bio, avatar_url,
      platform, platform_id, is_active, last_synced_at
    )
    VALUES ($1, $2, $3, $4, $5, $6, true, NOW())
    ON CONFLICT (platform_id) DO UPDATE SET
      username       = EXCLUDED.username,
      display_name   = EXCLUDED.display_name,
      bio            = EXCLUDED.bio,
      avatar_url     = EXCLUDED.avatar_url,
      last_synced_at = NOW(),
      updated_at     = NOW()
    RETURNING id
  `, [
    profile.username,
    profile.displayName,
    profile.bio,
    profile.avatarUrl,
    platform,
    profile.platformId,
  ]);

  return result.rows[0].id;
}

export async function insertMetricsSnapshot(
  db: Pool,
  influencerId: string,
  profile: NormalizedProfile,
  metrics: NormalizedMetrics,
  engagementRate: number
): Promise<void> {
  await db.query(`
    INSERT INTO influencer_metrics (
      influencer_id, followers_count, following_count,
      posts_count, avg_likes, avg_comments, engagement_rate
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7)
  `, [
    influencerId,
    profile.followersCount,
    profile.followingCount,
    profile.postsCount,
    metrics.avgLikes,
    metrics.avgComments,
    engagementRate,
  ]);
}

export async function refreshMetricsView(db: Pool): Promise<void> {
  await db.query(
    'REFRESH MATERIALIZED VIEW CONCURRENTLY influencer_latest_metrics'
  );
}