import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(5001),
  DATABASE_URL: z.string().default('postgresql://labsmart_user:labsmart_secure_password_2026@localhost:5432/labsmart_db?schema=public'),
  REDIS_URL: z.string().default('redis://:labsmart_redis_password_2026@localhost:6379'),
  JWT_ACCESS_SECRET: z.string().default('labsmart_super_secure_access_token_secret_2026_xyz'),
  JWT_REFRESH_SECRET: z.string().default('labsmart_super_secure_refresh_token_secret_2026_abc'),
  CORS_ORIGINS: z.string().default('http://localhost:5173,http://localhost:5174,http://localhost:5175'),
  S3_ENDPOINT: z.string().default('http://localhost:9000'),
  S3_BUCKET: z.string().default('labsmart-reports'),
  S3_ACCESS_KEY: z.string().default('minio_admin'),
  S3_SECRET_KEY: z.string().default('minio_secret_password_2026'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid backend environment configuration:', parsed.error.format());
  throw new Error('Environment variable validation failed');
}

export const ENV = parsed.data;
