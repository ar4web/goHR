# Charts

ECharts 6, lazy-imported per page. Two modules split the work:

- `src/v4/charts.js` — chart factories registered in the `charts` map.
- `src/v4/chart-helper.js` — shared plumbing: `chartTokens()` (token
  snapshot from CSS custom properties), `renderEchart()` /
  `disposeEchart()` lifecycle, and `applyRtl()` so axes mirror in Arabic.

## Adding a chart card

1. Add a factory in `charts.js` following an existing one. Pull every color
   from the token snapshot — never hardcode, or dark mode and custom brand
   colors will leave the chart behind.
2. Register it in the `charts` map at the bottom of the file.
3. Drop the host in any page:

```html
<div data-chart="your-name" style="width:100%;height:300px"></div>
```

Charts re-render on theme change (a mutation observer in the theme flow
re-inits them against the new tokens).
