// P6 logic smoke: settings-live EOSB/levy, role scopes, audit helper,
// seed-flow integrity, reports math. Node-safe imports only (no DOM).
import {
  getEosbConfig,
  levyFor,
  calcEOSB,
  calcPayLine,
  nitaqatEstimate,
  invoiceTotals,
  daysUntil
} from '../src/v4/hr-statutory.js';
import { getSeed } from '../src/v4/hr-api.js';
import { getAudit, storedEntries, currentActor, logAudit } from '../src/v4/hr-audit.js';
import { roleScopes, viewedRole, canShow, ROLE_MODULES } from '../src/v4/roles.js';
import {
  SEED_EOSB,
  GOALS,
  REVIEWS,
  FEEDBACK,
  TRAININGS,
  DEPARTMENTS,
  ROLES,
  ROLE_SCOPES,
  AUDIT_LOG,
  ANNOUNCEMENTS,
  EMPLOYEES,
  LEVY_TABLE
} from '../src/v4/hr-seed.js';

let n = 0;
const eq = (name, got, want) => {
  n += 1;
  const a = JSON.stringify(got);
  const b = JSON.stringify(want);
  console.log(`${a === b ? 'PASS' : 'FAIL'} ${name} (got ${a}, want ${b})`);
  if (a !== b) {
    process.exitCode = 1;
  }
};

// ── settings-live engine (node has no localStorage → seed defaults) ────
eq('eosb-default', getEosbConfig(), SEED_EOSB);
eq('levy-reduced', levyFor(true), LEVY_TABLE.reduced);
eq('levy-standard', levyFor(false), LEVY_TABLE.standard);

// ── object seeds survive getSeed ────────────────────────────────────────
eq('seed-roleScopes', getSeed('roleScopes'), ROLE_SCOPES);
eq('seed-roles-9', getSeed('roles').length, 9);
eq('seed-goals-5', getSeed('goals').length, 5);
eq('seed-audit-10', getSeed('auditLog').length, 10);

// ── roles ───────────────────────────────────────────────────────────────
eq('scopes-9', Object.keys(roleScopes()).length, 9);
eq('scopes-admin', roleScopes().admin, ['*']);
eq('viewed-admin', viewedRole(), 'admin');
eq('can-admin-all', ['hr-payroll', 'hr-roles', 'hr-reports'].every(canShow), true);
eq(
  'roles-codes',
  ROLES.map(r => r.code),
  ['admin', 'hr', 'ops', 'payroll', 'pro', 'finance', 'manager', 'site-supervisor', 'employee']
);
const matrixPages = new Set(ROLE_MODULES.flatMap(g => g.pages));
eq(
  'matrix-covers-p6',
  [
    'hr-goals',
    'hr-reviews',
    'hr-feedback',
    'hr-trainings',
    'hr-departments',
    'hr-roles',
    'hr-audit',
    'hr-announcements',
    'hr-reports'
  ].every(p => matrixPages.has(p)),
  true
);
eq(
  'scopes-in-matrix',
  Object.values(ROLE_SCOPES)
    .flat()
    .every(p => p === '*' || matrixPages.has(p)),
  true
);

// ── audit helper ────────────────────────────────────────────────────────
eq('audit-seed-only', getAudit().length, AUDIT_LOG.length);
eq(
  'audit-newest-first',
  getAudit().every((a, i, arr) => i === 0 || String(arr[i - 1].at) >= String(a.at)),
  true
);
eq('audit-stored-empty', storedEntries(), []);
eq('audit-actor-fallback', currentActor(), 'EMP-0001');
eq('audit-log-id', logAudit('test.ping', 'X', 'y'), 'AU-2026-101');

// ── flow integrity ──────────────────────────────────────────────────────
const FLOW = ['draft', 'self', 'manager', 'calibrated', 'published', 'acked'];
eq(
  'reviews-in-flow',
  REVIEWS.every(r => FLOW.includes(r.status)),
  true
);
eq(
  'reviews-cycle-covered',
  ['draft', 'self', 'manager', 'published'].every(s => REVIEWS.some(r => r.status === s)),
  true
);
eq(
  'goals-status',
  GOALS.every(g => ['draft', 'active', 'at-risk', 'done'].includes(g.status)),
  true
);
eq(
  'feedback-kinds',
  FEEDBACK.every(f => ['praise', 'coaching', 'shoutout'].includes(f.kind)),
  true
);
eq(
  'trainings-status',
  TRAININGS.every(t => ['planned', 'done', 'cancelled'].includes(t.status)),
  true
);
eq(
  'ann-status',
  ANNOUNCEMENTS.every(a => ['draft', 'published', 'archived'].includes(a.status)),
  true
);
eq(
  'depts-cc',
  DEPARTMENTS.map(d => d.costCenter),
  ['CC-100', 'CC-200', 'CC-300', 'CC-400', 'CC-500']
);

// ── reports math (same functions the page uses) ─────────────────────────
const nit = nitaqatEstimate(
  EMPLOYEES.filter(e => e.st === 'active'),
  0
);
eq(
  'nit-shape',
  [nit.saudis > 0, nit.expats > 0, nit.total === nit.saudis + nit.expats],
  [true, true, true]
);
eq('invoice-line', invoiceTotals([{ rate: 3000, days: 30, otH: 0 }]), {
  sub: 3000,
  vat: 450,
  total: 3450
});
const line = calcPayLine(EMPLOYEES[0], { at: '2026-08-28' });
eq('payline-net', line.net, Math.round((line.gross - line.gosiEmp - line.dedTotal) * 100) / 100);
eq(
  'eosb-positive',
  calcEOSB({ basic: 5000, joinDate: '2020-01-01', endDate: '2026-01-01', endReason: 'termination' })
    .net > 0,
  true
);
eq('days-future', daysUntil('2026-12-31', '2026-09-10') > 0, true);

console.log(`\nP6 LOGIC: ${n} vectors, ${process.exitCode ? 'FAILURES' : 'all passed'}`);
