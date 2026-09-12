# Command palette

`src/v4/command-palette.js` (`initCommandPalette()`, auto-booted by the
entry). Opens with the topbar search box, `⌘K`/`Ctrl+K`, or
`openCommandPalette()`; closes with Escape or `closeCommandPalette()`.

## What it searches

- **Pages** — built from the sidebar `NAV` tree, so every navigable page is
  reachable by typing its name.
- **Actions** — the `actions` array in `buildItems()`: open profile /
  settings / theme generator / FAQ, toggle theme, sign out.

## Registering a command

Add an entry to the `actions` array:

```js
{ label: 'Open payroll', keywords: 'payroll salary wps', action: () => {
  window.location.href = 'hr_payroll.html';
} },
```

`label` is what the user reads, `keywords` feed the fuzzy scorer, `action`
runs on select. Keep labels bilingual-aware (match the sidebar's translated
names where the command mirrors a page).
