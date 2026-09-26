import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import { ENV } from './env.js';

declare global {
  // eslint-disable-next-line no-var
  var __prismaClient: PrismaClient | undefined;
}

function createPrismaClient(): PrismaClient {
  const isSqlite = ENV.DATABASE_URL.startsWith('file:') || ENV.DATABASE_URL.endsWith('.db');

  if (isSqlite) {
    const adapter = new PrismaBetterSqlite3({ url: ENV.DATABASE_URL });
    return new PrismaClient({
      adapter,
      log: ENV.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
    });
  }

  const pool = new pg.Pool({ connectionString: ENV.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({
    adapter,
    log: ENV.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });
}

export const prisma = global.__prismaClient || createPrismaClient();

if (ENV.NODE_ENV !== 'production') {
  global.__prismaClient = prisma;
}

