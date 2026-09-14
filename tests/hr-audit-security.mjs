// T1 static security audit: escape-pipeline locks, brand-URL allowlist,
// honest gateway. Regression locks for fixed sinks + INFO backlog of the
// remaining day-by-day escape surface.
import { readFileSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const R = fileURLToPath(new URL('..', import.meta.url));
const fail = [];
const ok = (name, cond, extra = '') => {
  console.log(`${cond ? 'PASS' : 'FAIL'} ${name}${extra && !cond ? ` — ${extra}` : ''}`);
  if (!cond) {
    fail.push(name);
  }
};
const src = f => readFileSync(`${R}/${f}`, 'utf8');

// 1. Escape helper imported in every locked renderer
for (const f of [
  'src/v4/employees.js',
  'src/v4/employee-detail.js',
  'src/v4/import-modal.js'
]) {
  const s = src(f);
  ok(
    `esc-import-${f.split('/').pop()}`,
    s.includes('escapeHtml as esc') && s.includes("from './markup.js'")
  );
}

// 2. Import error boxes escaped (all three flows; messages are fixed codes,
// escaping is defense-in-depth against future message text)
for (const f of ['src/v4/import-modal.js']) {
  ok(`esc-errhtml-${f.split('/').pop()}`, src(f).includes('${esc(e.field)}'));
}

// 3. Employees table: every employee-derived sink escaped
for (const [name, needle] of [
  ['code-attr', '${esc(e.code)}'],
  ['code-href', 'encodeURIComponent(e.code)'],
  ['names', '${esc(currentLang()'],
  ['nat', '${esc(e.nat)}'],
  ['prof', '${esc(profName(e.prof))}'],
  ['dept', '${esc(dep.cls)}'],
  ['dep', '${esc(dep.label.replace('],
  ['sponsor', "${esc(e.sponsor||'—')}"]
]) {
  ok(`esc-employees-${name}`, src('src/v4/employees.js').includes(needle), needle);
}

// 5. Employee detail: header + data cells escaped
for (const [name, needle] of [
  ['kvd-helper', 'function kvd(k, v)'],
  ['header-name', '${esc(currentLang()'],
  ['header-code', '${esc(e.code)}'],
  ['iban', 'maskIban(e.iban)'],
  ['qiwa-doc', "kvd('Qiwa', t(`status.${e.q}`))"]
]) {
  ok(`esc-empdetail-${name}`, src('src/v4/employee-detail.js').includes(needle), needle);
}

// 6. S2: brand/logo URL allowlist + downscale
const i18n = src('src/v4/i18n.js');
ok('allowlist-fn', i18n.includes('export function isSafeMediaUrl'));
ok('allowlist-data-img', i18n.includes("startsWith('data:image/')"));
ok('allowlist-used', i18n.includes('isSafeMediaUrl(raw.company.logo)'));

// 7. S3: honest gateway + auth redirects
const landing = src('production/landing.html');
ok('gateway-shell', landing.includes('data-gateway') && landing.includes('gateway.js'));
ok('gateway-no-password', !landing.includes('type="password"'));
ok('gateway-i18n', landing.includes('data-i18n="common.gatewayTitle"'));
const gw = src('src/v4/gateway.js');
ok('gateway-sets-role', gw.includes('setViewedRole('));
ok('gateway-routes', gw.includes('my_space.html') && gw.includes('analytics.html'));
ok('gateway-escapes', gw.includes('escapeHtml as esc'));
ok('roles-setter', src('src/v4/roles.js').includes('export function setViewedRole'));
for (const p of ['login', 'register', 'forgot_password', 'lock_screen', 'verify_2fa']) {
  const h = src(`production/${p}.html`);
  ok(`auth-redirect-${p}`, h.includes('url=landing.html') && h.includes('role gateway'));
}

// 8. INFO backlog: innerHTML sinks per HR module (day-by-day escape queue)
const hrMods = readdirSync(`${R}/src/v4`).filter(f => f.endsWith('.js'));
const sinks = hrMods
  .map(f => ({ f, n: (src(`src/v4/${f}`).match(/\.innerHTML\s*=/g) || []).length }))
  .filter(x => x.n > 0)
  .sort((a, b) => b.n - a.n);
console.log(
  `  (innerHTML sinks in ${sinks.length} modules; top: ${sinks
    .slice(0, 5)
    .map(x => `${x.f}:${x.n}`)
    .join(', ')})`
);

console.log(
  fail.length ? `\nSECURITY AUDIT: ${fail.length} FAILURES` : '\nALL SECURITY CHECKS PASSED'
);
process.exit(fail.length ? 1 : 0);
