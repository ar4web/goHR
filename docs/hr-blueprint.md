# HR + Operations System Blueprint — KSA Manpower-Supply Edition
### From Gentelella Dash v4 (generic admin template) → Internal bilingual system for a Saudi workforce-supply company

**Repo:** `ar4web/Dash` (fork of ColorlibHQ/gentelella) · **Branch:** `arena/01a08c48-dash`
**Base version reviewed:** `4.1.1` · **Date:** 2026-09-10
**Status:** Blueprint proposal — manpower-supply edition, no code changed yet. Review, then pick Phase 1 scope.

> **One-line summary:** This repo is a polished, backend-less **admin UI shell** (58 static pages + vanilla JS + SCSS + Vite). This edition turns it into an **internal (not-for-sale), fully bilingual (Arabic/English), mobile-first HR + Operations system for a Saudi manpower-supply company**: recruit and document a mostly-expatriate workforce, **deploy workers to client companies under Ajeer-compliant assignments**, track every worker, run SAR payroll (GOSI+WPS), EOSB, expenses, and a **contract maker for all employee + client contract types** — all customizable via settings, no sales/marketing elements.

**Decided in this edition:** country = **Saudi Arabia** · business = **manpower supply (workforce outsourcing)** · workforce = **mostly expatriate** · app = **internal tool, bilingual, mobile-first, customizable**. Open decisions moved to §13.

---

## Table of contents

0. [KSA statutory foundation (the rules the system must encode)](#0-ksa-statutory-foundation-the-rules-the-system-must-encode)
1. [How to read this document](#1-how-to-read-this-document)
2. [Current-state review (what this repo actually is)](#2-current-state-review-what-this-repo-actually-is)
3. [Existing blueprint — as-is (distilled)](#3-existing-blueprint--as-is-distilled)
4. [Target blueprint — manpower-supply HR + Operations (to-be)](#4-target-blueprint--manpower-supply-hr--operations-to-be)
5. [Side-by-side comparison: existing vs KSA blueprint](#5-side-by-side-comparison-existing-vs-ksa-blueprint)
6. [Page reuse map (keep / adapt / retire / build)](#6-page-reuse-map-keep--adapt--retire--build)
7. [Proposed NAV redesign — KSA (concrete)](#7-proposed-nav-redesign--ksa-concrete)
8. [Data model + API blueprint (KSA starter)](#8-data-model--api-blueprint-ksa-starter)
9. [Frontend module plan (`src/v4/*`)](#9-frontend-module-plan-srcv4)
10. [UX: bilingual + mobile-first + customization + internal branding](#10-ux-bilingual--mobile-first--customization--internal-branding)
11. [Phased implementation roadmap (KSA-gated)](#11-phased-implementation-roadmap-ksa-gated)
12. [Non-functional blueprint (security, RBAC, audit, PDPL, compliance)](#12-non-functional-blueprint-security-rbac-audit-pdpl-compliance)
13. [Risks, gaps & open decisions](#13-risks-gaps--open-decisions)
14. [Appendix A — Full existing page inventory (58 pages)](#appendix-a--full-existing-page-inventory-58-pages)
15. [Appendix B — Chart-to-report reuse map (+ KSA/operations reports)](#appendix-b--chart-to-report-reuse-map--ksaoperations-reports)
16. [Appendix C — KSA statutory quick-reference + sources](#appendix-c--ksa-statutory-quick-reference--sources)
17. [Appendix D — Contract catalog (all types, bilingual)](#appendix-d--contract-catalog-all-types-bilingual)

---

## 0. KSA statutory foundation (the rules the system must encode)

> **How to use this section:** every table below becomes either (a) a seeded configuration row (leave types, holidays, GOSI/levy rate versions, Ajeer guardrails), (b) a formula in the statutory engine (`src/v4/hr-statutory.js`, §9), or (c) a compliance check on the command-center page (`hr_sa_compliance.html`, §4). Items marked **⚠️ verify** have conflicting secondary sources — the system must make them **configurable, not hardcoded**, and confirm wording with MHRSD publications / legal counsel before go-live.

### 0.1 Governing framework

| Pillar | Authority / platform | What it governs |
|---|---|---|
| Saudi Labor Law (Royal Decree M/51) + amendments effective **18 Feb 2025** (38 articles amended, 7 repealed, 2 added) | MHRSD | Contracts, working time, leaves, termination, EOSB, equality, training |
| Labour outsourcing / secondment (Ministerial Decision 60339, eff. **26 Jan 2026**) | **Ajeer** platform | Service vs labour outsourcing, Ajeer contracts/permits (≤3 y), profession match |
| Social insurance (GOSI) incl. new graduated system from **3 Jul 2024** | GOSI portal | Pension, SANED (unemployment), occupational hazards |
| Wage Protection (WPS) | **Mudad** platform + SAMA-approved banks | Electronic salary payment + monthly SIF filing |
| Saudization (Enhanced **Nitaqat**, 32 activity categories, 6+ employees) | **Qiwa** platform | Contract documentation, Nitaqat band, visas/transfers |
| Residency & work authorization | **Muqeem** / Absher | Iqama issuance/renewal, profession, sponsor transfer |
| Tax & zakat | **ZATCA** | No payroll income tax; VAT 15%; WHT on non-resident payments; entity CIT/zakat |
| Health insurance (mandatory) | CHI (CCHI)-approved insurers | Employer-provided medical cover |
| Data protection | Saudi **PDPL** | Employee PII consent, access, retention |

### 0.2 Working time & overtime

| Rule | Statutory value | System encoding |
|---|---|---|
| Standard day / week | **8 h / 48 h** | Default work-profile; attendance engine |
| Ramadan (Muslim employees) | **6 h / 36 h** | Ramadan profile switch on `hr_shifts.html` + calendar (Hijri-aware start/end) |
| Max incl. overtime | **11 h/day** | Timesheet validation error |
| Break | Required after **5 consecutive hours** | Shift template rule |
| Weekly rest | Min **1 paid day/week** (typically Friday) | Roster validation |
| Overtime rate | **150%** of hourly wage (beyond 48 h/week, or 36 h in Ramadan) | Payroll formula |
| Overtime cap | **720 h/year** (except with employee agreement) | Accrual + warning at 80% |
| Work on rest day / public holiday | **150% or compensatory day within 30 days**, agreed in advance | Timesheet → payroll/leave link |

### 0.3 Leave entitlements (seeded leave types)

| Leave type | Entitlement | Pay | Notes / system rule |
|---|---|---|---|
| Annual | **21 days**; **30 days after 5 continuous years** with same employer | Full (full wage incl. regular allowances) | Accrual + anniversary auto-step-up; carryover = **configurable policy** ⚠️ (sources conflict — default: carry with expiry, employer approval) |
| Sick (per year, after probation) | **120 days**: 30 full + 60 at **75%** + 30 unpaid | Tiered | ⚠️ one source says middle tier is half-pay — configurable; require medical certificate upload; **block termination while on sick leave** |
| Maternity | **10 weeks** (70 days): up to 4 prenatal + min 6 postnatal | Full or half by tenure | ⚠️ 2025 amendments may extend to **12 weeks** — verify; duration = config. Nursing: **1 paid hour/day**; job protection; full-pay maternity blocks annual leave same year |
| Paternity (newborn) | **3 days** paid (Art. 113, Feb-2025) | Full | Trigger: birth certificate |
| Marriage | **5 days** paid | Full | Once per marriage; advance notice |
| Bereavement | **5 days** spouse/ascendants/descendants; **3 days** siblings | Full | Relationship picker drives duration |
| Iddah (Muslim widow) | **4 months + 10 days** on husband's death | Full | Special long-leave case; payroll continuation |
| Hajj | **10–15 days incl. Eid Al-Adha**, **once per employment**, after **2 consecutive years**, for one who hasn't performed Hajj | ⚠️ **paid vs unpaid varies by source** — configurable, default per counsel; employer caps headcount/year (roster rule) | Eligibility check: tenure + prior-Hajj declaration |
| Unpaid extra | Up to **10 days/year** on employer approval | Unpaid | Approval workflow |
| Official holidays | **Eid Al-Fitr 4 days, Eid Al-Adha 4 days, National Day (23 Sep), Founding Day (22 Feb)**; shift to nearest working day if on weekend | Paid | Hijri-driven Eid dates; auto-shift rule; holiday-work → 150%/comp-day |

### 0.4 Contracts, probation, notice, termination

| Rule | Value | System encoding |
|---|---|---|
| Contract documentation | **Electronic contract via Qiwa is mandatory**; since Apr-2026 only **authenticated** Qiwa contracts count toward Saudization | `qiwa_contract_status` per employee; compliance widget; downgrade alerts |
| Probation | Max **180 days**, must be stated in contract; no repeat for same role; either party may end during probation per contract | Probation countdown + auto-confirm task; EOSB/leave accrual paused display |
| Expat contracts | **Fixed-term by default** (unwritten/indefinite deemed = Iqama duration) | Contract-type default by nationality; expiry linked to Iqama |
| Housing & transport | **Mandatory benefit or allowance** (2025 amendments) | Required fields on job/contract; payroll components |
| Notice (indefinite) | **60 days** (some sources: employer 60 / employee 30 ⚠️) | Notice calculator in offboarding; configurable split |
| Resignation (2025 reform) | Lawful termination route; **deemed accepted if employer doesn't reply within 30 days** | Resignation workflow with 30-day auto-accept timer + notifications |
| Art. 80 (employer dismissal for misconduct) | No notice, **no EOSB** | Termination-reason picker gates EOSB to zero + requires evidence docs |
| Art. 81 (employee leaves for employer breach) | No notice, **full EOSB + compensation** | Same picker; compensation line in settlement |
| Unlawful termination | Compensation = contract remainder or **15 days/year** (whichever applies) | Settlement calculator branch |
| Employer cost duties | Recruitment + **repatriation ticket** for expats; penalties for **late Iqama renewal** | Offboarding checklist item; Iqama-expiry alerts at 90/60/30/7 days |

### 0.5 End-of-service benefits (EOSB / EOSA)

Core formula (Art. 84) on **last basic wage** (+ fixed contractual allowances per contract interpretation ⚠️):

- **First 5 years: ½ month's wage per year** (= 15 days/year; daily wage = monthly ÷ 30)
- **Beyond 5 years: 1 full month's wage per year**; partial years **pro-rata**
- Probation counts toward service; pay within **1 week** (employer termination) / **2 weeks** (resignation)

Resignation haircut (Art. 85) — ⚠️ **2026 nuance:** applies only to **fixed-term resignation** (employer-accepted):

| Service | Resignation entitlement |
|---|---|
| < 2 years | None |
| 2–5 years | ⅓ of calculated EOSB |
| 5–10 years | ⅔ |
| 10+ years | Full |

System: `hr_eosb.html` = calculator + monthly **accrual provision report** + **final-settlement generator** (EOSB + unused-leave payout + outstanding salary + repatriation ticket). Wage-basis (basic vs basic+fixed allowances) and any cap ⚠️ (sources cite 12 vs 18 months — verify; default: no cap, configurable) are explicit settings.

### 0.6 GOSI / SANED (payroll deduction engine)

Contributory wage = **basic salary + housing allowance only**, cap **SAR 45,000/month**.

| Cohort | Pension (employee / employer) | SANED (each side) | Hazards (employer) | All-in 2026 |
|---|---|---|---|---|
| **Saudi, old system** (enrolled < 3 Jul 2024) — fixed | 9% / 9% | 0.75% | 2% | **9.75% / 11.75%** (total 21.5%) |
| **Saudi, new system** (enrolled ≥ 3 Jul 2024) — graduated | 9% → 9.5% (Jul-25) → **10% (Jul-26–Jun-27, current)** → 10.5% → 11% (Jul-28+) | 0.75% | 2% | **10.75% / 12.75% today** (total 23.5%), rising yearly |
| **Expat** | — | — | 2% | **0% / 2%** |

System: store `gosi_system` per Saudi employee; versioned rate table (`GOSI_2024 … GOSI_2028`) with effective dates; payroll auto-applies by enrollment date; `hr_gosi.html` shows split + monthly filing totals; cross-check vs Mudad within tolerance (see 0.7).

### 0.7 WPS / Mudad (salary disbursement compliance)

- All private-sector salaries **electronic via SAMA-approved banks**, monthly **SIF via Mudad** (≥1 business day before payday); pay within **first 10 days** of month.
- Delays: auto-alerts at **10 and 15 days**, **inspection at 20**; non-submission **suspends new work permits**; downgrades can cascade to Nitaqat.
- **Qiwa-contract ↔ WPS cross-check** at individual level: paid amount must match registered contract wage; **GOSI cross-check ~20% deviation threshold**.
- System: `hr_wps.html` builds the period file from the approved pay run, diffs contract wage vs payable, tracks Mudad upload state (draft → submitted → accepted → paid), raises mismatch tasks. (Confirm whether you file inside Mudad UI from our export — see D3.)

### 0.8 Nitaqat / Saudization (existential compliance)

- Enhanced Nitaqat: 32 activity categories, applies at **6+ employees**, band scale (Red → Platinum); band gates **visas, transfers, renewals, Ajeer participation, government contracts**.
- **SAR 4,000/month minimum for a Saudi to count** toward Nitaqat; part-time Saudi ≥ SAR 3,000 counts as **⅓**; **no statutory minimum for expats** (contract wage binding + WPS-enforced).
- System: `hr_sa_compliance.html` shows live band estimate, Saudization %, Qiwa-doc %, headcount by band drivers, and "what-if" (hire X Saudis → band Y). **Ships in P0** — a KSA system without it is not credible.

### 0.9 ZATCA / TAX (what touches HR)

| Item | Rule | HR-system impact |
|---|---|---|
| **Personal income tax** | **0% — none** on salaries for Saudis or expats; no wage withholding; no individual filing | Payroll has **no tax-withholding step**; payslip shows GOSI only |
| VAT **15%** | On most goods/services | Expense claims capture VAT (receipt VAT field; finance reclaim report); client billing notes VAT handling per finance policy |
| Withholding tax **5–20%** | On payments to **non-residents** (services, royalties…) | **Overseas agent/consultant payouts** need WHT category + remittance tracking (10th of following month) — employees NOT subject |
| Zakat **2.5%** / CIT **20%** (foreign share) | Entity-level, annual return ≤120 days after FY end | Headcount-cost feeds (GOSI, EOSB accrual, payroll totals) exportable for finance |
| E-invoicing (Fatoora P2) | Real-time clearance waves | Out of HR scope; expense PDFs Fatoora-friendly (clear VAT lines) |
| EOSB | **Tax-free in KSA** (destination country may tax) | Settlement statement notes this for departing expats |

### 0.10 Residency, sponsorship & mobility

- Iqama/visa via **Muqeem**; employer bears recruitment + repatriation; **late-renewal penalties**; transfer fees by transfer count/conditions ⚠️ (verify current fee order with counsel).
- Mobility under the Labor Reform Initiative framework: **Qiwa transfer without NOC after notice**; exit via Absher.
- System: `hr_residency.html` tracks Iqama/passport/contract expiries (90/60/30/7-day alerts), profession-on-Iqama vs actual role, transfer case status, dependents. Full cost stack in §0.12.

### 0.11 Labour outsourcing & Ajeer (your core business — Jan-2026 unified framework)

Ministerial Decision No. 60339 (effective **26 Jan 2026**) replaced fragmented Ajeer guidance with one framework. For a manpower-supply company this is **the** operating-license layer:

| Rule | Value | System encoding |
|---|---|---|
| Service vs labour outsourcing | **Formal legal distinction**, different rules each | `service_type` on client agreement + assignment; validation per type |
| Ajeer documentation | **Mandatory electronic Ajeer Contract BEFORE any work starts** ("in place, not in progress") | **Hard gate:** assignment cannot go `active` without `ajeer_ref`; dashboard red-flag otherwise |
| Permit cap | **Max 3 years**, tied to underlying service contract; ends when service contract ends | `ajeer_expiry ≤ service_contract_expiry ≤ start + 3y` validation |
| Profession match | Worker must perform the **same profession as on work permit/Iqama** | Match check: request profession vs employee profession; block/warn on mismatch |
| Both sides qualified | Valid CR/licence + **WPS-compliant** + **Nitaqat-compliant** (provider AND beneficiary) | Client compliance snapshot fields; pre-activation checklist |
| Employee consent | Required **unless employment contract already provides for outsourcing** | Consent record (contract clause ref or signed consent doc) required to activate |
| Provider duties | Original employer **issues & renews** the permit; liability stays with provider | Renewal owner = us; alerts at 60/30/14 days; renewal tasks auto-created |
| Beneficiary duties | No out-of-profession work; **return worker within 1 working day** of revocation | Revocation → auto **recall task (1-day SLA)** + notifications |
| Penalties | Fines up to **SAR 5,000 per worker per violation**; Nitaqat suspension; quota denial | Compliance page surfaces at-risk assignments (missing/expiring permits) first |
| Participation floor | Medium-green Nitaqat or better (older guidance — ⚠️ verify under 2026 framework) | Nitaqat widget doubles as Ajeer-eligibility indicator |
| Older secondment limits | 20% borrow/offer caps, 12-months-per-24-months, no secondment in first 12 months after entry (pre-2026 guidance — ⚠️ **verify current applicability**) | Encode as **configurable guardrails** (default ON, counsel can relax with audit note) |
| Multi-beneficiary | One worker may serve multiple companies within legal hour limits, **separate Ajeer application each** | Data model allows parallel assignments with hour-cap validation |
| ESNAD | Separate route for **Saudi-national** secondment | Assignment type includes ESNAD path for Saudis |
| Labour outsourcing licence | Regulated activity — requires the **appropriate licence** to provide workers to others ⚠️ | **Verify your licence scope** (service vs labour) with counsel in P0 (see D11) |

### 0.12 Expat cost stack (Art. 40 — employer bears; deductions prohibited)

Most of your workforce is expatriate, so **true cost per worker** (not just salary) must be visible everywhere — assignment pricing, client billing, renewal planning. 2026 secondary-source figures — **store as versioned config, re-verify at build**:

| Cost line | 2026 figure | Paid by | System encoding |
|---|---|---|---|
| Iqama base fee | **SAR 650/yr** (flexible 3/6/9/12-mo terms) | **Employer** (Art. 40) | Renewal calendar + cost forecast per worker |
| Work-permit levy (Maktab Amal) | **~SAR 700–800/mo** (SAR 8,400–9,600/yr) by Nitaqat band; industrial-sector exempt; small-biz (≤9) partial exemptions | **Employer** | Biggest line: amortize into true-cost + client rate guidance |
| Dependent levy | **SAR 400/mo per dependent** | Employee (unless contract says otherwise) | Track dependents; optional employer-cover flag per contract |
| Medical insurance (mandatory, CHI) | Varies (~SAR 500–2,000+) | **Employer, no deduction** | Expiry-tracked like Iqama; renewal blocker if lapsed |
| Absher processing | ~SAR 51.75 | Employer | Minor; include in forecast |
| Late renewal penalties | **500 → 1,000 → 2,000+** (+ deportation risk at 3rd); employer fines **up to SAR 100,000** for no-Iqama | Employer/employee | Escalating alerts 90/60/30/7 days; red at expired |
| Transfer (Qiwa) fees | New employer pays | New employer (us, for transfer-in hires) | Recruitment cost line on transfer hires |
| Renewal blockers | Passport <6 mo validity · lapsed insurance · unpaid traffic fines · missing GOSI · employer Nitaqat red | — | **Pre-renewal checklist** auto-evaluated per worker |
| Recruitment + repatriation | Visa, travel, medical, final-exit ticket | **Employer** (Art. 40) | Visa-case costing + offboarding ticket task |

**Art. 40 guard (non-negotiable):** payroll engine **rejects any deduction line** categorized as Iqama/levy/insurance/recruitment. Any attempt is blocked with an explanatory error + audit entry.

---

## 1. How to read this document

| If you are… | Read… |
|---|---|
| Decision maker / owner | §0.11–0.12 → §5 (comparison) → §11 (roadmap) → §13 (decisions) |
| Operations / deployment coordinator | §0.11–0.12 → §4.2 (M11) → §4.4 → §4.7 → App. D |
| PRO (Iqama/visa/Ajeer) | §0.10–0.12 → §4.7 → §8 |
| Frontend dev | §2 → §6 → §7 → §9 → §10 |
| Backend dev | §0 → §4.5–4.6 → §8 → §12 |
| HR / compliance stakeholder | §0 → §4.1–4.4 → §10 → App. C |
| Legal counsel (review ask) | §0 items marked ⚠️ + §12 + §13 (esp. D11–D12) |

**Conventions:**

- `production/*.html` = a page (Vite auto-discovers every file here — no config edit needed).
- `src/v4/*.js` = a frontend module, lazy-loaded by DOM-presence guard in `src/main-v4.js`.
- **Seed data** = hardcoded demo arrays (what every page uses today).
- **Adapter** = `src/v4/data-adapter.js` (`seedAdapter` vs `httpAdapter`, toggled by `?api=1`) — the seam where the API plugs in.
- **Statutory engine** = new `src/v4/hr-statutory.js` — single versioned source for KSA rates/rules (GOSI versions, levy table, leave table, EOSB, overtime, Ajeer guardrails). Nothing else may hardcode a KSA number.
- **Internal tool** = no public/marketing pages anywhere (§4.9).

---

## 2. Current-state review (what this repo actually is)

Reviewed: `package.json`, `vite.config.js`, `src/main-v4.js`, `src/v4/*.js` (22 modules), `src/scss/v4/*.scss` (10 partials), all 58 `production/*.html`, `types/gentelella.d.ts`, `examples/express-sqlite/*`, `AGENTS.md`/`CLAUDE.md`, `README.md`, `changelog.md`.

### 2.1 Verdict in 30 seconds

| Dimension | Finding |
|---|---|
| **What it is** | Free admin **dashboard template** (UI only). No HR/operations domain, no KSA logic, no real backend, no auth backend, no database. |
| **Tech** | Vite 8 (Rolldown) MPA · Vanilla ES2022 (no jQuery/Bootstrap/SPA) · SCSS (`@use`) · ECharts 6 + DataTables.net 3 + Leaflet 1.9 (lazy) · PWA-ready · **RTL already supported** (big win for Arabic) · dark mode. |
| **Strengths for this build** | Shell (sidebar/topbar/footer/breadcrumb) with build-time injection (no FOUC) · Single `NAV` constant · `showModal`/`showToast`/`openMenu`/`openPanel` primitives · DataTables wrapper (sort/search/paginate/select/CSV) · 20 ECharts factories with automatic dark-mode redraw · Working inbox / kanban / calendar / file-manager / settings / chat / invoice / user-management / profile pages · `?api=1` data-adapter seam + Express+SQLite example · RTL via logical properties · PWA-ready (home-screen install for mobile use) |
| **Gaps for manpower-supply HR+Ops** | Zero HR/operations entities (no workers, clients, assignments, Ajeer, contracts, expenses) · zero KSA rules (no GOSI/EOSB/WPS/Nitaqat/Ajeer/Hijri/SAR logic) · auth screens are static mocks · all state is in-memory seed or `localStorage` · no roles/permissions, approvals, audit, upload backend, notifications backend · example API only covers `orders` + `messages` · English-only strings (RTL-ready but untranslated) · desktop-first layouts (mobile needs a deliberate pass) |
| **Transformation effort** | **Frontend: mostly remap + reskin + localize + mobilize** (60–70% reusable). **KSA statutory engine + operations domain + backend: net-new** (the real work). No framework migration — the vanilla MPA fits this system well. |

### 2.2 Architecture (as built)

```
Browser
  production/*.html (58 entries, auto-discovered by vite.config.js)
    └── <body data-shell="admin" data-page="…">
          ├── Build time: shellInjectionPlugin inlines sidebar/topbar/footer + PWA/SEO meta + pre-paint theme script
          └── Runtime:  src/main-v4.js → mountShell() + initCharts() + initTables()
                        + initCommandPalette() + initPageActions()
                        + lazy import (inbox/kanban/calendar/settings/file-manager/form-controls/…)
                        + document-level delegation (toggles, todos, tabs, chips, card menus, fake form-submit→toast)

Styling:  src/scss/v4/_tokens.scss (:root + [data-theme="dark"] CSS vars) + 9 partials
Data:     hardcoded SEED arrays; optional httpAdapter via ?api=1 → /api/* (Vite proxy → examples/express-sqlite on :8080)
Build:    Vite 8 → dist/ (hashed js/css, 3 lazy vendor chunks: echarts/tables/maps, terser drops console.*)
```

Key files: `src/main-v4.js`; `NAV` + `ICONS` in `src/v4/shell-render.js`; `src/v4/data-adapter.js`; `examples/express-sqlite/server.js` (`/api/orders`, `/api/messages`, `/api/health`).

### 2.3 What already works (and this build can steal)

| Existing capability | File(s) | Reuse for manpower-supply HR+Ops |
|---|---|---|
| Sidebar/topbar/footer/breadcrumbs + ⌘K | `shell*.js`, `command-palette.js` | Keep; re-author `NAV` (§7) + Arabic labels + mobile drawer polish |
| RTL support | `_rtl.scss`, logical properties | **Arabic UI without a rewrite** — add `dir="rtl"` + translations |
| PWA (installable, offline shell) | `sw.js`, `site.webmanifest` | **Home-screen install for mobile use**; offline shell for site areas |
| Dark/light + theme generator | `_tokens.scss`, `theme.html` | Keep; re-tokenize to company brand via settings |
| DataTables (search/sort/paginate/select/CSV) | `tables.js`, `tables_dynamic.html` | Directory, requests, assignments, GOSI report, WPS log, EOSB, expenses, audit |
| 20 ECharts variants, theme-aware | `charts.js` | Headcount, utilization, Saudization, Ajeer health, leave, hiring, billing, EOSB (App. B) |
| Kanban drag-drop | `kanban.js` | Hiring pipeline + **workforce tracker board** (bench/deployed/leave/…) |
| Calendar CRUD | `calendar.js` | Leave + interviews + Ramadan-profile rosters + Hijri holidays |
| Inbox | `inbox.js` | Offer letters, client correspondence, HR announcements |
| File manager | `file-manager.js` | Vault: contracts, Iqama/GOSI/Ajeer docs, payslips, policies + expiries |
| User management | `user_management.html` | **→ `hr_employees.html`** (directory seed: search/filter/chips/row menu) |
| Contacts grid | `contacts.html` | Employee card wall (alt directory view, handy on mobile) |
| Profile | `profile.html` | → `hr_employee.html` 360 (+ Job/GOSI/Residency/Deployment/Leave/Docs tabs) |
| Invoice (editable lines) | `invoice.html` | **Bilingual payslip + final settlement + expense claim + billing view** |
| Settings (persisted) | `settings.js` | → `hr_settings.html` (customization engine UI, API-backed) |
| Forms + wizard + validation + upload + rich text | `form*.html`, `form-controls.js` | Onboarding wizard, **contract maker wizard**, job editor, expense claims |
| Chat / notifications / FAQ | assorted | HR helpdesk; approvals + expiry/Ajeer alerts; help center |
| Auth + error screens | `login/register/forgot/verify_2fa/lock/page_*` | Keep layout + Arabic; wire real auth; 403 = real RBAC denial; root → login |

---

## 3. Existing blueprint — as-is (distilled)

The implicit blueprint the template was built to — the comparison baseline.

**Product:** *A generic, framework-free, English-only, desktop-first admin UI starter for any back-office — judged on page count, theme quality, and copy-paste velocity, not on any domain, jurisdiction, or business model.*

- **IA (7 NAV groups, ~35 entries → 58 pages):** General (Dashboards ×4, Forms ×6, Tables ×2, Charts ×3, Calendar, Map) · Apps · E-commerce · Projects · UI library · Admin · Layouts.
- **Page archetypes (5):** Dashboard · CRUD table · App-workspace · Form/wizard · Marketing/auth/error/layout demo.
- **Data:** No schema. Per-page seed arrays; `localStorage` for theme/settings; `data-adapter.js` defines the API *shape* with no required adopters.
- **Identity:** None. Hardcoded avatar; role chips visual-only; no login state, guard, or tenant.
- **Locale:** English-only; Gregorian-only; `$` demos; RTL stylesheet-ready but untranslated.
- **Workflow:** None (fake-submit → toast).
- **Backend:** Optional Express+SQLite demo (`orders`, `messages`, no auth).
- **Quality:** ESLint + Prettier, smoke test, Playwright screenshots, PWA + SEO meta, a11y basics.

**In short:** breadth of UI, zero backend/domain/jurisdiction opinions. This blueprint inverts all of it: *narrow IA (manpower-supply people-operations), strong backend opinions, strong KSA statutory opinions, mobile-first, internal-only.*

---

## 4. Target blueprint — manpower-supply HR + Operations (to-be)

### 4.1 Product definition

> **Internal HR + Operations platform for a Saudi manpower-supply company** (mostly-expatriate workforce, deployed to client companies): one bilingual (Arabic/English), mobile-first place to **recruit → document (visa/Iqama/GOSI/Mudad) → deploy (Ajeer-compliant assignments) → track → pay (SAR+GOSI+WPS) → renew/exit** every worker — plus **client & site management, manpower requests, a contract maker for all employee + client contract types, full expense management, and live KSA compliance (Nitaqat/Qiwa/WPS/GOSI/Ajeer)**. Everything customizable via settings. **Internal tool only — zero sales/marketing elements.**

**Personas & home pages:**

| Persona | Needs | Home page |
|---|---|---|
| **Operations / deployment coordinator** ⭐ (core role) | Fulfill client requests, assign workers, Ajeer permits, tracker board | `hr_tracker.html` + `hr_requests.html` + `hr_assignments.html` |
| **HR Admin** | Full CRUD, contracts, compliance, payroll, settings, audit | `hr_dashboard.html` + `hr_sa_compliance.html` |
| **PRO (government relations)** | Visas, Iqama/insurance renewals, Qiwa transfers, Ajeer filings, Mudad flags | `hr_residency.html` + `hr_visas.html` + compliance expiries |
| **Site supervisor / client contact** | View deployed team, confirm attendance/timesheets, request workers | `hr_my_team.html` (site-scoped) + approvals (optional client portal P6) |
| **Manager (internal)** | Approve leave/expenses/timesheets, review team | `hr_approvals.html` (mobile-first) |
| **Employee / worker (self-service)** | Request leave, view payslips (bilingual), EOSB estimate, expenses, documents | `hr_my_space.html` (mobile-first, Arabic-first) |
| **Recruiter / agent coordinator** | Volume expat hiring via overseas agents, visa blocks, arrivals | `hr_candidates.html` + `hr_pipeline.html` + `hr_visas.html` |
| **Payroll officer** | Attendance → GOSI → pay run → WPS/SIF → Mudad | `hr_payroll.html` + `hr_wps.html` + `hr_gosi.html` |
| **Finance** | EOSB provision, GOSI totals, client billing export, expense VAT, true-cost per worker | `hr_eosb.html` + `hr_billing.html` + `hr_reports.html` |

### 4.2 Module map (12 modules + platform; M10–M12 are the business spine)

| # | Module | Purpose | Pages (slug) | Reuses existing |
|---|---|---|---|---|
| M1 | **Dashboard & Analytics** | Headcount, deployment/utilization, Saudization, attrition, leave, hiring, payroll, billing KPIs | `hr_dashboard.html`, `hr_reports.html`, `hr_billing.html` | `index*.html`, all `charts.js` factories, CSV |
| M2 | **People (expat-first)** | Bilingual directory, 360 profiles (GOSI + residency + deployment tabs), org chart, visa-to-deployment onboarding, offboarding | `hr_employees.html`, `hr_employee.html`, `hr_org_chart.html`, `hr_onboarding.html`, `hr_visas.html` | `user_management` → directory; `profile` → 360; `form_wizards` → onboarding |
| M3 | **Time: Attendance & Shifts** | Site-based check-in/out, timesheets (11 h / 720 h guards, client-approval), Ramadan profiles, Friday-rest rosters | `hr_attendance.html`, `hr_timesheets.html`, `hr_shifts.html` | `calendar.js` → roster; tables → logs |
| M4 | **Leave (KSA statutory)** | §0.3 leave types, balances, request/approve, Hijri holidays, exit/re-entry link for vacation | `hr_leave.html`, `hr_leave_calendar.html`, `hr_holidays.html`, `hr_approvals.html` | `calendar.js`, approvals, notifications |
| M5 | **Payroll, EOSB & Expenses** | SAR pay runs + GOSI engine + Art.40 guards, bilingual payslips, EOSB accrual + final settlement, **full expense management** (claims, VAT, advances, client-billable, reimbursement) | `hr_payroll.html`, `hr_payslip.html`, `hr_salary.html`, `hr_eosb.html`, `hr_expenses.html` | `invoice.html` → payslip/settlement/expense |
| M6 | **Recruitment (volume expat)** | Requisitions, overseas agents, candidates (+CSV import), kanban pipeline, interviews, offers, hire→visa→onboarding | `hr_jobs.html`, `hr_job.html`, `hr_candidates.html`, `hr_pipeline.html`, `hr_interviews.html`, `hr_offers.html` | `kanban.js`, `inbox.js`, `calendar.js` |
| M7 | **Performance & Growth** | Goals/OKRs, reviews, 1:1s, feedback, training (MHRSD training-duty evidence) | `hr_goals.html`, `hr_reviews.html`, `hr_review.html`, `hr_feedback.html`, `hr_trainings.html` | Forms + wizard + radar |
| M8 | **Documents & Help** | Vault (contracts, Iqama/GOSI/Ajeer docs, payslips, policies) + expiries, announcements, help center | `hr_documents.html`, `hr_policies.html`, `hr_announcements.html` (+ `faq.html` → KSA help) | `file-manager.js`, `notifications.html`, `chat.html` |
| M9 | **Settings & Admin (customization engine)** | Company profile + branding, numbering series, depts/designations/professions, KSA leave config, Hijri calendars, GOSI/levy versions, expense categories + limits, approval chains, notification templates, roles/permissions, audit | `hr_settings.html`, `hr_departments.html`, `hr_roles.html`, `hr_audit.html` | `settings.js` pattern (API-backed) |
| **M10** | **KSA Compliance spine** ⭐ | Nitaqat band + Saudization %, Qiwa-doc %, WPS/SIF tracker, GOSI filing, Ajeer-permit health, Iqama/visa/insurance expiries, Mudad flags | `hr_sa_compliance.html`, `hr_gosi.html`, `hr_wps.html`, `hr_residency.html` | New pages on table/card/chart patterns; data new |
| **M11** | **Clients & Deployments (Operations)** ⭐ | Client companies + sites, manpower requests (client orders), assignments (worker→client/site + Ajeer), **workforce tracker board**, client billing export | `hr_clients.html`, `hr_client.html`, `hr_requests.html`, `hr_assignments.html`, `hr_tracker.html` | `kanban.js` → tracker board; tables → requests/assignments |
| **M12** | **Contract Center (maker)** ⭐ | Bilingual **contract maker wizard** (all employee + client types, App. D), template library (placeholders, versioned), registers (employee contracts / client agreements / letters), sign-tracking, expiry alerts, Qiwa-doc checklist | `hr_contracts.html`, `hr_contract.html`, `hr_templates.html` | `form_wizards` → maker; tables → registers; modal/print |
| P | **Platform** | Auth+RBAC, approvals inbox, notifications, bilingual ⌘K, audit, import/export, Hijri/date/number helpers, i18n + mobile shell | `hr_approvals.html`, `hr_my_space.html`, `hr_my_team.html`, palette/menus/toast/modal | `command-palette.js`, `menus.js`, `modal.js`, `toast.js`, `page-actions.js` |

**Page count target:** ~46–50 pages (vs 58 generic) — complete HR + Operations coverage, zero marketing pages.

### 4.3 Information architecture (11 groups — HR + Operations)

Rule: *every sidebar entry is something your team does weekly.* Dev/gallery/marketing pages leave the sidebar entirely (internal tool — see §4.9).

```
HR + Operations sidebar — KSA manpower supply (see §7 for exact NAV code)
├── Overview
│   ├── Dashboard (hr_dashboard.html)              ← M1 (+ Saudization + deployment widgets)
│   ├── My space (hr_my_space.html)                ← P  (leave, payslips, EOSB, expenses)
│   └── Approvals (hr_approvals.html, badge=n)     ← P  (mobile-first)
├── People
│   ├── Directory (hr_employees.html)              ← M2 (Saudi/expat, status, Qiwa filters)
│   ├── Org chart (hr_org_chart.html)              ← M2
│   ├── Onboarding (hr_onboarding.html)            ← M2 (visa→Iqama→GOSI→Mudad→deploy)
│   └── Visas (hr_visas.html)                      ← M2 (blocks, arrivals, agents)
├── Operations ⭐
│   ├── Clients (hr_clients.html)                  ← M11 (companies + compliance snapshot)
│   ├── Manpower requests (hr_requests.html)       ← M11 (client orders + fulfillment)
│   ├── Assignments (hr_assignments.html)          ← M11 (worker→client/site + Ajeer)
│   └── Workforce tracker (hr_tracker.html)        ← M11 (status board: bench/deployed/leave/…)
├── Contracts ⭐
│   ├── Contract maker (hr_contracts.html)         ← M12 (wizard + registers)
│   └── Templates (hr_templates.html)              ← M12 (bilingual library, App. D)
├── Time & Leave
│   ├── Attendance (hr_attendance.html)            ← M3 (site-based, mobile check-in)
│   ├── Timesheets (hr_timesheets.html)            ← M3 (client-confirmed, billing link)
│   ├── Shifts (hr_shifts.html)                    ← M3 (incl. Ramadan profiles)
│   ├── Leave (hr_leave.html)                      ← M4 (§0.3 types)
│   └── Holidays (hr_holidays.html)                ← M4 (Hijri Eids + National + Founding Day)
├── Payroll
│   ├── Pay runs (hr_payroll.html)                 ← M5 (SAR, GOSI auto-split, Art.40 guards)
│   ├── EOSB & settlement (hr_eosb.html)           ← M5 (accrual + Art.84/85 + ticket)
│   └── Expenses (hr_expenses.html)                ← M5 (claims, VAT, advances, billable)
├── Compliance (KSA) ⭐
│   ├── Overview (hr_sa_compliance.html)           ← M10 (Nitaqat, Qiwa %, WPS, Ajeer, expiries)
│   ├── GOSI (hr_gosi.html)                        ← M10 (old/new split, monthly filing)
│   ├── WPS & Mudad (hr_wps.html)                  ← M10 (SIF build + mismatch alerts)
│   └── Residency & visas (hr_residency.html)      ← M10 (Iqama tracker, transfers)
├── Hiring
│   ├── Jobs (hr_jobs.html)                        ← M6 (SAR bands, housing/transport flags)
│   ├── Pipeline (hr_pipeline.html)                ← M6 (kanban)
│   ├── Candidates (hr_candidates.html)            ← M6 (+ agent source, CSV import)
│   ├── Interviews (hr_interviews.html)            ← M6
│   └── Offers (hr_offers.html)                    ← M6 (bilingual letters)
├── Growth
│   ├── Goals (hr_goals.html)                      ← M7
│   ├── Reviews (hr_reviews.html)                  ← M7
│   ├── Feedback (hr_feedback.html)                ← M7
│   └── Training (hr_trainings.html)               ← M7
├── Documents
│   ├── Vault (hr_documents.html)                  ← M8 (contracts, Iqama, GOSI, Ajeer, payslips)
│   ├── Announcements (hr_announcements.html)      ← M8
│   └── Help center (faq.html, KSA content)        ← M8
└── Admin
    ├── Reports (hr_reports.html)                  ← M1 (incl. billing + finance pack)
    ├── Departments (hr_departments.html)          ← M9
    ├── Roles (hr_roles.html)                      ← M9
    ├── Settings (hr_settings.html)                ← M9 (customization engine)
    └── Audit log (hr_audit.html)                  ← M9
```

No public marketing pages (internal tool). Auth screens rewired (§12); root URL → login. Candidate intake = internal (agents/CSV); a bare intake form is optional (P6, unlisted URL).

### 4.4 Core workflows (KSA + manpower-supply behavior layer)

Existing blueprint: none. This blueprint: **13 workflows** on one generic engine + statutory guards + configurable chains (§4.8).

| Workflow | States | KSA / business rule hooks |
|---|---|---|
| **Manpower request** (client order) ⭐ | `received → sourcing → shortlisted → proposed → confirmed → deploying → fulfilled` (+`cancelled`) | Profession/headcount/rate/duration; proposal = worker shortlist to client; fulfillment decrements open qty |
| **Assignment + Ajeer** ⭐ | `draft → eligibility → ajeer-filed → active → (renewing / recalling / completing) → closed` | **Gates:** Iqama valid, profession match, Nitaqat both sides, consent record, Ajeer ref present, ≤3 y; revocation → **1-working-day recall task** (§0.11) |
| **Visa-to-deployment** (expat onboarding) ⭐ | `offer → visa → arrived → medical → iqama → gosi → bank/mudad → housing → deployed` | Per-stage docs + SLAs; days-since-entry clock; Art.40 cost capture per stage (§4.7) |
| **Contract lifecycle** | `draft → review → issued → signed/filed → active → expiring → renewed/closed` | Template version pinned; Qiwa-doc checklist for employment contracts; expiry alerts 90/60/30 |
| Leave request | `draft → pending → approved/rejected → cancelled` | Balance check (§0.3); Hajj eligibility; sick-cert required; maternity interplay; vacation auto-suggests exit/re-entry task for expats |
| Resignation (2025 reform) | `submitted → (reply ≤30 d) → accepted/deemed-accepted → clearance → settled` | **30-day auto-accept timer**; Art. 85 haircut on settlement |
| Termination / offboarding | `initiated → reason(80/81/unlawful/mutual/expiry) → clearance → settled` | Art. 80 → EOSB zero + evidence; block on sick leave; ticket + final-exit + Iqama-cancel tasks; Qiwa/GOSI/Mudad checklist; Ajeer close + client recall |
| Final settlement | `draft → reviewed → approved → paid` | EOSB (84/85) + unused leave + outstanding salary + ticket; **1-wk/2-wk** countdown; "tax-free in KSA" note |
| **Expense claim (full)** | `draft → submitted → manager → finance → approved → (payroll/direct) → paid` | Category limits, VAT capture, receipt-required rules, **advance settlement**, **client-billable** flag → billing export |
| **Advance (سلفة)** | `requested → approved → paid → settling → settled` | Outstanding-advance cap per worker; settlement against claims/payroll within legal deduction limits |
| Job offer | `draft → approved → sent → accepted/declined` | Bilingual letter; salary floors; Nitaqat-floor hint for Saudis |
| Timesheet | `open → submitted → site-approved → locked` | 11 h/720 h guards; holiday/rest-day branches; Ramadan basis; site-supervisor confirm; locked hours feed **client billing** |
| Review cycle | `draft → self → manager → calibrated → published → acked` | Immutable once published; training-duty evidence |

Implementation: one generic `src/v4/approvals.js` (queue + approve/reject modal + chips + timeline) + `hr-statutory.js` guards + **settings-driven approval chains** (steps/roles/SLAs per workflow, §4.8). No bespoke engines per module.

### 4.5 Data blueprint (KSA + operations delta highlighted)

~28 tables (§8). Principles: `employees` root (1 user ↔ 0..1 employee; candidates separate until hire); time-based records append-only + effective-dated; money = **integer halalas** + `SAR`; pay runs immutable once paid; soft-delete people; audit tombstones; salary/GOSI/EOSB reads permission-gated server-side.

Operations principles: an **assignment** = worker × client × site × period × rate × Ajeer ref (the billable, compliant unit); **tracker status is derived** (never hand-typed) from assignment + leave + residency states; **client billing is derived** from active assignments + locked timesheets (+ billable expenses), exported monthly — the system is not an accounting package.

KSA-specific additions: nationality + IDs (national ID / Iqama + expiry + profession), `gosi_system` + contributory wage snapshot, IBAN (WPS), Qiwa contract status, Ramadan flag (opt-in, consent-based), Hijri holiday calendar, EOSB accrual ledger, WPS filing log, residency/transfer/visa cases, Ajeer permits, true-cost rollups.

### 4.6 Backend & auth blueprint (KSA)

- **API:** REST JSON under `/api/hr/*`, matching existing `httpAdapter` conventions; `?api=1` seed/API switching retained in dev. HR + operations + KSA endpoints in §8.2.
- **Reference stack:** Express + SQLite for P0–P2 (upgrade of `examples/express-sqlite`), Postgres at P3/P4. Add: session auth, RBAC, file store (disk → S3-compatible), schedulers (Ajeer/Iqama/contract/insurance expiries, probation, WPS deadlines, GOSI-version rollover, recall SLAs, Ramadan switch), CSV/SIF/billing exporters.
- **Government integrations — honest scoping:** Qiwa/Mudad/GOSI/Muqeem/**Ajeer** have **no public self-serve API for this app to call in P0** — the blueprint treats them as **operator-in-the-loop**: the system prepares, validates, and tracks (SIF file, GOSI totals, Qiwa checklist, Nitaqat estimate, Ajeer register + gates); a human files in the portal; the system records refs/receipts. Any portal API/RPA is a P6+ spike, explicitly out of MVP scope. (Decide D3: export-assist vs deeper integration.)
- **AuthN/Z:** real login + argon2/bcrypt + rate limits + lockout; invite-only registration; TOTP 2FA for HR/Payroll/Ops/Admin; reset tokens; idle lock screen. RBAC roles: `admin > hr > ops > payroll > pro > finance(read) > manager > site-supervisor > employee` with module scopes (§12). Server enforces; sidebar hides.
- **Notifications:** in-app first (approvals, expiries 90/60/30/7, Ajeer renewals, recall SLAs, WPS deadlines, probation ends, Ramadan switch); email Phase 2 (offers, payslip-ready, reminders). No WebSockets in MVP.

### 4.7 Expat worker lifecycle (most of your workforce — end-to-end)

Every expatriate moves through these stages. The system tracks stage + SLA + documents + Art.40 cost at each step (`hr_onboarding.html` wizard, `hr_visas.html`, `hr_residency.html`, 360 profile timeline).

| # | Stage | Owner | Key docs / data | System encoding |
|---|---|---|---|---|
| 1 | Sourcing & offer | Recruiter/agent | Overseas agent, bilingual offer, profession, salary split | Candidate → offer; agent + cost lines; transfer-in hires skip to stage 8 via Qiwa case |
| 2 | Work visa | PRO | Visa no./type, block, agent, validity | `hr_visas.html`: blocks, per-worker visa, expiry alerts; cost capture |
| 3 | Arrival | PRO/ops | Entry date (stamp) | **Starts clocks** (probation, tenure, ⚠️ 12-mo secondment guardrail if applicable); arrival checklist |
| 4 | Medical + fingerprints | PRO | Medical result, biometric confirmation | Task + document; blocks Iqama stage until complete |
| 5 | Iqama issuance | PRO | Iqama no./expiry/profession | Days-since-entry alert (timely issuance — ⚠️ confirm MHRSD deadline with counsel); profession-catalog match |
| 6 | GOSI registration | Payroll/PRO | GOSI no. | Expat 2% employer; registration is a renewal-chain prerequisite |
| 7 | Bank account + Mudad | Payroll | IBAN, bank | WPS-ready flag per worker; mismatch task if unpaid after active |
| 8 | Housing allocation | Ops | Camp/room or housing allowance | Mandatory benefit/allowance record (§0.4); feeds true-cost |
| 9 | Deployment (Ajeer) | Ops coordinator | Assignment + Ajeer ref + consent | **All §0.11 gates**; tracker → `deployed`; billing starts |
| 10 | Active ops | Ops/PRO | Renewals (Iqama/insurance/passport watch), exit/re-entry for vacation, profession changes, Qiwa transfers-in, traffic-fine watch, dependents | 90/60/30/7 alerts; **pre-renewal checklist** auto-evaluated; vacation ↔ exit/re-entry linkage; recall/replace flow |
| 11 | Exit | HR/PRO/Finance | Clearance, settlement, ticket, final exit, Iqama cancel, Ajeer close | Offboarding checklist + settlement + ticket + client recall + file archive |

Local-hire expats (already in KSA): **Qiwa transfer case** instead of stages 2–5 (transfer fee cost line, notice/release tracking, new Iqama data on completion).

### 4.8 Customization engine (settings-driven — "no IT ticket needed")

Principle: *if HR must ask a developer to change a text, rate, template, or approval step, that's a bug — it must be a setting.* All config is versioned + audited; seeds = §0 values.

| Config domain | Examples (bilingual AR/EN where user-facing) | Edited in |
|---|---|---|
| Company profile + branding | Name AR/EN, logo, CR no., address, letterhead, footer, login-screen text | `hr_settings.html` |
| Numbering series | `EMP-0001`, `CON-2026-001`, `REQ-…`, `ASN-…`, `EXP-…`, `PAY-…` prefixes + yearly reset | Settings |
| Organization | Departments, designations, **profession catalog** (with Iqama-profession mapping) | `hr_departments.html` |
| Leave | §0.3 leave types (durations, pay %, eligibility), carryover policy, Hajj quota | Settings |
| Holidays | Hijri holiday calendars per year, weekend-shift rule | `hr_holidays.html` |
| Time | Shift templates, Ramadan profiles, OT rules, site list | `hr_shifts.html` + clients |
| Pay | Salary components, **GOSI/levy version tables**, WPS bank mapping, deduction categories (Art.40-blocked flagged) | Settings |
| Expenses | Categories + limits + receipt rules, per-diem/mileage rates, VAT default, advance caps | `hr_expenses.html` + settings |
| Contracts | **Template library** (AR/EN bodies + `{{placeholders}}` + versions + active flag) | `hr_templates.html` |
| Workflows | Approval chains per flow (steps, roles, SLAs, escalations) | Settings |
| Notifications | Message templates AR/EN per event (issue, approve, expiry, recall…) | Settings |
| Documents | Required-doc checklists per process (onboarding, renewal, Ajeer, offboarding) | Settings |
| Access | Roles × module scopes matrix, site-scoped supervisor access | `hr_roles.html` |
| Clients | Default rate types, billing day, billing rules | `hr_clients.html` |

### 4.9 Internal tool scope (not for sale — no selling-type elements)

- **Root URL → login.** No public marketing/landing/pricing/promo/upsell pages or blocks anywhere in the app.
- **Shell rebranded to your company** via settings (logo, names AR/EN, footer). Template credit stays only in `LICENSE.txt`/repo files as legally required — invisible in the UI.
- **Auth required on every HR page**; post-login home is role-based (ops → tracker, worker → my space, PRO → expiries).
- **No public careers/apply marketing.** Candidate intake is internal (recruiters, overseas agents, CSV import). An optional bare bilingual intake form (unlisted URL, P6) only if you want it.
- **Minimal page metadata** (no marketing SEO/OG); **PWA kept and promoted** (home-screen install banner) because the team works from mobile.
- Every list/table supports the internal reality: Arabic-first names, Iqama/profession columns, status chips — not demo-shop data.

---

## 5. Side-by-side comparison: existing vs KSA blueprint

### 5.1 Product & IA

| Aspect | Existing (Gentelella v4) | KSA manpower-supply blueprint | Change |
|---|---|---|---|
| Product | Generic EN-only desktop-first template, any domain | **Internal bilingual mobile-first HR+Ops** for workforce supply | Narrow, deepen, localize, mobilize |
| Business model | None | **Clients → requests → assignments (Ajeer) → tracker → billing** | Net-new domain |
| Jurisdiction | None | **KSA statutory spine** (§0): Labor Law, Ajeer, GOSI, EOSB, WPS, Nitaqat, ZATCA | Net-new opinions |
| NAV groups | 7 generic | **11 groups** incl. **Operations**, **Contracts**, **Compliance (KSA)** | Full re-author of `NAV` |
| Entries/pages | ~35 → 58 (breadth showcase) | ~40 → ~48 (task + compliance oriented) | Fewer, deeper |
| Dashboards | 4 generic | Dashboard (+Saudization + deployment) + My Space + Reports + Billing | Replace 4 with 4 domain |
| Public pages | Template marketing landing | **None** — root → login (internal tool) | Remove |
| Gallery/dev pages | In product NAV | Removed from sidebar, kept on disk during build | Hide, then delete (P6) |

### 5.2 Pages & components

| Aspect | Existing | KSA blueprint | Verdict |
|---|---|---|---|
| Tables | 2 demos | Directory, requests, assignments, GOSI, WPS, EOSB, expenses, audit… | **Reuse `tables.js` 100%** |
| Charts | 20 generic demos | Same factories + KSA/ops datasets (utilization, Ajeer health, billing…) | **Reuse + new cases** |
| Kanban | Generic board | Hiring pipeline + **workforce tracker board** + onboarding board | **Reuse, new configs** |
| Calendar | Generic events | Leave + interviews + Ramadan rosters + Hijri holidays | **Reuse ×4 configs** |
| User mgmt | Generic users, fake chips | **Bilingual directory** + status/Iqama/Qiwa filters | **Adapt first (P0)** |
| Profile | Social profile | 360 + Job/GOSI/Residency/**Deployment**/Leave/Docs tabs | Heavy adapt |
| Invoice | Generic invoice | **Bilingual payslip + settlement + expense + billing view** | Adapt + print CSS |
| Settings | `localStorage` toggles | **Customization engine UI** (API-backed, §4.8) | Reuse UX, replace storage |
| Forms/wizard | Generic | Onboarding wizard, **contract maker wizard**, job editor, expense claims | Reuse controls |
| File manager | Generic browser | Vault + KSA doc types + expiries + assignment/client links | Adapt |
| E-commerce/Projects/Media/Marketing | Full verticals | **Retire from product** | Retire |
| RTL | Supported, untranslated | **Arabic-first strings, `dir` toggle, AR default (configurable)** | Localize (P0–P1) |
| Mobile | Desktop-first, basic drawer | **Mobile-first key flows, 360px gate, PWA install** (§10) | Deliberate pass |

### 5.3 Data, backend & behavior

| Aspect | Existing | KSA blueprint | Delta |
|---|---|---|---|
| Data model | None | ~28 entities + KSA/ops fields (§8) | **Net-new** |
| Statutory engine | None | `hr-statutory.js` (GOSI/levy/leave/EOSB/OT/Ajeer guards, versioned) | **Net-new (core IP)** |
| Operations domain | None | Clients/sites/requests/**assignments (Ajeer-gated)**/tracker/billing | **Net-new** |
| Backend | Demo (`orders`, `messages`) | HR+Ops API + KSA endpoints (§8.2) + auth + files + schedulers | **Net-new** |
| Payroll math | None | SAR minor units, GOSI auto-split, **no PIT**, EOSB accrual, WPS/SIF, Art.40 guards | **Net-new** |
| Leave engine | None | §0.3 table + step-up + Hajj/iddah/sick guards | **Net-new** |
| Expenses | None | **Full: claims + VAT + advances + limits + billable + reimbursement** | **Net-new** |
| Contracts | None | **Contract Center: templates + maker + registers + sign-track + expiries** | **Net-new** |
| Auth/RBAC | Mock | Sessions + 2FA + 9 roles × scopes, server-enforced | **Net-new** |
| Workflows | None | 13 flows on one engine + configurable chains | **Net-new** |
| Gov. filing | None | **Operator-in-the-loop** (SIF, GOSI, Qiwa, Nitaqat, Ajeer register) | New (honest scope) |
| Files | UI only | Real store + ACL + KSA doc types + retention + expiries | **Net-new server** |
| Search | ⌘K static pages | Bilingual ⌘K: pages + people/clients/contracts/docs | Extend |
| Audit/compliance | None | Append-only audit + PDPL rights + payroll immutability | **Net-new** |
| Tax | None | **No wage withholding**; expense VAT; agent/contractor WHT tracking | New (light) |
| Mobile/PWA | PWA files present, desktop-first UI | Mobile-first flows + install prompt + offline shell | Extend + gate |

### 5.4 Tech & quality (unchanged core)

Vanilla ES2022 MPA · Vite 8 auto-entries · SCSS vars + dark mode · `showModal/showToast/openMenu/openPanel` · PWA/a11y — **all unchanged**. Add: `_hr.scss` + `_ksa.scss` + `_mobile.scss` partials, `hr-statutory` tests, i18n dict, bilingual screenshots (AR+EN × light+dark × desktop+mobile).

---

## 6. Page reuse map (keep / adapt / retire / build)

✅ Keep (≤1h) · 🔁 Adapt (0.5–3d) · ❌ Retire from NAV · 🆕 Build new · ⭐ business-spine page.

### 6.1 Existing pages → fate

| Existing page | Fate | Becomes / notes |
|---|---|---|
| `index.html` | 🔁 | `hr_dashboard.html` — KPIs + **Saudization + deployment/utilization widgets** (P0) |
| `index2.html` | 🔁 | `hr_reports.html` — attrition/leave/hiring + finance/billing pack |
| `index3/4.html` | ❌ | Retire (harvest gauge/radar/bars into reports first) |
| `calendar.html` | 🔁 | ×3 configs: `hr_leave_calendar.html`, `hr_interviews.html`, `hr_shifts.html` (+Ramadan) |
| `chat.html` | 🔁 | HR helpdesk / site coordination (P5+) |
| `contacts.html` | 🔁 | Employee card wall (alt directory view, good on mobile) |
| `user_management.html` | 🔁 | → **`hr_employees.html` (P0 flagship)** — status/Iqama/Qiwa filters + Arabic names + mobile cards |
| `profile.html` | 🔁 | → `hr_employee.html` — 360 tabs incl. **GOSI + Residency + Deployment** |
| `settings.html` | 🔁 | → `hr_settings.html` — **customization engine UI** (§4.8) |
| `faq.html` | 🔁 | KSA help center (leave, GOSI, WPS pay dates, Ajeer basics) |
| `inbox.html` | 🔁 | Candidate + client correspondence |
| `kanban.html` | 🔁 | → `hr_pipeline.html` (hiring) + ⭐ `hr_tracker.html` (workforce board) |
| `file_manager.html` | 🔁 | → `hr_documents.html` (+ KSA doc types + expiries + links) |
| `notifications.html` | 🔁 | Approvals + **expiry/Ajeer/WPS-deadline alerts** |
| `invoice.html` | 🔁 | → `hr_payslip.html` (**bilingual**, GOSI, no tax) + `hr_expenses.html` (+VAT) + `hr_eosb.html` settlement + `hr_billing.html` view |
| `tables*.html` | ✅ | Pattern reference; every list page copies `tables_dynamic.html` (+ mobile-card transform) |
| `form*.html` (+advanced/validation/upload) | ✅/🔁 | Control gallery; advanced → job editor, reviews, expense claims |
| `form_wizards.html` | 🔁 | → `hr_onboarding.html` (visa→deploy) + ⭐ `hr_contracts.html` **maker wizard** |
| `login/register/forgot/verify_2fa/lock` | 🔁 | Keep UI + Arabic + company brand; wire real auth; register = invite-only; root → login |
| `page_403/404/500`, `maintenance`, `coming_soon`, `offline` | ✅ | Keep (+Arabic, +brand); 403 = real RBAC denial |
| Gallery (`general_elements`, `widgets`, `typography`, `icons`, `playground`, `theme`, `chartjs`, `echarts`, `other_charts`, `form_buttons`, layouts) | ✅ dev-only | Remove from sidebar; `plain_page.html` = page starter; delete in P6 |
| `e_commerce*`, `orders*`, `pricing*`, `projects*`, `map*`, `media_gallery` | ❌ | Retire (map → branch/client-site map *maybe* P6) |
| `landing.html` | ❌ | **Retire — internal tool, no marketing pages.** (Optional bare intake form in P6 is a fresh minimal page, not this.) |

### 6.2 New pages to build (operations order)

| Phase | New page(s) | Seed from |
|---|---|---|
| P0 | `hr_dashboard.html` (+Nitaqat +deployment widgets), `hr_employees.html`, `hr_employee.html`, ⭐ `hr_sa_compliance.html` (v1) | `index`, `user_management`, `profile`, new |
| P1 | `hr_onboarding.html` (visa→deploy wizard), `hr_visas.html`, `hr_residency.html`, ⭐ `hr_tracker.html`, `hr_documents.html` (+expiries), `hr_my_space.html`, `hr_org_chart.html` | wizard, tables, kanban, file-manager |
| P2 | `hr_attendance.html` (site check-in), `hr_timesheets.html`, `hr_shifts.html`, `hr_leave.html` (§0.3), `hr_leave_calendar.html`, `hr_holidays.html` (Hijri), `hr_approvals.html` (mobile-first), `hr_my_team.html` | tables, calendar, notifications |
| P3 | ⭐ `hr_clients.html`, `hr_client.html`, ⭐ `hr_requests.html`, ⭐ `hr_assignments.html`, `hr_billing.html` (export v1) | tables, new |
| P4 | `hr_payroll.html` (GOSI+Art.40), `hr_payslip.html` (bilingual), ⭐ `hr_gosi.html`, ⭐ `hr_wps.html` (SIF), ⭐ `hr_eosb.html` (+settlement), `hr_expenses.html` (full) | invoice, tables |
| P5 | ⭐ `hr_contracts.html` (maker + registers), `hr_contract.html` (view/print/sign), ⭐ `hr_templates.html`, `hr_jobs.html`, `hr_candidates.html`, `hr_pipeline.html`, `hr_interviews.html`, `hr_offers.html` | wizard, tables, kanban, calendar, inbox |
| P6 | `hr_goals.html`, `hr_reviews.html`, `hr_review.html`, `hr_feedback.html`, `hr_trainings.html`, `hr_departments.html`, `hr_roles.html`, `hr_audit.html`, `hr_settings.html`, `hr_announcements.html`, `hr_reports.html` (+finance pack) | wizards, settings, tables, file-manager |

Net: **~46–50 pages** (11 adapted + ~36 new; ⭐ = spine). Detail pages (`hr_employee`, `hr_client`, `hr_contract`, `hr_payslip`, `hr_job`, `hr_review`) stay out of NAV.

---

## 7. Proposed NAV redesign — KSA (concrete)

Drop-in replacement for `NAV` in `src/v4/shell-render.js`. Add HR icons to `ICONS` (inline SVG, one-liners): `shield`, `id`, `scale`, `bank`, `palm`, `clock`, `wallet`, `briefcase`, `target`, `org`, `building`, `clipboard`, `swap`, `contract`.

```js
// HR + Operations NAV — KSA manpower-supply edition. Keys match data-page.
// Labels via i18n dict (AR default configurable); icons added to ICONS.
export const NAV = [
  { label: 'Overview', items: [
    { key: 'hr-dashboard', href: 'hr_dashboard.html', text: 'Dashboard', icon: 'dashboard' },
    { key: 'hr-my-space', href: 'hr_my_space.html', text: 'My space', icon: 'profile' },
    { key: 'hr-approvals', href: 'hr_approvals.html', text: 'Approvals', icon: 'bell', badge: { text: '4', cls: 'badge-red' } },
  ]},
  { label: 'People', items: [
    { key: 'hr-employees', href: 'hr_employees.html', text: 'Directory', icon: 'users' },
    { key: 'hr-org', href: 'hr_org_chart.html', text: 'Org chart', icon: 'org' },
    { key: 'hr-onboarding', href: 'hr_onboarding.html', text: 'Onboarding', icon: 'forms' },
    { key: 'hr-visas', href: 'hr_visas.html', text: 'Visas', icon: 'id' },
  ]},
  { label: 'Operations', items: [
    { key: 'hr-clients', href: 'hr_clients.html', text: 'Clients', icon: 'building' },
    { key: 'hr-requests', href: 'hr_requests.html', text: 'Manpower requests', icon: 'clipboard' },
    { key: 'hr-assignments', href: 'hr_assignments.html', text: 'Assignments', icon: 'swap' },
    { key: 'hr-tracker', href: 'hr_tracker.html', text: 'Workforce tracker', icon: 'kanban' },
  ]},
  { label: 'Contracts', items: [
    { key: 'hr-contracts', href: 'hr_contracts.html', text: 'Contract maker', icon: 'contract' },
    { key: 'hr-templates', href: 'hr_templates.html', text: 'Templates', icon: 'pages' },
  ]},
  { label: 'Time & Leave', items: [
    { key: 'hr-attendance', href: 'hr_attendance.html', text: 'Attendance', icon: 'clock' },
    { key: 'hr-timesheets', href: 'hr_timesheets.html', text: 'Timesheets', icon: 'tables' },
    { key: 'hr-shifts', href: 'hr_shifts.html', text: 'Shifts', icon: 'calendar' },
    { key: 'hr-leave', href: 'hr_leave.html', text: 'Leave', icon: 'palm' },
    { key: 'hr-holidays', href: 'hr_holidays.html', text: 'Holidays', icon: 'map' },
  ]},
  { label: 'Payroll', items: [
    { key: 'hr-payroll', href: 'hr_payroll.html', text: 'Pay runs', icon: 'wallet' },
    { key: 'hr-eosb', href: 'hr_eosb.html', text: 'EOSB & settlement', icon: 'scale' },
    { key: 'hr-expenses', href: 'hr_expenses.html', text: 'Expenses', icon: 'receipt' },
  ]},
  { label: 'Compliance (KSA)', items: [
    { key: 'hr-sa-compliance', href: 'hr_sa_compliance.html', text: 'Overview', icon: 'shield' },
    { key: 'hr-gosi', href: 'hr_gosi.html', text: 'GOSI', icon: 'bank' },
    { key: 'hr-wps', href: 'hr_wps.html', text: 'WPS & Mudad', icon: 'bank' },
    { key: 'hr-residency', href: 'hr_residency.html', text: 'Residency & visas', icon: 'id' },
  ]},
  { label: 'Hiring', items: [
    { key: 'hr-jobs', href: 'hr_jobs.html', text: 'Jobs', icon: 'briefcase' },
    { key: 'hr-pipeline', href: 'hr_pipeline.html', text: 'Pipeline', icon: 'kanban' },
    { key: 'hr-candidates', href: 'hr_candidates.html', text: 'Candidates', icon: 'profile' },
    { key: 'hr-interviews', href: 'hr_interviews.html', text: 'Interviews', icon: 'chat' },
    { key: 'hr-offers', href: 'hr_offers.html', text: 'Offers', icon: 'mail' },
  ]},
  { label: 'Growth', items: [
    { key: 'hr-goals', href: 'hr_goals.html', text: 'Goals', icon: 'target' },
    { key: 'hr-reviews', href: 'hr_reviews.html', text: 'Reviews', icon: 'charts' },
    { key: 'hr-feedback', href: 'hr_feedback.html', text: 'Feedback', icon: 'chat' },
    { key: 'hr-trainings', href: 'hr_trainings.html', text: 'Training', icon: 'media' },
  ]},
  { label: 'Documents', items: [
    { key: 'hr-documents', href: 'hr_documents.html', text: 'Vault', icon: 'files' },
    { key: 'hr-announcements', href: 'hr_announcements.html', text: 'Announcements', icon: 'bell' },
    { key: 'faq', href: 'faq.html', text: 'Help center', icon: 'help' },
  ]},
  { label: 'Admin', items: [
    { key: 'hr-reports', href: 'hr_reports.html', text: 'Reports', icon: 'charts' },
    { key: 'hr-departments', href: 'hr_departments.html', text: 'Departments', icon: 'projects' },
    { key: 'hr-roles', href: 'hr_roles.html', text: 'Roles', icon: 'settings' },
    { key: 'hr-settings', href: 'hr_settings.html', text: 'Settings', icon: 'settings' },
    { key: 'hr-audit', href: 'hr_audit.html', text: 'Audit log', icon: 'pages' },
  ]},
];
```

Rules: detail pages out of NAV (`hr_employee`, `hr_client`, `hr_contract`, `hr_payslip`, `hr_job`, `hr_review`) with back-linking breadcrumbs; badges real (approvals count, expiring-Iqama count, Ajeer-renewal count); `renderSidebar()` gains `can(key)` RBAC filter (UX-only; server enforces); ⌘K indexes the same NAV; no dead breadcrumb levels; mobile uses the existing drawer + role-based home (§10).

---

## 8. Data model + API blueprint (KSA starter)

### 8.1 Entities (⭐ = KSA/ops-specific)

```
users ──1:1── employees ──┬── contracts_emp (Qiwa status, housing/transport required)
  │                       ├── salaries (effective-dated; basic/housing/transport split)
  │                       ├── ⭐ gosi_records (gosi_no, system old/new, contrib_wage snapshot)
  │                       ├── ⭐ residency (iqama_no/expiry/profession, passport, transfer cases)
  │                       ├── ⭐ visas (visa_no/type/block/agent, issued/entry dates)
  │                       ├── ⭐ eosb_accruals (monthly provision snapshots)
  │                       ├── leave_requests ──→ approvals (all 13 workflows)
  │                       ├── timesheets / attendances ──(site)── ⭐ assignments
  │                       ├── ⭐ expenses ── advances (settlements) ──(billable)── ⭐ clients
  │                       └── reviews/goals/feedback (P6)
  ├── departments ── designations ── employees
  ├── ⭐ clients ── sites ── ⭐ manpower_requests ── ⭐ assignments (⭐ ajeer_permits) ── employees
  │                                                  └── ⭐ billing_runs (monthly exports)
  ├── jobs ── candidates ── interviews ── offers ──(hire)── employees
  ├── payroll_runs ── payslips ── employees   (+ ⭐ wps_filings: sif_ref, mudad_state)
  ├── ⭐ contract_templates ── ⭐ contracts_all (employee | client | letter)
  ├── ⭐ expense_categories ── expenses
  ├── ⭐ leave_types (seeded §0.3, configurable) ── leave_balances
  ├── ⭐ holidays (gregorian + hijri, shift-if-weekend)
  ├── announcements ── reads
  └── audit_logs (append-only)
```

Field sketches (money = integer **halalas** + `SAR`):

| Entity | Key fields (KSA/ops delta) |
|---|---|
| `employees` | `nationality, is_saudi, national_id?, iqama_no?/expiry?/profession?, passport_no/expiry?, gosi_no, gosi_system(old/new), gosi_enrolled_on, iban, bank_name, qiwa_contract_id/status, wps_contract_wage, ramadan_opt_in?, name_ar, job_title_ar, status_derived, housing_record?, dependents?` |
| `contracts_emp` / `salaries` | `housing_allowance, transport_allowance (required), eosb_wage_basis(basic|basic+fixed), effective_from/to` (supersede, never UPDATE) |
| `attendances` / `timesheets` | `site_id, client_id`, Ramadan-basis flag; OT split (normal/ramadan/rest-day/holiday); 720 h YTD; site-approval by/at |
| `leave_requests` | `leave_type (KSA enum), hajj_declaration?, sick_cert_url?, relationship?, iddah_case?, exit_reentry_link?` |
| `payroll_runs` | `gosi_employee/employer_totals, wps_sif_ref, mudad_state, period_hijri_label?` (immutable once paid) |
| `payslips` | Bilingual lines: basic/housing/transport/overtime/GOSI/net; **no tax line**; GOSI-reg + IBAN-masked |
| `clients` ⭐ | `name_ar/en, cr_no, contact, city, nitaqat_band?(snapshot), wps_ok?(snapshot), rate_default, billing_day, compliance_notes` |
| `sites` ⭐ | `client_id, name_ar/en, city, supervisor_id, shift_template?` |
| `manpower_requests` ⭐ | `client_id, site_id?, profession, headcount, start, duration_mo, rate_minor, status, fulfilled_count, notes` |
| `assignments` ⭐ | `employee_id, client_id, site_id, request_id?, start/end, rate_minor, service_type, consent_ref, status, recall_due?` |
| `ajeer_permits` ⭐ | `assignment_id, ajeer_ref, type, issued_at, expires_at(≤3y), state(active/renewing/revoked/closed)` |
| `contract_templates` ⭐ | `code, category(employee|client|letter), title_ar/en, body_ar/en ({{placeholders}}), version, active` |
| `contracts_all` ⭐ | `template_code+version(pinned), party_type/id, placeholders JSON, pdf_url, status, issued/signed/active/expiry, qiwa_linked?` |
| `expense_categories` ⭐ | `name_ar/en, limit_minor, receipt_required, vat_applicable, active` |
| `expenses` ⭐ | `employee_id, category, amount_minor, vat_minor, spent_on, receipt_url?, note, billable_client_id?, advance_id?, status, decided_by?` |
| `advances` ⭐ | `employee_id, amount_minor, purpose, status(requested/paid/settling/settled), settled_via?` |
| `visas` ⭐ | `candidate/employee_id, agent?, visa_no/type, block?, issued_at, entry_at?, status` |
| `billing_runs` ⭐ | `client_id, period, lines JSON (assignment/timesheet/expense refs), total_minor, exported_at/by, state` |
| `wps_filings` | `run_id, sif_hash, submitted_at/by, mudad_receipt?, mismatches JSON, state` |
| `audit_logs` | `actor, action, entity, diff, ip` + PDPL access-purpose flag on PII reads |

### 8.2 API endpoints (REST `/api/hr`, `httpAdapter`-compatible; ⭐ ops/KSA)

| Method & path | Purpose | Notes |
|---|---|---|
| `GET /api/hr/employees?…&status=&nationality=&qiwa=` | Directory (+CSV) | `employees`; team/site-scope for supervisors |
| `GET/POST/PATCH… /api/hr/employees[/:id]`, `GET …/:id/overview` | CRUD + 360 bundle | + deployment + true-cost tabs |
| `GET /api/hr/true-cost?employee=` ⭐ | Salary + levy amort. + insurance + housing + visa amort. | finance/ops pricing |
| `GET /api/hr/org` | Manager tree | nested |
| `GET /api/hr/leave-types` | Seeded §0.3 table (admin-tunable ⚠️) | `types` |
| `GET/POST/PATCH /api/hr/leave` (+`/approve`,`/reject`) | Requests + decisions | balance + eligibility guards |
| `GET /api/hr/holidays?year=` | Gregorian + Hijri + shift log | `holidays` |
| `GET/POST /api/hr/attendance`, `POST …/check-in\|-out` | Site logs + mobile self check-in | `days`; site stamp |
| `GET/POST/PATCH /api/hr/timesheets` (+`/submit`,`/site-approve`) | Weekly sheets → billing | 11 h/720 h guards |
| `GET/POST/PATCH /api/hr/jobs`, `/candidates` (+CSV import), `/interviews`, `/offers` | Volume hiring | `jobs`, `candidates`, … |
| `POST /api/hr/candidates/:id/hire` | Convert → employee + onboarding case | creates employee |
| `GET/POST/PATCH /api/hr/visas` (+`/arrive`) ⭐ | Visa blocks + arrivals | `visas`; agent costing |
| `GET/POST/PATCH /api/hr/payroll-runs` (+`/approve`,`/pay`), `GET /api/hr/payslips?run=&me=` | Pay runs (Payroll role) | Art.40 deduction guard |
| `GET/POST/PATCH /api/hr/expenses` (+`/approve`,`/pay`) ⭐ | Claims (+VAT, +billable, +advance link) | category-limit guards |
| `GET/POST/PATCH /api/hr/advances` (+`/settle`) ⭐ | Advances lifecycle | outstanding-cap guard |
| `GET /api/hr/approvals?role=mine` | Unified queue (all 13 flows) | polymorphic `items` |
| `GET/POST /api/hr/announcements`, `POST /:id/read` | Broadcasts | `items` |
| `GET/POST /api/hr/documents` (+ upload) | Vault + expiries | ACL by doc type |
| `GET /api/hr/reports/…` | Headcount/utilization/attrition/leave/hiring/payroll/billing | per-report |
| `GET /api/hr/audit?…` | Audit trail (Admin/HR) | `events` |
| ⭐ `GET /api/hr/sa/nitaqat` | Band estimate + Saudization % + Qiwa % + what-if | computed |
| ⭐ `GET /api/hr/sa/gosi?month=` | Contribution report (old/new split) + filing totals | `lines`, `totals` |
| ⭐ `GET /api/hr/sa/wps?run=` | SIF download + contract-vs-pay diff | file + `mismatches` |
| ⭐ `GET /api/hr/sa/eosb?employee=` | Live EOSB calc (+resignation branches) | Art.84/85 |
| ⭐ `GET/POST /api/hr/sa/settlements` | Final settlement (EOSB+leave+salary+ticket) | deadline countdown |
| ⭐ `GET /api/hr/sa/expiries` | Iqama/passport/contract/insurance/Ajeer expiries | 90/60/30/7 buckets |
| ⭐ `GET/POST/PATCH /api/hr/clients`, `/sites` | Client companies + sites | `clients`, `sites` |
| ⭐ `GET/POST/PATCH /api/hr/requests` (+`/propose`,`/fulfill`) | Manpower requests lifecycle | open-qty math |
| ⭐ `GET/POST/PATCH /api/hr/assignments` (+`/activate`,`/recall`,`/complete`) | Assignments; `/activate` enforces §0.11 gates | gate errors w/ reasons |
| ⭐ `GET/POST/PATCH /api/hr/ajeer` | Ajeer register (refs, renewals, revocations) | renewal due list |
| ⭐ `GET /api/hr/tracker` | Derived status board dataset | bench/deployed/leave/… |
| ⭐ `GET/POST/PATCH /api/hr/contracts` (+`/issue`,`/sign`) | Contract register + lifecycle | template version pinned |
| ⭐ `GET/POST/PATCH /api/hr/templates` | Template library (AR/EN + versions) | `{{placeholder}}` lint |
| ⭐ `GET /api/hr/billing/export?client=&period=` | Monthly client billing pack (CSV) | assignments + locked hours + billable expenses |
| `POST /api/auth/*` | Login/logout/invite/reset/2FA (+TOTP, lockout) | sessions |


**Frontend wiring rule:** every page constructs its adapter exactly like the docs prescribe:

```js
import { useApiMode, seedAdapter, httpAdapter } from './v4/data-adapter.js';
const adapter = useApiMode()
  ? httpAdapter('/api/hr/employees', { listKey: 'employees' })
  : seedAdapter(SEED_EMPLOYEES);
```

Seed data lives in `src/v4/hr-seed.js` (new, shared): one coherent demo manpower company (Riyadh HQ + 2 client sites, ~24 mixed Saudi/expat workers, assignments + Ajeer refs, SAR, Hijri holidays 1447/1448) — never per-page random names.

---

## 9. Frontend module plan (`src/v4/*`)

Repo conventions (§AGENTS.md): vanilla DOM, DOM-presence lazy import, idempotent `init*()`, overlays via `modal/toast/menus`, colors via CSS vars, `BASE_URL`-safe URLs.

| Module | New / Extend | Responsibility |
|---|---|---|
| `hr-seed.js` | 🆕 | **Shared demo company**: workers, clients, sites, requests, assignments + Ajeer refs, leave, holidays, pay data. Single import for all pages in seed mode |
| `hr-statutory.js` | 🆕 | **Single versioned KSA source**: GOSI rate versions, levy table, leave table (§0.3), EOSB Art.84/85, overtime, Ajeer guardrails (§0.11). Ships with contract test vectors. **Only module allowed to contain KSA numbers** |
| `hr-locale.js` | 🆕 | `Intl` helpers: SAR money, Gregorian + Hijri (`islamic-umalqura`) dates, AR/EN number words for documents |
| `i18n.js` | 🆕 | AR/EN string dict, `t(key)` helper, `dir` toggle (RTL/LTR), persisted language (default per settings) |
| `hr-api.js` | 🆕 | Wrapper over `httpAdapter`: session handling, `{ error }` → toast mapping, CSV download helper |
| `approvals.js` | 🆕 | **Generic queue** for all 13 flows + settings-driven chains (steps/roles/SLAs); approve/reject modal + chips + timeline |
| `employees.js` | 🆕 | Directory: search + status/nationality/Qiwa filters + sort + row-select + bulk CSV + row menu (ported from `user_management.html` inline script) |
| `employee-detail.js` | 🆕 | 360 tabs (Overview/Job & comp/GOSI/Residency/**Deployment**/Leave/Docs/Reviews) + true-cost card + edit modals |
| `org-chart.js` | 🆕 | SVG tree from `/api/hr/org` |
| `visas.js` | 🆕 | Visa blocks + per-worker visa + arrival recording + agent costing |
| `onboarding.js` | 🆕 | Visa-to-deployment stage machine (§4.7) + doc checklists + SLA clocks |
| `residency.js` | 🆕 | Expiry board + **pre-renewal checklist** auto-eval + Qiwa transfer cases |
| `operations.js` | 🆕 | Clients/sites CRUD + manpower requests lifecycle (propose/fulfill, open-qty math) |
| `assignments.js` | 🆕 | Assignment CRUD + **§0.11 activation gates** (clear reason list on block) + recall/complete + Ajeer register |
| `tracker.js` | 🆕 | Derived status-board dataset → renders through `kanban.js` config (bench/deployed/leave/vacation/renewal/exited) |
| `contracts.js` | 🆕 | Maker wizard + registers (employee/client/letter) + issue/sign-track + bilingual print |
| `templates.js` | 🆕 | Template library editor (AR/EN bodies, `{{placeholder}}` lint, versioning) |
| `leave.js` | 🆕 | Balances + request modal (date-range) + my-requests + Hajj/sick guards + exit/re-entry hint |
| `attendance.js` | 🆕 | Site-stamped check-in/out + today status + log table |
| `timesheets.js` | 🆕 | Week grid + submit + site-approve + lock (→ billing feed) |
| `recruitment.js` | 🆕 | Requisitions + candidates (+CSV import) + stage moves + hire-convert (kanban stays in `kanban.js`) |
| `payroll.js` | 🆕 | Run builder + GOSI auto-split + **Art.40 deduction guard** + approve/pay states |
| `gosi.js` | 🆕 | Contribution report (old/new split) + monthly filing totals |
| `wps.js` | 🆕 | SIF builder + contract-vs-pay diff + Mudad state tracker |
| `eosb.js` | 🆕 | Live calculator (Art.84/85 + resignation branches) + monthly accrual + settlement generator |
| `expenses.js` | 🆕 | Claims (photo receipt, VAT, limits) + advances lifecycle + billable flag + reimbursement |
| `billing.js` | 🆕 | Monthly client billing pack builder (assignments + locked hours + billable expenses → CSV) |
| `reviews.js` (P6) | 🆕 | Goals + review cycle wizard + radar + feedback wall |
| `documents.js` | 🆕 (thin) | Over `file-manager.js`: KSA doc-type filter + upload + expiry badges + entity links |
| `shell-render.js` | Extend | Replace `NAV` (§7, 11 groups) + 14 HR icons + `can(key)` RBAC filter + live badges + **brand injection** (logo/name from settings) |
| `command-palette.js` | Extend | Bilingual index: pages + (API mode) people/clients/contracts/docs search |
| `page-actions.js` | Extend | HR+Ops intents: `Approve/Reject/Check in/Request leave/New request/Assign/Activate/File Ajeer/New contract/Run payroll` (+ keep Print/Export/Share) |
| `kanban.js` | Extend | Config-ize columns/labels/cards → hiring pipeline + **tracker board** + onboarding (no fork) |
| `calendar.js` | Extend | Config-ize seed/colors/behavior → leave + interviews + shifts/Ramadan + Hijri holidays |
| `form-controls.js` | Extend | Add employee/client/site/profession pickers if multi-select can't cover it |
| `settings.js` | Extend→`hr-settings.js` | Same UX, API persistence, all §4.8 domains |
| `main-v4.js` | Extend | Lazy guards per `.hr-*` root; `hr-statutory` + `hr-locale` + `i18n` loaded once |

**What NOT to build:** a state store, a router, a component framework, a second modal/toast system, or a native mobile app (responsive web + PWA instead).

---

## 10. UX: bilingual + mobile-first + customization + internal branding

### A. Bilingual everything (Arabic-first)

1. **String catalog:** every user-facing string lives in `i18n.js` (`t('nav.operations.clients')` → `العملاء` / `Clients`). No hardcoded Arabic or English in pages/modules. **Coverage gate: 100% of HR pages × AR+EN before P6 sign-off.**
2. **Direction:** `<html dir>` toggles `rtl`/`ltr` with persisted language; layout already uses logical properties (§2) — verify each new component (tables, kanban, timelines, org chart) in both directions.
3. **Default language:** Arabic-first recommended (your team operates in Arabic); default is a **setting** (`hr_settings.html`), toggle in topbar, persisted per user.
4. **Documents print bilingual:** payslips, settlements, offers, contracts, assignment letters render AR+EN (side-by-side or stacked per template) with company letterhead from settings; one shared `@media print` stylesheet; money in figures + Arabic words for settlement/offer totals (via `hr-locale.js`).
5. **Locale correctness:** `Intl.DateTimeFormat` (no hand-formatted dates), Hijri alongside Gregorian where it matters (holidays, Ramadan, leave calendar headers), `Intl.NumberFormat('ar-SA'/'en-SA')` for SAR.

### B. Mobile-first (the team works from phones — mandatory)

**Breakpoints:** 360px (phones) · 768px (tablets) · 1024px+ (desktop). Every HR page must be **usable** at 360px; the flows below must be **excellent** one-handed.

| Mobile-critical flow | Page | Mobile pattern |
|---|---|---|
| Approve / reject (leave, expense, timesheet, assignment) | `hr_approvals.html` | Card queue, big thumb buttons, sticky approve bar, comment sheet |
| Request leave | `hr_leave.html` | 3-tap request (type → dates → submit), balance chips on top |
| Claim expense + photo receipt | `hr_expenses.html` | Camera upload (`capture="environment"`), VAT auto-line, offline-draft note |
| Site check-in/out | `hr_attendance.html` | One giant button + site auto-detect display |
| My payslips / EOSB / documents | `hr_my_space.html` | Cards + bilingual PDF view/download |
| Directory lookup (call a worker) | `hr_employees.html` | Search-first, `tel:` links, Iqama/profession at a glance |
| Tracker board glance | `hr_tracker.html` | Horizontal-snap columns or status filter + cards |
| Contract view / sign-ack | `hr_contract.html` | Full-screen readable doc + acknowledge button |

**Implementation rules (`_mobile.scss`, ~250 lines):**

1. **Tables → cards** under 768px: every HR `table[data-datatable]` gets a card transform (row → stacked card with labeled fields; hide low-priority columns via `data-priority`). Non-negotiable pattern, built once, applied everywhere.
2. **Touch targets ≥ 44px** for all actions; sticky bottom action bars on flows (approve/submit/check-in); modals become **full-screen sheets** on phones.
3. **Drawer nav + role home:** mobile keeps the existing sidebar drawer; post-login landing is role-based so daily work is ≤2 taps away.
4. **PWA install:** keep + promote (install prompt, branded icon/name from settings); offline shell for poor site connectivity; **drafts survive reload** (expense/leave forms persist to `localStorage` until submitted).
5. **Performance on mid-range Androids:** no new heavy deps; images capped; charts lazy as today; test on a real device, not just DevTools.
6. **Mobile test gate (every phase exit):** all touched pages pass at **360×740** (no horizontal scroll, no overlapping controls, all primary actions reachable); screenshots include a **mobile set** (AR+EN) from P1 on.

### C. Customization implementation (§4.8 → UI)

- One screen per domain (settings/templates/roles/departments/holidays/expenses), all API-backed, all audited; every select/option in daily flows (leave type, expense category, profession, site, template, chain step) reads from these — **zero hardcoded business options** in pages or modules.
- Template editor: textarea-based AR/EN bodies with `{{placeholder}}` insert-menu + lint (unknown placeholder = error) + version history + preview with sample worker.
- Approval-chain editor: per workflow, ordered steps (role + SLA hours + escalation role); engine reads it at runtime.

### D. Internal branding (strip list)

- Company logo + names (AR/EN) + footer text from settings; login screen branded; topbar avatar = session user.
- Remove from product surface: marketing landing, pricing/promo/upsell blocks, template-credit footer (stays only in `LICENSE.txt`/repo), public SEO/OG marketing tags.
- Keep: PWA, offline page (reworded, branded), 403/404/500 (branded, Arabic).

### E. Theme & a11y carry-over

- Re-tokenize `--primary` to company brand (green option) via `theme.html`; verify dark mode + all charts (automatic via CSS vars — just screenshot).
- New `_hr.scss` + `_ksa.scss` partials: status chips, bilingual doc styles, org tree, timelines, empty states; skip-link, focus rings, ARIA labels on all new controls; `prefers-reduced-motion` respected.

---

## 11. Phased implementation roadmap (KSA-gated)

Each phase ends with **smoke + screenshots green** and a demo-able slice. Estimates assume 1 full-stack dev, seed-mode first, API second within each phase.

| Phase | Goal (demo-able) | Frontend | Backend | KSA / ops gate |
|---|---|---|---|---|
| **P0 — Foundation (2 wks)** | Bilingual branded shell + directory + compliance v1 | NAV-11 (§7) + 14 icons + `i18n` skeleton + RTL verify + `_mobile.scss` baseline + brand settings; `hr_dashboard` (+Nitaqat +deployment widgets), `hr_employees`, `hr_employee` (tabs v1), `hr_sa_compliance` (v1); manpower seed (2 clients, sites, 24 mixed workers, assignments + Ajeer refs) | Extend example backend → `server/`: `employees`, `clients` (+`GET` list/detail/CVC) | Shell + directory pass at 360px; Nitaqat widget computes from seed |
| **P1 — People + expat lifecycle + tracker (2 wks)** | A worker tracked arrival → deployed | Onboarding wizard (§4.7), `hr_visas`, `hr_residency` (+pre-renewal checklist), ⭐ `hr_tracker`, vault + expiries, `hr_my_space` v1, org chart | `visas`, `residency`, `documents` + upload, tracker derived-status query, expiry scheduler | Renewal alerts fire at 90/60/30/7 on seed data; tracker statuses 100% derived |
| **P2 — Time & Leave (2 wks)** | Site attendance + statutory leave live | Site check-in, timesheets (+site-approve), shifts/Ramadan, leave §0.3, Hijri holidays, **mobile-first** `hr_approvals`, `hr_my_team` | Leave engine (balances, step-up, Hajj/sick guards), timesheet guards, chains v1 | KSA leave test vectors pass; approvals one-handed on phone |
| **P3 — Operations: clients + Ajeer (2 wks)** | Request → gated assignment → billing lines | `hr_clients`, `hr_client`, `hr_requests`, ⭐ `hr_assignments` (gate UI), `hr_billing` export v1 | Requests/assignments/Ajeer register; `/activate` enforces §0.11; billing derivation | Zero active assignments without Ajeer ref (seed + API); recall SLA task fires on test revocation |
| **P4 — Money: payroll + EOSB + expenses (2–3 wks)** | Pay workers correctly; expenses live | Pay runs (GOSI+Art.40 UI), bilingual payslip, `hr_gosi`, `hr_wps` (SIF), `hr_eosb` (+settlement), full `hr_expenses` (camera receipts, advances, billable) | GOSI engine (old/new), WPS/SIF builder, EOSB + settlement math, expense/advance ledgers, payroll immutability | GOSI vectors (Jul-2026 rates) pass; Art.40 guard rejects levy deduction; SIF sample validates |
| **P5 — Contracts + Hiring (2 wks)** | Bilingual contract maker + volume hiring | ⭐ Contract maker wizard + registers + sign-track + print, ⭐ template library (App. D v1 set), jobs/candidates(+CSV)/pipeline/interviews/offers | Templates versioning, contracts lifecycle, candidate import, hire→onboarding link | Issue→sign→expiry-alert cycle works; placeholder lint blocks bad template |
| **P6 — Growth + Admin + hardening (2 wks)** | Production-ready internal system | Goals/reviews/feedback/training/org; departments/roles/settings/audit; announcements; reports + finance pack; delete retired demo files; optional bare intake form / client-portal spike | RBAC enforcement pass, config versioning, schedulers (all), backup/restore drill | **No page ships without its 403 test**; mobile 360px pass on ALL pages; AR+EN screenshot set (desktop+mobile); counsel clears ⚠️ items |

**Total: ~14–16 weeks solo; ~7–8 weeks with FE+BE pair.** P0–P3 alone = operable core (document → deploy → track → bill); +P4 = pay correctly; +P5 = document everything bilingually.

Scaffold per page (repo convention):

```bash
npm run new -- hr-tracker --title "Workforce tracker" --nav-group "Operations" --icon kanban \
  --breadcrumb "Home > Workforce tracker|hr_tracker.html"
```

---

## 12. Non-functional blueprint (security, RBAC, audit, PDPL, compliance)

HR + operations data (PII, salaries, Iqama scans, contracts) in one internal system — explicit rules:

| Concern | Blueprint decision |
|---|---|
| **AuthN** | Email+password (argon2id/bcrypt, rate-limited, lockout), session cookie `HttpOnly; Secure; SameSite=Lax` + invite-only registration (HR invites → token link) + TOTP 2FA for admin/hr/ops/payroll + 1h reset tokens + idle lock screen |
| **AuthZ (RBAC)** | Roles: `admin > hr > ops > payroll > pro > finance(read) > manager > site-supervisor > employee`. Scopes per module (`people.read/write`, `ops.assign/activate`, `contracts.issue`, `leave.approve`, `payroll.run`, `billing.read`, `settings.write`, `audit.read`…). **Server enforces every endpoint** (403 + JSON); sidebar/palette hide defensively via `can()`; site-supervisors get site-scoped reads; employees get `me`-scoped |
| **Ajeer & assignment integrity** | Activation gates server-side (§0.11) — client can never hold an active assignment without Ajeer ref, valid Iqama, profession match, consent; revocation triggers recall task automatically; full history immutable |
| **Art. 40 cost guard** | Deduction categories flagged (`employer-borne` vs `deductible`); payroll API rejects employer-borne deductions (Iqama/levy/insurance/recruitment) with error + audit entry; legal deduction caps configurable |
| **Audit** | `audit_logs` insert-only (DB denies UPDATE/DELETE); every create/update/delete/approve/reject/login/export/config-change + actor + diff + IP; PII reads carry access-purpose flag; `hr_audit.html` Admin/HR-read-only |
| **Payroll integrity** | Runs immutable once paid (DB check + API guard); money in halalas; double-approve above threshold (config); payslips stored, never silently regenerated |
| **PII & files (PDPL)** | Iqama scans/contracts/payslips behind auth + ACL (never `public/`); signed expiring links; upload allowlist (pdf/png/jpg ≤10MB) + MIME sniff + AV hook; consent records for candidate/worker data; export-my-data + retention settings; at-rest encryption on prod volume |
| **Privacy ops** | Candidate delete-on-request (audit tombstone); rejected-candidate auto-purge (configurable months); consent checkbox on any intake form |
| **Validation** | Client: HTML5 + existing patterns (UX). **Server: authoritative** (schemas + date logic: no backdated approvals, no negative balances, no overlapping leave, no assignment beyond Ajeer/contract/Iqama expiry) |
| **Rate limits & abuse** | Login/reset/intake rate-limited; intake honeypot (+CAPTCHA in prod if abused); CSV/billing exports capped + logged |
| **Mobile/PWA** | Installable, branded icon; offline shell; form drafts survive reload; no sensitive data in `localStorage` beyond UI prefs (theme/lang/drafts of own forms) |
| **Internal-tool posture** | All HR pages behind auth; security headers; minimal metadata; no third-party marketing trackers (keep Google Fonts or self-host Inter — decide P0) |
| **Backups & env** | SQLite→Postgres by P4; nightly backup + tested restore before payroll go-live; secrets in env only; subpath deploy keeps working (`BASE_URL` everywhere) |
| **Testing** | `npm run smoke` (extend to all HR pages) + API contract tests + RBAC matrix (roles × endpoints) + workflow-transition tests + payroll/GOSI/EOSB/levy math suites + Ajeer-gate tests + Hijri/RTL/i18n checks + bilingual screenshots (AR+EN × light+dark × desktop+mobile) |

---

## 13. Risks, gaps & open decisions

| # | Risk / gap | Impact | Mitigation / decision needed |
|---|---|---|---|
| D1 | Country/scope | ✅ **Decided: Saudi manpower-supply, internal, bilingual, mobile-first** | — |
| D2 | Backend stack | Rework vs velocity | Blueprint: Express+SQLite → Postgres at P4. Confirm or name your stack (`httpAdapter` isolates FE) |
| D3 | Mudad filing mode | WPS UX scope | Export-assist MVP (system builds SIF, human files in Mudad — recommended) vs deeper integration |
| D4 | Brand assets | Every screen + document | **Send: company name (AR/EN), logo, CR no., address, letterhead prefs** — needed in P0 |
| D5 | Demo seed identity | Realistic demos | Fictional company/clients for seed (no real PII). Confirm name + 2 sample clients |
| D6 | Retire demo verticals | Repo clarity | Blueprint: out of NAV in P0, files deleted in P6. Confirm deletion OK (fork history preserves) |
| D7 | File storage | Uploads architecture | P0–P4 local disk; prod object storage. Decide provider before P1 uploads |
| D8 | Email provider | Offers/payslip-ready/reminders | Pick by P2 (Resend/SES/SMTP?). Until then in-app only |
| D9 | Default language | Daily UX | **Arabic-first (recommended)** vs English-first; toggle always available |
| D10 | Nitaqat activity category | Saudization % targets | Your MHRSD activity/size class → drives band math + seed |
| D11 | Outsourcing licence scope ⚠️ | **Legal basis of the business** | Confirm with counsel: your licence covers service vs labour outsourcing; encode in settings |
| D12 | Ajeer permit types + old limits ⚠️ | Activation gates | Confirm with counsel/MHRSD: which permit types you use; whether pre-2026 limits (20%, 12-mo) still apply |
| D13 | Fee/rate figures ⚠️ | Payroll/renewal correctness | Counsel/MHRSD confirm: levy bands, sick 75% vs 50%, maternity 10 vs 12 wks, Hajj paid/unpaid, carryover, EOSB cap, transfer fees |
| D14 | Client portal? | Scope | Optional P6: read-only deployed-team + timesheet confirm + requests for clients. Yes/no? |
| D15 | Data migration | P0–P1 effort | Do worker/client lists exist in Excel/files today? If yes, P1 includes CSV importers |
| D16 | Mobile priority flows | P2 quality bar | Confirm the 8 flows in §10-B (or re-rank) |
| R1 | Vanilla-JS scale | Bugs in hand-rolled state | Small idempotent modules + shared `hr-api` error path; no mid-stream framework |
| R2 | Payroll/EOSB/levy math | Financial + legal | Minor units + versioned tables + test suites as phase gates |
| R3 | UI-only RBAC by accident | Data leak | Rule: **no page ships without its 403 test** |
| R4 | Ajeer non-compliance | **SAR 5,000/worker/violation** + Nitaqat damage | Hard activation gates + renewal alerts + at-risk-first compliance page |
| R5 | Statutory drift (rates/rules change) | Silent non-compliance | Versioned config + annual counsel review task; ⚠️ items never hardcoded |

**Suggested next step:** send D4 (brand assets) + answer D9/D10/D11 + confirm D14–D16 → I scaffold P0 (NAV-11 + dashboard + directory + 360 + compliance v1 + manpower seed + i18n skeleton + mobile baseline) on `arena/01a08c48-dash`.

---

## Appendix A — Full existing page inventory (58 pages)

Auto-discovered entries (`vite.config.js → discoverEntries()`), grouped by current NAV + unlisted:

| Group | Pages (file → `data-page`) |
|---|---|
| Dashboards | `index.html`→`dashboard`, `index2.html`→`dashboard-2`, `index3.html`→`dashboard-3`, `index4.html`→`dashboard-4` |
| Forms | `form.html`→`forms`, `form_advanced.html`→`form-advanced`, `form_buttons.html`→`form-buttons`, `form_upload.html`→`form-upload`, `form_validation.html`→`form-validation`, `form_wizards.html`→`form-wizards` |
| Tables | `tables.html`→`tables`, `tables_dynamic.html`→`tables-dynamic` |
| Charts | `chartjs.html`→`charts`, `echarts.html`→`echarts`, `other_charts.html`→`other-charts` |
| General singles | `calendar.html`→`calendar`, `map.html`→`map` |
| Apps | `chat.html`→`chat`, `inbox.html`→`inbox`, `kanban.html`→`kanban`, `file_manager.html`→`files`, `notifications.html`→`notifications` |
| E-commerce | `e_commerce.html`→`storefront`, `product_detail.html`→`product`, `orders.html`→`orders`, `order_detail.html`→`order-detail`, `invoice.html`→`invoice`, `pricing_tables.html`→`pricing` |
| Projects | `projects.html`→`projects`, `project_detail.html`→`project-detail` |
| UI library | `general_elements.html`→`ui`, `widgets.html`→`widgets`, `playground.html`→`playground`, `theme.html`→`theme`, `typography.html`→`typography`, `icons.html`→`icons`, `media_gallery.html`→`media` |
| Admin | `contacts.html`→`users`, `user_management.html`→`user_management`, `profile.html`→`profile`, `settings.html`→`settings`, `faq.html`→`faq` |
| Layouts | `fixed_sidebar.html`→`fixed-sidebar`, `fixed_footer.html`→`fixed-footer`, `level2.html`→`level2`, `plain_page.html`→`plain` |
| Unlisted (no NAV; auth/error/marketing/system) | `login.html`, `register.html`, `forgot_password.html`, `verify_2fa.html`, `lock_screen.html`, `page_403.html`, `page_404.html`, `page_500.html`, `landing.html`, `maintenance.html`, `coming_soon.html`, `offline.html` |

Count check: 4+6+2+3+2+5+6+2+7+5+4+12 = **58** ✅

---

## Appendix B — Chart-to-report reuse map (+ KSA/operations reports)

All factories live in `src/v4/charts.js` and re-theme automatically. This build adds *cases + datasets*, not a chart library.

| Existing factory | HR + Operations reuse |
|---|---|
| `revenueLine` / `stackedArea` | Headcount trend / deployed vs bench over time / hires vs exits |
| `salesBar` / `horizontalBar` | Payroll cost by dept / **client billing by month** / open requests by profession |
| `mixedBarLine` | Hires (bar) + attrition % (line); deployments (bar) + utilization % (line) |
| `donut` / `trafficDonut` | Workforce by status / by client / by nationality / by profession |
| `radar` | Review dimension scores; candidate scorecards |
| `gauge` | **Utilization %** / offer-accept rate / onboarding completion / Saudization vs target |
| `scatter` | Tenure vs performance; salary vs rating (pay-equity view) |
| `heatmap` | Leave density by week; attrition by dept×quarter |
| `funnel` | Hiring funnel; **request fulfillment funnel** (received → fulfilled) |
| `calendarHeatmap` | Absence intensity; **site attendance intensity** per day |
| `gantt` | Onboarding plans / probation / **assignments + Ajeer validity timelines** |
| `treemap` | Headcount by client→site; salary-mass view |
| `sankey` | Candidate source → hire; **bench → deployed → returned flows** |
| `polarBar` | Training hours by category; expenses by category |
| `candlestick` | (No HR use — leave in gallery) |
| `dashboardNetwork` mini-line | KPI sparklines + compliance status dots on dashboard |

---

## Appendix C — KSA statutory quick-reference + sources

Consolidated numbers (2026 secondary sources — **re-verify D13 before go-live; all live in versioned config**):

- **Time:** 8h/48h · Ramadan 6h/36h (Muslims) · 11h/day max · break/5h · Friday rest · OT 150% · OT cap 720h/y · rest/holiday work 150% or comp-day ≤30d.
- **Leave:** annual 21→30 (5y) · sick 120 (30 full + 60 @75%⚠️ + 30 unpaid) · maternity 10w⚠️(12?) · paternity 3d · marriage 5d · bereavement 5/3d · iddah 4m10d · Hajj 10–15d once/2y⚠️ · holidays: Eid-F 4d, Eid-A 4d, National 23-Sep, Founding 22-Feb.
- **Contracts:** Qiwa e-contract mandatory · probation ≤180d in-contract · expat fixed-term default · housing+transport mandatory · notice 60d⚠️(60/30?) · resignation deemed-accepted 30d · Art.80 (no EOSB) / Art.81 (full+comp) / unlawful (remainder or 15d/y).
- **EOSB:** ½m×5y + 1m×rest, pro-rata, last basic wage; resignation 0/⅓/⅔/full; pay 1wk/2wk; ⚠️ fixed-term-only nuance (2026), ⚠️ cap.
- **GOSI:** base = basic+housing ≤45,000 · old Saudi 9.75/11.75 · new Saudi **10.75/12.75 (Jul-26–Jun-27)** rising to 11.75/13.75 · expat 0/2.
- **WPS:** SIF via Mudad ≥1bd before payday · pay ≤10th · alerts 10/15d, inspection 20d · contract↔pay per-worker check · GOSI ~20% check.
- **Nitaqat:** 32 cats, 6+ staff · SAR 4,000 Saudi floor (⅓ @3,000 PT) · no expat floor · Qiwa-authenticated only (90% bar).
- **Ajeer (Dec. 60339, 26-Jan-2026):** service≠labour · Ajeer e-contract BEFORE work · ≤3y tied to service contract · profession match · both sides CR+WPS+Nitaqat · consent unless in contract · provider issues/renews · beneficiary returns ≤1 working day · fines ≤5,000/worker · ⚠️ licence scope + old limits.
- **Expat costs:** Iqama 650/y (3/6/9/12) · levy ~700–800/mo by band · dependent 400/mo (employee) · insurance mandatory (employer) · late 500→1,000→2,000+ · employer no-Iqama fines ≤100,000 · **Art.40: employer bears, no deductions**.
- **TAX:** PIT 0% (no withholding) · VAT 15% · WHT 5–20% non-residents · zakat 2.5% / CIT 20% entity · EOSB tax-free in KSA.

Sources consulted (secondary — confirm against MHRSD/ZATCA/GOSI primary publications):

- Labor Law Feb-2025 amendments: paulhastings.com, actcorporateservices.sa, zenhr.com, etqanlawfirm-sa.com, kurums.com
- GOSI rates/graduation: silberson.com, motaded.com.sa, numerral.com, Oracle HCM readiness, saudicomplianceinstitute.com
- EOSB: saudicompanyformation.com, hijri-calendars.com, alothmanlaw.sa, zimyo.me
- Nitaqat/Qiwa/Mudad/WPS/min wage: mercans.com (qiwa + mudad), promenics.com, commoner-law.com, y-axis.com
- ZATCA/VAT/WHT/no-PIT: noblecoreksa.com, infinityhorizonsa.com, taxesforexpats.com, houseofsaud.com, countrytaxcalc.com
- Leave entitlements: remotepass.com, hr360s.com, asanify.com, absherbusiness.com, cxcglobal.com
- Ajeer/outsourcing (2026 framework): scplksa.com, motaded.com.sa/blog, proven-sa.com, baticfirm.com, chambers.com
- Iqama/levy/exit costs & duties: iqamaadesk.site, ksaexpats.com, saudilifeguide.com, jobbatical.com, worldwide-rs.com

---

## Appendix D — Contract catalog (all types, bilingual)

Every type = template in `hr_templates.html` (AR + EN bodies, `{{placeholders}}`, versions) → issued via the maker wizard (`hr_contracts.html`) → tracked in registers with sign-state + expiry alerts. Placeholders draw from employee/client/request/assignment records (no retyping).

### D1. Employee contracts (عقود العمل)

| # | Type (EN / AR) | For whom | Key fields | Lifecycle notes |
|---|---|---|---|---|
| E1 | Indefinite-term / غير محدد المدة | Saudis (default) | Parties, job, wage split (basic/housing/transport), probation ≤180d, notice 60d, outsourcing-consent clause ⭐ | Qiwa-doc checklist; end = notice process |
| E2 | Fixed-term / محدد المدة | Saudis on projects | + duration, renewal/convert terms | Expiry alerts 90/60/30; non-renewal = notice task |
| E3 | Expat fixed-term / عقد غير سعودي | Expatriates (bulk of workforce) | + passport/Iqama refs, ticket + repatriation, exit/re-entry terms, outsourcing-consent clause ⭐ | Expiry linked to Iqama; Art.85 resignation branch |
| E4 | Part-time / دوام جزئي | Part-timers | Hours, hourly/monthly wage, Nitaqat-⅓ hint (Saudi ≥3,000) | Hour-cap validation |
| E5 | Flexible/hourly / العمل المرن | Hourly (per regulations) | Hourly rate, max hours, GOSI handling note | ⚠️ confirm current flexible-work rules with counsel |
| E6 | Temporary/seasonal / مؤقت–موسمي | Seasonal peaks (e.g. Hajj) | Fixed short duration, site, end date | Auto-close + clearance at end |
| E7 | Remote work / العمل عن بعد | Remote staff | Work location, hours, equipment, communication SLA | Per remote-work regulations |
| E8 | Management/executive | Managers+ | + confidentiality, non-compete (within enforceable limits ⚠️), bonus terms | Counsel-reviewed template |

### D2. Assignment & outsourcing documents (Ajeer-linked)

| # | Type (EN / AR) | Parties | Key fields | Lifecycle notes |
|---|---|---|---|---|
| A1 | Assignment / outsourcing consent / موافقة الإعارة | Company → worker | Client, site, profession, period, wage-continuity note | **Required to activate assignment** unless in E1/E3 |
| A2 | Deployment letter / خطاب تكليف | Company → worker | Client/site, start date, supervisor, reporting instructions | Issued on activation; bilingual print |
| A3 | Ajeer cover record (internal) | Ops file | Ajeer ref, type, issued/expiry, portal receipt | Renewal alerts 60/30/14; revocation → recall |
| A4 | Recall / completion notice | Company → client + worker | End reason, last day, handover | Closes assignment; tracker → bench/leave |

### D3. Client agreements (اتفاقيات العملاء)

| # | Type (EN / AR) | Key fields | Lifecycle notes |
|---|---|---|---|
| C1 | Manpower-supply framework (MSA) | Parties/CRs, service vs labour outsourcing ⭐, professions, rate methodology, payment terms, duration, Ajeer duties both sides, liability, termination | Master record; work orders attach; expiry alerts |
| C2 | Work order / deployment schedule | MSA ref, site, profession×headcount, start/duration, monthly rate per head, OT/billing rules | Drives assignments + billing lines |
| C3 | Quotation / rate offer | Request ref, proposed professions/rates/validity | Converts to C2 on client confirm |
| C4 | NDA (mutual) | Standard confidentiality | Optional per client |
| C5 | Service completion / handover certificate | Period, headcount delivered, client sign | Monthly or end-of-order; supports billing |

### D4. HR letters & disciplinary (خطابات الموارد البشرية)

| # | Type (EN / AR) | Trigger | Notes |
|---|---|---|---|
| L1 | Job offer / عرض وظيفي | Post-interview | Bilingual; salary split; validity; converts to E-contract |
| L2 | Salary certificate / تعريف بالراتب | On request | For banks/embassies; masked/unmasked variants |
| L3 | Experience certificate / شهادة خبرة | On exit | Tenure + last role (per Labor Law duty) |
| L4–L6 | Warning 1st/2nd/final + appeal note / إنذارات | Disciplinary process | **2025 internal-appeals procedure** supported; evidence attach |
| L7 | Termination notice / إشعار إنهاء | Art.80/81/expiry/mutual | Reason picker drives EOSB branch |
| L8 | Resignation acceptance / قبول استقالة | Resignation flow | Starts 30-day/notice clock; deemed-accept auto-letter |
| L9 | Clearance & handover / إخلاء طرف | Any exit | Assets, advances, housing, client handover sign-offs |
| L10 | Final settlement statement / مخالصة نهائية | Settlement paid | Bilingual; EOSB + leave + salary + ticket lines; "tax-free in KSA" note |

**Maker wizard steps (all types):** 1) pick type → 2) pick party (worker/client/request auto-fills) → 3) fill highlighted fields (placeholders validated) → 4) bilingual preview → 5) issue → 6) sign-track (acknowledge + signed-scan upload) → 7) file to vault + link (employee/client/assignment) + start expiry clock.

---

## Decision log — answered 2026-09-10

Owner answers to the six P0 questions (§13 D-set), locked for the scaffold:

1. **Brand, Nitaqat, licence (D4/D9–D11)** — all three are **Settings-configurable placeholders**, not build-time constants. HR Settings ships: company name AR/EN, logo upload, CR no., address; Nitaqat activity category, size band, target %; licence scope selector (service contracting / labour supply / both). Strict Ajeer deployment guards stay ON by default until owner/counsel relaxes them.
2. **Language default** — bilingual EN⇄AR with topbar toggle on every page; the *default* language is itself a setting (seed: English).
3. **Import/export (universal)** — every data list gets importer + exporter: Excel (.xlsx via lazy-loaded SheetJS chunk) + CSV (BOM for Arabic) always; documents print/PDF; settings JSON backup/restore. Reports (P4+) add multi-format bundles.
4. **Portals** — **both**: employee self-service ("My space") + client portal (roster, billing, requests scoped by client). P0 ships My space v1 + one client dashboard proving the scoped-by-role pattern; RBAC hardening follows in P3/P6.

**P1 built 2026-09-10** (same branch): onboarding wizard (§4.7, overseas + transfer-in), visa register, residency board + pre-renewal checklist + Qiwa transfers, workforce tracker (100% derived statuses + Staff column), document vault + coverage gaps, org chart. Overlay patches (`patchSeedRow`) added so renewals/advances persist in seed mode. Two pragmatic deviations: tracker renders a custom board (not kanban.js config) since statuses are read-only derived; org chart is a CSS tree (not SVG) for mobile.

*End of blueprint (manpower-supply edition). P0–P1 scaffolded on `arena/01a08c48-dash` per the decision log above.*
