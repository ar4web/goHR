# App modules

The admin shell around the HR core — each page pairs with a module in
`src/v4/`:

- **Inbox** (`inbox.html` + `inbox.js`) — folders, reader pane, compose
  modal, labels, stars.
- **Kanban** (`kanban.html` + `kanban.js`) — drag-and-drop task board.
- **Calendar** (`calendar.html` + `calendar.js`) — month grid, event modal,
  toolbar navigation.
- **Chat** (`chat.html`, inline module) — threads, conversation view.
- **File manager** (`file_manager.html` + `file-manager.js`) — breadcrumbs,
  grid/list toggle, search.
- **Settings** (`settings.html` + `settings.js`) — profile, notifications,
  integrations, export (`dash-export.json`).

All of them run on seed data out of the box; point them at a backend via the
[data adapter](data-adapter.md) (`examples/express-sqlite/` demonstrates the
`/api/orders` and `/api/messages` shape).
