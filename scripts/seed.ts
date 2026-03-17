import { Pool } from 'pg';
import * as dotenv from 'dotenv';

// Load .env.local
dotenv.config({ path: '.env.local' });

const db = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const influencers = [
  {
    username:    'fitness_mike',
    displayName: 'Mike Johnson',
    bio:         'Personal trainer | 10 years experience 💪',
    platform:    'instagram',
    platformId:  'ig_mock_001',
    niche:       ['fitness', 'lifestyle'],
    country:     'US',
    isVerified:  true,
    followers:   245000,
    avgLikes:    8200,
    avgComments: 340,
  },
  {
    username:    'travel_with_sara',
    displayName: 'Sara Williams',
    bio:         'Exploring the world one city at a time ✈️',
    platform:    'instagram',
    platformId:  'ig_mock_002',
    niche:       ['travel', 'lifestyle'],
    country:     'GB',
    isVerified:  false,
    followers:   89000,
    avgLikes:    3100,
    avgComments: 180,
  },
  {
    username:    'techreview_hub',
    displayName: 'Tech Review Hub',
    bio:         'Honest reviews on the latest tech 📱',
    platform:    'youtube',
    platformId:  'yt_mock_001',
    niche:       ['tech'],
    country:     'IN',
    isVerified:  true,
    followers:   520000,
    avgLikes:    15000,
    avgComments: 890,
  },
  {
    username:    'foodie_adventures',
    displayName: 'Foodie Adventures',
    bio:         'Street food to fine dining 🍜',
    platform:    'instagram',
    platformId:  'ig_mock_003',
    niche:       ['food', 'travel'],
    country:     'AU',
    isVerified:  false,
    followers:   132000,
    avgLikes:    5400,
    avgComments: 290,
  },
  {
    username:    'beauty_by_priya',
    displayName: 'Priya Sharma',
    bio:         'Makeup tutorials & skincare routines ✨',
    platform:    'instagram',
    platformId:  'ig_mock_004',
    niche:       ['beauty', 'fashion'],
    country:     'IN',
    isVerified:  false,
    followers:   67000,
    avgLikes:    2800,
    avgComments: 210,
  },
  {
    username:    'gaming_with_alex',
    displayName: 'Alex Gaming',
    bio:         'Daily gaming streams & reviews 🎮',
    platform:    'youtube',
    platformId:  'yt_mock_002',
    niche:       ['gaming'],
    country:     'US',
    isVerified:  true,
    followers:   890000,
    avgLikes:    32000,
    avgComments: 2100,
  },
  {
    username:    'business_mindset',
    displayName: 'Business Mindset',
    bio:         'Entrepreneurship tips & startup stories 🚀',
    platform:    'instagram',
    platformId:  'ig_mock_005',
    niche:       ['business', 'education'],
    country:     'US',
    isVerified:  true,
    followers:   310000,
    avgLikes:    9800,
    avgComments: 560,
  },
  {
    username:    'fashion_forward_nyc',
    displayName: 'Fashion Forward NYC',
    bio:         'NYC street style & fashion inspo 👗',
    platform:    'instagram',
    platformId:  'ig_mock_006',
    niche:       ['fashion'],
    country:     'US',
    isVerified:  false,
    followers:   178000,
    avgLikes:    6200,
    avgComments: 320,
  },
  {
    username:    'yoga_with_anjali',
    displayName: 'Anjali Yoga',
    bio:         'Daily yoga flows & mindfulness 🧘',
    platform:    'instagram',
    platformId:  'ig_mock_007',
    niche:       ['fitness', 'lifestyle'],
    country:     'IN',
    isVerified:  false,
    followers:   54000,
    avgLikes:    2100,
    avgComments: 180,
  },
  {
    username:    'finance_with_james',
    displayName: 'James Finance',
    bio:         'Personal finance & investing made simple 💰',
    platform:    'youtube',
    platformId:  'yt_mock_003',
    niche:       ['business', 'education'],
    country:     'US',
    isVerified:  true,
    followers:   1200000,
    avgLikes:    45000,
    avgComments: 3200,
  },
  {
    username:    'photography_by_leo',
    displayName: 'Leo Photography',
    bio:         'Capturing moments around the world 📸',
    platform:    'instagram',
    platformId:  'ig_mock_008',
    niche:       ['travel', 'lifestyle'],
    country:     'FR',
    isVerified:  false,
    followers:   43000,
    avgLikes:    1800,
    avgComments: 120,
  },
  {
    username:    'cooking_with_maria',
    displayName: 'Maria Cooks',
    bio:         'Authentic Italian recipes from my kitchen 🍝',
    platform:    'instagram',
    platformId:  'ig_mock_009',
    niche:       ['food'],
    country:     'IT',
    isVerified:  false,
    followers:   98000,
    avgLikes:    4200,
    avgComments: 310,
  },
];

async function seed() {
  console.log('🌱 Seeding database...\n');

  for (const inf of influencers) {
    try {
      // Calculate engagement rate
      const engagementRate =
        inf.followers > 0
          ? (inf.avgLikes + inf.avgComments) / inf.followers
          : 0;

      // Upsert influencer
      const result = await db.query(
        `INSERT INTO influencers (
          username, display_name, bio, platform,
          platform_id, niche, country, is_verified,
          is_active, last_synced_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true, NOW())
        ON CONFLICT (platform_id) DO UPDATE SET
          username       = EXCLUDED.username,
          display_name   = EXCLUDED.display_name,
          bio            = EXCLUDED.bio,
          updated_at     = NOW()
        RETURNING id`,
        [
          inf.username,
          inf.displayName,
          inf.bio,
          inf.platform,
          inf.platformId,
          inf.niche,
          inf.country,
          inf.isVerified,
        ]
      );

      const influencerId = result.rows[0].id;

      // Insert metrics snapshot
      await db.query(
        `INSERT INTO influencer_metrics (
          influencer_id, followers_count,
          avg_likes, avg_comments, engagement_rate
        )
        VALUES ($1, $2, $3, $4, $5)`,
        [
          influencerId,
          inf.followers,
          inf.avgLikes,
          inf.avgComments,
          engagementRate,
        ]
      );

      console.log(`✅ Seeded: @${inf.username} — ${inf.followers.toLocaleString()} followers`);

    } catch (err: any) {
      console.error(`❌ Failed: ${inf.username} — ${err.message}`);
    }
  }

  // Refresh materialized view
  await db.query(
    'REFRESH MATERIALIZED VIEW CONCURRENTLY influencer_latest_metrics'
  );

  console.log('\n✅ Materialized view refreshed');
  console.log('🎉 Seeding complete!\n');

  await db.end();
}

seed().catch(console.error);