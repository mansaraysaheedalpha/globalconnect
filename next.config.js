import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  swcMinify: true,
  disable: process.env.NODE_ENV === "development",
  workboxOptions: {
    disableDevLogs: true,
  },
});

// Security headers for production
const securityHeaders = [
  // Enforce HTTPS
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  // Prevent clickjacking
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN',
  },
  // Prevent MIME type sniffing
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  // XSS Protection for legacy browsers
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block',
  },
  // DNS prefetching
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
  // Referrer policy
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  // Permissions policy - disable unnecessary browser features
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  },
  // Content Security Policy - adjust based on your needs
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https: http://localhost:*",
      "font-src 'self' data:",
      "connect-src 'self' https://api.stripe.com wss: ws: http://localhost:* https://localhost:*",
      "frame-src 'self' https://js.stripe.com https://hooks.stripe.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'self'",
    ].join('; '),
  },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove console.log in production for security and performance
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production'
      ? { exclude: ['error', 'warn'] }  // Keep error and warn for debugging
      : false,
  },

  // Powered by header removal for security
  poweredByHeader: false,

  // Security headers
  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },

  // Image optimization with restricted domains
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "source.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "unsplash.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "plus.unsplash.com",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "9000",
        pathname: "/globalconnect-dev/**",
      },
      // Restricted AWS S3 patterns - replace with your actual bucket names in production
      {
        protocol: "https",
        hostname: "globalconnect-prod.s3.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "globalconnect-dev.s3.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "s3.amazonaws.com",
        pathname: "/globalconnect-*/**",
      },
      {
        protocol: "https",
        hostname: "s3.*.amazonaws.com",
        pathname: "/globalconnect-*/**",
      },
      {
        protocol: "https",
        hostname: "images.pexels.com",
      },
    ],
  },
};

export default withPWA(nextConfig);
