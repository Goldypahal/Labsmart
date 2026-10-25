import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

/**
 * Environment configuration.
 *
 * Secrets have NO defaults. In development and test, missing secrets fall back to
 * clearly-labelled throwaway values so the app can start locally. In production,
 * startup fails if any secret is missing, too short, or equal to a value that has
 * ever been published in this repository (SEC-003, SEC-011).
 */

// Values that appeared in git history. They must never be accepted in production.
export const KNOWN_LEAKED_SECRETS = [
  'labsmart_super_secure_access_token_secret_2026_xyz',
  'labsmart_super_secure_refresh_token_secret_2026_abc',
  'secure_access_token_secret_min_32_bytes_long',
  'secure_refresh_token_secret_min_32_bytes_long',
  'labsmart_secure_password_2026',
  'labsmart_redis_password_2026',
  'minio_secret_password_2026',
];

const DEV_ONLY = {
  DATABASE_URL: 'postgresql://labsmart_dev:dev_only_change_me@localhost:5432/labsmart_dev?schema=public',
  JWT_ACCESS_SECRET: 'dev_only_access_secret_not_for_production_use_000',
  JWT_REFRESH_SECRET: 'dev_only_refresh_secret_not_for_production_use_000',
};

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(5001),
  DATABASE_URL: z.string().min(1).optional(),
  REDIS_URL: z.string().optional(),
  JWT_ACCESS_SECRET: z.string().optional(),
  JWT_REFRESH_SECRET: z.string().optional(),
  CORS_ORIGINS: z.string().default('http://localhost:5173,http://localhost:5174,http://localhost:5175'),
  S3_ENDPOINT: z.string().optional(),
  S3_BUCKET: z.string().default('labsmart-reports'),
  S3_ACCESS_KEY: z.string().optional(),
  S3_SECRET_KEY: z.string().optional(),
});

type RawEnv = z.infer<typeof envSchema>;

/** Returns a list of problems; empty means the configuration is acceptable. */
export function checkProductionSecrets(env: RawEnv): string[] {
  const problems: string[] = [];
  const required: Array<keyof RawEnv> = ['DATABASE_URL', 'JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET'];
  for (const key of required) {
    const value = env[key];
    if (typeof value !== 'string' || value.length === 0) {
      problems.push(`${key} is required in production`);
      continue;
    }
    if (KNOWN_LEAKED_SECRETS.some((leaked) => value.includes(leaked)) || value.includes('dev_only')) {
      problems.push(`${key} uses a published or development-only value; generate a new secret`);
    }
  }
  for (const key of ['JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET'] as const) {
    const value = env[key];
    if (typeof value === 'string' && value.length > 0 && value.length < 32) {
      problems.push(`${key} must be at least 32 characters`);
    }
  }
  if (env.JWT_ACCESS_SECRET && env.JWT_ACCESS_SECRET === env.JWT_REFRESH_SECRET) {
    problems.push('JWT_ACCESS_SECRET and JWT_REFRESH_SECRET must be different');
  }
  for (const key of ['REDIS_URL', 'S3_SECRET_KEY'] as const) {
    const value = env[key];
    if (typeof value === 'string' && KNOWN_LEAKED_SECRETS.some((leaked) => value.includes(leaked))) {
      problems.push(`${key} uses a published value; generate a new secret`);
    }
  }
  return problems;
}

export function loadEnv(source: NodeJS.ProcessEnv) {
  const parsed = envSchema.safeParse(source);
  if (!parsed.success) {
    console.error('Invalid backend environment configuration:', parsed.error.format());
    throw new Error('Environment variable validation failed');
  }
  const raw = parsed.data;

  if (raw.NODE_ENV === 'production') {
    const problems = checkProductionSecrets(raw);
    if (problems.length > 0) {
      throw new Error(`Refusing to start in production:\n - ${problems.join('\n - ')}`);
    }
  } else {
    const missing = (['DATABASE_URL', 'JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET'] as const).filter((k) => !raw[k]);
    if (missing.length > 0) {
      console.warn(`Using development-only placeholder values for: ${missing.join(', ')}`);
    }
  }

  return {
    ...raw,
    DATABASE_URL: raw.DATABASE_URL ?? DEV_ONLY.DATABASE_URL,
    JWT_ACCESS_SECRET: raw.JWT_ACCESS_SECRET ?? DEV_ONLY.JWT_ACCESS_SECRET,
    JWT_REFRESH_SECRET: raw.JWT_REFRESH_SECRET ?? DEV_ONLY.JWT_REFRESH_SECRET,
    REDIS_URL: raw.REDIS_URL ?? '',
    S3_ENDPOINT: raw.S3_ENDPOINT ?? '',
    S3_ACCESS_KEY: raw.S3_ACCESS_KEY ?? '',
    S3_SECRET_KEY: raw.S3_SECRET_KEY ?? '',
  };
}

export const ENV = loadEnv(process.env);
