# Contributing to Dash

Thanks for considering a contribution. This is a small, opinionated codebase —
knowing the conventions makes review much faster.

## Getting set up

```bash
git clone https://github.com/ar4web/Dash.git
cd Dash
nvm use            # picks up .nvmrc (Node 20)
npm install
npm run dev
```

Open http://localhost:9173/production/hr_dashboard.html. Vite hot-reloads
SCSS, JS, and HTML.

## The chunk loop

Work ships **chunk by chunk**: code one concern → run every gate → commit +
push immediately. See [docs/workflow.md](docs/workflow.md) for the full loop.

## Before you commit

```bash
npm test             # static audits + HR logic suites — all green
npm run test:runtime # browser-behavior suite — all green
npm run lint         # ESLint over src/ — 0 errors
npm run build        # must succeed
```

Manual verification of every page you touched (EN + AR, desktop + mobile
widths) is part of the contract — the suites don't see pixels.

## Standing rules

- **Bilingual everything** — new strings ship in English and Arabic
  (`data-i18n` attributes or the `hr.*` dictionaries).
- **Mobile-responsive by default** — verify narrow viewports.
- **KSA-first HR logic** — labor law, GOSI, ZATCA, Nitaqat, Ajeer govern.
- **No page deletions** — improve pages in place.
- **Settings-driven** — owner values live in Settings, never hardcoded.

## Architecture in one breath

- **No framework, no SPA.** Every page in `production/` is its own HTML entry.
  They all load `/src/main-v4.js`, which mounts the shell, initializes the
  theme/i18n/palette, and wires delegated event handlers.
- **Page behavior is data-driven.** You set `data-shell="admin"`,
  `data-page="key"`, and `data-breadcrumb="A > B"` on `<body>`; feature
  modules under `src/v4/` initialize against element presence.
- **Tokens-first SCSS.** Every color, radius, sidebar dimension, **and spacing
  step** lives in `_tokens.scss` as a CSS custom property. Use
  `var(--space-1)` … `var(--space-6)` (4 / 8 / 12 / 16 / 24 / 32 px) for
  paddings, margins, and gaps. Going off-scale is sometimes correct but
  should be the exception.
- **Lazy imports for heavy libs.** `echarts`, `datatables.net`, `leaflet`,
  and `xlsx` only load on pages that use them.
- **Logical properties for direction.** RTL (Arabic) support means
  `margin-inline-start`, not `margin-left` — the static audit enforces this.

If this is unclear, read [CLAUDE.md](CLAUDE.md) — it's the architecture brief.

## Adding things

### A new page

1. `npm run new -- <slug>` scaffolds `production/<slug>.html` (or copy a
   similar page as a starting point).
2. Edit the `<title>`, `data-page`, `data-breadcrumb`.
3. Replace the `<main>` content with your markup using existing components.
4. If the page deserves a sidebar slot, add it to the `NAV` array in
   [`src/v4/shell-render.js`](src/v4/shell-render.js).

### A new chart

1. Add a factory in [`src/v4/charts.js`](src/v4/charts.js) following the
   existing pattern. Pull colors from the token snapshot — never hardcode.
2. Register the factory in the `charts` map at the bottom of the file.
3. Drop `<div data-chart="your-name" style="width:100%;height:300px"></div>`
   in any page.

### A new sortable table

Just add `data-datatable` to a regular `<table class="table">`. Use
`<th data-orderable="false">` to disable sorting on a column and
`data-page-length="25"` on the table to change the page size.

### A new shared component

Put the SCSS in the right partial:

| Where | When |
|---|---|
| `_components.scss` | Reusable, used on multiple pages (buttons, cards, tables, status, toggles). |
| `_widgets.scss` | Dashboard-style widgets (stat tiles, sparklines, donuts, todos). |
| `_pages.scss` | Single-page layout (invoice, calendar, pricing, landing). |
| `_apps.scss` | Heavier app surfaces (chat, kanban, file manager, settings). |
| `_hr.scss` / `_ksa.scss` | HR-module and Saudi-specific surfaces. |
| Its own partial | Vendor library override (mirroring `_datatable.scss`). |

## What we don't accept

Feel free to argue any of these in your PR if you have a strong case, but the
default answer is "no":

- **Re-introducing Bootstrap, jQuery, or any CSS framework.** Dash ships its
  own design system.
- **Page-specific entry scripts.** The shared `main-v4.js` stays small. Use
  `data-*` attributes + the existing delegation, or dynamic-import inside a
  feature module guarded by an element check.
- **Inline `<style>` blocks** in HTML. They belong in SCSS so they update
  with tokens.
- **Hardcoded colors anywhere outside `_tokens.scss`.** Use `var(--…)`.
- **Physical direction props** (`margin-left`, `text-align: left`, …) in
  markup or JS. Use logical properties so Arabic mirrors correctly.
- **Comments that restate what the code does.** Comments earn their place by
  explaining *why*.

## Issues and bug reports

Include:

- Browser + OS + Node version
- The page (e.g. `production/hr_payroll.html`)
- Language (EN/AR) and viewport width
- Console errors (if any)

## Releasing

Maintainers only — the footer version comes from `package.json`, so a release
is a version bump plus a changelog entry:

```bash
npm version <patch|minor|major>   # bumps package.json + lockfile, tags
git push --follow-tags
```

A new tag on `master` triggers the GitHub Pages deploy.

---

By submitting code, you agree to license it under the MIT license (same as
the project).
