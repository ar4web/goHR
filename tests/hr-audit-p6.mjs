// Lean audit: settings-window entries (departments + roles), settings page
// sections + engine, seed xref for departments/roles/scopes/audit, hr-api
// collections, role preview + audit helper wiring.
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';

const R = fileURLToPath(new URL('..', import.meta.url));
const RU = pathToFileURL(R).href.replace(/\/$/, '');
const fail = [];
const ok = (name, cond, extra = '') => {
  console.log(`${cond ? 'PASS' : 'FAIL'} ${name}${extra && !cond ? ` — ${extra}` : ''}`);
  if (!cond) {
    fail.push(name);
  }
};

// 1. NAV leaves -> files (HR leaves live in collapsible parents; icons resolve from the parent).
const { NAV, ICONS, SETTINGS_NAV } = await import(`${RU}/src/v4/shell-render.js`);
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
// Departments + roles live in the settings window, not the sidebar.
const winKeys = SETTINGS_NAV.flatMap(s => s.items.map(i => i.key));
for (const k of ['departments', 'roles']) {
  ok(`win-${k}`, winKeys.includes(k), k);
}
for (const l of SETTINGS_NAV.flatMap(s => s.items).filter(x => ['departments', 'roles'].includes(x.key))) {
  ok(`win-file-${l.key}`, existsSync(`${R}/production/${l.href}`), l.href);
}
// 2. i18n coverage + DOM id xref
const i18nSrc = readFileSync(`${R}/src/v4/i18n.js`, 'utf8');
const dictKeys = new Set(
  [...i18nSrc.matchAll(/'((?:nav|common|status|role|hr|st)\.[^']+)'\s*:/g)].map(m => m[1])
);
const pages = [
  'departments',
  'roles'
];
const mods = [
  'departments',
  'roles'
];
const roots = {
  departments: 'data-hr-departments',
  roles: 'data-hr-roles'
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
const setHtml = readFileSync(`${R}/production/settings.html`, 'utf8');
for (const m of setHtml.matchAll(/data-i18n(?:-ph)?="([^"]+)"/g)) {
  used.add(m[1]);
}
const setSrc = readFileSync(`${R}/src/v4/settings.js`, 'utf8');
for (const x of setSrc.matchAll(/\bt\(\s*['"]([^'"`$}]+)['"]\)/g)) {
  used.add(x[1]);
}
const missing = [...used].filter(k => !dictKeys.has(k));
ok('i18n-coverage', missing.length === 0, missing.join(', '));
console.log(`  (used=${used.size} dict=${dictKeys.size})`);

// 3. seed xref + anchors
const seed = await import(`${RU}/src/v4/hr-seed.js`);
const emps = new Set(seed.EMPLOYEES.map(e => e.code));
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

// 4. settings page sections + engine
for (const id of ['set-general', 'set-nitaqat', 'set-perms', 'set-prefs']) {
  ok(`settings-body-${id}`, setHtml.includes(`id="${id}"`));
}
ok('settings-root', setHtml.includes('data-hr-settings'));
for (const fn of ['renderGeneral', 'renderNitaqat', 'renderPerms', 'renderPrefs', 'initSettings']) {
  ok(`settings-fn-${fn}`, setSrc.includes(`function ${fn}(`) || setSrc.includes(`export function ${fn}(`));
}
ok('settings-store', setSrc.includes('getSettings') && setSrc.includes('saveSettings'));

// 5. hr-api collections + role preview wiring
const api = readFileSync(`${R}/src/v4/hr-api.js`, 'utf8');
ok(
  'api-p6-collections',
  [
    'departments:',
    'roles:',
    'roleScopes:',
    'auditLog:'
  ].every(k => api.includes(k))
);
const shellJs = readFileSync(`${R}/src/v4/shell.js`, 'utf8');
ok(
  'shell-role-preview',
  shellJs.includes('applyRolePreview()') && shellJs.includes("from './roles.js'")
);
const auditSrc = readFileSync(`${R}/src/v4/hr-audit.js`, 'utf8');
ok('audit-helper', auditSrc.includes('hr:audit') && auditSrc.includes('export function logAudit'));

console.log(fail.length ? `\nP6 AUDIT: ${fail.length} FAILURES` : '\nALL P6 CHECKS PASSED');
process.exit(fail.length ? 1 : 0);
