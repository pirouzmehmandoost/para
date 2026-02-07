/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  transpilePackages: [
    "@react-three/fiber",
    "@react-three/drei", 
    "@react-three/postprocessing"
  ],
};

export default nextConfig;
