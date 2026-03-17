const INSTAGRAM_API = 'https://graph.instagram.com/v25.0';
const FACEBOOK_API     = 'https://graph.facebook.com/v25.0';

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
  country:        string | null;
  accountType:    'BUSINESS' | 'CREATOR' | 'PERSONAL';
}

export interface NormalizedMetrics {
  avgLikes:       number;
  avgComments:    number;
  engagementRate: number;
  postsAnalyzed:  number;
}

// ── Step 1: Detect account type ────────────────────────

async function detectAccountType(
  userId: string
): Promise<'BUSINESS' | 'CREATOR' | 'PERSONAL'> {
  const url =
    `${INSTAGRAM_API}/${userId}` +
    `?fields=account_type` +
    `&access_token=${process.env.INSTAGRAM_ACCESS_TOKEN}`;

  const res  = await fetch(url);
  const data = await res.json();

  if (data.error) return 'PERSONAL'; // fallback

  // account_type: "BUSINESS" | "MEDIA_CREATOR" | "PERSONAL"
  if (data.account_type === 'BUSINESS')      return 'BUSINESS';
  if (data.account_type === 'MEDIA_CREATOR') return 'CREATOR';
  return 'PERSONAL';
}

// ── Step 2a: Fetch via Basic API (Personal/Creator) ────

async function fetchBasicProfile(
  userId: string
): Promise<NormalizedProfile> {
  const fields = [
    'id', 'username', 'name', 'biography',
    'profile_picture_url', 'followers_count',
    'follows_count', 'media_count', 'website',
    'account_type',
  ].join(',');

  const url =
    `${INSTAGRAM_API}/${userId}` +
    `?fields=${fields}` +
    `&access_token=${process.env.INSTAGRAM_ACCESS_TOKEN}`;

  const res  = await fetch(url);
  const data = await res.json();

  if (data.error) {
    throw new Error(`Instagram Basic API error: ${data.error.message}`);
  }

  const accountType =
    data.account_type === 'BUSINESS'      ? 'BUSINESS' :
    data.account_type === 'MEDIA_CREATOR' ? 'CREATOR'  : 'PERSONAL';

  return {
    platformId:     data.id,
    username:       data.username,
    displayName:    data.name                || data.username,
    bio:            data.biography           || '',
    avatarUrl:      data.profile_picture_url || '',
    followersCount: data.followers_count     || 0,
    followingCount: data.follows_count       || 0,
    postsCount:     data.media_count         || 0,
    website:        data.website             || '',
    country:        null,      // ← not available in Basic API
    accountType,
  };
}

// ── Step 2b: Fetch via Business Discovery API ──────────
// Used when fetching OTHER business accounts by username

async function fetchBusinessDiscoveryProfile(
  username: string
): Promise<NormalizedProfile> {
  const businessAccountId = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID;

  if (!businessAccountId) {
    throw new Error(
      'INSTAGRAM_BUSINESS_ACCOUNT_ID is not set in .env.local'
    );
  }

  const fields = [
    'id', 'username', 'name', 'biography',
    'profile_picture_url', 'followers_count',
    'follows_count', 'media_count', 'website',
    'location',
  ].join(',');

  const url =
    `${FACEBOOK_API}/${businessAccountId}` +
    `?fields=business_discovery.fields(${fields})` +
    `&access_token=${process.env.INSTAGRAM_ACCESS_TOKEN}`;

  const res  = await fetch(url);
  const data = await res.json();

  if (data.error) {
    throw new Error(
      `Instagram Business Discovery error: ${data.error.message}`
    );
  }

  const profile = data.business_discovery;

  if (!profile) {
    throw new Error(
      `Could not find business account: @${username}. ` +
      `Make sure the account is a Business or Creator account.`
    );
  }

  // Extract country from location if available
  const country = profile.location?.country_code || null;

  return {
    platformId:     profile.id,
    username:       profile.username,
    displayName:    profile.name                || profile.username,
    bio:            profile.biography           || '',
    avatarUrl:      profile.profile_picture_url || '',
    followersCount: profile.followers_count     || 0,
    followingCount: profile.follows_count       || 0,
    postsCount:     profile.media_count         || 0,
    website:        profile.website             || '',
    country,          // ← available in Business Discovery ✅
    accountType:    'BUSINESS',
  };
}

// ── Main Export: Auto-detect and fetch ─────────────────

export async function fetchInstagramProfile(
  userIdOrUsername: string,
  options: {
    useBusinessDiscovery?: boolean; // force Business Discovery
    country?:              string;  // manual override
  } = {}
): Promise<NormalizedProfile> {

  let profile: NormalizedProfile;

  if (options.useBusinessDiscovery) {
    // Fetch another business account by username
    profile = await fetchBusinessDiscoveryProfile(userIdOrUsername);
  } else {
    // Fetch own account via Basic API
    profile = await fetchBasicProfile(userIdOrUsername);
  }

  // Manual country override — takes priority over API value
  if (options.country) {
    profile.country = options.country.toUpperCase();
  }

  return profile;
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

  const media = data.data || [];

  if (media.length === 0) {
    return {
      avgLikes:       0,
      avgComments:    0,
      engagementRate: 0,
      postsAnalyzed:  0,
    };
  }

  const totals = media.reduce(
    (acc: any, post: any) => ({
      likes:    acc.likes    + (post.like_count     || 0),
      comments: acc.comments + (post.comments_count || 0),
    }),
    { likes: 0, comments: 0 }
  );

  const count = media.length;

  return {
    avgLikes:       totals.likes    / count,
    avgComments:    totals.comments / count,
    engagementRate: 0,
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