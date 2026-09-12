# FAQ

## Is this a template or a product?

A product-in-use: an internal HR command center for one company. It is not
for sale and ships no marketing surface.

## Which browsers are supported?

Evergreen Chrome, Edge, Firefox, and Safari — desktop and mobile. RTL and the
PWA install path are verified in the same set.

## Where does data live?

In the browser (`localStorage` preferences and seed data) until you connect
a backend via the [data adapter](data-adapter.md). Nothing phones home.

## How do I change the company name, logo, or colors?

HR → Settings → company profile. The sidebar, titles, and brand
color update at runtime; no rebuild, no code changes.

## How do I add a page?

`npm run new -- <slug>`, then sidebar/i18n entries if it needs a NAV slot.
Full steps in [pages](pages.md) and [workflow](workflow.md).

## How do I deploy it?

`npm run build` → serve `dist/` from any static host. Details (subpaths,
sitemaps, cache headers, Pages, previews) in [deployment](deployment.md).

