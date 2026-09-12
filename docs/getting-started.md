# Getting started

## Prerequisites

- **Node.js 20+** (`.nvmrc` pins 20; newer works) and npm.
- No database, no API keys, no environment variables. Seed data ships in the
  repo, so every page works five seconds after `npm install`.

## Install and run

```bash
git clone https://github.com/ar4web/Dash.git
cd Dash
npm install
npm run dev
```

Vite prints a local URL (Vite prints the exact port). The site root `/`
redirects to the HR dashboard; every page lives under `/production/`, e.g.
`/production/hr_dashboard.html`, `/production/inbox.html`.

## First build

```bash
npm run build    # production build -> dist/
npm run preview  # serve dist/ locally to verify the build
```

`npm run build` also emits the root redirect, PWA meta, SEO fallbacks, and
`sitemap.xml` (only when `SITE_URL` is set — see
[deployment](deployment.md)).

## Verify before you commit

```bash
npm test             # static audits + HR logic suites — must be all green
npm run test:runtime # browser-behavior suite (vitest + jsdom)
npm run lint         # ESLint over src/ — 0 errors required
```

These are the gates from the [workflow](workflow.md): every chunk passes all
of them before it is committed and pushed.

## Troubleshooting

- **Port in use** — `npm run dev -- --port 5199` (or any free port).
- **Stale content in the browser** — the service worker only registers in
  production builds, so dev is always fresh; for `preview`, hard-reload once.
- **A page renders blank** — open devtools: most pages fail loudly on a
  missing `#id` or import; `npm test` catches wiring issues statically.
- **Playwright browsers missing** — only `npm run screenshots` needs them;
  the test suites use jsdom and static analysis instead.

## Next steps

- [Workflow](workflow.md) — how changes ship, chunk by chunk.
- [Architecture](architecture.md) — bundle, shell, lazy imports.
- [Project structure](project-structure.md) — what lives where.
