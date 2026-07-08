import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    // allow images served from the API host (add other hosts as needed)
    domains: [
      'kopbnkasso.runasp.net',
    ],
  },
};

export default nextConfig;
