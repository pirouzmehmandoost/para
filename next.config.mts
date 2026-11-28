import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  transpilePackages: [
    "@react-three/fiber",
    "@react-three/drei", 
    "@react-three/postprocessing"
  ],
  experimental: {
    agentFeedback: true,
  },
};

export default nextConfig;
