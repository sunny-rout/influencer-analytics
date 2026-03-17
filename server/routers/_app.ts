import { createTRPCRouter } from '@/lib/trpc/server';
import { influencerRouter } from './influencer';

export const appRouter = createTRPCRouter({
  influencer: influencerRouter,
  // We'll add these later:
  // metrics:   metricsRouter,
  // campaign:  campaignRouter,
  // list:      listRouter,
});

// This type is imported by the frontend — the key link
export type AppRouter = typeof appRouter;