# UI Blueprint v2 — Dash HR Command Center (from scratch)

> Status: PROPOSAL. Nothing here is implemented yet. It replaces the
> accumulated v1 chrome (nested dropdowns, breadcrumb trails, scattered
> template pages) with one coherent system. Research basis: HR SaaS table /
> bulk-action / workflow patterns, role-based dashboard layouts (3–5 KPIs per
> view, trend + current value, drill-downs), and token-first trilingual design
> systems (primitives → semantics → components, light/dark + LTR/RTL as token
> properties, dual-script typography).

## 0. What we are building

- **Product:** bilingual (EN/AR) HR command center for a KSA
  workforce-supply company: employees, contracts, payroll, compliance (GOSI /
  WPS / Nitaqat / Ajeer), visas, clients, **vendors** (new), company assets.
- **Users:** HR admin (power user), payroll officer, PRO (visas), finance
  (read), manager, site supervisor, employee (self-service), client portal,
  vendor portal (new).
- **Non-goals:** public marketing site, mobile native apps (responsive web
  covers it), general e-commerce (removed from nav).

## 1. New rules (replace all old conventions)

1. **One nav, zero dropdowns.** Sidebar = flat section links only. The
   active section lists its pages inline. No accordions, no flyouts, no
   third levels. Ever.
2. **One header per screen.** H1 + actions only. No pretitle echo, no
   breadcrumb trail (sidebar + highlight already orient you).
3. **Tokens or nothing.** No hex/rgb literals, no px font sizes, no physical
   `left/right/margin-left` in components. Every value comes from
   `src/ds/tokens.*` via semantic names.
4. **Three token layers, strict order:** primitives → semantics →
   components. Components never touch primitives.
5. **Every list is a DataGrid.** Same anatomy everywhere (§8): toolbar,
   saved filters, bulk bar, density switch, import/export, audit link.
6. **Every workflow shows state.** Draft → review → approve → done (payroll,
   offers, requests). Status is always color + icon + text (never color
   alone — color-blind safe).
7. **Every number has a home.** KPI definitions live in one catalogue
   (§12.4). No ad-hoc formulas in page code.
8. **EN/AR parity is a gate.** No string ships without both languages; AR
   body text +1px; logical properties only.
9. **Light/dark/RTL are token properties**, never parallel stylesheets.
10. **No page without a role.** Every route declares roles; server enforces,
    sidebar/tabs hide defensively.

## 2. Package structure (new)

```text
src/
  ds/                    # DESIGN SYSTEM (new package, no business logic)
    tokens.css           # primitives + semantics, light/dark, both dirs
    tokens.js            # JS mirror (charts read computed tokens)
    type.css             # dual-script scale (§6)
    components/          # button, card, datagrid, modal, toast, tabs,
                         # drawer, meter, badge, avatar, empty, skeleton
    icons.js             # single 1.5px-stroke set, mirroring map
  app/                   # shell: sidebar, topbar, right-rail, footer,
                         # settings window, command palette, router guards
  data/                  # canonical store: seed, settings, audit, sync,
                         # import/export engine, integrations (§9–10)
  modules/               # one folder per domain (people, pay, hire…)
                         # each: page.js + tabs.js + dialogs.js (no shared CSS)
  i18n/                  # en.js, ar.js — flat keys, parity-tested
```

- Build stays Vite. Path alias `@ds`, `@app`, `@data`.
- Rule: `modules/` may import `@ds` + `@data` only — never each other
  (kills the current spaghetti).

## 3. Layout system

| Slot | Spec |
|---|---|
| Sidebar | Fixed inline-start, 232px → 64px rail (icons + tooltips) → drawer <768px. Brand block, 2 group labels max, flat links, footer = Settings button only. |
| Topbar | Fixed 56px: rail toggle · search/⌘K · spacer · lang · theme · notifications · messages · avatar. No breadcrumb. |
| Main | `padding-top:56px`; page container 20–24px gutters, max-width 1440px centered on ultra-wide. |
| Right rail (new) | Slide-over inspector, 380px: record summary + timeline + actions. Opens from any DataGrid row (chevron), never a new page for read-only detail. Closes on Esc/backdrop. |
| Footer (new) | Slim status strip inside main bottom: sync time · record count · version · support link. Never fixed; never marketing links. |
| Grid | 12-col; cards in 4/3/2/1 responsive steps (existing breakpoints kept: 1200/920/768). Tables scroll inside cards, never push tracks (`minmax(0,1fr)`). |
| Zones (dashboard) | Max 5 zones, first 2 open, rest collapsed-remembered; Collapse-all/Expand-all in header. |

## 4. Navigation IA (final)

**Sidebar — Group 1 HR & Operations:** People · Compliance ·
Time & Leave · Operations · Pay & Finance · Hiring · Growth · Portals.
**Group 2 Workspace:** Apps (Chat, Inbox, Kanban, Calendar, Map, Files,
Notifications) · Projects.
**Footer:** Settings window (HR Settings · Customization · Company Assets ·
Dashboard views · System).

- Section click → section main screen (first page) + inline page list.
- Settings pages, auth pages, and portals never appear in the sidebar.
- **Vendors (new section under Operations or its own parent — decision
  §14):** vendor profiles, contracts, compliance docs, invoices, ratings.

## 5. Auth, user access, admin panel

- **Login page:** email + password, show/hide, CapsLock hint, remember me,
  forgot → reset flow, 2FA (TOTP) for admin/payroll/pro, lockout after 5
  fails + rate limit, idle auto-lock (15 min) → lock screen with avatar.
- **Roles:** `admin > hr > payroll > pro > finance(read) > manager >
  site-supervisor > employee`, plus portal roles `client`, `vendor`.
  Matrix UI stays (checkbox grid) but reads from one `roleScopes` source.
- **Admin panel (Settings → System → User management):** invite-only user
  creation, role assignment, scope preview ("view sidebar as"), session
  list + revoke, audit of every permission change.
- **Rule:** client sees only its roster/contracts/invoices; vendor sees
  only its workers/contracts/payables; employee sees only self.

## 6. Typography (dual-script)

- Latin: Inter (UI) · Arabic: IBM Plex Sans Arabic. Mono: tabular numerals
  for money/tables (both scripts).
- Scale (px, AR +1 on body/small): display 28/700 · H1 18/600 · H2 16/700 ·
  H3 13/600 · body 13.5 · small 12 · micro 11 (labels, uppercase, +0.4px
  tracking — never uppercase Arabic, use weight instead).
- Line-height 1.5 body, 1.3 headings; Arabic +0.1 to protect ligatures.
- One `<h1>` per page; tables use real `<th scope>`; numerals
  `font-variant-numeric: tabular-nums`.

## 7. Color system

- **Primary (brand/teal):** `#1ABB9C` light · lifted +10% lightness dark.
  Uses: primary buttons, active states, links, chart-1, focus rings.
- **Secondary (ink blue):** `#2563EB` family. Uses: secondary actions,
  info states, chart-2, links on dark surfaces.
- **Surfaces:** bg / surface / surface-2 / border / border-light — full
  light + dark ramps (dark = deep navy `#141D2B` family, never pure black).
- **Status (always + icon + label):** green `#2FB344` · yellow `#F59F00` ·
  red `#D63939` · blue · purple · teal. Money-positive = green, risk =
  red, pending = yellow. No other meanings for red/green.
- **Charts:** fixed 5-palette `[teal, blue, purple, yellow, red]` read from
  tokens at render (dark-mode redraw stays automatic).
- **Company Assets tie-in:** brand primary/logo/paper styles ship from the
  Customization engine (§11), stored per company profile — the palette
  above is the default, never hard-coded.

## 8. Tables (the DataGrid standard — every list)

Anatomy, top to bottom: title + count · search + saved-filter chips +
column menu · density switch (comfortable/compact) · **bulk bar** (appears
on selection: "N selected" + actions + clear) · grid (sticky header,
 zebra-off, row hover, status pills, row chevron → right-rail inspector) ·
footer (pagination: 25/50/100 + total + Excel export).
- Empty state: icon + one line + primary action (never blank table).
- Loading: skeleton rows (never spinner soup).
- Errors: inline row alert + retry, table keeps old data.
- All money right-aligned tabular; dates locale-formatted (EN `15 Oct
  2026`, AR with Hijri option in settings).

## 9. Data import / export

- **Import:** one flow everywhere — Upload (.xlsx/.csv template download)
  → column mapping (auto-matched, fixable) → validation report (row-level
  errors, nothing half-saved) → confirm → audit entry. Templates carry
  required-column marks + Arabic headers support.
- **Export:** current view (filters respected) to .xlsx with title row,
  generated-at stamp, and role stamp. Payroll/WPS exports use official
  fixed formats (SIF for WPS) — validated before download.
- **Rule:** imports never overwrite silently — preview + diff counts first.

## 10. Integrations

| System | Direction | Notes |
|---|---|---|
| Bank SIF / WPS (Mudad) | out | fixed-width salary file, pre-validated |
| GOSI | out/report | monthly contribution report |
| Qiwa / Ajeer | out + track | permits, validity alerts on dashboard |
| Muqeem / Absher (PRO) | track | iqama/profession expiry deck |
| Email + SMS gateway | out | payslips, alerts, OTP; templates bilingual |
| Excel (universal) | in/out | §9 |
| API seam (`?api=1`) | both | adapter for future backend; local seed until then |

Each integration gets: status pill (connected/error/off), last-sync time
in footer, retry + log in its module — never silent failure.

## 11. Customization engine

Settings → Customization: **theme presets** (Teal/Ocean/Sunset/Forest/Berry/
Slate — full token swap, live preview, no reload) · **density**
(comfortable/compact globally) · **brand kit** (logo, company names EN/AR,
primary color → Company Assets) · **dashboard layout** (reorder/hide zones
per role, persisted) · **language/dir** default. All stored versioned in
settings with reset-to-defaults.

## 12. Dashboard, analytics, reports

- **Role views:** Executive (5 KPIs: headcount, margin %, Saudization vs
  target, expiring docs, open approvals) · HR ops (full 5 zones) · Manager
  (my team only) · Finance (billing/payroll) · Employee (payslips, leave,
  requests).
- **KPI rule (research-backed):** every KPI = current value + delta vs
  prior period + 6-mo trend + threshold color + "what to do" link. No
  orphan numbers.
- **Reports module:** saved report builder (pick module → columns →
  filters → schedule weekly/monthly email) + statutory pack (GOSI, WPS,
  audit trail) one-click.
- **Refresh:** seed-driven now; each zone shows data-as-of stamp (footer
  sync time). Alerts fire on thresholds (expiry ≤30d, margin <5%).

## 13. RTL, i18n, accessibility

- `lang`+`dir` on `<html>`, set pre-paint (no flash). Logical properties
  only; icons mirror via map (back/forward chevrons, charts stay LTR data
  direction with Arabic labels).
- Numbers/dates: Western digits default, Eastern Arabic optional in
  settings; Hijri toggle for official docs.
- A11y: 44px touch targets, visible focus ring, Esc closes everything,
  aria-current on active nav, live regions for toasts only, AA contrast
  enforced at token level.

## 14. Open decisions (need you)

1. **Vendors:** own sidebar parent or inside Operations? (Proposal: parent
   "Vendors" with profiles/contracts/invoices/ratings.)
2. **Footer content:** status strip as specced, or also quick links?
3. **Login branding:** company logo only, or split marketing panel?
4. **Dashboard default zones** for non-admin roles — confirm the 5 above.
5. **Company Assets content rebuild** (logo/colors/paper/uniforms data) —
   proceed after this blueprint is approved?

## 15. Migration phases (no big-bang)

- **P0 tokens:** extract `src/ds/tokens.*`, ban literals (lint rule).
- **P1 shell:** sidebar/topbar/footer/right-rail per §3–4 (mostly done for
  sidebar; add rail + footer).
- **P2 grids:** convert top-10 lists to DataGrid standard (§8).
- **P3 data:** import/export engine + WPS/GOSI validators (§9–10).
- **P4 access:** RBAC UI + portals + audit (§5).
- **P5 delight:** customization engine, role dashboards, reports (§11–12).
- Each phase: tests green + bilingual + dark/RTL screenshots before merge.
