'use client';
import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from '@/server/routers/_app';

// Import only the TYPE — zero backend code leaks to frontend
export const trpc = createTRPCReact<AppRouter>();