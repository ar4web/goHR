# TypeScript

The codebase is vanilla JS, but the public surface is typed:
`types/dash.d.ts`, wired via the `types` and `exports["./types"]` fields in
`package.json`.

It declares the `dash/v4/*` modules (shell, shell-render, toast, modal…),
the theme-token setter, and the `window.__DASH_API__` flag (plus its
deprecated pre-rebrand alias). Consumers get completions and type errors
without any build step on this side.
