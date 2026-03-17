import { initTRPC } from '@trpc/server';
import superjson from 'superjson';
import { db } from '@/lib/db';
import { redis } from '@/lib/redis';

// 1. Define context — available in every procedure
export const createTRPCContext = async () => {
  return { db, redis };
};

type Context = Awaited<ReturnType<typeof createTRPCContext>>;

// 2. Initialize tRPC with context and superjson transformer
const t = initTRPC.context<Context>().create({
  transformer: superjson,
});

// 3. Export these — used in every router file
export const createTRPCRouter  = t.router;
export const publicProcedure   = t.procedure;