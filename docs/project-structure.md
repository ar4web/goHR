# Project structure

```text
production/        108 static HTML pages — HR modules (hr_*.html), portals,
                   admin apps (inbox, kanban, calendar…), auth/error screens
src/
  main-v4.js       Single entry bundle (shell, theme, i18n, palette)
  v4/              Feature modules — one per page/concern, vanilla ES2022
  scss/v4/         Design system: _tokens, _layout, _components, _forms,
                   _apps, _pages, _widgets, _hr, _ksa, _rtl, _mobile, _auth…
public/            site.webmanifest, sw.js (service worker), llms.txt, images
docs/              These guides
tests/             hr-audit-*.mjs (static), hr-logic-*.mjs (rules),
                   runtime-smoke.test.js (vitest + jsdom)
examples/          Optional Express + SQLite backend for the data adapter
types/             dash.d.ts — declarations for the public JS surface
scripts/           new-page.mjs (scaffold), deploy-preview.sh, screenshots…
```

## Conventions

- **One module per page** in `src/v4/`, named after the page (`payroll.js`
  for `hr_payroll.html`, `inbox.js` for `inbox.html`), plus shared modules
  (`shell.js`, `i18n.js`, `modal.js`, `toast.js`, `hr-api.js`…).
- **SCSS partials by layer**, not by page: reusable pieces go in
  `_components.scss`, single-page layout in `_pages.scss`, HR surfaces in
  `_hr.scss`, Saudi-specific in `_ksa.scss`.
- **Everything user-facing is bilingual** — static copy via `data-i18n`
  attributes, dynamic copy via the `en`/`ar` dictionaries in `src/v4/i18n.js`
  (key parity is audit-enforced).
