# Components

Reusable markup + SCSS lives in `src/scss/v4/_components.scss`: buttons
(`.btn`, `.btn-primary`, `.btn-outline`, `.btn-sm`, `.btn-ghost`), cards,
status pills, badges, chips, avatars, toggles, tabs, alerts, list groups,
toolbars, and prose lists (`.list`, `.list-bullets`).

## The playground

`production/playground.html` renders every component beside its exact HTML
with a copy button — the fastest way to build a new page correctly. When in
doubt, copy from there instead of inventing markup.

## Rules

- **One style per pattern.** Tables (`.table`, alias `.hr-table`), row lists,
  page headers (`.page-header`), and toolbars (`.toolbar`) each have exactly
  one system style; the static audit pins this.
- **Tokens only.** Colors, spacing, radii come from `var(--…)`; hardcoded
  values stay in `_tokens.scss`.
- **Logical properties.** Directional CSS uses `margin-inline-start`,
  `padding-inline-end`, `text-align: start`, etc., so Arabic mirrors
  correctly. Physical props in markup/JS fail the audit.
- **Bilingual copy.** Static text uses `data-i18n` attributes; dynamic text
  uses the `en`/`ar` dictionaries in `src/v4/i18n.js`.
