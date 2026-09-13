# AGENTS.md

Dash (`1.0.0`) — internal bilingual (EN/AR) HR command center for KSA. 108 HTML
pages in `production/`, Vite 8 (Rolldown), vanilla ES2022, SCSS only. No
Bootstrap, no jQuery, no SPA framework. Heavy deps (ECharts 6, DataTables.net 3,
Leaflet 1.9, `xlsx`) are lazy-imported per page. Counterparts: `CLAUDE.md`,
`.cursor/rules/`, `.github/copilot-instructions.md` — content overlaps on purpose.

## Setup & commands

Requires Node 20 (`.nvmrc`) + npm. No DB, no env vars; seed data works offline.

```bash
nvm use && npm install
npm run dev                # :9173 (PORT=… to override), opens /production/index.html
npm run preview            # serve dist/ on :9174
npm run build              # → dist/ ; subpath: BASE_PATH=/Dash/ npm run build

npm test                   # 16× node suites: hr-audit-*, hr-logic-*, import, seed, security
node tests/hr-logic-p1.mjs # single static/logic suite (any file in tests/*.mjs)
npm run test:runtime        # vitest + jsdom (tests/runtime-smoke.test.js only)
npx vitest run tests/runtime-smoke.test.js -t "<name>"  # single runtime test

npm run lint               # ESLint over src/ only — 0 errors required
npm run lint:fix
npx prettier --check <touched files>  # format gate is touched-lines only
npm run new -- <slug>      # scaffold production/<slug>.html
npm run smoke              # boot dev server, assert 200 on every page
```

## Workflow

Chunk loop: code one concern → run all gates → commit + push immediately
(see `docs/workflow.md`). Gates: `npm test` + `npm run test:runtime` (all green),
`npm run lint` (0 errors), Prettier-clean touched lines, dev smoke of touched
pages in EN + AR at desktop + mobile widths.

Standing rules: bilingual UI (EN/AR) on everything new; KSA-first HR logic
(labor law, GOSI, ZATCA, Nitaqat, Ajeer); no page deletions; settings-driven
behavior (never hardcode owner values); Excel import + export on data grids.

## Architecture

- Single entry `src/main-v4.js`: imports `scss/v4/main.scss`, calls
  `mountShell()/initI18n()/initCharts()/initTables()/initCommandPalette()/initPageActions()`,
  then lazy-imports page modules behind DOM-presence guards
  (`if (document.getElementById('inbox-root')) import(...)`). Never add per-page `<script>` entries.
- Shell injection at build/dev time: `shellInjectionPlugin` in `vite.config.js`
  inlines sidebar/topbar/footer into bodies with `data-shell="admin"`. Runtime
  `mountShell()` in `src/v4/shell.js` only wires handlers + fallback. Pages
  without `data-shell="admin"` (login, errors) get no shell.
- Entries auto-discovered: `discoverEntries()` walks `production/*.html` — drop
  a file in, it's live. Never edit `rollupOptions.input`.
- `NAV` in `src/v4/shell-render.js` is the single sidebar source; leaf `key`
  must match body's `data-page`. New icons go in `ICONS` in the same file.
- Breadcrumb: `data-breadcrumb="Home > …"`. Segments matching a NAV label
  auto-link (parent → first child); override with pipe
  (`Projects|projects.html`); last segment never links; unmatched segments render
  as plain text — drop grouping-only levels instead of shipping dead crumbs.
- Theming: tokens in `src/scss/v4/_tokens.scss` (`:root` + `[data-theme="dark"]`).
  Pre-paint script sets `data-theme` from `localStorage`, dark when unset. Service
  worker registers only under `import.meta.env.PROD`.
- Subpath-safe: relative paths in `production/*.html`, `import.meta.env.BASE_URL`
  in JS, `${base}` in the Vite plugin. Never hard-code leading `/`.
- Only three lazy vendor chunks (`vendor-echarts/-tables/-maps` matched by
  `node_modules` path); `xlsx` lazy-imports without a chunk. Everything else is main chunk.

## Conventions

- Vanilla DOM only (`querySelector`/`classList`/`addEventListener`).
- Page modules export one idempotent `init<Name>()`: safe with root absent, safe twice.
- Shared interactions delegate on `document` (bottom of `src/main-v4.js`);
  stateful components (inbox, kanban, palette) bind on their own root.
- Overlays only via `showModal()`/`showToast()` (`src/v4/modal.js`, `toast.js`)
  and `openMenu()`/`openPanel()` (`src/v4/menus.js`) — they own backdrop/escape/focus.
- Colors via `var(--…)` tokens only, never hex in components. Charts read tokens
  with `getComputedStyle(document.documentElement).getPropertyValue('--…')`.
- RTL: logical properties (`margin-inline-start`), never physical (`margin-left`) —
  the static audit enforces this. Spacing scale: `var(--space-1…6)` (4/8/12/16/24/32px).
- No `console.*` in shipped code (Terser drops it; lint warns). SCSS in partials
  by surface (`_components` shared, `_widgets` dashboard, `_pages` single-page,
  `_apps` chat/kanban/files, `_hr.scss`/`_ksa.scss` HR/Saudi); no inline `<style>`.
- New strings ship EN + AR (`data-i18n` or `hr.*` dicts in `src/v4/i18n.js`).

## New page / chart / table

```bash
npm run new -- <slug> --title "Name" --nav-group "Admin" \
  --breadcrumb "Home > Group|page.html > Name" --icon profile
```

By hand: `production/<slug>.html` with
`<body data-shell="admin" data-page="<slug>" data-breadcrumb="Home > …">` +
`<script type="module" src="/src/main-v4.js">`, then add `{ key, href, text, icon }`
to `NAV` (`key` = `data-page`). Chart: `<div class="chart" data-chart="<id>">` +
`case '<id>':` in `initCharts()` (`src/v4/charts.js`, modular ECharts imports).
Table: `<table class="table" data-datatable>` (`data-orderable="false"`,
`data-page-length="25"`).

## Don't

- Add jQuery/Bootstrap/SPA framework/Tailwind/extra build steps; edit
  `dist/`, `node_modules/`, `docs/screenshots/` (generated); delete pages.
- `import * as echarts`; `new bootstrap.Modal()`; hand-rolled modal/toast/dropdown;
  hardcoded `/` asset paths; physical-direction CSS; hardcoded colors.
- Bump CDN scripts with pinned `integrity=` without updating hashes.

## Pointers

- Full architecture brief: `CLAUDE.md`. Contributor loop + gates: `CONTRIBUTING.md`, `docs/workflow.md`.
- Bundle/shell/lazy imports: `docs/architecture.md`. Deploy/cache headers: `docs/deployment.md`, `scripts/deploy-preview.sh`.
- Public JS surface types: `types/dash.d.ts`.
