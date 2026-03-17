const INSTAGRAM_API = 'https://graph.instagram.com/v25.0';

// ── Types ──────────────────────────────────────────────

interface InstagramProfile {
  id:                  string;
  username:            string;
  name:                string;
  biography:           string;
  profile_picture_url: string;
  followers_count:     number;
  follows_count:       number;
  media_count:         number;
  website:             string;
}

interface InstagramMedia {
  id:             string;
  like_count:     number;
  comments_count: number;
  timestamp:      string;
  media_type:     string;
}

export interface NormalizedProfile {
  platformId:     string;
  username:       string;
  displayName:    string;
  bio:            string;
  avatarUrl:      string;
  followersCount: number;
  followingCount: number;
  postsCount:     number;
  website:        string;
}

export interface NormalizedMetrics {
  avgLikes:       number;
  avgComments:    number;
  engagementRate: number;
  postsAnalyzed:  number;
}

// ── Fetch Profile ──────────────────────────────────────

export async function fetchInstagramProfile(
  userId: string
): Promise<NormalizedProfile> {
  const fields = [
    'id', 'username', 'name', 'biography',
    'profile_picture_url', 'followers_count',
    'follows_count', 'media_count', 'website',
  ].join(',');

  const url =
    `${INSTAGRAM_API}/${userId}` +
    `?fields=${fields}` +
    `&access_token=${process.env.INSTAGRAM_ACCESS_TOKEN}`;

  const res = await fetch(url);
  const data = await res.json();

  if (data.error) {
    throw new Error(`Instagram API error: ${data.error.message}`);
  }

  const profile = data as InstagramProfile;

  return {
    platformId:     profile.id,
    username:       profile.username,
    displayName:    profile.name        || profile.username,
    bio:            profile.biography   || '',
    avatarUrl:      profile.profile_picture_url || '',
    followersCount: profile.followers_count     || 0,
    followingCount: profile.follows_count       || 0,
    postsCount:     profile.media_count         || 0,
    website:        profile.website             || '',
  };
}

// ── Fetch Media Metrics ────────────────────────────────

export async function fetchInstagramMediaMetrics(
  userId: string
): Promise<NormalizedMetrics> {
  const url =
    `${INSTAGRAM_API}/${userId}/media` +
    `?fields=id,like_count,comments_count,timestamp,media_type` +
    `&limit=12` +
    `&access_token=${process.env.INSTAGRAM_ACCESS_TOKEN}`;

  const res  = await fetch(url);
  const data = await res.json();

  if (data.error) {
    throw new Error(`Instagram media error: ${data.error.message}`);
  }

  const media: InstagramMedia[] = data.data || [];

  if (media.length === 0) {
    return { avgLikes: 0, avgComments: 0, engagementRate: 0, postsAnalyzed: 0 };
  }

  // Calculate averages from last 12 posts
  const totals = media.reduce(
    (acc, post) => ({
      likes:    acc.likes    + (post.like_count     || 0),
      comments: acc.comments + (post.comments_count || 0),
    }),
    { likes: 0, comments: 0 }
  );

  const count      = media.length;
  const avgLikes    = totals.likes    / count;
  const avgComments = totals.comments / count;

  return {
    avgLikes,
    avgComments,
    engagementRate: 0, // calculated after we know followers
    postsAnalyzed:  count,
  };
}

// ── Calculate Engagement Rate ──────────────────────────

export function calculateEngagementRate(
  avgLikes:    number,
  avgComments: number,
  followers:   number
): number {
  if (followers === 0) return 0;
  return (avgLikes + avgComments) / followers;
}