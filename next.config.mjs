/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  cacheComponents: true,
  transpilePackages: [
    "@react-three/fiber",
    "@react-three/drei", 
    "@react-three/postprocessing"
  ],
};

export default nextConfig;
