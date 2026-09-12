# Workflow

Dash ships **chunk by chunk**. A chunk is one reviewable concern (one component,
one page, one rule) that goes from code to pushed commit in a single pass.

## The chunk loop

1. **Code** — small diff, one concern. Touch only what the chunk needs.
2. **Gate** — run every gate below; fix failures before proceeding.
3. **Commit + push** — immediately, on the working branch. Never batch chunks
   into an end-of-day push.

## Gates (all must pass)

| Gate                                 | Command                              | Bar                                       |
| ------------------------------------ | ------------------------------------ | ----------------------------------------- |
| Static + HR logic suites             | `npm test`                           | every suite green                         |
| Browser-behavior suite               | `npm run test:runtime`               | every test green, no unhandled errors     |
| Lint                                 | `npm run lint`                       | 0 errors (`src/`)                         |
| Format                               | `npx prettier --check <touched>`     | touched lines clean                       |
| Dev smoke                            | `npm run dev` + open touched pages   | pages render, no console errors           |

## Rules that never bend

- **Bilingual** — every new string ships in English and Arabic (`data-i18n` or
  the `hr.*` dictionaries), including contracts and emails.
- **Mobile-responsive** — the app is used on phones; verify narrow viewports.
- **KSA-first HR logic** — labor law, GOSI, ZATCA, Nitaqat, Ajeer rules govern;
  never a generic/global default.
- **No page deletions** — pages stay upgradeable; improve them in place.
- **Settings-driven** — owner-configurable values live in Settings (company
  profile, Nitaqat, licence scope), never hardcoded.
- **Import + export** — new data grids get Excel import and export.

## Tests, in brief

- `tests/hr-audit-*.mjs` + `tests/hr-logic-*.mjs` — static audits (NAV, i18n
  parity, wiring, links, IDs, table/list/header style pins) and HR rule
  engines (payroll, EOSB, leave, compliance).
- `tests/runtime-smoke.test.js` — vitest + jsdom: every page mounts, key
  interactions behave, shell/header/sidebar contracts hold.

## Branches and releases

- Feature work happens on `arena/*` working branches, pushed after every
  chunk; `master` receives reviewed merges.
- The version lives only in `package.json` (nothing renders it into the UI),
  so a release is a version bump + changelog entry — no code edits.
- GitHub Pages deploys from `master` via `.github/workflows/deploy-pages.yml`
  (serves under `/Dash/`); ad-hoc previews via `npm run deploy:preview`
  (see [deployment](deployment.md)).

## Scaffold a page

```bash
npm run new -- <slug>   # e.g. npm run new -- hr_overtime
```

This generates `production/<slug>.html` wired to the shell, theme, and i18n —
then add its module under `src/v4/` and register NAV/i18n entries.
