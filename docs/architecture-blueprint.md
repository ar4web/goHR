# Architecture Blueprint

Complete map of Dash: every page, every shell control, full wiring, and the
delivery workflow. Diagrams are Mermaid — they render natively on GitHub.

> Scope note: all 108 pages and all shell/global controls are mapped below.
> In-page buttons number in the hundreds, so per-domain key actions are
> listed as tables instead of diagram nodes.

## 1. System at a glance

```mermaid
flowchart LR
    U[User browser] --> P[108 static pages in production]
    P --> SH[Shell - sidebar topbar]
    SH --> M[main-v4 boot]
    M --> FEAT[Feature modules in src v4]
    FEAT --> SEED[Built in seed data]
    FEAT --> API[Real API via data adapter]
    FEAT --> LS[(Browser storage)]
    M --> OV[Overlays - modal toast menus palette]
    P --> V[Vite 8 build]
    V --> D[dist bundle]
    D --> H[Static host or GitHub Pages]
```

| Layer | Tech | Notes |
|---|---|---|
| Pages | Static HTML, 108 entries | Auto-discovered by Vite, no input list |
| Entry | `src/main-v4.js`, vanilla ES2022 | One bundle, shell plus lazy guards |
| Style | SCSS partials, CSS custom props | Tokens in `_tokens.scss`, logical props for RTL |
| Charts | ECharts 6 | Lazy chunk `vendor-echarts` |
| Grids | DataTables.net 3 | Lazy chunk `vendor-tables` |
| Maps | Leaflet 1.9 | Lazy chunk `vendor-maps` |
| Excel | xlsx | Lazy import, no split chunk |
| Build | Vite 8, Rolldown, Terser | Hashed assets, shell injection plugins |
| PWA | `sw.js` plus `site.webmanifest` | Worker registers in production only |
| Tests | Node audits, vitest plus jsdom | Static, logic, and runtime suites |

## 2. Boot and runtime lifecycle

```mermaid
flowchart TB
    R[HTTP request for a page] --> INJ[Vite injects shell HTML at dev and build time]
    INJ --> ATTRS[Body carries data-shell data-page data-breadcrumb]
    ATTRS --> MS[mountShell - skip render if injected, wire events]
    MS --> I18N[initI18n - language plus branding]
    I18N --> CH[initCharts]
    CH --> TB[initTables]
    TB --> PAL[initCommandPalette]
    PAL --> PA[initPageActions]
    PA --> LZ[Lazy guards - inbox-root, calendar-grid, settings-content, data controls]
    LZ --> IDLE[Idle - delegated events on document]
    IDLE --> SW[On window load in PROD - register service worker]
```

Boot order is fixed in `src/main-v4.js`: `mountShell()`, `initI18n()`,
`initCharts()`, `initTables()`, `initCommandPalette()`, `initPageActions()`,
then DOM-presence lazy imports. Common clicks (toggles, tabs, todos) are
delegated on `document`; stateful modules (inbox, kanban, palette) listen on
their own root.

## 3. Shell anatomy and controls

```mermaid
flowchart TB
    subgraph SB[Sidebar - aside dot sidebar]
        BR[Brand icon plus name] --> AP[applyBranding rewrites name logo color]
        NT[11 nav parents - dot nav-toggle] --> ACC[Accordion - one open group]
        NT --> RAIL[In rail mode parents open flyouts]
        ST[.sidebar-toggle button] --> RD[Desktop - 64px rail. Mobile - drawer]
        UC[User card plus dot more-btn] --> ME[Menu - profile settings sign out]
    end
    subgraph TP[Topbar]
        SB2[.search-box] --> PL[Opens command palette]
        LT[lang-toggle button] --> LG[EN ⇄ AR plus dir flip]
        TT[.theme-toggle button] --> TH[data-theme light dark, persisted]
        NB[.tb-notifications bell] --> NP[Live HR alerts panel]
        MB[.tb-messages] --> MP[Messages panel]
        AV[.tb-avatar] --> ME2[Account menu]
    end
    SB --> TP
```

| Control | Selector | Action |
|---|---|---|
| Sidebar toggle | `.sidebar-toggle` | Rail collapse on desktop, drawer plus `.sidebar-backdrop` on mobile |
| Nav parent | `.nav-toggle` × 11 | Accordion expand, persists to `dash:nav-open` |
| Nav subgroup | `.nav-subtoggle` | Expands template sections under HR Settings |
| Search | `.search-box` | Opens ⌘K palette (`openCommandPalette`) |
| Language | `#lang-toggle` | `setLang`, flips `dir`, re-applies i18n plus branding |
| Theme | `.theme-toggle` | Flips `data-theme`, persists `theme`, re-inits charts |
| Bell | `.tb-notifications` | HR alerts popover (compliance, visas, WPS) |
| Messages | `.tb-messages` | Messages popover |
| Avatar | `.tb-avatar` | Account menu |
| User card | `.more-btn` | Sidebar account menu |

Global page actions (`src/v4/page-actions.js`) fire by button text or
`aria-label` when no page handler claims the click: **Print** →
`window.print()` · **Export\*** → CSV/JSON download or `data-export` table
dump · **Compose / New …** → contextual modal · **Refresh** → card pulse
plus chart re-init.

## 4. Page map — HR command center (50 pages)

```mermaid
flowchart TB
    subgraph d4core[Core]
        d4_hr_dashboard[HR Dashboard]
        d4_hr_employees[Employees]
        d4_hr_employee[Employee file]
        d4_hr_departments[Departments]
        d4_hr_org_chart[Org chart]
        d4_hr_my_space[My space]
        d4_hr_my_team[My team]
        d4_m_core[mods - hr-dashboard employees employee-detail departments org-chart my-space my-team]
    end
    subgraph d4talent[Talent]
        d4_hr_jobs[Jobs]
        d4_hr_candidates[Candidates]
        d4_hr_pipeline[Pipeline]
        d4_hr_interviews[Interviews]
        d4_hr_offers[Offers]
        d4_hr_onboarding[Onboarding]
        d4_m_talent[mods - jobs candidates pipeline interviews offers onboarding]
    end
    subgraph d4contracts[Contracts]
        d4_hr_contracts[Contract maker]
        d4_hr_contract[Contract]
        d4_hr_templates[Templates]
        d4_m_contracts[mods - contracts contract templates]
    end
    subgraph d4time[Time]
        d4_hr_attendance[Attendance]
        d4_hr_shifts[Shifts]
        d4_hr_timesheets[Timesheets]
        d4_hr_leave[Leave]
        d4_hr_leave_calendar[Leave calendar]
        d4_hr_holidays[Holidays]
        d4_m_time[mods - attendance shifts timesheets leave leave-calendar holidays]
    end
    subgraph d4pay[Pay]
        d4_hr_payroll[Pay runs]
        d4_hr_payslip[Payslip]
        d4_hr_wps[WPS and Mudad]
        d4_hr_eosb[EOSB and settlement]
        d4_hr_gosi[GOSI]
        d4_m_pay[mods - payroll payslip wps eosb gosi]
    end
    subgraph d4comp[Compliance]
        d4_hr_sa_compliance[SA Compliance]
        d4_hr_visas[Visas]
        d4_hr_residency[Residency and renewals]
        d4_hr_ajeer[Ajeer permits]
        d4_hr_documents[Vault]
        d4_hr_audit[Audit log]
        d4_hr_reports[Reports]
        d4_m_comp[mods - compliance visas residency ajeer documents hr-audit reports]
    end
    subgraph d4growth[Growth]
        d4_hr_reviews[Reviews]
        d4_hr_review[Review]
        d4_hr_goals[Goals]
        d4_hr_feedback[Feedback]
        d4_hr_trainings[Trainings]
        d4_hr_tracker[Workforce tracker]
        d4_m_growth[mods - reviews review goals feedback trainings tracker]
    end
    subgraph d4ops[Operations]
        d4_hr_clients[Clients]
        d4_hr_client_dashboard[Client dashboard]
        d4_hr_assignments[Assignments]
        d4_hr_approvals[Approvals]
        d4_hr_requests[Manpower requests]
        d4_hr_announcements[Announcements]
        d4_hr_expenses[Expenses]
        d4_hr_invoices[Invoices]
        d4_hr_roles[Roles and access]
        d4_hr_settings[HR Settings]
        d4_m_ops[mods - clients client-dashboard assignments approvals requests announcements expenses invoices roles hr-settings]
    end
```

Key actions by domain (each also carries Import plus Export on its grids):

| Domain | Key actions |
|---|---|
| Core | New employee, 360° file tabs, department tree, org drill-down, team boards |
| Talent | Post job, move pipeline stage, schedule interview, issue offer, onboard checklist |
| Contracts | Generate bilingual contract, e-sign, template variables |
| Time | Check-in/out, plan shifts, submit timesheet, request leave, holiday table |
| Pay | Run payroll, WPS SIF file, EOSB settlement, GOSI computation, print payslip |
| Compliance | Nitaqat gauge, visa issue/renew, residency renew, Ajeer permit, vault upload, audit trail |
| Growth | Start review cycle, set goals, 360 feedback, enroll training, tracker board |
| Operations | Add client, deploy workforce, approve/reject queue, requests inbox, expense claim, invoice issue, role matrix, company profile |

Sidebar NAV is one group (**HR & Operations**) with 11 parents: Overview ·
People · Compliance · Time and Leave · Operations · Employee · Accounts ·
Hiring · Growth · Portals · Settings. Groups render collapsed on desktop and
auto-open the active group on mobile only; a stored toggle always wins.

## 5. Page map — apps and shell (58 pages)

```mermaid
flowchart TB
    subgraph d5dash[Dashboards]
        d5_index[Dashboard]
        d5_index2[Analytics dashboard]
        d5_index3[Sales dashboard]
        d5_index4[Operations dashboard]
    end
    subgraph d5apps[Apps]
        d5_inbox[Inbox]
        d5_kanban[Kanban]
        d5_calendar[Calendar]
        d5_chat[Chat]
        d5_file_manager[Files]
        d5_contacts[Users]
        d5_notifications[Notifications]
        d5_settings[Settings]
        d5_theme[Theme generator]
        d5_playground[Playground]
    end
    subgraph d5shop[Commerce]
        d5_e_commerce[Products]
        d5_orders[Orders]
        d5_order_detail[Order detail]
        d5_invoice[Invoice]
        d5_product_detail[Product detail]
    end
    subgraph d5proj[Projects]
        d5_projects[Projects]
        d5_project_detail[Project detail]
    end
    subgraph d5forms[Forms]
        d5_form[Forms]
        d5_form_advanced[Advanced form]
        d5_form_buttons[Buttons]
        d5_form_upload[Upload]
        d5_form_validation[Form validation]
        d5_form_wizards[Form wizard]
    end
    subgraph d5charts[Charts]
        d5_chartjs[Charts]
        d5_echarts[ECharts]
        d5_other_charts[Other charts]
    end
    subgraph d5ui[UI library]
        d5_general_elements[UI Elements]
        d5_icons[Icons]
        d5_typography[Typography]
        d5_tables[Tables]
        d5_tables_dynamic[Dynamic tables]
        d5_widgets[Widgets]
        d5_media_gallery[Media]
        d5_map[Map]
    end
    subgraph d5pages[Pages]
        d5_profile[Profile]
        d5_user_management[User management]
        d5_faq[Help center]
        d5_plain_page[Blank page]
        d5_fixed_footer[Fixed footer]
        d5_fixed_sidebar[Fixed sidebar]
        d5_level2[Sub-page]
        d5_pricing_tables[Pricing]
    end
    subgraph d5solo[Standalone - no shell]
        d5_login[Sign in]
        d5_register[Sign up]
        d5_forgot_password[Forgot password]
        d5_lock_screen[Locked]
        d5_verify_2fa[Two-factor verification]
        d5_page_403[Forbidden]
        d5_page_404[Page not found]
        d5_page_500[Server error]
        d5_maintenance[Under maintenance]
        d5_offline[Offline]
        d5_coming_soon[Coming soon]
        d5_landing[Landing]
    end
```

App modules mirror their pages (`inbox.js`, `kanban.js`, `calendar.js`,
`file-manager.js`, `settings.js`, …); chat runs an inline page module.
Standalone pages omit `data-shell="admin"` and render without sidebar or
topbar.

## 6. Data wiring

```mermaid
flowchart LR
    SEED[hr-seed defaults] --> HAPI[hr-api getSeed]
    IMP[hr-import overrides] --> HAPI
    HAPI --> PG[Pages and grids]
    SET[HR Settings form] --> ST[(dash-settings)]
    ST --> BR[applyBranding]
    BR --> TI[document title]
    BR --> SB[Sidebar brand]
    BR --> PC[Primary color tokens]
    D18N[en plus ar dicts] --> DA[data-i18n attributes]
    D18N --> TF[t function]
    DA --> PG
    TF --> PG
    THBTN[Theme toggle] --> DT[data-theme attr]
    DT --> LS[(theme key)]
    NAVT[Nav toggles] --> NS[(dash-nav-open session)]
    RAILT[Rail toggle] --> RS[(dash-sidebar-rail)]
    MODE[useApiMode] --> SAD[seedAdapter]
    MODE --> HAD[httpAdapter]
    SAD --> PG
    HAD --> BE[Example Express backend]
    XX[xlsx engine] --> IE[import-export module]
    IE --> PG
```

| Storage key | Store | Purpose |
|---|---|---|
| `theme` | localStorage | Light/dark mode |
| `hr:lang` | localStorage | EN/AR language |
| `dash:sidebar-rail` | localStorage | Collapsed rail state |
| `dash:nav-open` | sessionStorage | Manually toggled group |
| `dash:settings` | localStorage | Company, Nitaqat, licence |
| `dash:theme-overrides` | sessionStorage | Theme lab preview |
| `hr:import:*` | localStorage | Per-grid data overrides |
| `hr:role-view`, `hr:actor-role` | localStorage | Role preview |
| `hr:audit`, `hr:custom-lists` … | localStorage | Audit trail, lists, counters |

Pre-rebrand storage keys migrate forward automatically on load and are
never written fresh (see `migrateStorageKeys` in `src/v4/shell.js`).

## 7. Build and deploy pipeline

```mermaid
flowchart TB
    DEV[npm run dev - port 9173] --> HMR[Hot reload, no service worker]
    BLD[npm run build] --> PLG[Vite plugins]
    PLG --> P1[dash-shell-injection - shell plus PWA plus SEO meta]
    PLG --> P2[dash-structured-data - JSON-LD on landing]
    PLG --> P3[dash-sitemap - only with SITE_URL]
    PLG --> P4[dash-root-redirect - front door index]
    PLG --> DIST[dist - hashed assets plus 108 HTML]
    DIST --> PREV[npm run preview - port 9174]
    DIST --> PAGES[GitHub Pages - BASE_PATH per repo]
    DIST --> R2[Preview script - 3-pass rclone plus purge]
    ENV1[BASE_PATH] --> BLD
    ENV2[SITE_URL] --> P3
    ENV3[PREVIEW BUCKET HOST keys] --> R2
```

Cache contract: hashed `assets/*` immutable for a year · `*.html`,
`llms.txt`, `sitemap.xml` short cache · `sw.js` plus `site.webmanifest`
never cached.

## 8. Delivery workflow and gates

```mermaid
flowchart LR
    C[Code one chunk] --> T1[npm test - static plus logic]
    T1 --> T2[npm run test-runtime - jsdom behavior]
    T2 --> L[npm run lint - 0 errors]
    L --> F[Prettier - touched lines clean]
    F --> S[Dev smoke - EN plus AR, desktop plus mobile]
    S --> P[Commit plus push immediately]
```

| Suite | Runner | What it pins |
|---|---|---|
| `hr-audit-*` | node | NAV, i18n parity, wiring, links, IDs, style systems, brand leaks, RTL props |
| `hr-logic-*` | node | Payroll, EOSB, leave, compliance rule engines |
| `hr-seed-t2`, `hr-import-test`, `hr-audit-security` | node | Seed integrity, imports, security rules |
| `runtime-smoke.test.js` (127) | vitest | Every page mounts, interactions, shell/header/sidebar contracts |

Full loop, rules, and release process: [workflow](workflow.md).
