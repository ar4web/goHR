// P6 static audit: NAV/pages/i18n/seed-xref for goals + reviews + review +
// feedback + trainings + departments + roles + audit + announcements +
// reports, plus the settings extension and settings-live engine wiring.
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
const need = [
  'hr-goals',
  'hr-reviews',
  'hr-feedback',
  'hr-trainings',
  'hr-departments',
  'hr-roles',
  'hr-audit',
  'hr-announcements',
  'hr-reports'
];
ok(
  'nav-9-leaves',
  need.every(k => leaves.some(l => l.key === k))
);
for (const l of leaves.filter(x => need.includes(x.key))) {
  ok(`nav-file-${l.key}`, existsSync(`${R}/production/${l.href}`), l.href);
  ok(`nav-icon-${l.key}`, !!l.parentIcon && l.parentIcon in ICONS, l.parentIcon);
}
ok('review-detail-exists', existsSync(`${R}/production/hr_review.html`));
ok('review-detail-no-leaf', !leaves.some(l => l.key === 'hr-review'));
const detailHtml = readFileSync(`${R}/production/hr_review.html`, 'utf8');
ok('review-detail-rides-reviews', detailHtml.includes('data-page="hr-reviews"'));
// 2. i18n coverage + DOM id xref
const i18nSrc = readFileSync(`${R}/src/v4/i18n.js`, 'utf8');
const dictKeys = new Set(
  [...i18nSrc.matchAll(/'((?:nav|common|status|role|hr)\.[^']+)'\s*:/g)].map(m => m[1])
);
const pages = [
  'hr_goals',
  'hr_reviews',
  'hr_review',
  'hr_feedback',
  'hr_trainings',
  'hr_departments',
  'hr_roles',
  'hr_audit',
  'hr_announcements',
  'hr_reports'
];
const mods = [
  'goals',
  'reviews',
  'review',
  'feedback',
  'trainings',
  'departments',
  'roles',
  'audit',
  'announcements',
  'reports'
];
const roots = {
  goals: 'data-hr-goals',
  reviews: 'data-hr-reviews',
  review: 'data-hr-review',
  feedback: 'data-hr-feedback',
  trainings: 'data-hr-trainings',
  departments: 'data-hr-departments',
  roles: 'data-hr-roles',
  audit: 'data-hr-audit',
  announcements: 'data-hr-announcements',
  reports: 'data-hr-reports'
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
// settings page keys also count as used
const setHtml = readFileSync(`${R}/production/hr_settings.html`, 'utf8');
for (const m of setHtml.matchAll(/data-i18n(?:-ph)?="([^"]+)"/g)) {
  used.add(m[1]);
}
const setSrc = readFileSync(`${R}/src/v4/hr-settings.js`, 'utf8');
for (const x of setSrc.matchAll(/\bt\('([^'`$}]+)'\)/g)) {
  used.add(x[1]);
}
const missing = [...used].filter(k => !dictKeys.has(k));
ok('i18n-coverage', missing.length === 0, missing.join(', '));
console.log(`  (used=${used.size} dict=${dictKeys.size})`);

// 3. seed xref + anchors
const seed = await import(`${R}/src/v4/hr-seed.js`);
const emps = new Set(seed.EMPLOYEES.map(e => e.code));
ok('seed-goals-5', seed.GOALS.length === 5);
ok(
  'seed-goals-xref',
  seed.GOALS.every(g => emps.has(g.owner))
);
ok(
  'seed-goal-risk-demo',
  seed.GOALS.some(g => g.id === 'G-2026-02' && g.status === 'at-risk')
);
const flow = ['draft', 'self', 'manager', 'calibrated', 'published', 'acked'];
ok('seed-reviews-4', seed.REVIEWS.length === 4);
ok(
  'seed-reviews-xref',
  seed.REVIEWS.every(r => emps.has(r.emp) && flow.includes(r.status))
);
ok(
  'seed-review-published-demo',
  seed.REVIEWS.some(r => r.id === 'RV-2026-001' && r.status === 'published' && r.finalRating === 4)
);
ok(
  'seed-review-cycle-demo',
  seed.REVIEWS.some(r => r.id === 'RV-2026-002' && r.status === 'manager')
);
ok('seed-feedback-5', seed.FEEDBACK.length === 5);
ok(
  'seed-feedback-xref',
  seed.FEEDBACK.every(f => emps.has(f.from) && emps.has(f.to) && f.from !== f.to)
);
ok('seed-trainings-3', seed.TRAININGS.length === 3);
ok(
  'seed-trainings-xref',
  seed.TRAININGS.every(t => (t.attendees || []).every(a => emps.has(a)))
);
ok(
  'seed-training-planned-demo',
  seed.TRAININGS.some(t => t.id === 'T-2026-02' && t.status === 'planned')
);
ok(
  'seed-depts-head-cc',
  seed.DEPARTMENTS.every(d => emps.has(d.head) && /^CC-\d+$/.test(d.costCenter))
);
ok('seed-roles-9', seed.ROLES.length === 9);
ok('seed-roles-admin-first', seed.ROLES[0].code === 'admin');
ok(
  'seed-scopes-xref',
  Object.keys(seed.ROLE_SCOPES).every(k => seed.ROLES.some(r => r.code === k))
);
ok('seed-scopes-admin-star', JSON.stringify(seed.ROLE_SCOPES.admin) === '["*"]');
ok('seed-audit-10', seed.AUDIT_LOG.length === 10);
ok(
  'seed-audit-shape',
  seed.AUDIT_LOG.every(a => a.id && a.at && a.actor && a.action)
);
ok('seed-ann-4', seed.ANNOUNCEMENTS.length === 4);
ok(
  'seed-ann-xref',
  seed.ANNOUNCEMENTS.every(a => (a.reads || []).every(r => emps.has(r)))
);
ok(
  'seed-ann-draft-demo',
  seed.ANNOUNCEMENTS.some(a => a.id === 'AN-2026-014' && a.status === 'draft')
);

// 4. settings extension
for (const id of ['set-eosb', 'set-levy', 'set-expcats', 'set-chains', 'set-links']) {
  ok(`settings-body-${id}`, setHtml.includes(`id="${id}"`));
}
for (const fn of ['renderEosb', 'renderLevy', 'renderExpCats', 'renderChains', 'renderLinks']) {
  ok(`settings-fn-${fn}`, setSrc.includes(`function ${fn}(`));
}
ok('settings-backup-audit', setSrc.includes("'hr:audit'"));

// 5. hr-api collections + settings-live engine wiring
const api = readFileSync(`${R}/src/v4/hr-api.js`, 'utf8');
ok(
  'api-p6-collections',
  [
    'goals:',
    'reviews:',
    'feedback:',
    'trainings:',
    'departments:',
    'roles:',
    'roleScopes:',
    'auditLog:',
    'announcements:'
  ].every(k => api.includes(k))
);
const eosbSrc = readFileSync(`${R}/src/v4/eosb.js`, 'utf8');
ok('eosb-settings-live', eosbSrc.includes('getEosbConfig()') && !eosbSrc.includes('SEED_EOSB'));
const expSrc = readFileSync(`${R}/src/v4/expenses.js`, 'utf8');
ok('expenses-cats-live', expSrc.includes('function expenseCats('));
const shellJs = readFileSync(`${R}/src/v4/shell.js`, 'utf8');
ok(
  'shell-role-preview',
  shellJs.includes('applyRolePreview()') && shellJs.includes("from './roles.js'")
);
const auditSrc = readFileSync(`${R}/src/v4/hr-audit.js`, 'utf8');
ok('audit-helper', auditSrc.includes('hr:audit') && auditSrc.includes('export function logAudit'));

console.log(fail.length ? `\nP6 AUDIT: ${fail.length} FAILURES` : '\nALL P6 CHECKS PASSED');
process.exit(fail.length ? 1 : 0);
