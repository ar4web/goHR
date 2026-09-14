# Duplicate Cleanup Plan — HRGO

Agreed order (pilot-first, deprecate dead code only — no page deletions):

## 0. Hierarchy (do not break top first)
- L0 entry: `src/main-v4.js` (mountShell, initI18n, charts/tables idle, palette, page-actions)
- L1 shell: `src/v4/shell-render.js` NAV (single sidebar source) + `shell.js` + Vite shellInjectionPlugin
- L2 data: `hr-seed.js` + `hr-seed-extra.js` <- `hr-api.js` (getSeed) <- `data-adapter.js`
- L3 rules: `hr-statutory.js` (ONLY KSA rates: GOSI/EOSB/pay/WPS/leave/expiry/Nitaqat)
- L4 shared UI: `i18n.js` t() + `hr-locale.js` L(), modal/toast/menus, import-export + import-modal, tables, chart-helper, hr-settings store
- L5 pages: `src/v4/*.js` init*() + `production/*.html` (data-page must match NAV key, dash form)
- L6 style: `_tokens.scss` -> _components/_forms/_layout -> _pages/_apps/_hr/_ksa

## 1. P0 — registry + keys (fixes boot)
- NEW `PAGES = { datapage: () => import() }` in `main-v4.js` off `body[data-page]`
- Alias map underscore -> dash (`hr_approval_requests` -> dash); fix 4 collisions
  (contracts/contract-detail, payroll/payslip, employees/employee-file, reviews/review-detail);
  add missing `visas`, `tracker`
- Fix Vite `${base}` SCSS href + dev redirect -> `production/index.html`
- Pilot: 2 pages. Gate: `npm test` + `test:runtime` + `lint`

## 2. P1 — JS shared libs (biggest win ~950 lines)
- NEW `src/v4/page.js`: `bootPage(sel, render)` — kills 53x `let booted=false` + LANG_EVENT wiring
- `hr-api.js`: add `nextPrefixedId(seed,prefix)` (from `expenses.js:90`) + lookups
  (empName/profName/clientName/siteName/deptName/candName) — kills ~560 lines
- `markup.js`: add `statusChip(key,map)`; `hr-locale.js`: `AV`/`avatarFor`
- `tables.js` -> `import-export.js` delegation; use `showModal` return handle (kill 10x `.modal-backdrop:last-child`)
- Pilot `jobs.js` + `goals.js`, then hiring/employee/time clusters

## 3. P2 — statutory SSOT
- Export `payWage/gosiWage/eosbWage/dailyRate/WEEKEND/NITAQAT_BANDS` from `hr-statutory.js`
- Route payroll/wps/contract-values/employee-detail through them; render `leave.js`
  allowances from `LEAVE_TYPES`; document expiry 30-vs-60 intent; issuer/fees -> settings (`GOVT_FEES`)
- Deprecate snapshots with comments only: `PAYROLL_WPS_FILES`, `COUNTRY_HOLIDAYS` SA rows,
  `COUNTRIES.SA` rates, `LEAVES_BALANCES`, stale `nav.*` i18n keys

## 4. P3 — SCSS
- Alias ghost `var(--border)/--card-bg` -> `--border-color/--bg-surface` first
- Unify pagination/card/chip/avatar/input/OTP/toggle/rating/progress/stepper/kanban/empty-state
  behind `_components.scss`/`_forms.scss`; snap raw px to `--space-*`; fix `_layout:525 margin-left`

## Rules
- Small per-cluster PRs, commit + push immediately
- Gates per PR: `npm test`, `npm run test:runtime`, `npm run lint` (0 errors), prettier touched lines,
  dev smoke EN+AR desktop+mobile
- Bilingual UI on everything new; settings-driven (never hardcode owner values);
  Excel import+export on data grids; no page deletions
