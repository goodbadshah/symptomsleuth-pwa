import type { NextConfig } from "next";
import withPWA from "@ducanh2912/next-pwa";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Acknowledge Turbopack as default in Next.js 16.
  // next-pwa's webpack config only applies to production builds.
  turbopack: {},
  allowedDevOrigins: ["10.0.0.165"],
};

export default withPWA({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === "development",
  // Offline fallback: served when a navigation request fails (no network).
  fallbacks: {
    document: "/offline",
  },
  workboxOptions: {
    disableDevLogs: true,
    // Force the new SW to activate immediately on rebuild instead of waiting
    // for all tabs to close. Without this, the old SW keeps serving stale JS
    // chunks after every build until the user manually unregisters it.
    skipWaiting: true,
    clientsClaim: true,
    runtimeCaching: [
      // Google Fonts stylesheet - cache-first, 1 year
      {
        urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
        handler: "CacheFirst",
        options: {
          cacheName: "google-fonts-stylesheets",
          expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
          cacheableResponse: { statuses: [0, 200] },
        },
      },
      // Google Fonts static files - cache-first, 1 year
      {
        urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
        handler: "CacheFirst",
        options: {
          cacheName: "google-fonts-webfonts",
          expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
          cacheableResponse: { statuses: [0, 200] },
        },
      },
    ],
  },
})(nextConfig);
