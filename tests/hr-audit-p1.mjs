// P1 static audit: NAV/pages/i18n/seed-xref for visas + residency + onboarding +
// tracker + vault + org. Rebuilt from the P1 contract (post-/tmp-wipe).
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
const need = ['hr-visas', 'hr-residency', 'hr-onboarding', 'hr-tracker', 'hr-documents', 'hr-org'];
ok(
  'nav-6-leaves',
  need.every(k => leaves.some(l => l.key === k))
);
for (const l of leaves.filter(x => need.includes(x.key))) {
  ok(`nav-file-${l.key}`, existsSync(`${R}/production/${l.href}`), l.href);
  ok(`nav-icon-${l.key}`, !!l.parentIcon && l.parentIcon in ICONS, l.parentIcon);
}
// 2. i18n coverage + DOM id xref
const i18nSrc = readFileSync(`${R}/src/v4/i18n.js`, 'utf8');
const dictKeys = new Set(
  [...i18nSrc.matchAll(/'((?:nav|common|status|role|hr)\.[^']+)'\s*:/g)].map(m => m[1])
);
const pages = [
  'hr_visas',
  'hr_residency',
  'hr_onboarding',
  'hr_tracker',
  'hr_documents',
  'hr_org_chart'
];
const mods = ['visas', 'residency', 'onboarding', 'tracker', 'documents', 'org-chart'];
const roots = {
  visas: 'data-hr-visas',
  residency: 'data-hr-residency',
  onboarding: 'data-hr-onboarding',
  tracker: 'data-hr-tracker',
  documents: 'data-hr-documents',
  'org-chart': 'data-hr-org'
};
const dynamic = new Set([
  'ob-convert',
  'ob-advance',
  'ob-cost',
  'res-renew',
  'res-ins',
  'res-fines'
]); // module-rendered
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
    if (dynamic.has(id)) {
      continue;
    }
    ok(`page-id-${p}#${id}`, html.includes(`id="${id}"`), 'missing in page');
  }
  for (const x of src.matchAll(/\bt\('([^'`$}]+)'\)/g)) {
    used.add(x[1]);
  }
});
const missing = [...used].filter(k => !dictKeys.has(k));
ok('i18n-coverage', missing.length === 0, missing.join(', '));
console.log(`  (used=${used.size} dict=${dictKeys.size})`);

// 3. seed xref (documented P1 counts)
const seed = await import(`${R}/src/v4/hr-seed.js`);
const emps = new Set(seed.EMPLOYEES.map(e => e.code));
ok('seed-visas-24', seed.VISAS.length === 24);
ok('seed-onboarding-4', seed.ONBOARDING.length === 4);
ok('seed-documents-19', seed.DOCUMENTS.length === 19);
ok('seed-orglinks-24', seed.ORG_LINKS.length === 24);
ok(
  'seed-orglinks-xref',
  seed.ORG_LINKS.every(l => emps.has(l.emp) && (!l.mgr || emps.has(l.mgr)))
);
ok(
  'seed-docs-xref',
  seed.DOCUMENTS.every(d => !d.emp || emps.has(d.emp))
);

// 4. hr-api collections
const api = readFileSync(`${R}/src/v4/hr-api.js`, 'utf8');
ok(
  'api-p1-collections',
  [
    'visaBlocks:',
    'visas:',
    'onboarding:',
    'transfers:',
    'residencyDocs:',
    'documents:',
    'orgLinks:'
  ].every(k => api.includes(k))
);

console.log(fail.length ? `\nP1 AUDIT: ${fail.length} FAILURES` : '\nALL P1 CHECKS PASSED');
process.exit(fail.length ? 1 : 0);
