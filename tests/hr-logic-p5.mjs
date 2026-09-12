// P5 logic smoke: template lint + render, date math, probation guard,
// Nitaqat wage floor, placeholder auto-fill, seed integration.
import {
  lintTemplate,
  renderTemplate,
  addDays,
  addMonths,
  probationOk,
  contractEnd,
  nitaqatWageOk,
  nitaqatWageFloor,
  daysUntil
} from '../src/v4/hr-statutory.js';
import { buildValues, templateByCode } from '../src/v4/contract-values.js';
import { TEMPLATES, CONTRACTS, JOBS, OFFERS, CANDIDATES } from '../src/v4/hr-seed.js';

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

// ── lint ────────────────────────────────────────────────────────────────
eq('lint-clean', lintTemplate('Hi {{worker_name}}, wage {{wage_total}}.').errors, []);
eq('lint-spaced', lintTemplate('Hi {{ worker_name }}.').placeholders, ['worker_name']);
eq('lint-unbalanced', lintTemplate('Hi {{worker_name}.').errors, ['unbalanced-braces']);
eq('lint-unknown', lintTemplate('Hi {{nope}} {{worker_name}}.').errors, ['unknown:nope']);
eq('lint-empty', lintTemplate('Hi {{}}!').errors.includes('empty-placeholder'), true);

// ── render ──────────────────────────────────────────────────────────────
eq('render-sub', renderTemplate('Pay {{wage_total}} to {{worker_name}}.', { wage_total: 2600, worker_name: 'Rajesh' }), 'Pay 2600 to Rajesh.');
eq('render-missing', renderTemplate('Pay {{wage_total}}.', {}), 'Pay …….');
eq('render-spaced', renderTemplate('A{{ wage_total }}B', { wage_total: 5 }), 'A5B');

// ── dates ───────────────────────────────────────────────────────────────
eq('adddays-1', addDays('2026-09-10', 1), '2026-09-11');
eq('adddays-roll', addDays('2026-01-31', 1), '2026-02-01');
eq('adddays-year', addDays('2026-12-31', 1), '2027-01-01');
eq('adddays-neg', addDays('2026-09-10', -10), '2026-08-31');
eq('addmonths-12', addMonths('2026-01-15', 12), '2027-01-15');
eq('addmonths-clamp', addMonths('2026-01-31', 1), '2026-02-28');
eq('addmonths-roll', addMonths('2026-11-30', 3), '2027-02-28');
eq('contract-end', contractEnd('2026-01-15', 12), '2027-01-15');

// ── guards ──────────────────────────────────────────────────────────────
eq('probation-90', probationOk(90), true);
eq('probation-180', probationOk(180), true);
eq('probation-181', probationOk(181), false);
eq('probation-0', probationOk(0), false);
eq('floor-value', nitaqatWageFloor(), 4000);
eq('floor-saudi-low', nitaqatWageOk(true, 3500), false);
eq('floor-saudi-ok', nitaqatWageOk(true, 4000), true);
eq('floor-expat', nitaqatWageOk(false, 1500), true);

// ── auto-fill ───────────────────────────────────────────────────────────
const e3 = buildValues(templateByCode('E3'), 'EMP-0006', {});
eq('fill-worker', [e3.worker_name, e3.wage_total, e3.id_no], ['Rajesh Kumar', 2600, '2000000006']);
const c1 = buildValues(templateByCode('C1'), 'CL-001', {});
eq('fill-client', [c1.client_name, c1.client_cr], ['Al-Bina Construction', '1010XXXX11']);
const a2 = buildValues(templateByCode('A2'), 'ASN-2026-001', {});
eq('fill-asn', [a2.assignment_ref, a2.ajeer_ref, a2.site_name], ['ASN-2026-001', 'AJ-2026-101', 'KAFD Tower FM']);
const l1 = buildValues(templateByCode('L1'), 'CD-2026-005', { wage_basic: 2200, wage_housing: 550, wage_transport: 300 });
eq('fill-offer', [l1.job_title, l1.wage_total], ['Mason', 3050]);

// ── seed integration ────────────────────────────────────────────────────
const lintErrs = TEMPLATES.flatMap(t => [...lintTemplate(t.bodyEn).errors, ...lintTemplate(t.bodyAr).errors]);
eq('seed-all-templates-lint', [TEMPLATES.length, lintErrs.length], [27, 0]);
const exp = CONTRACTS.find(c => c.id === 'CT-2026-005');
eq('seed-expiring-35d', daysUntil(exp.end, '2026-09-10'), 35);
eq('seed-jobs-mandatory', JOBS.every(j => j.housing > 0 && j.transport > 0), true);
const saudiOffer = OFFERS.find(o => o.id === 'OF-2026-002');
const saudiCand = CANDIDATES.find(c => c.id === saudiOffer.candidate);
eq('seed-floor-demo', [saudiCand.saudi, nitaqatWageOk(saudiCand.saudi, saudiOffer.basic)], [true, false]);

console.log(`\nP5 LOGIC: ${n} vectors, exit=${process.exitCode || 0}`);
