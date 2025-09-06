import "server-only";
import { redis } from "./redis";

type CacheOptions = {
  key: string;
  ttl?: number; // Time to live in seconds
};

export async function cache<T>(options: CacheOptions, callback: () => Promise<T>): Promise<T> {
  const { key, ttl = 3600 } = options; // Default TTL of 1 hour

  // If Redis is not configured, bypass caching gracefully
  if (!redis) {
    return await callback();
  }

  const cachedData = await redis.get(key);
  if (cachedData) {
    return JSON.parse(cachedData) as T;
  }

  const freshData = await callback();
  await redis.set(key, JSON.stringify(freshData), "EX", ttl);

  return freshData;
}
