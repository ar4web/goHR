# Architecture

No framework, no SPA. Every page in `production/` is its own HTML entry, and
they all load one shared bundle: `/src/main-v4.js`.

## Request path (dev and build)

1. **Shell injection.** `vite.config.js` (`dash-shell-injection`) inlines the
   sidebar/topbar into every `body[data-shell="admin"]` page at
   dev/build time, so the shell paints on the first frame. At runtime
   `mountShell()` (`src/v4/shell.js`) detects the injected shell and only
   wires event handlers.
2. **Entry boot.** `main-v4.js` mounts the shell, initializes theme, i18n
   (`src/v4/i18n.js`), and the command palette, then lets feature modules
   initialize against element presence.
3. **Page behavior is data-driven.** `<body>` carries `data-page="key"` and
   `data-breadcrumb="A > B"`; modules read those plus `document.getElementById`
   guards instead of per-page entry scripts.

## Lazy loading

`echarts`, `datatables.net`, `leaflet`, and `xlsx` are dynamically imported
inside feature modules, so pages that don't use them never download them.
Check `src/v4/charts.js`, `src/v4/tables.js`, `src/v4/map-helper.js`, and
`src/v4/import-export.js` for the pattern.

## State

There is no store. Page state lives in the DOM, user preferences in
`localStorage` (`theme`, `hr:lang`, `dash:sidebar-rail`, `dash:settings`),
and HR seed/override data behind `src/v4/hr-api.js` (`getSeed`) with
`hr:import:*` overrides. The [data adapter](data-adapter.md) swaps seed data
for a real backend without touching pages.
