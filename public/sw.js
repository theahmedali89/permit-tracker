/* Permit Warden service worker — minimal, versioned cache.
 * Caches ONLY the app shell ('/') and '/manifest.json' on install.
 * Fetch strategy:
 *   - cache-first for same-origin GET requests for static assets
 *     (/_next/static/*, /blog/* images, /logo-mark.png, icons, fonts)
 *   - network-first for everything else
 *   - NEVER caches /api/* or /auth/* (or any non-GET request)
 * Bump CACHE_NAME on every release that changes the shell.
 */
const CACHE_NAME = "permit-warden-v1";
const SHELL_URLS = ["/", "/manifest.json"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(SHELL_URLS))
      .catch(() => {
        // Offline-first is best-effort: a failed precache must not break install.
      })
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

function isStaticAsset(url) {
  return (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/blog/") ||
    /\.(png|jpg|jpeg|webp|svg|ico|woff|woff2|css|js)$/i.test(url.pathname)
  );
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  // Never intercept or cache API/auth traffic, or cross-origin requests.
  if (url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/") || url.pathname.startsWith("/auth/")) return;

  if (isStaticAsset(url)) {
    // Cache-first for versioned/static assets.
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((response) => {
            if (response.ok) {
              const copy = response.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
            }
            return response;
          })
      )
    );
    return;
  }

  // Network-first for pages and everything else; fall back to the cached
  // shell for navigations when offline.
  event.respondWith(
    fetch(request)
      .then((response) => response)
      .catch(() =>
        request.mode === "navigate"
          ? caches.match("/").then((cached) => cached || Response.error())
          : caches.match(request)
      )
  );
});
