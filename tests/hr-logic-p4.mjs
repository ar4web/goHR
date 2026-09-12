// P4 logic smoke: GOSI ladder + splits, Art. 40 guard, pay lines, EOSB
// Art. 84/85 (2026 fixed-term nuance), WPS deadline + SIF validation.
import {
  calcGosi,
  gosiPensionRate,
  isOldGosiSystem,
  isBlockedDeduction,
  calcPayLine,
  calcEOSB,
  wpsDeadline,
  sifBuild
} from '../src/v4/hr-statutory.js';
import { EMPLOYEES, PAY_RUNS } from '../src/v4/hr-seed.js';

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

const E = code => EMPLOYEES.find(e => e.code === code);
const AT = '2026-09-15'; // Sep-2026: new-system pension is 10% (Jul-26 ladder)

// ── GOSI ────────────────────────────────────────────────────────────────
eq('gosi-old-full', calcGosi({ basic: 9000, housing: 2250, isSaudi: true, enrolledOn: '2022-03-05', at: AT }), {
  base: 11250,
  employee: 1096.88,
  employer: 1321.88,
  pension: 1012.5,
  saned: 84.38,
  hazards: 225,
  system: 'old',
  pensionRate: 0.09
});
eq('gosi-new-full', calcGosi({ basic: 6000, housing: 1500, isSaudi: true, enrolledOn: '2024-09-05', at: AT }), {
  base: 7500,
  employee: 806.25,
  employer: 956.25,
  pension: 750,
  saned: 56.25,
  hazards: 150,
  system: 'new',
  pensionRate: 0.1
});
eq('gosi-new-pcts', [Math.round((806.25 / 7500) * 10000) / 100, Math.round((956.25 / 7500) * 10000) / 100], [10.75, 12.75]);
eq('gosi-expat', calcGosi({ basic: 1800, housing: 500, isSaudi: false, at: AT }), {
  base: 2300,
  employee: 0,
  employer: 46,
  pension: 0,
  saned: 0,
  hazards: 46,
  system: 'expat'
});
eq('gosi-cap', calcGosi({ basic: 40000, housing: 10000, isSaudi: true, enrolledOn: '2024-09-05', at: AT }).base, 45000);
eq('gosi-ladder-25', gosiPensionRate('2025-01-01'), 0.09);
eq('gosi-ladder-26', gosiPensionRate('2026-09-15'), 0.1);
eq('gosi-ladder-28', gosiPensionRate('2028-08-01'), 0.11);
eq('gosi-old-flag', [isOldGosiSystem('2022-03-05'), isOldGosiSystem('2024-09-05')], [true, false]);

// ── Art. 40 ─────────────────────────────────────────────────────────────
eq(
  'art40-blocked',
  ['iqama', 'levy', 'insurance', 'recruitment'].map(isBlockedDeduction),
  [true, true, true, true]
);
eq('art40-case', isBlockedDeduction('LEVY'), true);
eq('art40-allowed', ['advance', 'loan', 'absence', 'damage', 'other'].map(isBlockedDeduction), [false, false, false, false, false]);

// ── Pay lines ───────────────────────────────────────────────────────────
const l6 = calcPayLine(E('EMP-0006'), { otH: 12, at: '2026-08-15' });
eq('pay-ot12', { daily: l6.daily, otPay: l6.otPay, gross: l6.gross, gosiEmp: l6.gosiEmp, gosiEr: l6.gosiEr, net: l6.net }, {
  daily: 86.67,
  otPay: 195,
  gross: 2795,
  gosiEmp: 0,
  gosiEr: 46,
  net: 2795
});
const lb = calcPayLine(E('EMP-0006'), { deductions: [{ label: 'Levy share', cat: 'levy', amount: 700 }] });
eq('pay-blocked', [lb.blocked.length, lb.blocked[0]?.cat], [1, 'levy']);
const l3 = calcPayLine(E('EMP-0003'), { at: AT });
eq('pay-saudi', { gross: l3.gross, gosiEmp: l3.gosiEmp, net: l3.net }, { gross: 8200, gosiEmp: 806.25, net: 7393.75 });
const ld = calcPayLine(E('EMP-0010'), { deductions: [{ label: 'Advance', cat: 'advance', amount: 500 }], at: AT });
eq('pay-ded', [ld.dedTotal, ld.blocked.length, ld.net], [500, 0, Math.round((ld.gross - ld.gosiEmp - 500) * 100) / 100]);

// ── EOSB ────────────────────────────────────────────────────────────────
eq('eosb-5y-gross', calcEOSB({ basic: 3000, joinDate: '2021-01-01', endDate: '2026-01-01', endReason: 'termination' }).gross, 7498.97);
eq('eosb-fixed-3y', calcEOSB({ basic: 3000, joinDate: '2023-09-10', endDate: '2026-09-10', endReason: 'resignation-fixed' }).factor, 1 / 3);
eq('eosb-fixed-3y-net', calcEOSB({ basic: 3000, joinDate: '2023-09-10', endDate: '2026-09-10', endReason: 'resignation-fixed' }).net, 1500.34);
eq('eosb-indef-full', calcEOSB({ basic: 3000, joinDate: '2023-09-10', endDate: '2026-09-10', endReason: 'resignation' }).factor, 1);
eq('eosb-fixed-1y', calcEOSB({ basic: 3000, joinDate: '2025-09-10', endDate: '2026-09-10', endReason: 'resignation-fixed' }).factor, 0);
eq('eosb-fixed-7y', calcEOSB({ basic: 3000, joinDate: '2019-09-10', endDate: '2026-09-10', endReason: 'resignation-fixed' }).factor, 2 / 3);
eq('eosb-fixed-12y', calcEOSB({ basic: 3000, joinDate: '2014-09-10', endDate: '2026-09-10', endReason: 'resignation-fixed' }).factor, 1);
eq('eosb-art80', calcEOSB({ basic: 3000, joinDate: '2020-01-01', endDate: '2026-09-10', endReason: 'art80' }).net, 0);
eq('eosb-art81', calcEOSB({ basic: 3000, joinDate: '2020-01-01', endDate: '2026-09-10', endReason: 'art81' }).factor, 1);

// ── WPS ─────────────────────────────────────────────────────────────────
eq('wps-deadline', wpsDeadline('2026-08'), '2026-09-10');
eq('wps-deadline-roll', wpsDeadline('2026-12'), '2027-01-10');
const sif = sifBuild('2026-08', [
  { emp: 'EMP-0006', iban: 'SA1000000000000000000006', net: 2795 },
  { emp: 'EMP-0007', iban: '', net: 0 }
]);
eq('sif-head', sif.text.split('\n')[0], 'SIF|V1|2026-08|2|279500');
eq('sif-row', sif.text.split('\n')[1], 'SAL|202608|SA1000000000000000000006|000000279500|EMP-0006');
eq('sif-errors', sif.errors.length, 2);
const sifClean = sifBuild('2026-08', [{ emp: 'EMP-0006', iban: 'SA1', net: 2795 }]);
eq('sif-clean', [sifClean.errors.length, sifClean.count, sifClean.total], [0, 1, 2795]);

// ── Seed × engine integration ───────────────────────────────────────────
const aug = PAY_RUNS.find(r => r.id === 'PR-2026-08');
const augLine = calcPayLine(E('EMP-0006'), { ...(aug.adjustments['EMP-0006'] || {}), at: '2026-08-15' });
eq('seed-aug-0006-net', augLine.net, 2795);
eq('seed-aug-wps', [aug.status, aug.wps], ['paid', 'paid']);
eq('seed-sep-draft', PAY_RUNS.find(r => r.id === 'PR-2026-09').status, 'draft');

console.log(`\nP4 LOGIC: ${n} vectors, exit=${process.exitCode || 0}`);
