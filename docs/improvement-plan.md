# System Improvement & Engineering Plan — “200% Reputation” Program

**Date:** 2026-09-11 · **Status:** PROPOSED — awaiting owner approval (no code until signed off)
**Scope:** HR + workforce-supply system (50 HR pages). Template pages under Settings are referenced only where they affect reputation/security/perf.

---

## 0. What the audit found (evidence, not opinions)

| #   | Finding                                                                                                  | Evidence                                                                                                                                           |
| --- | -------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| F1  | **Template brand leaks everywhere** — every browser tab says “Gentelella 2026 v4”                        | 122 files mention Gentelella; `gentelella:*` storage keys; `--primary: #1ABB9C` (template teal) hardcoded                                          |
| F2  | **Brand settings don’t fully work** — owner sets brand, but color never applies and titles stay template | `SEED_COMPANY.primary` exists but nothing reads it; `applyBranding()` only swaps sidebar name/logo                                                 |
| F3  | **Marketing pages ship in an internal tool** — “no selling” rule violated                                | `landing.html` (“Free admin template” + marketing copy), `coming_soon.html` — both orphan (zero incoming links)                                    |
| F4  | **Fake auth screens** — login/register/2FA with no backend                                               | No auth JS anywhere; `verify_2fa.html` is pure theater                                                                                             |
| F5  | **XSS vector via Excel import** — user data rendered unescaped                                           | `escapeHtml()` exists in `markup.js` but **zero** modules import it; `employees.js` interpolates import-error HTML + row data raw into `innerHTML` |
| F6  | **Dashboard is junior-grade** — 6 stat cards, zero charts, zero trends, zero money story                 | `hr-dashboard.js` is 248 lines; no echarts; no margin/receivables/utilization/attendance-today/hiring-funnel                                       |
| F7  | **Chart engine exists but HR can’t use it**                                                              | `charts.js` lazy-loads echarts but exports only page-level `initCharts()` — no reusable helper                                                     |
| F8  | **Keyboard users may be blind** — global `:focus { outline: none }`                                      | `_layout.scss:29` kills all focus rings; `:focus-visible` replacements exist only for nav/search/main (WCAG 2.4.7 risk)                            |
| F9  | **Tables fail basic a11y + bilingual details**                                                           | `<th>` without `scope`; hardcoded `OT`/`OT h`/`parse-error`/`0 rows`; Reports export headers English-only                                          |
| F10 | **Hijri is 10% adopted** — a KSA-first app showing Gregorian-only contracts/payslips/expiries            | `fmtHijri()` (Umalqura) exists but used in only 3 of ~40 HR modules                                                                                |
| F11 | **Half the statutory config isn’t configurable**                                                         | Weekend days, Ramadan periods, GOSI rate versions, leave types, shift defaults live in seed only — Settings has no sections for them               |
| F12 | **Dead weight in the bundle path** — shop mock data ships to HR pages                                    | `product-mockups.js` (26 KB) + `product-images.js` imported by bundle chain serving every page                                                     |
| F13 | **Setup has no guidance** — owner never learns brand/Nitaqat/licence are placeholders                    | `1010XXXXXX` CR, empty Nitaqat/licence, `company.sa` emails — nothing surfaces this in-app                                                         |

**What’s already strong (protect it):** modal focus trap + ESC/backdrop ✓ · skip-link ✓ · status badges use text+color ✓ · mobile grid collapse ✓ · print CSS ✓ · CSV/XLSX/Print-PDF/JSON export ✓ · `?api=1` backend seam (`hr-api.js`, 10 entities) ✓ · bilingual dict parity enforced by audit ✓ · 661 static + 106 runtime checks green ✓.

---

## 1. Asset Conversion Matrix (misfits → aligned)

| Misfit                                    | Convert to                                                                                  | How                                                                                                                                              | Track |
| ----------------------------------------- | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ----- |
| Gentelella titles/keys/teal               | **White-label product brand**                                                               | Titles/brand from Settings `company.*`; `company.primary` → `--primary` CSS var; storage keys migrated to product namespace w/ one-time fallback | T0    |
| `landing.html`, `coming_soon.html`        | **Deleted** (verify zero refs, then remove + audit)                                         | No links in; pure marketing                                                                                                                      | T5    |
| `login/register/forgot/lock/2fa.html`     | **Honest role gateway** (one page: “Continue as …” → sets `viewedRole`, no fake passwords)  | Matches existing role-preview architecture; removes security theater                                                                             | T1    |
| `product-mockups.js`, `product-images.js` | **Lazy chunk** (shop pages only)                                                            | Dynamic import; HR pages stop paying 26 KB+                                                                                                      | T5    |
| `charts.js` page-only init                | **`renderEchart(el, option)` reusable helper** (lazy echarts core, RTL-aware, a11y summary) | Extract loader + wrapper; template gallery pages keep working                                                                                    | T2    |
| Template dashboards (index–index4)        | **Keep as UI reference** under Settings→General, rebrand titles only                        | They are the “UI/UX customization reference” the owner asked to keep in Settings                                                                 | T0    |
| Placeholder brand/Nitaqat/licence         | **Setup checklist card** on dashboard (KIT: “3 steps to go live”)                           | Detects placeholders → deep-links to Settings sections                                                                                           | T2    |
| `maintenance/offline.html`, error pages   | **Keep** (operational, honest)                                                              | Rebrand titles only                                                                                                                              | T0    |

---

## 2. The 200% Dashboard — “CEO Command Center” (Track T2)

**Design principle:** the owner opens one page and sees _money, people, risk, actions_ — in that order. Everything computable from existing seed/API data; zero backend required.

```
┌─ Header: Hijri + Gregorian date · Nitaqat band chip · Setup progress ──────┐
│ ZONE A · BUSINESS HEALTH (money)                                           │
│ [Deployment revenue/mo] [Payroll cost/mo] [Gross margin + %] [Receivables]  │
│  6-mo revenue-vs-cost trend chart (echarts) · Top-clients margin mini-table │
├─ ZONE B · WORKFORCE OPS (today) ───────────────────────────────────────────┤
│ [Headcount SA/expat] [Deployed vs bench + utilization %] [Attendance today] │
│ [On leave today] [Pending approvals] → each deep-links to its page          │
├─ ZONE C · COMPLIANCE SHIELD (KSA) ─────────────────────────────────────────┤
│ [Nitaqat meter vs target] [Iqama 30/60/90 buckets] [Ajeer validity]         │
│ [Contracts ≤90d] [Qiwa/GOSI/WPS chips] [Expat levy/mo]                      │
├─ ZONE D · ACTION CENTER ───────────────────────────────────────────────────┤
│  Prioritized queue (existing alerts, upgraded: counts + one-click fix links)│
│  Hiring funnel snapshot · Expiry timeline · Setup checklist                  │
└────────────────────────────────────────────────────────────────────────────┘
```

**Why this ordering (CEO logic):** workforce supply is a _margin_ business — money first. Ops second (butts in seats today). Compliance third (what keeps owners awake + our KSA differentiator). Actions last (the “do” list). Current dashboard shows none of Zone A and half of C.

**Config:** Phase 1 = fixed executive layout. Widget show/hide prefs → Phase 2 (Settings → Dashboard), only if owner asks.

---

## 3. UI/UX + Accessibility + Bilingual sweep (Track T4)

| Fix                                                                                                | Why                                                      | Effort        |
| -------------------------------------------------------------------------------------------------- | -------------------------------------------------------- | ------------- |
| Global `:focus-visible` ring system (replace `:focus { outline: none }`)                           | WCAG 2.4.7; keyboard users can’t see focus today         | S             |
| `<th scope>` + table captions audit across HR tables                                               | Screen-reader correctness                                | S             |
| Kill hardcoded EN (`OT`, `parse-error`, `0 rows`, report labels, export headers) → dict keys EN+AR | Bilingual contract incl. exports                         | M             |
| Hijri alongside Gregorian on contracts, payslips, expiries, dashboard header                       | KSA-first credibility                                    | M             |
| 360px mobile pass on HR-specific components (boards, walls, funnels, timelines)                    | Mandatory mobile; generic grids already collapse         | M             |
| Echarts RTL + a11y (axis inversion check, text summaries for every chart)                          | New dashboard must be RTL-correct + screen-reader honest | S (inside T2) |
| Brand color theming (`company.primary` → `--primary` + accents)                                    | White-label = reputation                                 | S (inside T0) |

---

## 4. Security & Configuration strategy (Tracks T1 + T3)

**Security (frontend-honest posture — real authN/Z stays a backend job via `hr-api.js`):**

| #   | Control                                                                                                                                                                            | Notes                                 |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| S1  | **Escape pipeline**: route all HR `innerHTML` interpolation through `escapeHtml()`; new static audit fails builds on raw `${data}` interpolation (allowlist for trusted icon HTML) | Kills the Excel-import XSS vector     |
| S2  | **Brand/logo URL allowlist** (`http/https/data:image` only, size cap)                                                                                                              | `applyBranding()` hardening           |
| S3  | **Honest role gateway** replaces fake auth pages (decision required: §6)                                                                                                           | No more password theater              |
| S4  | Keep prod sourcemaps off; keep `?api=1` seam; document server-side scope-enforcement contract                                                                                      | Defense stays honest about boundaries |

**Configuration (Settings expansion):**

| New section               | Source of default      | Notes                            |
| ------------------------- | ---------------------- | -------------------------------- |
| Weekend days              | `WEEKEND_DAYS`         | Drives leave math + calendars    |
| Ramadan periods           | `RAMADAN_PERIODS`      | Drives hours rules (6h/36h)      |
| GOSI rate versions        | `GOSI_VERSIONS`        | Versioned table, effective-dated |
| Leave types               | `LEAVE_TYPES`          | Balances/accrual editable        |
| Shift defaults            | `SHIFTS`               | Template shifts                  |
| Brand color               | `SEED_COMPANY.primary` | Live-theming                     |
| (Phase 2) Dashboard prefs | —                      | Only if asked                    |

All: seed default → Settings override → JSON backup/restore (backup exists, extend keys). Every new string EN+AR (dict parity audit enforced).

---

## 5. Execution tracks, order & gates

| Track                       | Content                                                                         | Size | Visible payoff                                      |
| --------------------------- | ------------------------------------------------------------------------------- | ---- | --------------------------------------------------- |
| **T0 Brand de-template**    | Titles from company, keys migration, primary-color theming, rebrand ops pages   | S    | Every tab + theme looks like _your_ company         |
| **T1 Security**             | S1 escape pipeline + audit, S2 URL allowlist, S3 gateway (pending decision)     | M    | Imported Excel can’t hijack sessions; no fake login |
| **T2 Dashboard 2.0**        | Chart helper + CEO Command Center + setup checklist + tests                     | L    | The 200% moment                                     |
| **T3 Config expansion**     | 6 new Settings sections + backup keys                                           | M    | “Customizable” promise, no-code                     |
| **T4 A11y/bilingual/Hijri** | Focus system, th scope, EN-string kill, export headers, Hijri dates, 360px pass | M    | WCAG + bilingual + KSA credibility                  |
| **T5 Diet**                 | Delete landing/coming_soon, lazy shop chunk, bundle budget check                | S    | Faster loads, zero marketing residue                |

**Order rationale (Architect):** T0 first (cheap, visible, de-risks brand). T1 before T2 (dashboard renders money/PII — secure the renderer first). T2 is the centerpiece. T3/T4 in parallel after. T5 last (cleanup).

**Gates (unchanged, must stay green):** static 661+ · runtime 106+ (new: dashboard metric vectors, gateway flow, chart render) · eslint 0 errors · prettier · build (0 maps) · HTTP 200s. **New gates:** a11y static audit (th scope, focus-visible, chart summaries) · security static audit (no raw interpolation) · bundle budget (per-page JS must not grow vs today).

---

## 6. Decisions required from owner (answering unblocks execution)

1. **Approve the track order** (T0 → T1 → T2 → T3 → T4 → T5) or reprioritize?
2. **Auth pages:** (A) honest role gateway (recommended) or (B) delete until backend exists?
3. **Delete approval:** `landing.html` + `coming_soon.html` (both orphan marketing)?
4. **Dashboard Zone A money cards** — confirm margin math: deployment billing − (payroll + levy + GOSI employer share)? Any cost to exclude?
5. **Phase 2 dashboard prefs** now or later? (Recommendation: later.)

---

# v2 — DDD Refactor + Executive Command Dashboard (appended 2026-09-11)

**Status:** PROPOSED — awaiting owner approval (no code until signed off)
**Supersedes:** §6 decisions 1–2 approved (order T0→T5 ✓, role gateway ✓). Decision 3 revised by owner: **no deletions** — pages must stay upgradeable day by day (see §V2.0).

## V2.0 Revised: upgradeable pages (no deletions)

| Page                                         | New fate (was: delete)                                                                                                                                                                            |
| -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `landing.html`                               | **Converted into the honest role gateway** (same file/URL, rewritten content: “Continue as …” → sets role, no fake passwords). A living page we extend day by day (PIN → SSO → backend sessions). |
| `coming_soon.html`                           | **Kept as the standard module stub** — future modules link here until built, showing bilingual “in progress” + owner contact. Rebranded, zero marketing copy.                                     |
| `login/register/forgot/lock/verify_2fa.html` | Redirect content → gateway (single honest entry point); files stay until backend auth lands, then convert to real forms.                                                                          |

## V2.1 DDD sidebar refactor — Accounts & Employee modules (new Track T0b, runs with T0)

**Rule applied:** money-owed-to-us vs money-owed-by-us vs people. `Money` parent dissolves; nothing is deleted, keys/URLs unchanged.

| New parent (icon)       | Members (moved, same pages)                    | From               |
| ----------------------- | ---------------------------------------------- | ------------------ |
| **Accounts** (`wallet`) | Invoices, Expenses                             | Money / Operations |
| **Employee** (`id`)     | Pay runs, GOSI, WPS & Mudad, EOSB & settlement | Money              |

**Rationale:** billing + billable expenses = Accounts domain; payroll + social insurance + wage disbursement + end-of-service = Employee compensation domain. Sidebar becomes 11 parents; `ROLE_MODULES` regrouped; phase audits unaffected (key-based); runtime parent-count assertions updated 10→11.

**Naming note:** new **Employee** module vs existing **Employees** page (under People = directory/lifecycle). Kept per instruction; alternative on request: rename People → “Directory”. Expenses placement flagged: page serves billable (Accounts) + staff claims (Employee) — proposed home Accounts because money controls dominate; one click either way.

## V2.2 Executive Command Dashboard — visualization spec (extends Track T2)

**Home:** same `hr_dashboard.html` URL/nav (no nav churn). **IA (proposed):** single-page Command Center, executive money zones first, then Workforce (§1), Leave (§2), Geo (§3), then compliance/actions; zone cards collapsible with persisted state. (Alternative: tabbed — decision §V2.5.)

### §1 Workforce & HR Dynamics (per owner brief)

| Widget                | Viz                                                                                 | Data source                                                                                                                    | Gap                                                                                                           |
| --------------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------- |
| Headcount status      | Progress ring: active / on-leave / probation / exited                               | `EMPLOYEES.st`                                                                                                                 | **Add 2× `st:'exited'` demo rows** (`exitDate`, `exitReason`) — `nitaqatEstimate` already excludes `exited` ✓ |
| Tenure distribution   | Bars: <1 / 1–3 / 3–5 / 5+ yrs (+ new-vs-veteran ring)                               | `EMPLOYEES.join` ✓                                                                                                             | None                                                                                                          |
| Separation & mobility | 6-mo grouped bar: hired / boarded / exited per month                                | joins ✓ · `ONBOARDING` final-stage dates ✓ · exits need gap-1                                                                  | Same as gap-1                                                                                                 |
| Huroob risk           | Red alert card: count + worker + “legal attention” CTA → employee file + compliance | **GAP — add 1× huroob demo row** (`st:'huroob'`, `reportedAt`, `legalNote`) + exclude from active counts (counsel-verify note) | Seed + 1 filter line + test                                                                                   |

### §2 Vacation & Leave (per owner brief)

| Widget            | Viz                                                                           | Data source                                                                                                                          | Gap                                            |
| ----------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------- |
| Vacation pipeline | 3 count-cards + drill list: on-vacation-now / departing ≤14d / returning ≤14d | `LEAVE_REQUESTS` approved-annual `from/to` vs today ✓                                                                                | **Add 3 dated rows** spanning 2026-09-11 ± 14d |
| Return efficiency | Ring: on-time % vs overdue                                                    | **GAP — add `returnedAt` + `returnStatus`** to ~4 past rows                                                                          | Seed extension                                 |
| Overdue + reasons | Table + reason drill-down bar                                                 | **GAP — add `delayReason`** (+ bilingual `LEAVE_DELAY_REASONS`: flight / emergency / transfer-delay / other) + 1–2 overdue demo rows | Seed extension                                 |
| Eligibility list  | Table: eligible now (balance + last vacation + CTA to request)                | Rule: probation done + annual balance>0 + no active request (entitlement engine exists ✓)                                            | None (rule documented in UI)                   |

### §3 Geographic & Demographics (PROPOSED by architect — owner brief truncated, needs confirmation)

| Widget                        | Viz                                                                                                    | Data source                   | Gap                                                                                                                                  |
| ----------------------------- | ------------------------------------------------------------------------------------------------------ | ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Workforce map                 | **Leaflet KSA map** (dep already installed): site markers sized by headcount, click → roster side-list | `SITES` + `ASSIGNMENTS` ✓     | **Add `lat/lng` to 3 sites + 3 new sites** (Jeddah, Dammam, +Riyadh) + 4–6 modest assignments (keep billing/alert demo counts green) |
| Nationality mix               | Donut (7 nationalities in seed ✓)                                                                      | `EMPLOYEES.nat` ✓             | None                                                                                                                                 |
| Profession mix                | Horizontal bars                                                                                        | `EMPLOYEES.prof` ✓            | None                                                                                                                                 |
| Saudi/expat ring + city chips | Ring + per-city headcount                                                                              | `saudi` ✓ + `SITES.city` ✓    | None                                                                                                                                 |
| Gender split                  | —                                                                                                      | **No `gender` field in seed** | Optional: add `gender` to 24 rows (also fixes maternity/iddah eligibility filtering). Proposed: include (small, high value).         |

### Charts & maps stack

ECharts via the new `renderEchart()` helper (rings/bars/lines, lazy chunk, RTL-checked, text summary per chart for screen readers) + Leaflet for §3 (marker-data runtime test; tiles lazy, offline-tolerant).

## V2.3 Seed-extension safety rules

1. Amounts modest + consistent (new assignment rates ≤ existing bands; new invoices: none — reuse months).
2. Existing demo counts guarded by tests stay green (alerts list, Nitaqat %, billing totals) — any intentional change updates the test expectation explicitly with a comment.
3. Every new demo row clearly fictional, bilingual labels, dated around the demo “today” (Sep 2026).
4. All new UI strings EN+AR (dict parity audit enforced).

## V2.4 New gates for v2

Seed-consistency vectors (exits/huroob/returns/geo) · huroob-alert runtime test · return-efficiency math test · map container+marker-data test (no tile fetch in jsdom) · 11-parent nav assertion · RTL chart check.

## V2.5 Decisions required (v2)

1. §3: approve architect’s geo/demographics spec above, or paste the remainder of your brief (§3 rest + §4+)?
2. DDD naming: keep **Employee** module vs **Employees** page, or rename People → “Directory”? Confirm Expenses→Accounts, WPS/EOSB→Employee.
3. Dashboard IA: single scrolling Command Center (recommended) vs tabbed (Executive | Workforce | Leave & Geo)?
4. Huroob demo row + gender field: approved to add (clearly fictional demo data)?

---

# v3 — Final dashboard spec §3–§6 + execution (appended 2026-09-11)

**Status:** APPROVED — owner brief complete (§3–§6 received), DDD naming kept, scrolling IA, all seed additions approved. **Executing T0 → T0b → T1 → T2 → T3 → T4 → T5.**

## V3.1 §3 Geo, Demographics & Sponsorship (per owner brief)

| Widget             | Viz                                                          | Source                | Gap → fix                                                                                                   |
| ------------------ | ------------------------------------------------------------ | --------------------- | ----------------------------------------------------------------------------------------------------------- |
| Workforce layer    | Leaflet KSA map, headcount markers, click → roster side-list | SITES + ASSIGNMENTS ✓ | `lat/lng` on 3 sites + 3 new sites + 4–6 assignments                                                        |
| Nationality donut  | ECharts donut (7 nationalities)                              | `nat` ✓               | None                                                                                                        |
| Skills tag cloud   | Sized tag cloud (bilingual labels)                           | **GAP**               | NEW `emp.skills[]` (2–4 tags × 24 rows, from a bilingual SKILLS list)                                       |
| Client layer       | Pin drops (toggleable layer)                                 | CLIENTS.city ✓        | `lat/lng` on 2 clients                                                                                      |
| Sponsorship Matrix | Total sponsors + workers per sponsor legal entity            | **GAP**               | NEW `SPONSORS` (2 entities: HQ CR + branch CR) + `emp.sponsor` (default HQ); Settings → Sponsors in Phase 2 |

## V3.2 §4 Compliance & Document Health (per owner brief)

| Widget                | Viz                                                                              | Source                                               | Gap → fix                   |
| --------------------- | -------------------------------------------------------------------------------- | ---------------------------------------------------- | --------------------------- |
| Expiration alert deck | 3 rings (Valid / Expired / Expiring ≤60d) × Iqama / Passport / Medical insurance | `iqamaExp` ✓ + `RESIDENCY_DOCS.passportExp/insExp` ✓ | None — fully computable     |
| Sponsor transfers     | Kanban: requested / in-progress / awaiting-release / completed                   | `TRANSFERS` ✓ (2 rows)                               | **+2 rows** for board depth |

## V3.3 §5 Accounts, Expenses & Performance (per owner brief)

| Widget               | Viz                                         | Source                                                                                                                                                            | Gap → fix              |
| -------------------- | ------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| Expense distribution | Donut by category (bilingual)               | EXPENSES.cat + EXPENSE_CATEGORIES ✓                                                                                                                               | None                   |
| Billing history      | List: month · client · total · status chips | INVOICES ✓                                                                                                                                                        | None                   |
| Performance matrix   | Monthly trends: top-5 vs bottom-5 quartiles | **Computed Performance Index** (no fake monthly ratings): attendance 40% + goal progress 30% + praise/feedback 20% + OT discipline 10%, documented in UI footnote | Formula + test vectors |

## V3.4 §6 Utilities & Notifications (per owner brief)

| Widget          | Viz                                                 | Source                     | Gap → fix                                                                                            |
| --------------- | --------------------------------------------------- | -------------------------- | ---------------------------------------------------------------------------------------------------- |
| Priority ticker | Rotating high-priority alerts (red first)           | Existing `alerts()` feed ✓ | None                                                                                                 |
| Task To-Do      | Checkable list + due/overdue highlights + reminders | **GAP**                    | NEW `TASKS` seed (8 rows: personal + role tasks, `due`, `priority`) + localStorage check-off overlay |

## V3.5 T2 build order (inside the track)

Seed extensions (+consistency tests) → chart/map helpers → Zone A money → §1 → §2 → §3 → §4 → §5 → §6 → setup checklist → RTL/a11y pass → gates.
