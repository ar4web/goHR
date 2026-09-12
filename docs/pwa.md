# PWA

Dash is installable on desktop and mobile:

- **Manifest** — `public/site.webmanifest` (name, icons, theme colors,
  shortcuts). Injected into every page at build time with subpath-safe URLs.
- **Service worker** — `public/sw.js`. Cache-first for hashed assets,
  network-first for HTML, fallback to `production/offline.html`. The
  activate handler deletes any cache that isn't the current `CACHE` key, so
  bumping the key migrates users cleanly.
- **Dev vs. prod** — the worker only registers in production builds
  (`import.meta.env.PROD`), so HMR is never fought by the cache.

Never cache `sw.js` or `site.webmanifest` themselves (see
[deployment](deployment.md)) — a stale worker pins stale everything.
