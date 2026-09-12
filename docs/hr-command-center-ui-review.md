# HR Command Center — UI Review (typography, alignment, visibility, display, a11y)

Date: 2026-09-11 · Scope: `production/hr_dashboard.html` + T2 zones (§1–§6) and the
shared primitives they use · Method: static audit + computed WCAG contrast ratios +
jsdom structural checks (no browser binary available in sandbox; no screenshots).

## Contrast measurements (WCAG 2.1, normal text needs ≥ 4.5)

| Pair | Ratio | Verdict |
|---|---|---|
| text/white | 15.21 | AAA |
| text-secondary/white | 5.25 | AA |
| **text-muted/white** | **3.59** | **FAIL** (all small muted text) |
| status-green/white | 2.74 | FAIL |
| status-yellow(#b45309)/white | 5.02 | AA |
| status-red/white | 4.66 | AA |
| status-blue/white | 5.00 | AA |
| btn-primary white/teal | 2.43 | FAIL (brand token — see A4) |
| DARK muted/surface | 5.10 | AA |
| DARK yellow/red/blue/purple | 3.14–3.39 | FAIL |
| DARK green/primary | 5.75/6.49 | AA |
| ticker red/green/dark bands | 6.70/5.50/17.76 | AA/AA/AAA |

## GOOD — keep

- Type system: Inter + Arabic-capable system fallbacks (San Francisco, Segoe UI,
  Roboto all ship Arabic) — offline-safe, no webfont dependency. 14px/1.4286 base,
  clear 11→22 scale, tabular figures on `.num`.
- Logical properties throughout (`inline-start`, `text-align: start/end`);
  `setLang()` updates `<html lang dir>`; ticker + zone chevron have RTL variants.
- Charts: bundled ECharts (offline), window-resize handler, screen-reader summary
  on every chart, hbar RTL inversion, live CSS-var tokens (dark-mode aware).
- Zone heads: ~45px touch targets, custom chevron, collapse memory, single h1,
  `main` landmark, native `details/summary` (keyboard + SR free).
- No color-only meaning: status dots, meters, kanban, checklist, trend lines all
  pair color with text; ticker bands pass AA.
- Ticker: pauses on hover/focus, honors reduced-motion, duplicate half hidden
  from screen readers, readable ~64px/s speed.
- Mobile: tables scroll in wrappers, grids stack to 1 column, kanban scrolls,
  chips wrap; Leaflet fully bundled (CSS + chunk).

## BAD — fixed (implementation order)

- A1 `.status-green` text 2.74 → darkened text tone, vivid dot kept.
- A2 Small muted text 3.59 → `text-secondary` for th, stat-subtext, fine-print,
  hr-empty, meter span, kanban small, sub-heads, tasks formula, inline smalls,
  chart labels (via `tokens()`).
- A3 Dark-theme status tones 3.1–3.4 → lightened dark overrides.
- A4 btn-primary 2.43 — NOT fixed: brand token is owner-controlled (white-label);
  documented here instead.
- B1 th `letter-spacing: 0.3px` disconnects Arabic letter joining → `[dir=rtl]`
  reset to 0 (uppercase is a harmless no-op for Arabic, kept).
- B2 16× inline `margin-top:12px` → `.stack-gap` spacing-token utility.
- C1 Outline gaps (h1 → h3/h4, spans) → zone titles to `h2`, sub-heads to `h3`.
- C2 thead `th` lack `scope="col"`; `#` rank headers meaningless to SR →
  `scope` + sr-only "Rank" label (new `hr.dashboard.rank` key, EN+AR).
- C3 JS-built tables (vac/roster/sponsor/watch/eligible/overdue) have no
  accessible name → `aria-label` from nearby headings.
- C4 No branded focus ring (browser default only) → global `:focus-visible`
  2px teal ring with offset.
- C5 ECharts animates under reduced-motion → `animation: false` when the
  media query matches (guarded for non-DOM environments).
- C6 Buttons 32/28px pass WCAG 2.2 (≥24px) but trail iOS 44px HIG — accepted
  and documented; no change.
- D1 `.meter-fill` fills left-to-right physically → mirror under `[dir=rtl]`.
- D2 Billing chips used `status-issued`/`status-paid` classes that don't exist
  (unstyled) → explicit paid→green / issued→yellow tone map.

## Test plan per chunk

Static 13/13 · runtime command-center 9/9 (full file 118/118 at the end) ·
eslint 0 errors · prettier-clean own lines · new assertions where the fix is
observable in jsdom (outline tags, scope attrs, aria-labels, focus rule
presence via built CSS grep, animation flag via unit check).
