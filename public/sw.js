// SymptomSleuth service worker.
//
// Hand-rolled because @ducanh2912/next-pwa hooks webpack, but Next 16 builds
// with Turbopack by default. Keep this file thin: cache the install-time app
// shell, runtime-cache static assets, and serve /offline when navigation fails.
//
// Bump CACHE_VERSION whenever this file changes shape so old caches get purged.

const CACHE_VERSION = "v1";
const PRECACHE = `symptomsleuth-precache-${CACHE_VERSION}`;
const RUNTIME = `symptomsleuth-runtime-${CACHE_VERSION}`;

const PRECACHE_URLS = [
  "/",
  "/offline",
  "/manifest.json",
  "/icons/symptomsleuth-icon-194.png",
  "/icons/symptomsleuth-icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(PRECACHE)
      .then((cache) =>
        cache.addAll(PRECACHE_URLS.map((u) => new Request(u, { cache: "reload" }))),
      )
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k !== PRECACHE && k !== RUNTIME)
            .map((k) => caches.delete(k)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  // Only handle GETs from our origin. Leave POSTs (Stripe, Supabase, our APIs)
  // and cross-origin requests to the network.
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // Never cache API routes - they're stateful and user-scoped.
  if (url.pathname.startsWith("/api/")) return;

  // Navigation requests: network-first, fall back to /offline.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() =>
        caches.match("/offline").then((res) => res ?? Response.error()),
      ),
    );
    return;
  }

  // Static assets (Next chunks, fonts, icons): cache-first with network fallback.
  if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/icons/") ||
    url.pathname.startsWith("/brand/") ||
    url.pathname === "/manifest.json"
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(RUNTIME).then((cache) => cache.put(request, copy));
          }
          return response;
        });
      }),
    );
  }
});
