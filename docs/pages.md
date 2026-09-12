# Pages

108 static pages under `production/`, in four groups:

- **HR command center** (`hr_*.html`) — dashboard, employees, contracts,
  attendance, shifts, timesheets, leave, payroll + WPS, EOSB, GOSI,
  compliance, visas, residency, Ajeer, recruitment, onboarding, reviews,
  goals, trainings, expenses, invoices, reports, settings.
- **Portals** — client portal and employee self-service.
- **Admin apps** — inbox, kanban, calendar, chat, file manager, contacts,
  notes, settings, theme generator, playground, and UI showcases.
- **Standalone** — auth (login, register, 2FA, lock, forgot password),
  error/maintenance/offline screens, landing.

## Anatomy of a page

```html
<body data-shell="admin" data-page="hr-payroll" data-breadcrumb="Home > Payroll">
```

- `data-shell="admin"` — the Vite plugin + `mountShell()` inject the sidebar and
  topbar. Standalone pages omit them.
- `data-page` — must match a `NAV` key in `src/v4/shell-render.js` so the
  sidebar highlights correctly (audit-enforced).
- `data-breadcrumb` — drives the topbar trail and the SEO description fallback.

## Adding a page

```bash
npm run new -- <slug>
```

Then add sidebar/i18n entries if the page needs a NAV slot, and a feature
module under `src/v4/` if it needs behavior. See [workflow](workflow.md).
