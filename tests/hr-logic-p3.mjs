// P3 logic smoke: invoice math + permits + Ajeer gates + licence scope.
import {
  invoiceLine, invoiceTotals, permitStatus, returnDeadline, professionMatch,
  licenceScopeOk, invoiceDue, ajeerCheck, VAT_RATE
} from '../src/v4/hr-statutory.js';
import { EMPLOYEES, CLIENTS, ASSIGNMENTS } from '../src/v4/hr-seed.js';

let n = 0;
const eq = (name, got, want) => {
  n += 1;
  const a = JSON.stringify(got);
  const b = JSON.stringify(want);
  console.log(`${a === b ? 'PASS' : 'FAIL'} ${name} (got ${a}, want ${b})`);
  if (a !== b) {process.exitCode = 1;}
};

// invoiceLine: daily = rate/30, OT = 1.5x hourly slice
eq('inv-clean', invoiceLine(3000, 22, 4), { daily: 100, reg: 2200, otRate: 18.75, ot: 75, total: 2275 });
eq('inv-rounding', invoiceLine(3500, 22, 6), { daily: 116.67, reg: 2566.67, otRate: 21.88, ot: 131.25, total: 2697.92 });
eq('inv-zero-ot', invoiceLine(2800, 22, 0).total, 2053.33);
eq('inv-totals', invoiceTotals([{ rate: 3000, days: 22, otH: 4 }]), { sub: 2275, vat: 341.25, total: 2616.25 });
eq('vat-rate', VAT_RATE, 0.15);

// permitStatus boundaries (today pinned)
eq('permit-expiring', permitStatus('2026-09-25', '2026-09-10'), 'expiring');
eq('permit-active', permitStatus('2026-12-31', '2026-09-10'), 'active');
eq('permit-expired', permitStatus('2026-09-09', '2026-09-10'), 'expired');
eq('permit-missing', permitStatus('', '2026-09-10'), 'missing');

// returnDeadline skips Fri/Sat (Thu→Sun, Sun→Mon, Wed→Thu)
eq('return-thu-sun', returnDeadline('2026-09-10'), '2026-09-13');
eq('return-sun-mon', returnDeadline('2026-09-13'), '2026-09-14');
eq('return-wed-thu', returnDeadline('2026-09-09'), '2026-09-10');

// professionMatch + licenceScopeOk
eq('prof-match', professionMatch('mason', 'mason'), true);
eq('prof-mismatch', professionMatch('mason', 'driver'), false);
eq('prof-empty', professionMatch('', 'mason'), false);
eq('scope-both', licenceScopeOk('both', 'service'), true);
eq('scope-labour-ok', licenceScopeOk('labour', 'labour'), true);
eq('scope-labour-block', licenceScopeOk('labour', 'service'), false);
eq('scope-service-block', licenceScopeOk('service', 'labour'), false);

// invoiceDue: billingDay of next month, clamped to 28
eq('due-sep5', invoiceDue('2026-08', 5), '2026-09-05');
eq('due-sep10', invoiceDue('2026-08', 10), '2026-09-10');
eq('due-year-roll', invoiceDue('2026-12', 5), '2027-01-05');
eq('due-clamp', invoiceDue('2026-08', 31), '2026-09-28');

// ajeerCheck vectors on real + crafted rows
const asn1 = ASSIGNMENTS.find((a) => a.id === 'ASN-2026-001');
const emp1 = EMPLOYEES.find((e) => e.code === asn1.emp);
const cl2 = CLIENTS.find((c) => c.id === asn1.client);
eq('ajeer-clean', ajeerCheck(asn1, emp1, cl2, '2026-09-10').ok, true);
eq('ajeer-missing-asn', ajeerCheck(null, emp1, cl2).reasons, ['missing-assignment']);
eq('ajeer-no-consent', ajeerCheck({ ...asn1, consent: '' }, emp1, cl2, '2026-09-10').reasons.includes('no-consent'), true);
eq('ajeer-exp-permit', ajeerCheck({ ...asn1, ajeerExp: '2026-01-01' }, emp1, cl2, '2026-09-10').reasons.includes('ajeer-expired'), true);
eq('ajeer-3y-cap', ajeerCheck({ ...asn1, end: '2030-01-01' }, emp1, cl2, '2026-09-10').reasons.includes('over-3y-cap'), true);
eq('ajeer-client-wps', ajeerCheck(asn1, emp1, { ...cl2, wpsOk: false }, '2026-09-10').reasons.includes('client-wps-fail'), true);
eq('ajeer-client-red', ajeerCheck(asn1, emp1, { ...cl2, nitaqat: 'Red' }, '2026-09-10').reasons.includes('client-nitaqat-red'), true);

console.log(`\nP3 LOGIC SMOKE: ${n} assertions, ${process.exitCode ? 'FAILURES' : 'ALL PASS'}`);
