# Theming

All design tokens live in `src/scss/v4/_tokens.scss` as CSS custom
properties: colors, radii, sidebar dimensions, and the spacing scale
(`--space-1` … `--space-6` = 4 / 8 / 12 / 16 / 24 / 32 px). Components use
`var(--…)` — never a hardcoded value.

## Light and dark

The theme is a `data-theme` attribute on `<html>`, toggled by the topbar
button (`src/v4/shell.js`). It persists in `localStorage` (`theme`) and
defaults to `prefers-color-scheme`. Dark palettes are token overrides, so
every component follows automatically.

## Owner brand

HR → Settings → company profile sets the brand color at runtime
(`applyBranding()` in `src/v4/i18n.js` rewrites `--primary` and its
derivatives). No rebuild needed.

## Theme generator

`production/theme.html` is a live lab: pick a primary color, sidebar
background, radius, and density, watch the page restyle, then copy or
download the generated SCSS overrides.

## Adding tokens

1. Declare in `_tokens.scss` (light default + `[data-theme="dark"]`
   override where the value differs).
2. Use via `var(--token)` in the relevant partial (see
   [CONTRIBUTING.md](../CONTRIBUTING.md) for partial placement).
