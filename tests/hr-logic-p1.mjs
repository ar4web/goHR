// P1 logic smoke: tracker distribution + expiry bands + renewal checklist.
// Rebuilt from the documented P1 vectors (post-/tmp-wipe).
import { EMPLOYEES, RESIDENCY_DOCS } from '../src/v4/hr-seed.js';
import { expiryBand, renewalChecklist } from '../src/v4/hr-statutory.js';
import { deriveTrack } from '../src/v4/tracker.js';

let n = 0;
const eq = (name, got, want) => {
  n += 1;
  const a = JSON.stringify(got);
  const b = JSON.stringify(want);
  console.log(`${a === b ? 'PASS' : 'FAIL'} ${name} (got ${a}, want ${b})`);
  if (a !== b) {process.exitCode = 1;}
};

// tracker distribution (v3 contract): staff5/deployed14/renewal2/leave1/blocked2
// (incl. huroob→blocked)/probation1/bench0/exited2 — +4 geo assignments deploy
// the bench, +2 exits, +1 huroob (T2 seed extension).
const dist = {};
for (const e of EMPLOYEES) {
  const c = deriveTrack(e).col;
  dist[c] = (dist[c] || 0) + 1;
}
eq('track-staff', dist.staff || 0, 5);
eq('track-deployed', dist.deployed || 0, 14);
eq('track-renewal', dist.renewal || 0, 2);
eq('track-on-leave', dist['on-leave'] || 0, 1);
eq('track-blocked', dist.blocked || 0, 2);
eq('track-probation', dist.probation || 0, 1);
eq('track-bench', dist.bench || 0, 0);
eq('track-exited', dist.exited || 0, 2);

// expiryBand boundaries
eq('band-expired', expiryBand(-5), 'expired');
eq('band-critical-0', expiryBand(0), 'critical');
eq('band-critical-7', expiryBand(7), 'critical');
eq('band-urgent-8', expiryBand(8), 'urgent');
eq('band-urgent-30', expiryBand(30), 'urgent');
eq('band-soon-31', expiryBand(31), 'soon');
eq('band-soon-90', expiryBand(90), 'soon');
eq('band-ok-91', expiryBand(91), 'ok');
eq('band-missing-null', expiryBand(null), 'missing');
eq('band-missing-nan', expiryBand(NaN), 'missing');

// renewalChecklist vectors
const cl = (code) => {
  const emp = EMPLOYEES.find((e) => e.code === code);
  const docs = RESIDENCY_DOCS.find((d) => d.emp === code) || {};
  return renewalChecklist(emp, docs);
};
const flag = (code, key) => cl(code).find((c) => c.key === key);
eq('check-0006-passport', flag('EMP-0006', 'passport').ok, true);
eq('check-0006-insurance', flag('EMP-0006', 'insurance').ok, true);
eq('check-0006-fines', flag('EMP-0006', 'fines').ok, true);
eq('check-0011-passport-fail', flag('EMP-0011', 'passport').ok, false);
eq('check-0007-fines-fail', flag('EMP-0007', 'fines').ok, false);
eq('check-0017-ins-fail', flag('EMP-0017', 'insurance').ok, false);
eq('check-0021-ins-missing', flag('EMP-0021', 'insurance').detail, 'missing');
const saudi = EMPLOYEES.find((e) => e.saudi);
eq('check-saudi-shortcircuit', renewalChecklist(saudi, {}), [{ key: 'saudi', ok: true, detail: 'no-iqama-chain' }]);

console.log(`\nP1 LOGIC SMOKE: ${n} assertions, ${process.exitCode ? 'FAILURES' : 'ALL PASS'}`);
