# Tables

One system style for all data tables: `table.table` (`.hr-table` is a styled
alias, not a variant). Micro uppercase headers, row hover, tabular numerals
via `.num`, RTL joining-safe. Wrap wide tables in `.table-responsive` for
mobile scroll.

Non-data tables (heatmaps, totals grids) are marked `data-plain-table`
instead of taking the system class. The static audit enforces that every
`<table>` in pages and JS is either system-classed or plain-marked.

## Sorting, paging, search

Add `data-datatable` to a `table.table` and `src/v4/tables.js` upgrades it
with DataTables.net (lazy-imported, so other pages never load it):

```html
<table class="table" data-datatable data-page-length="10">
  …
  <th data-orderable="false">Actions</th>
```

The DataTables chrome is re-skinned in `src/scss/v4/_datatable.scss` to match
the system style, including RTL.
