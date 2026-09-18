// goHR — data access. Seed mode (default) merges hr-seed.js with any
// locally imported rows (localStorage overlay). API mode (?api=1) uses httpAdapter.

import { useApiMode, seedAdapter, httpAdapter } from './data-adapter.js';
import {
  EMPLOYEES,
  CLIENTS,
  SITES,
  ORG_LINKS,
  DEPARTMENTS,
  ROLES,
  ROLE_SCOPES,
  AUDIT_LOG,
  TASKS,
  SKILLS,
  COMPANIES,
  SALUTATIONS,
  ATTENDANCE
} from './hr-seed.js';

const SEED_MAP = {
  employees: EMPLOYEES,
  clients: CLIENTS,
  sites: SITES,
  orgLinks: ORG_LINKS,
  departments: DEPARTMENTS,
  roles: ROLES,
  roleScopes: ROLE_SCOPES,
  auditLog: AUDIT_LOG,
  tasks: TASKS,
  skills: SKILLS,
  companies: COMPANIES,
  salutations: SALUTATIONS,
  attendance: ATTENDANCE
};

const API_MAP = {
  employees: { path: '/api/hr/employees', listKey: 'employees' },
  clients: { path: '/api/hr/clients', listKey: 'clients' },
  sites: { path: '/api/hr/sites', listKey: 'sites' },
  orgLinks: { path: '/api/hr/org', listKey: 'links' },
  departments: { path: '/api/hr/departments', listKey: 'departments' },
  roles: { path: '/api/hr/roles', listKey: 'roles' },
  auditLog: { path: '/api/hr/audit', listKey: 'entries' },
  tasks: { path: '/api/hr/tasks', listKey: 'tasks' },
  skills: { path: '/api/hr/skills', listKey: 'skills' },
  companies: { path: '/api/hr/companies', listKey: 'companies' },
  salutations: { path: '/api/hr/salutations', listKey: 'salutations' }
};

function overlayRows(name) {
  try {
    return JSON.parse(localStorage.getItem(`hr:import:${name}`) || '[]');
  } catch (_e) {
    return [];
  }
}

function writeOverlay(name, rows) {
  try {
    localStorage.setItem(`hr:import:${name}`, JSON.stringify(rows));
  } catch (_e) {
    /* quota */
  }
}

function keyOf(r) {
  return r.code || r.id || r.emp || r.no;
}

export function saveImportedRows(name, rows) {
  const prev = overlayRows(name);
  writeOverlay(name, prev.concat(rows));
}

export function clearImportedRows(name) {
  try {
    localStorage.removeItem(`hr:import:${name}`);
  } catch (_e) {
    /* ignore */
  }
}

/** Upsert a patch into the overlay. `row` carries the key (code/id/emp/no). */
export function patchSeedRow(name, row, patch) {
  const rows = overlayRows(name);
  const k = keyOf(row);
  const merged = { ...row, ...patch };
  const i = rows.findIndex(r => keyOf(r) === k);
  if (i >= 0) {
    rows[i] = { ...rows[i], ...merged };
  } else {
    rows.push(merged);
  }
  writeOverlay(name, rows);
}

/** Seeds merged with local overlay (seed mode only). Overlay rows whose key
 *  matches a seed row act as patches; unknown keys append as new rows. */
export function getSeed(name) {
  const raw = SEED_MAP[name];
  if (raw && !Array.isArray(raw)) {
    return raw; // object seeds (e.g. roleScopes) carry no row overlays
  }
  const base = (raw || []).slice();
  const extra = overlayRows(name);
  if (!extra.length) {
    return base;
  }
  const out = base.slice();
  for (const r of extra) {
    const k = keyOf(r);
    const i = out.findIndex(x => keyOf(x) === k);
    if (i >= 0) {
      out[i] = { ...out[i], ...r };
    } else {
      out.push(r);
    }
  }
  return out;
}

const adapters = {};

export function hrAdapter(name) {
  if (adapters[name]) {
    return adapters[name];
  }
  let b;
  if (useApiMode() && API_MAP[name]) {
    b = httpAdapter(API_MAP[name].path, { listKey: API_MAP[name].listKey });
  } else {
    b = seedAdapter(getSeed(name));
  }
  adapters[name] = b;
  return b;
}

export async function hrList(name, query = {}) {
  return hrAdapter(name).list(query);
}

export function isApi() {
  return useApiMode();
}
