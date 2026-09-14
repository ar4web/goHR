// Lean logic vectors: workforce + statutory engine + seed integrity.
// Date math pins a fixed demo-today so vectors never rot.
import { readFileSync, readdirSync } from 'node:fs';
import {
  EMPLOYEES,
  CLIENTS,
  SITES,
  TASKS,
  SKILLS,
  SPONSORS,
  DEPARTMENTS,
  ROLES,
  ROLE_SCOPES,
  AUDIT_LOG,
  ORG_LINKS
} from '../src/v4/hr-seed.js';
import {
  nitaqatEstimate,
  headcountByStatus,
  tenureBuckets,
  separationSeries,
  iqamaBuckets,
  daysUntil,
  calcGosi,
  calcEOSB,
  annualEntitlement,
  getSettings
} from '../src/v4/hr-statutory.js';
import { applyRtl } from '../src/v4/chart-helper.js';
import { fileURLToPath } from 'node:url';

const R = fileURLToPath(new URL('..', import.meta.url));
const fail = [];
const ok = (name, cond, extra = '') => {
  console.log(`${cond ? 'PASS' : 'FAIL'} ${name}${extra && !cond ? ` — ${extra}` : ''}`);
  if (!cond) {
    fail.push(name);
  }
};
const eq = (name, a, b) =>
  ok(
    name,
    JSON.stringify(a) === JSON.stringify(b),
    `${JSON.stringify(a)} !== ${JSON.stringify(b)}`
  );

const TODAY = '2026-09-11';
const emps = new Set(EMPLOYEES.map(e => e.code));

// ── §1 workforce ──────────────────────────────────────────────────────────
eq('t2-st-counts', headcountByStatus(EMPLOYEES), {
  active: 22,
  probation: 1,
  'on-leave': 1,
  exited: 2,
  huroob: 1,
  other: 0
});
ok(
  't2-exits-dated',
  EMPLOYEES.filter(e => e.st === 'exited').every(e => e.exitDate && e.exitReason && e.exitReasonAr)
);
ok(
  't2-huroob-cased',
  EMPLOYEES.filter(e => e.st === 'huroob').length === 1 &&
    EMPLOYEES.every(e => (e.st === 'huroob') === !!(e.reportedAt && e.legalNote))
);
eq('t2-nitaqat-excludes', nitaqatEstimate(EMPLOYEES).total, 24);
eq('t2-separation', separationSeries(EMPLOYEES, [], TODAY), {
  labels: ['04/26', '05/26', '06/26', '07/26', '08/26', '09/26'],
  hired: [0, 0, 0, 0, 1, 0],
  boarded: [0, 0, 0, 0, 0, 0],
  exited: [0, 0, 0, 1, 1, 0]
});
ok(
  't2-tenure-covers',
  (() => {
    const b = tenureBuckets(EMPLOYEES, TODAY);
    return b.lt1 + b.y1_3 + b.y3_5 + b.gte5 === 24;
  })()
);

// ── §2 statutory engine ───────────────────────────────────────────────────
eq('t2-days-neg', daysUntil('2026-09-01', TODAY), -10);
eq('t2-days-pos', daysUntil('2026-09-21', TODAY), 10);
ok(
  't2-gosi-shape',
  (() => {
    const g = calcGosi({ basic: 5000, housing: 1666, isSaudi: false });
    return g.base > 0 && g.employee >= 0 && g.employer >= 0;
  })()
);
ok(
  't2-eosb-shape',
  (() => {
    const e = calcEOSB({ basic: 5000, joinDate: '2020-01-01', endReason: 'termination' });
    return e.net > 0;
  })()
);
ok('t2-entitlement', annualEntitlement('2020-01-01') >= 21);
ok(
  't2-iqama-buckets',
  (() => {
    const b = iqamaBuckets(EMPLOYEES, TODAY);
    return b.le30 + b.le60 + b.le90 >= 0;
  })()
);
ok(
  't2-settings-shape',
  (() => {
    const s = getSettings();
    return (
      Array.isArray(s.companies) &&
      s.companies.length > 0 &&
      typeof s.nitaqat.target === 'number' &&
      typeof s.licence === 'object' &&
      ['en', 'ar'].includes(s.language)
    );
  })()
);

// ── §3 directory xref ─────────────────────────────────────────────────────
ok(
  't2-emp-dept-xref',
  EMPLOYEES.every(e => DEPARTMENTS.some(d => d.code === e.dept))
);
ok(
  't2-emp-client-xref',
  EMPLOYEES.every(e => !e.client || CLIENTS.some(c => c.id === e.client))
);
ok(
  't2-emp-site-xref',
  EMPLOYEES.every(e => !e.site || SITES.some(s => s.id === e.site))
);
ok(
  't2-org-xref',
  ORG_LINKS.every(l => emps.has(l.emp) && (!l.mgr || emps.has(l.mgr)))
);
ok(
  't2-depts-head-cc',
  DEPARTMENTS.every(d => emps.has(d.head) && /^CC-\d+$/.test(d.costCenter))
);
ok('t2-roles-9', ROLES.length === 9 && ROLES[0].code === 'admin');
ok(
  't2-scopes-xref',
  Object.keys(ROLE_SCOPES).every(k => ROLES.some(r => r.code === k))
);
ok('t2-scopes-admin-star', JSON.stringify(ROLE_SCOPES.admin) === '["*"]');
ok(
  't2-audit-10',
  AUDIT_LOG.length === 10 && AUDIT_LOG.every(a => a.id && a.at && a.actor && a.action)
);
ok('t2-tasks-4', TASKS.length === 4 && TASKS.every(x => x.id && x.titleEn && x.due));
ok('t2-skills-sponsors', SKILLS.length > 0 && SPONSORS.length > 0);
ok('t2-seed-file-present', readdirSync(`${R}/src/v4`).includes('hr-seed.js'));
ok('t2-rtl-helper', typeof applyRtl === 'function');

console.log(fail.length ? `\nSEED T2: ${fail.length} FAILURES` : '\nALL SEED T2 CHECKS PASSED');
process.exit(fail.length ? 1 : 0);
