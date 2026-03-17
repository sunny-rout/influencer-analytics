import Redis from 'ioredis';

const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined;
};

export const redis = globalForRedis.redis ?? new Redis(process.env.REDIS_URL!, {
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    // Retry with exponential backoff, max 3 seconds
    return Math.min(times * 100, 3000);
  },
});

if (process.env.NODE_ENV !== 'production') {
  globalForRedis.redis = redis;
}

// Helper functions used throughout the app
export async function getCached<T>(key: string): Promise<T | null> {
  const cached = await redis.get(key);
  if (!cached) return null;
  try {
    return JSON.parse(cached) as T;
  } catch {
    return null;
  }
}

export async function setCache<T>(
  key: string,
  value: T,
  ttlSeconds: number = 300
): Promise<void> {
  await redis.setex(key, ttlSeconds, JSON.stringify(value));
}

export async function invalidateCache(pattern: string): Promise<void> {
  const keys = await redis.keys(pattern);
  if (keys.length > 0) await redis.del(...keys);
}

// TTL constants — use these everywhere for consistency
export const CACHE_TTL = {
  SEARCH:   5  * 60,   // 5 minutes
  PROFILE:  60 * 60,   // 1 hour
  METRICS:  30 * 60,   // 30 minutes
} as const;

export default redis;