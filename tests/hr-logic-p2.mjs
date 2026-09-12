// P2 logic smoke: KSA leave + timesheet vectors (§0.3, 8h/48h, Ramadan 6h/36h, 11h cap).
import {
  leaveDays, annualBalance, annualEntitlement, sickTier, hajjEligible, observedHoliday, inRamadan,
  timesheetDay, NORMAL_DAY_HOURS, RAMADAN_DAY_HOURS, MAX_DAY_HOURS, OT_RATE
} from '../src/v4/hr-statutory.js';

let n = 0;
const eq = (name, got, want) => {
  n += 1;
  const a = JSON.stringify(got);
  const b = JSON.stringify(want);
  console.log(`${a === b ? 'PASS' : 'FAIL'} ${name} (got ${a}, want ${b})`);
  if (a !== b) {process.exitCode = 1;}
};

const HOLS = [];
eq('leave-5day-week', leaveDays('2026-09-06', '2026-09-10', HOLS), 5);
eq('leave-skips-weekend', leaveDays('2026-09-10', '2026-09-13', HOLS), 2);
eq('leave-friday-zero', leaveDays('2026-09-11', '2026-09-11', HOLS), 0);
eq('leave-skips-holiday', leaveDays('2026-09-06', '2026-09-08', [{ start: '2026-09-07', days: 1 }]), 2);
eq('leave-reversed-zero', leaveDays('2026-09-10', '2026-09-06', HOLS), 0);
eq('annual-balance', annualBalance('2024-01-01', 4, 11), { entitlement: 21, used: 15, left: 6 });
eq('annual-stepup-30', annualEntitlement('2020-01-01'), 30);
eq('annual-first5-21', annualEntitlement('2026-03-01'), 21);
eq('sick-tier-10', sickTier(10), { rate: 1, tier: 1 });
eq('sick-tier-31', sickTier(31), { rate: 0.75, tier: 2 });
eq('sick-tier-100', sickTier(100), { rate: 0, tier: 3 });
eq('sick-tier-130', sickTier(130), { rate: 0, tier: 0 });
eq('hajj-eligible', hajjEligible('2023-01-01', 0), { ok: true, reason: '' });
eq('hajj-too-new', hajjEligible('2026-01-01', 0), { ok: false, reason: 'tenure-under-2y' });
eq('hajj-once-only', hajjEligible('2020-01-01', 1), { ok: false, reason: 'already-taken' });
eq('observed-fri', observedHoliday('2026-09-11'), { observed: '2026-09-13', shifted: true });
eq('observed-sun', observedHoliday('2026-09-06'), { observed: '2026-09-06', shifted: false });
eq('ramadan-in', inRamadan('2026-02-19', [{ start: '2026-02-18', end: '2026-03-19' }]), true);
eq('ramadan-out', inRamadan('2026-09-10', [{ start: '2026-02-18', end: '2026-03-19' }]), false);
eq('ts-normal', timesheetDay(480), { regMin: 480, otMin: 0, violation: false });
eq('ts-ot', timesheetDay(600), { regMin: 480, otMin: 120, violation: false });
eq('ts-weekend', timesheetDay(360, { weekendDay: true }), { regMin: 0, otMin: 360, violation: false });
eq('ts-ramadan-cap', timesheetDay(480, { ramadan: true }), { regMin: 360, otMin: 120, violation: false });
eq('ts-violation', timesheetDay(720).violation, true);
eq('ts-constants', [NORMAL_DAY_HOURS, RAMADAN_DAY_HOURS, MAX_DAY_HOURS, OT_RATE], [8, 6, 11, 1.5]);
console.log(`\nP2 LOGIC SMOKE: ${n} assertions, ${process.exitCode ? 'FAILURES' : 'ALL PASS'}`);
