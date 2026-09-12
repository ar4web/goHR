// P5 static audit: NAV/pages/i18n/seed-xref for contracts + templates +
// jobs + candidates + pipeline + interviews + offers.
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
  'hr-contracts',
  'hr-templates',
  'hr-jobs',
  'hr-candidates',
  'hr-pipeline',
  'hr-interviews',
  'hr-offers'
];
ok(
  'nav-7-leaves',
  need.every(k => leaves.some(l => l.key === k))
);
for (const l of leaves.filter(x => need.includes(x.key))) {
  ok(`nav-file-${l.key}`, existsSync(`${R}/production/${l.href}`), l.href);
  ok(`nav-icon-${l.key}`, !!l.parentIcon && l.parentIcon in ICONS, l.parentIcon);
}
ok('contract-detail-exists', existsSync(`${R}/production/hr_contract.html`));
// 2. i18n coverage + DOM id xref
const i18nSrc = readFileSync(`${R}/src/v4/i18n.js`, 'utf8');
const dictKeys = new Set(
  [...i18nSrc.matchAll(/'((?:nav|common|status|role|hr)\.[^']+)'\s*:/g)].map(m => m[1])
);
const pages = [
  'hr_contracts',
  'hr_contract',
  'hr_templates',
  'hr_jobs',
  'hr_candidates',
  'hr_pipeline',
  'hr_interviews',
  'hr_offers'
];
const mods = [
  'contracts',
  'contract',
  'templates',
  'jobs',
  'candidates',
  'pipeline',
  'interviews',
  'offers'
];
const roots = {
  contracts: 'data-hr-contracts',
  contract: 'data-hr-contract',
  templates: 'data-hr-templates',
  jobs: 'data-hr-jobs',
  candidates: 'data-hr-candidates',
  pipeline: 'data-hr-pipeline',
  interviews: 'data-hr-interviews',
  offers: 'data-hr-offers'
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
const asns = new Set(seed.ASSIGNMENTS.map(a => a.id));
const tplCodes = new Set(seed.TEMPLATES.map(t => t.code));
ok('seed-templates-27', seed.TEMPLATES.length === 27);
ok(
  'seed-template-cats',
  seed.TEMPLATES.filter(t => t.cat === 'E').length === 8 &&
    seed.TEMPLATES.filter(t => t.cat === 'A').length === 4 &&
    seed.TEMPLATES.filter(t => t.cat === 'C').length === 5 &&
    seed.TEMPLATES.filter(t => t.cat === 'L').length === 10
);
ok(
  'seed-contracts-xref',
  seed.CONTRACTS.every(c => {
    if (!tplCodes.has(c.type)) {
      return false;
    }
    if (c.partyKind === 'employee') {
      return emps.has(c.party);
    }
    if (c.partyKind === 'client') {
      return clients.has(c.party);
    }
    if (c.partyKind === 'assignment') {
      return asns.has(c.party);
    }
    return false;
  })
);
ok(
  'seed-contract-status',
  seed.CONTRACTS.every(c =>
    ['draft', 'review', 'issued', 'signed', 'active', 'renewed', 'closed'].includes(c.status)
  )
);
ok(
  'seed-expiring-demo',
  seed.CONTRACTS.some(c => c.id === 'CT-2026-005' && c.end === '2026-10-15')
);
ok('seed-jobs-4', seed.JOBS.length === 4);
ok(
  'seed-jobs-housing-transport',
  seed.JOBS.every(j => j.housing > 0 && j.transport > 0)
);
const jobs = new Set(seed.JOBS.map(j => j.id));
const cands = new Set(seed.CANDIDATES.map(c => c.id));
ok('seed-candidates-8', seed.CANDIDATES.length === 8);
ok(
  'seed-candidates-xref',
  seed.CANDIDATES.every(c => jobs.has(c.job))
);
ok(
  'seed-interviews-xref',
  seed.INTERVIEWS.every(r => cands.has(r.candidate) && emps.has(r.interviewer))
);
ok(
  'seed-offers-xref',
  seed.OFFERS.every(o => cands.has(o.candidate) && jobs.has(o.job))
);
ok(
  'seed-offer-floor-demo',
  seed.OFFERS.some(o => o.id === 'OF-2026-002' && o.basic === 3500)
);
const l1 = seed.TEMPLATES.find(t => t.code === 'L1');
ok(
  'seed-offer-l1-pin',
  seed.OFFERS.every(o => o.templateVer === l1.version)
);

// 4. hr-api collections
const api = readFileSync(`${R}/src/v4/hr-api.js`, 'utf8');
ok(
  'api-p5-collections',
  ['templates:', 'contracts:', 'jobs:', 'candidates:', 'interviews:', 'offers:'].every(k =>
    api.includes(k)
  )
);

console.log(fail.length ? `\nP5 AUDIT: ${fail.length} FAILURES` : '\nALL P5 CHECKS PASSED');
process.exit(fail.length ? 1 : 0);
