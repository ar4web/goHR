// HR + Operations — data access. Seed mode (default) merges hr-seed.js with any
// locally imported rows (localStorage overlay). API mode (?api=1) uses httpAdapter.

import { useApiMode, seedAdapter, httpAdapter } from './data-adapter.js';
import {
  EMPLOYEES,
  CLIENTS,
  SITES,
  ASSIGNMENTS,
  REQUESTS,
  LEAVE_TYPES,
  HOLIDAYS,
  EXPENSE_CATEGORIES,
  VISA_BLOCKS,
  VISAS,
  ONBOARDING,
  TRANSFERS,
  RESIDENCY_DOCS,
  DOCUMENTS,
  ORG_LINKS,
  SHIFTS,
  SITE_SHIFTS,
  ATTENDANCE,
  TIMESHEETS,
  LEAVE_REQUESTS,
  AJEER_PERMITS,
  INVOICES,
  PAY_RUNS,
  EXPENSES,
  ADVANCES,
  TEMPLATES,
  CONTRACTS,
  JOBS,
  CANDIDATES,
  INTERVIEWS,
  OFFERS,
  GOALS,
  REVIEWS,
  FEEDBACK,
  TRAININGS,
  DEPARTMENTS,
  ROLES,
  ROLE_SCOPES,
  AUDIT_LOG,
  ANNOUNCEMENTS,
  TASKS
} from './hr-seed.js';

const SEED_MAP = {
  employees: EMPLOYEES,
  clients: CLIENTS,
  sites: SITES,
  assignments: ASSIGNMENTS,
  requests: REQUESTS,
  leaveTypes: LEAVE_TYPES,
  holidays: HOLIDAYS,
  expenseCategories: EXPENSE_CATEGORIES,
  visaBlocks: VISA_BLOCKS,
  visas: VISAS,
  onboarding: ONBOARDING,
  transfers: TRANSFERS,
  residencyDocs: RESIDENCY_DOCS,
  documents: DOCUMENTS,
  orgLinks: ORG_LINKS,
  shifts: SHIFTS,
  siteShifts: SITE_SHIFTS,
  attendance: ATTENDANCE,
  timesheets: TIMESHEETS,
  leaveRequests: LEAVE_REQUESTS,
  ajeerPermits: AJEER_PERMITS,
  invoices: INVOICES,
  payRuns: PAY_RUNS,
  expenses: EXPENSES,
  advances: ADVANCES,
  templates: TEMPLATES,
  contracts: CONTRACTS,
  jobs: JOBS,
  candidates: CANDIDATES,
  interviews: INTERVIEWS,
  offers: OFFERS,
  goals: GOALS,
  reviews: REVIEWS,
  feedback: FEEDBACK,
  trainings: TRAININGS,
  departments: DEPARTMENTS,
  roles: ROLES,
  roleScopes: ROLE_SCOPES,
  auditLog: AUDIT_LOG,
  announcements: ANNOUNCEMENTS,
  tasks: TASKS
};

const API_MAP = {
  employees: { path: '/api/hr/employees', listKey: 'employees' },
  clients: { path: '/api/hr/clients', listKey: 'clients' },
  sites: { path: '/api/hr/sites', listKey: 'sites' },
  assignments: { path: '/api/hr/assignments', listKey: 'assignments' },
  requests: { path: '/api/hr/requests', listKey: 'requests' },
  leaveTypes: { path: '/api/hr/leave-types', listKey: 'types' },
  holidays: { path: '/api/hr/holidays', listKey: 'holidays' },
  expenseCategories: { path: '/api/hr/expense-categories', listKey: 'categories' },
  visaBlocks: { path: '/api/hr/visa-blocks', listKey: 'blocks' },
  visas: { path: '/api/hr/visas', listKey: 'visas' },
  onboarding: { path: '/api/hr/onboarding', listKey: 'cases' },
  transfers: { path: '/api/hr/transfers', listKey: 'transfers' },
  residencyDocs: { path: '/api/hr/residency-docs', listKey: 'docs' },
  documents: { path: '/api/hr/documents', listKey: 'documents' },
  orgLinks: { path: '/api/hr/org', listKey: 'links' },
  shifts: { path: '/api/hr/shifts', listKey: 'shifts' },
  siteShifts: { path: '/api/hr/site-shifts', listKey: 'mappings' },
  attendance: { path: '/api/hr/attendance', listKey: 'rows' },
  timesheets: { path: '/api/hr/timesheets', listKey: 'sheets' },
  leaveRequests: { path: '/api/hr/leave-requests', listKey: 'requests' },
  ajeerPermits: { path: '/api/hr/ajeer', listKey: 'permits' },
  invoices: { path: '/api/hr/invoices', listKey: 'invoices' },
  payRuns: { path: '/api/hr/pay-runs', listKey: 'runs' },
  expenses: { path: '/api/hr/expenses', listKey: 'expenses' },
  advances: { path: '/api/hr/advances', listKey: 'advances' },
  templates: { path: '/api/hr/templates', listKey: 'templates' },
  contracts: { path: '/api/hr/contracts', listKey: 'contracts' },
  jobs: { path: '/api/hr/jobs', listKey: 'jobs' },
  candidates: { path: '/api/hr/candidates', listKey: 'candidates' },
  interviews: { path: '/api/hr/interviews', listKey: 'interviews' },
  offers: { path: '/api/hr/offers', listKey: 'offers' },
  goals: { path: '/api/hr/goals', listKey: 'goals' },
  reviews: { path: '/api/hr/reviews', listKey: 'reviews' },
  feedback: { path: '/api/hr/feedback', listKey: 'items' },
  trainings: { path: '/api/hr/trainings', listKey: 'trainings' },
  departments: { path: '/api/hr/departments', listKey: 'departments' },
  roles: { path: '/api/hr/roles', listKey: 'roles' },
  auditLog: { path: '/api/hr/audit', listKey: 'entries' },
  announcements: { path: '/api/hr/announcements', listKey: 'items' },
  tasks: { path: '/api/hr/tasks', listKey: 'tasks' }
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
