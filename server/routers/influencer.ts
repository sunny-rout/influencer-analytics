import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { createTRPCRouter, publicProcedure } from '@/lib/trpc/server';
import { getCached, setCache, CACHE_TTL, invalidateCache } from '@/lib/redis';
import {
  fetchInstagramProfile,
  fetchInstagramMediaMetrics,
  calculateEngagementRate,
} from '@/lib/services/instagram';

import {
  upsertInfluencer,
  insertMetricsSnapshot,
  refreshMetricsView,
} from '@/lib/db/influencer-queries';

// Input validation schema
const SearchInput = z.object({
  query:        z.string().min(1).max(100).optional(),
  platform:     z.enum(['instagram', 'youtube', 'tiktok']).optional(),
  followersMin: z.number().min(0).optional(),
  followersMax: z.number().optional(),
  engagementMin:z.number().min(0).max(100).optional(),
  country:      z.string().length(2).optional(),
  niche:        z.enum([
    'fashion', 'beauty', 'fitness', 'food', 'travel',
    'tech', 'gaming', 'lifestyle', 'business', 'education'
  ]).optional(),
  sortBy: z.enum(['followers', 'engagement', 'relevance']).default('relevance'),
  page:   z.number().min(1).default(1),
  limit:  z.number().min(1).max(50).default(20),
});

export const influencerRouter = createTRPCRouter({

  // influencer.syncFromInstagram
// Call this to fetch a user from Instagram API and save to DB
syncFromInstagram: publicProcedure
  .input(z.object({
    userId:               z.string().min(1),
    country:              z.string().length(2).optional(),
    useBusinessDiscovery: z.boolean().default(false),
  }))
  .mutation(async ({ ctx, input }) => {
    try {
      const [profile, mediaMetrics] = await Promise.all([
        fetchInstagramProfile(input.userId, {
          useBusinessDiscovery: input.useBusinessDiscovery,
          country:              input.country,
        }),
        fetchInstagramMediaMetrics(input.userId),
      ]);

      const engagementRate = calculateEngagementRate(
        mediaMetrics.avgLikes,
        mediaMetrics.avgComments,
        profile.followersCount
      );

      const influencerId = await upsertInfluencer(
        ctx.db, profile, 'instagram'
      );

      await insertMetricsSnapshot(
        ctx.db, influencerId, profile, mediaMetrics, engagementRate
      );

      await refreshMetricsView(ctx.db);
      await invalidateCache('search:*');

      return {
        success:              true,
        influencerId,
        username:             profile.username,
        country:              profile.country,
        accountType:          profile.accountType,
        followersCount:       profile.followersCount,
        engagementRate:       (engagementRate * 100).toFixed(2) + '%',
        usedBusinessDiscovery: input.useBusinessDiscovery,
      };

    } catch (error: any) {
      throw new TRPCError({
        code:    'INTERNAL_SERVER_ERROR',
        message: error.message,
      });
    }
  }),
  // influencer.search — powers the main search page
  search: publicProcedure
    .input(SearchInput)
    .query(async ({ ctx, input }) => {
      const cacheKey = `search:${JSON.stringify(input)}`;

      // 1. Check cache first
      const cached = await getCached<any>(cacheKey);
      if (cached) return cached;

      // 2. Build dynamic WHERE conditions
      const conditions: string[] = ['i.is_active = true'];
      const params: any[] = [];
      let idx = 1;

      if (input.query) {
        conditions.push(
          `(i.username ILIKE $${idx} OR i.display_name ILIKE $${idx})`
        );
        params.push(`%${input.query}%`);
        idx++;
      }
      if (input.platform) {
        conditions.push(`i.platform = $${idx}`);
        params.push(input.platform);
        idx++;
      }
      if (input.followersMin !== undefined) {
        conditions.push(`m.followers_count >= $${idx}`);
        params.push(input.followersMin);
        idx++;
      }
      if (input.followersMax !== undefined) {
        conditions.push(`m.followers_count <= $${idx}`);
        params.push(input.followersMax);
        idx++;
      }
      if (input.engagementMin !== undefined) {
        conditions.push(`m.engagement_rate >= $${idx}`);
        params.push(input.engagementMin / 100);
        idx++;
      }
      if (input.country) {
        conditions.push(`i.country = $${idx}`);
        params.push(input.country);
        idx++;
      }
      if (input.niche) {
        conditions.push(`$${idx}::text = ANY(i.niche)`);
        params.push(input.niche);
        idx++;
      }

      const where = conditions.join(' AND ');
      const offset = (input.page - 1) * input.limit;

      const orderBy = {
        followers:  'm.followers_count DESC',
        engagement: 'm.engagement_rate DESC',
        relevance:  'i.username ASC',
      }[input.sortBy];

      // 3. Run count + data queries in parallel
      const [dataResult, countResult] = await Promise.all([
        ctx.db.query(`
          SELECT
            i.id, i.username, i.display_name, i.avatar_url,
            i.platform, i.niche, i.country, i.is_verified,
            m.followers_count, m.engagement_rate,
            m.avg_likes, m.avg_comments, m.audience_quality_score
          FROM influencers i
          JOIN influencer_latest_metrics m ON m.influencer_id = i.id
          WHERE ${where}
          ORDER BY ${orderBy}
          LIMIT $${idx} OFFSET $${idx + 1}
        `, [...params, input.limit, offset]),

        ctx.db.query(`
          SELECT COUNT(*) as total
          FROM influencers i
          JOIN influencer_latest_metrics m ON m.influencer_id = i.id
          WHERE ${where}
        `, params),
      ]);

      const result = {
        influencers: dataResult.rows,
        total:       parseInt(countResult.rows[0].total),
        page:        input.page,
        totalPages:  Math.ceil(parseInt(countResult.rows[0].total) / input.limit),
      };

      // 4. Cache result
      await setCache(cacheKey, result, CACHE_TTL.SEARCH);
      return result;
    }),

  // influencer.getById — powers the profile page
  getById: publicProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const cacheKey = `influencer:${input.id}`;
      const cached = await getCached(cacheKey);
      if (cached) return cached;

      const result = await ctx.db.query(`
        SELECT
          i.*,
          m.followers_count, m.engagement_rate,
          m.avg_likes, m.avg_comments, m.avg_views,
          m.audience_quality_score, m.snapshotted_at
        FROM influencers i
        JOIN influencer_latest_metrics m ON m.influencer_id = i.id
        WHERE i.id = $1
      `, [input.id]);

      if (!result.rows[0]) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Influencer not found',
        });
      }

      await setCache(cacheKey, result.rows[0], CACHE_TTL.PROFILE);
      return result.rows[0];
    }),
});