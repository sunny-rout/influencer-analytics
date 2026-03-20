import type { NextConfig } from "next";

const nextConfig: NextConfig = {
   serverExternalPackages: ['pg', 'pg-native', 'ioredis', 'bullmq', 'bcryptjs'],
};

export default nextConfig;
