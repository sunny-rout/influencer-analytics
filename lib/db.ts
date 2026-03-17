import { Pool } from 'pg';

// Singleton pattern — reuse the same connection pool
// across all requests instead of creating a new one each time
const globalForDb = globalThis as unknown as {
  db: Pool | undefined;
};

export const db = globalForDb.db ?? new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,                // max 20 connections in pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// In development, store on globalThis to survive hot reloads
// Without this, Next.js hot reload creates a new pool every save
if (process.env.NODE_ENV !== 'production') {
  globalForDb.db = db;
}

export default db;