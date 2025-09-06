import "server-only";
import Redis from "ioredis";
import { env } from "../../../env";

let redis: Redis | null = null;

declare global {
  var __redis: Redis | null | undefined;
}

if (env.REDIS_URL) {
  if (env.NODE_ENV === "production") {
    redis = new Redis(env.REDIS_URL);
  } else {
    if (!global.__redis) {
      global.__redis = new Redis(env.REDIS_URL);
    }
    redis = global.__redis ?? null;
  }
}

export { redis };
