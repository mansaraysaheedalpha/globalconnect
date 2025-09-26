/** @type {import('next').NextConfig} */
const nextConfig = {
  // Your Next.js configuration options will go here in the future.
   // ✅ THE FIX: This section tells Next.js to trust images from placehold.co
   images: {
    remotePatterns: [
      // ✅ ADD THIS NEW BLOCK
      {
        protocol: "https",
        hostname: 'source.unsplash.com',
        port: "",
        pathname:  '/random/**',
      },
    ],
  },
};

module.exports = nextConfig;