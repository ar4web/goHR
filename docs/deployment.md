# Deployment

Dash is a static site: `npm run build` produces `dist/`, which can be served
from any static host. No server-side code is required.

## Builds

```bash
npm run build    # BASE_PATH=/ (default) -> dist/
npm run preview  # serve dist/ locally
```

- **Subpath deploys** — `BASE_PATH=/Dash/ npm run build` prefixes every asset
  URL (manifest, icons, service worker). `preview` honors `BASE_PATH` too, so
  verify before shipping.
- **Sitemap** — emitted only when `SITE_URL` is set
  (`SITE_URL=https://example.com/ npm run build`), so the file never points
  at a host the site isn't on. Auth/error/placeholder pages are excluded.

## GitHub Pages

`.github/workflows/deploy-pages.yml` builds `master` with
`BASE_PATH=/Dash/` and deploys `dist/` to Pages. Pushes to `master` deploy
automatically; `workflow_dispatch` deploys on demand.

## Ad-hoc previews

`npm run deploy:preview` (`scripts/deploy-preview.sh`) builds and syncs to an
rclone remote with a three-pass cache strategy — immutable hashed assets,
short-cache HTML/manifest data, no-cache service worker — then optionally
purges the Cloudflare edge cache. Configure via environment (it refuses to
guess): `PREVIEW_BUCKET` (required), `PREVIEW_SLUG`, `PREVIEW_HOST`,
`CF_API_TOKEN`, `CF_ZONE_ID`.

## Cache rules that matter

- Hashed JS/CSS (`dist/assets/*`) — cache immutably for a year.
- `*.html`, `llms.txt`, `sitemap.xml` — short cache (`max-age=60`).
- `sw.js`, `site.webmanifest` — never cache. A stale service worker pins
  stale everything.
