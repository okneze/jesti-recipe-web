import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Removed 'output: export' for Railway deployment
  // output: 'export',
  // experimental: {
  //   turbo: {
  //     rules: {
  //       '*.svg': {
  //         loaders: ['@svgr/webpack'],
  //         as: '*.js',
  //       }
  //     }
  //   }
  // },
  images: { unoptimized: true }
};

export default nextConfig;
