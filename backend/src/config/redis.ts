import RedisPackage from 'ioredis';
import { ENV } from './env.js';

const RedisConstructor: any = (RedisPackage as any).default || RedisPackage;
let redisClient: any = null;
let isRedisAvailable = false;

try {
  redisClient = new RedisConstructor(ENV.REDIS_URL, {
    maxRetriesPerRequest: 1,
    retryStrategy: (times: number) => {
      if (times > 3) {
        console.warn('⚠️ Redis not reachable. Falling back to in-memory session management.');
        return null;
      }
      return Math.min(times * 100, 2000);
    },
  });

  redisClient.on('connect', () => {
    isRedisAvailable = true;
    console.log('✅ Connected to Redis cache service.');
  });

  redisClient.on('error', (err: any) => {
    isRedisAvailable = false;
    if (ENV.NODE_ENV === 'development') {
      console.warn('ℹ️ Redis notice:', err.message);
    }
  });
} catch {
  console.warn('⚠️ Redis initialization bypassed, in-memory session store active.');
}

const inMemoryStore = new Map<string, string>();

export const redisService = {
  isAvailable: () => isRedisAvailable,

  set: async (key: string, value: string, ttlSeconds?: number): Promise<void> => {
    if (isRedisAvailable && redisClient) {
      if (ttlSeconds) {
        await redisClient.set(key, value, 'EX', ttlSeconds);
      } else {
        await redisClient.set(key, value);
      }
    } else {
      inMemoryStore.set(key, value);
    }
  },

  get: async (key: string): Promise<string | null> => {
    if (isRedisAvailable && redisClient) {
      return await redisClient.get(key);
    }
    return inMemoryStore.get(key) || null;
  },

  del: async (key: string): Promise<void> => {
    if (isRedisAvailable && redisClient) {
      await redisClient.del(key);
    } else {
      inMemoryStore.delete(key);
    }
  },
};
