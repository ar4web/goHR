// P4 static audit: NAV/pages/i18n/seed-xref for payroll + payslip + GOSI +
// WPS + EOSB + expenses.
import { readFileSync, existsSync } from 'node:fs';

const R = new URL('..', import.meta.url).pathname.replace(/\/$/, '');
const fail = [];
const ok = (name, cond, extra = '') => {
  console.log(`${cond ? 'PASS' : 'FAIL'} ${name}${extra && !cond ? ` — ${extra}` : ''}`);
  if (!cond) {
    fail.push(name);
  }
};

// 1. NAV leaves -> files (HR leaves live in collapsible parents; icons resolve from the parent).
const { NAV, ICONS } = await import(`${R}/src/v4/shell-render.js`);
const leaves = [];
for (const g of NAV) {
  for (const it of g.items || []) {
    if (it.children) {
      for (const c of it.children) {
        leaves.push({ ...c, parentIcon: it.icon });
      }
    } else if (it.key) {
      leaves.push({ ...it, parentIcon: null });
    }
  }
}
const need = ['hr-payroll', 'hr-gosi', 'hr-wps', 'hr-eosb', 'hr-expenses'];
ok(
  'nav-5-leaves',
  need.every(k => leaves.some(l => l.key === k))
);
for (const l of leaves.filter(x => need.includes(x.key))) {
  ok(`nav-file-${l.key}`, existsSync(`${R}/production/${l.href}`), l.href);
  ok(`nav-icon-${l.key}`, !!l.parentIcon && l.parentIcon in ICONS, l.parentIcon);
}
ok('payslip-page-exists', existsSync(`${R}/production/hr_payslip.html`));
// 2. i18n coverage + DOM id xref
const i18nSrc = readFileSync(`${R}/src/v4/i18n.js`, 'utf8');
const dictKeys = new Set(
  [...i18nSrc.matchAll(/'((?:nav|common|status|role|hr)\.[^']+)'\s*:/g)].map(m => m[1])
);
const pages = ['hr_payroll', 'hr_payslip', 'hr_gosi', 'hr_wps', 'hr_eosb', 'hr_expenses'];
const mods = ['payroll', 'payslip', 'gosi', 'wps', 'eosb', 'expenses'];
const roots = {
  payroll: 'data-hr-payroll',
  payslip: 'data-hr-payslip',
  gosi: 'data-hr-gosi',
  wps: 'data-hr-wps',
  eosb: 'data-hr-eosb',
  expenses: 'data-hr-expenses'
};
const used = new Set();
pages.forEach((p, i) => {
  const html = readFileSync(`${R}/production/${p}.html`, 'utf8');
  for (const m of html.matchAll(/data-i18n(?:-ph)?="([^"]+)"/g)) {
    used.add(m[1]);
  }
  ok(`page-root-${p}`, html.includes(roots[mods[i]]), roots[mods[i]]);
  const src = readFileSync(`${R}/src/v4/${mods[i]}.js`, 'utf8');
  const ids = new Set([...src.matchAll(/getElementById\('([a-z-]+)'\)/g)].map(m => m[1]));
  for (const id of ids) {
    ok(`page-id-${p}#${id}`, html.includes(`id="${id}"`), 'missing in page');
  }
  for (const x of src.matchAll(/\bt\('([^'`$}]+)'\)/g)) {
    used.add(x[1]);
  }
});
const missing = [...used].filter(k => !dictKeys.has(k));
ok('i18n-coverage', missing.length === 0, missing.join(', '));
console.log(`  (used=${used.size} dict=${dictKeys.size})`);

// 3. seed xref
const seed = await import(`${R}/src/v4/hr-seed.js`);
const emps = new Set(seed.EMPLOYEES.map(e => e.code));
const clients = new Set(seed.CLIENTS.map(c => c.id));
const cats = new Set(seed.EXPENSE_CATEGORIES.map(c => c.code));
const runIds = new Set(seed.PAY_RUNS.map(r => r.id));
ok('seed-runs-2', seed.PAY_RUNS.length === 2);
ok(
  'seed-run-status',
  seed.PAY_RUNS.every(r => ['draft', 'approved', 'paid'].includes(r.status))
);
ok(
  'seed-run-wps',
  seed.PAY_RUNS.every(r => ['draft', 'submitted', 'accepted', 'paid'].includes(r.wps))
);
ok(
  'seed-adjust-xref',
  seed.PAY_RUNS.every(r => Object.keys(r.adjustments || {}).every(e => emps.has(e)))
);
const BLOCKED = ['iqama', 'levy', 'insurance', 'recruitment'];
ok(
  'seed-no-blocked-deductions',
  seed.PAY_RUNS.every(r =>
    Object.values(r.adjustments || {}).every(a =>
      (a.deductions || []).every(d => !BLOCKED.includes(d.cat))
    )
  )
);
ok('seed-expenses-7', seed.EXPENSES.length === 7);
ok(
  'seed-expenses-xref',
  seed.EXPENSES.every(
    x => emps.has(x.emp) && cats.has(x.cat) && (!x.billable || clients.has(x.client))
  )
);
ok(
  'seed-expense-flag-demos',
  seed.EXPENSES.some(x => x.id === 'EXP-2026-014') &&
    seed.EXPENSES.some(x => x.id === 'EXP-2026-016')
);
ok('seed-advances-2', seed.ADVANCES.length === 2);
ok(
  'seed-advances-xref',
  seed.ADVANCES.every(a => emps.has(a.emp) && (a.settled || []).every(s => runIds.has(s.ref)))
);
ok('seed-eosb-basis', ['basic', 'basic+housing'].includes(seed.SEED_EOSB.basis));

// 4. hr-api collections
const api = readFileSync(`${R}/src/v4/hr-api.js`, 'utf8');
ok(
  'api-p4-collections',
  ['payRuns:', 'expenses:', 'advances:'].every(k => api.includes(k))
);

console.log(fail.length ? `\nP4 AUDIT: ${fail.length} FAILURES` : '\nALL P4 CHECKS PASSED');
process.exit(fail.length ? 1 : 0);
