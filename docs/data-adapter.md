# Data adapter

Every interactive page ships with hardcoded seed data. The data adapter
(`src/v4/data-adapter.js`) is the seam for replacing it with a real backend
without touching page code:

```js
import { useApiMode, seedAdapter, httpAdapter } from './data-adapter.js';

const adapter = useApiMode()
  ? httpAdapter('/api/messages')
  : seedAdapter(SEED);

const items = await adapter.list({ folder: 'inbox' });
await adapter.update(id, { unread: 0 });
await adapter.create({ ... });
await adapter.remove(id);
```

Both adapters share the same surface (`list`, `update`, `create`, `remove`);
`HttpError` normalizes fetch failures.

## Flipping to API mode

- `?api=1` in the URL (one-shot demo trigger), or
- `window.__DASH_API__ = true` before module load (set in a build script
  for production). A pre-rebrand alias flag is still honored for
  backward compatibility (see `types/dash.d.ts`).

## Example backend

`examples/express-sqlite/` is a tiny Express + SQLite server exposing the
`/api/orders` and `/api/messages` endpoints the pattern expects:

```bash
cd examples/express-sqlite && npm install && node server.js
```

Then point a page's adapter at `http://localhost:<port>/api/…` and flip API
mode on to watch it fetch real rows.
