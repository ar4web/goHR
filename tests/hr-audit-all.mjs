// Full-system audit: NAV integrity, i18n coverage (every page + every
// module, EN+AR parity), init wiring, DOM-id xref, links, dup IDs,
// viewport and responsive tables — across all pages, not just HR.
import { readFileSync, readdirSync, existsSync } from 'node:fs';

const R = new URL('..', import.meta.url).pathname.replace(/\/$/, '');
const read = p => readFileSync(`${R}/${p}`, 'utf8');
const fail = [];
const ok = (name, cond, extra = '') => {
  if (!cond) {
    console.log(`FAIL ${name}${extra ? ` — ${extra}` : ''}`);
    fail.push(name);
  }
};

// ── dict parity ─────────────────────────────────────────────────────────
const i18nSrc = read('src/v4/i18n.js');
const enSrc = i18nSrc.slice(i18nSrc.indexOf('  en: {'), i18nSrc.indexOf('  ar: {'));
const arSrc = i18nSrc.slice(i18nSrc.indexOf('  ar: {'));
const kk = s => new Set([...s.matchAll(/'((?:nav|common|status|role|hr)\.[^']+)'\s*:/g)].map(m => m[1]));
const EN = kk(enSrc);
const AR = kk(arSrc);
ok('dict-parity', EN.size === AR.size && [...EN].every(k => AR.has(k)) && [...AR].every(k => EN.has(k)));
console.log(`  (dict EN=${EN.size} AR=${AR.size})`);

// ── NAV ─────────────────────────────────────────────────────────────────
const shell = read('src/v4/shell-render.js');
const nav = [...shell.matchAll(/key: '([a-z0-9_-]+)'[\s\S]{0,200}?href: '([a-z0-9_]+\.html)'/g)];
const navKeys = new Set(nav.map(n => n[1]));
for (const m of nav) {
  ok(`nav-file-${m[1]}`, existsSync(`${R}/production/${m[2]}`), m[2]);
}
const keyList = nav.map(n => n[1]);
ok('nav-no-dupes', new Set(keyList).size === keyList.length);
const icons = new Set([...shell.matchAll(/^ {2}([a-z]+): ?['\n]/gm)].map(m => m[1]));
for (const m of shell.matchAll(/icon: '([a-z]+)'/g)) {
  ok(`nav-icon-${m[1]}`, icons.has(m[1]));
}

// ── pages ───────────────────────────────────────────────────────────────
const pages = readdirSync(`${R}/production`).filter(f => f.endsWith('.html'));
const used = new Set();
for (const p of pages) {
  const html = read(`production/${p}`);
  const isHr = p.startsWith('hr_');
  for (const m of html.matchAll(/data-i18n(?:-ph)?="([^"]+)"/g)) {
    used.add(m[1]);
    ok(`i18n-page-${p}#${m[1]}`, EN.has(m[1]));
  }
  const dp = html.match(/data-page="([^"]+)"/);
  if (dp) {
    ok(`datapage-${p}`, navKeys.has(dp[1]), dp[1]);
  }
  const ids = [...html.matchAll(/ id="([^"]+)"/g)].map(m => m[1]);
  ok(`dup-id-${p}`, new Set(ids).size === ids.length);
  ok(`viewport-${p}`, html.includes('name="viewport"'));
  for (const m of html.matchAll(/href="([a-z0-9_]+\.html)([?#][^"]*)?"/g)) {
    ok(`link-${p}->${m[1]}`, existsSync(`${R}/production/${m[1]}`));
  }
  if (isHr) {
    const tables = (html.match(/<table/g) || []).length;
    const wraps = (html.match(/table-responsive/g) || []).length;
    ok(`tables-wrapped-${p}`, tables <= wraps, `${tables} tables / ${wraps} wraps`);
  }
  for (const m of html.matchAll(/from '(\/src\/v4\/[a-z0-9-]+\.js)'/g)) {
    const mod = m[1].slice(1);
    ok(`init-mod-${p}`, existsSync(`${R}/${mod}`), m[1]);
    if (!existsSync(`${R}/${mod}`)) {
      continue;
    }
    const src = read(mod);
    const im = html.match(new RegExp(`import \\{ ([^}]+) \\} from '${m[1]}'`));
    if (im) {
      for (const fn of im[1].split(',').map(s => s.trim())) {
        ok(`init-fn-${p}#${fn}`, new RegExp(`export (async function|function|const|class) ${fn}\\b`).test(src), mod);
      }
    }
    for (const x of src.matchAll(/getElementById\('([A-Za-z0-9-_]+)'\)/g)) {
      const id = x[1];
      const inPage = html.includes(`id="${id}"`);
      const inMod = src.includes(`id="${id}"`) || src.includes(`id=\\"${id}\\"`);
      ok(`dom-id-${p}#${id}`, inPage || inMod, mod);
    }
  }
}

// ── every module's t() keys resolve ─────────────────────────────────────
const mods = readdirSync(`${R}/src/v4`).filter(f => f.endsWith('.js'));
for (const m of mods) {
  const src = read(`src/v4/${m}`);
  for (const x of src.matchAll(/\bt\(['"]([^'"`$}]+)['"]\)/g)) {
    used.add(x[1]);
    ok(`i18n-mod-${m}#${x[1]}`, EN.has(x[1]));
  }
  for (const x of src.matchAll(/href=\\?"([a-z_]+\.html)/g)) {
    ok(`jslink-${m}->${x[1]}`, existsSync(`${R}/production/${x[1]}`));
  }
}
// ── one table style: every <table> is class table/hr-table or a marked ──
// plain (heatmap/kv) table. JS comment lines mentioning <table> are skipped.
const tableOk = tag =>
  /class="[^"]*\b(table|hr-table)\b/.test(tag) || tag.includes('data-plain-table');
for (const p of pages) {
  const html = read(`production/${p}`);
  for (const m of html.matchAll(/<table[^>]*>/g)) {
    ok(`table-style-${p}`, tableOk(m[0]), m[0].slice(0, 60));
  }
}
for (const m of mods) {
  const src = read(`src/v4/${m}`);
  for (const x of src.matchAll(/<table[^>]*>/g)) {
    const prefix = src.slice(src.lastIndexOf('\n', x.index) + 1, x.index);
    if (/^\s*(\*|\/\/)/.test(prefix)) {
      continue;
    }
    ok(`table-style-js-${m}`, tableOk(x[0]), x[0].slice(0, 60));
  }
}
// ── RTL-safe inline styles: no physical direction props in markup/JS ──
// (a nearby `direction: ltr` — e.g. code blocks — exempts the match)
const physicalRe = /\b(margin-left|padding-left|border-left)\s*:|text-align\s*:\s*left\b/g;
const ltrPinned = (src, idx) => /direction:\s*ltr/.test(src.slice(Math.max(0, idx - 120), idx));
for (const p of pages) {
  const html = read(`production/${p}`);
  for (const m of html.matchAll(physicalRe)) {
    if (!ltrPinned(html, m.index)) {
      ok(`rtl-physical-${p}`, false, m[0]);
    }
  }
  physicalRe.lastIndex = 0;
}
for (const m of mods) {
  const src = read(`src/v4/${m}`);
  for (const x of src.matchAll(physicalRe)) {
    if (!ltrPinned(src, x.index)) {
      ok(`rtl-physical-js-${m}`, false, x[0]);
    }
  }
  physicalRe.lastIndex = 0;
}
// ── white-label: no template brand in user-visible copy ──
// Only storage-compat shims + the legacy API-hook alias keep the old
// tokens (exempted below); dated records (changelog, hr-blueprint,
// improvement-plan, LICENSE provenance) are outside this scan.
const brandRe = /gentelella|colorlib|aigars|silkalns/gi;
const compatRe =
  /__GENTELELLA_API__|LEGACY_|gentelella:(nav-open|sidebar-rail|settings|theme-overrides)/;
for (const p of pages) {
  const html = read(`production/${p}`);
  for (const m of html.matchAll(brandRe)) {
    const lineStart = html.lastIndexOf('\n', m.index) + 1;
    const lineEnd = html.indexOf('\n', m.index);
    const line = html.slice(lineStart, lineEnd === -1 ? undefined : lineEnd);
    if (!compatRe.test(line)) {
      ok(`brand-leak-${p}`, false, line.trim().slice(0, 70));
    }
  }
  brandRe.lastIndex = 0;
}
const docFiles = [
  ...readdirSync(`${R}`).filter(f => f.endsWith('.md')),
  ...readdirSync(`${R}/docs`).filter(f => f.endsWith('.md')).map(f => `docs/${f}`),
  ...readdirSync(`${R}/examples`).filter(f => f.endsWith('.md')).map(f => `examples/${f}`),
  'examples/express-sqlite/README.md',
  'package.json',
  'public/llms.txt',
  'public/site.webmanifest'
].filter(f => !['changelog.md', 'docs/hr-blueprint.md', 'docs/improvement-plan.md'].includes(f));
for (const d of docFiles) {
  const text = read(d);
  for (const m of text.matchAll(brandRe)) {
    const lineStart = text.lastIndexOf('\n', m.index) + 1;
    const lineEnd = text.indexOf('\n', m.index);
    const line = text.slice(lineStart, lineEnd === -1 ? undefined : lineEnd);
    ok(`brand-leak-doc-${d.replaceAll('/', '-')}`, false, line.trim().slice(0, 70));
  }
  brandRe.lastIndex = 0;
}
for (const m of mods) {
  const src = read(`src/v4/${m}`);
  for (const x of src.matchAll(brandRe)) {
    const lineStart = src.lastIndexOf('\n', x.index) + 1;
    const line = src.slice(lineStart, src.indexOf('\n', x.index));
    if (!/^\s*(\/\/|\*|\/\*)/.test(line) && !compatRe.test(line)) {
      ok(`brand-leak-js-${m}`, false, line.trim().slice(0, 70));
    }
  }
  brandRe.lastIndex = 0;
}
console.log(`  (pages=${pages.length} mods=${mods.length} keys-used=${used.size})`);

console.log(fail.length ? `\nSYSTEM AUDIT: ${fail.length} FAILURES` : '\nALL SYSTEM CHECKS PASSED');
process.exit(fail.length ? 1 : 0);
