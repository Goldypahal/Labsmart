import test from 'node:test';
import assert from 'node:assert/strict';
import { checkProductionSecrets, loadEnv, KNOWN_LEAKED_SECRETS } from '../src/config/env.js';

const strong = (seed: string) => `${seed}_${'x'.repeat(40)}`;

test('production refuses to start without secrets (SEC-003)', () => {
  assert.throws(() => loadEnv({ NODE_ENV: 'production' }), /Refusing to start in production/);
});

test('production refuses secrets that were published in the repo (SEC-011)', () => {
  for (const leaked of KNOWN_LEAKED_SECRETS) {
    const problems = checkProductionSecrets({
      NODE_ENV: 'production',
      PORT: 5001,
      DATABASE_URL: `postgresql://u:${leaked}@db:5432/x`,
      JWT_ACCESS_SECRET: leaked.padEnd(40, '_'),
      JWT_REFRESH_SECRET: strong('refresh'),
      CORS_ORIGINS: '',
      S3_BUCKET: 'b',
    });
    assert.ok(problems.length > 0, `accepted leaked value ${leaked}`);
  }
});

test('production refuses short, identical or development-only JWT secrets', () => {
  const base = { NODE_ENV: 'production' as const, PORT: 5001, DATABASE_URL: 'postgresql://u:p@db/x', CORS_ORIGINS: '', S3_BUCKET: 'b' };
  assert.ok(checkProductionSecrets({ ...base, JWT_ACCESS_SECRET: 'short', JWT_REFRESH_SECRET: strong('r') }).length > 0);
  assert.ok(checkProductionSecrets({ ...base, JWT_ACCESS_SECRET: strong('same'), JWT_REFRESH_SECRET: strong('same') }).length > 0);
  assert.ok(checkProductionSecrets({ ...base, JWT_ACCESS_SECRET: strong('dev_only'), JWT_REFRESH_SECRET: strong('r') }).length > 0);
});

test('production accepts strong, distinct, unpublished secrets', () => {
  const env = loadEnv({
    NODE_ENV: 'production',
    DATABASE_URL: 'postgresql://app:Zq8newSecretValue@db:5432/lims',
    JWT_ACCESS_SECRET: strong('access'),
    JWT_REFRESH_SECRET: strong('refresh'),
  });
  assert.equal(env.NODE_ENV, 'production');
});

test('development starts with clearly-labelled placeholders, never the old published secrets', () => {
  const env = loadEnv({ NODE_ENV: 'development' });
  assert.match(env.JWT_ACCESS_SECRET, /dev_only/);
  for (const leaked of KNOWN_LEAKED_SECRETS) {
    assert.ok(!env.JWT_ACCESS_SECRET.includes(leaked) && !env.DATABASE_URL.includes(leaked));
  }
});
