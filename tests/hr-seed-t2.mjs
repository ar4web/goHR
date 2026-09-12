// T2 Command Center seed-consistency vectors (v3 §1–§6 gaps).
// Date math pins a fixed demo-today so vectors never rot.
import { readFileSync, readdirSync } from 'node:fs';
import {
  EMPLOYEES,
  CLIENTS,
  SITES,
  ASSIGNMENTS,
  LEAVE_REQUESTS,
  LEAVE_DELAY_REASONS,
  TRANSFERS,
  TASKS,
  SKILLS,
  SPONSORS,
  AJEER_PERMITS,
  INVOICES,
  ONBOARDING,
  RESIDENCY_DOCS,
  CONTRACTS,
  ATTENDANCE,
  GOALS,
  FEEDBACK,
  TIMESHEETS,
  EXPENSES,
  EXPENSE_CATEGORIES
} from '../src/v4/hr-seed.js';
import {
  nitaqatEstimate,
  leaveWindows,
  returnStats,
  headcountByStatus,
  tenureBuckets,
  execMoney,
  separationSeries,
  eligibleForVacation,
  expiryDeck,
  iqamaBuckets,
  contractsEnding,
  perfIndex,
  perfRanking,
  cohortTrend,
  tickerAlerts
} from '../src/v4/hr-statutory.js';
import { applyRtl } from '../src/v4/chart-helper.js';

const R = new URL('..', import.meta.url).pathname.replace(/\/$/, '');
const fail = [];
const ok = (name, cond, extra = '') => {
  console.log(`${cond ? 'PASS' : 'FAIL'} ${name}${extra && !cond ? ` — ${extra}` : ''}`);
  if (!cond) {
    fail.push(name);
  }
};
const eq = (name, a, b) =>
  ok(
    name,
    JSON.stringify(a) === JSON.stringify(b),
    `${JSON.stringify(a)} !== ${JSON.stringify(b)}`
  );

const TODAY = '2026-09-11';
const emps = new Set(EMPLOYEES.map(e => e.code));

// ── §1 workforce ──────────────────────────────────────────────────────────
eq('t2-st-counts', headcountByStatus(EMPLOYEES), {
  active: 22,
  probation: 1,
  'on-leave': 1,
  exited: 2,
  huroob: 1,
  other: 0
});
ok(
  't2-exits-dated',
  EMPLOYEES.filter(e => e.st === 'exited').every(e => e.exitDate && e.exitReason && e.exitReasonAr)
);
ok(
  't2-huroob-cased',
  EMPLOYEES.filter(e => e.st === 'huroob').length === 1 &&
    EMPLOYEES.every(e => (e.st === 'huroob') === !!(e.reportedAt && e.legalNote))
);
eq('t2-nitaqat-excludes', nitaqatEstimate(EMPLOYEES).total, 24);
eq('t2-separation', separationSeries(EMPLOYEES, ONBOARDING, TODAY), {
  labels: ['04/26', '05/26', '06/26', '07/26', '08/26', '09/26'],
  hired: [0, 0, 0, 0, 1, 0],
  boarded: [0, 0, 0, 0, 0, 1],
  exited: [0, 0, 0, 1, 1, 0]
});
ok(
  't2-tenure-covers',
  (() => {
    const b = tenureBuckets(EMPLOYEES, TODAY);
    return b.lt1 + b.y1_3 + b.y3_5 + b.gte5 === 24;
  })()
);

// ── §2 leave ───────────────────────────────────────────────────────────────
eq('t2-vac-windows', leaveWindows(LEAVE_REQUESTS, TODAY), {
  onVacation: ['LV-2026-032', 'LV-2026-034'],
  departing: ['LV-2026-033'],
  returning: ['LV-2026-032', 'LV-2026-034']
});
eq('t2-return-stats', returnStats(LEAVE_REQUESTS), { total: 5, onTime: 3, overdue: 2, pct: 60 });
{
  const elig = eligibleForVacation(EMPLOYEES, LEAVE_REQUESTS, TODAY);
  eq('t2-elig-count', elig.length, 19);
  ok(
    't2-elig-excludes',
    !elig.some(x =>
      ['EMP-0021', 'EMP-0025', 'EMP-0026', 'EMP-0027', 'EMP-0009', 'EMP-0014', 'EMP-0016', 'EMP-0019'].includes(x.code)
    )
  );
  ok('t2-elig-sorted', elig.every((x, i) => i === 0 || elig[i - 1].left >= x.left));
}
ok(
  't2-delay-reasons',
  LEAVE_REQUESTS.filter(r => r.returnStatus === 'overdue').every(
    r => r.delayReason && LEAVE_DELAY_REASONS.some(d => d.code === r.delayReason)
  ) && LEAVE_DELAY_REASONS.every(d => d.en && d.ar)
);

// ── §3 geo/demo ────────────────────────────────────────────────────────────
ok(
  't2-sites-6-geo',
  SITES.length === 6 && SITES.every(s => Number.isFinite(s.lat) && Number.isFinite(s.lng))
);
ok(
  't2-clients-geo',
  CLIENTS.every(c => Number.isFinite(c.lat) && Number.isFinite(c.lng))
);
ok(
  't2-emp-geo-fields',
  EMPLOYEES.every(
    e =>
      ['M', 'F'].includes(e.gender) &&
      Array.isArray(e.skills) &&
      e.skills.length >= 2 &&
      e.skills.length <= 4 &&
      e.skills.every(k => SKILLS.some(k2 => k2.code === k)) &&
      SPONSORS.some(p => p.id === e.sponsor)
  )
);
ok('t2-gender-mix', EMPLOYEES.some(e => e.gender === 'F') && EMPLOYEES.some(e => e.gender === 'M'));
ok('t2-sponsors-2', SPONSORS.length === 2 && SPONSORS.every(p => p.cr && p.nameEn && p.nameAr));
eq('t2-nats-6', [...new Set(EMPLOYEES.map(e => e.nat))].length, 6);
eq('t2-gender-4-23', [EMPLOYEES.filter(e => e.gender === 'F').length, EMPLOYEES.filter(e => e.gender === 'M').length], [4, 23]);
{
  const hc = {};
  ASSIGNMENTS.filter(a => a.status === 'active').forEach(a => { hc[a.site] = (hc[a.site] || 0) + 1; });
  eq('t2-site-hc', hc, { 'ST-003': 6, 'ST-001': 5, 'ST-002': 3, 'ST-004': 2, 'ST-005': 1, 'ST-006': 1 });
}
eq('t2-sponsor-split', [EMPLOYEES.filter(e => e.sponsor === 'HQ').length, EMPLOYEES.filter(e => e.sponsor === 'BR-JED').length], [25, 2]);
ok(
  't2-new-assigns-clean',
  ASSIGNMENTS.filter(a => a.id >= 'ASN-2026-015').every(a => {
    const p = AJEER_PERMITS.find(x => x.no === a.ajeer);
    return a.ajeer && p && p.asn === a.id && emps.has(a.emp);
  })
);

// ── §4 transfers ───────────────────────────────────────────────────────────
eq('t2-transfer-stages', TRANSFERS.map(x => x.status).sort(), [
  'awaiting-release',
  'completed',
  'in-progress',
  'requested'
]);
eq('t2-deck', expiryDeck(EMPLOYEES, RESIDENCY_DOCS, TODAY), {
  iqama: { valid: 17, expiring: 2, expired: 0, missing: 0 },
  passport: { valid: 19, expiring: 0, expired: 0, missing: 0 },
  insurance: { valid: 15, expiring: 2, expired: 1, missing: 1 }
});
eq('t2-iqama-buckets', iqamaBuckets(EMPLOYEES, TODAY), { le30: 1, le60: 1, le90: 2 });
eq('t2-contracts-90', contractsEnding(CONTRACTS, 90, TODAY).map(c => `${c.id}:${c.days}`), [
  'CT-2026-005:34'
]);

// ── §5 accounts & performance ─────────────────────────────────────────────
eq(
  't2-perf-synth',
  perfIndex('X', {
    attendance: Array.from({ length: 10 }, (_, i) => ({
      emp: 'X',
      status: i < 8 ? 'present' : 'late'
    })),
    goals: [{ owner: 'X', status: 'active', target: 98, current: 96.5 }],
    feedback: [{ to: 'X', kind: 'praise' }],
    timesheets: [{ status: 'approved', lines: [{ emp: 'X', otH: 2 }] }]
  }),
  { index: 95.5, signals: 4, att: 90, goals: 98.5, feedback: 100, ot: 100 }
);
eq(
  't2-perf-att-only',
  perfIndex('Y', { attendance: [{ emp: 'Y', status: 'present' }] }).index,
  100
);
eq('t2-perf-none', perfIndex('Z', {}), null);
{
  const d = { attendance: ATTENDANCE, goals: GOALS, feedback: FEEDBACK, timesheets: TIMESHEETS };
  const r = perfRanking(d);
  eq('t2-perf-crew-18', r.length, 18);
  ok(
    't2-perf-range',
    r.every(x => x.index >= 0 && x.index <= 100 && x.signals >= 1)
  );
  ok(
    't2-perf-sorted',
    r.every((x, i) => i === 0 || r[i - 1].index >= x.index)
  );
  const trend = cohortTrend(
    r.slice(0, 5).map(x => x.code),
    ATTENDANCE
  );
  ok(
    't2-perf-trend',
    trend.length >= 5 && trend.every((t, i) => i === 0 || trend[i - 1].date <= t.date)
  );
}
ok(
  't2-expense-cats',
  EXPENSES.every(x => EXPENSE_CATEGORIES.some(c => c.code === x.cat)) && EXPENSE_CATEGORIES.every(c => c.en && c.ar)
);

// ── §6 tasks ───────────────────────────────────────────────────────────────
ok('t2-tasks-8', TASKS.length === 8);
ok(
  't2-tasks-shape',
  TASKS.every(
    x => x.titleEn && x.titleAr && x.due && ['high', 'medium', 'low'].includes(x.priority) && x.link
  )
);
ok(
  't2-tasks-links-resolve',
  TASKS.every(x => {
    const page = x.link.split('?')[0];
    try {
      readFileSync(`${R}/production/${page}`, 'utf8');
      return true;
    } catch (_e) {
      return false;
    }
  })
);
ok(
  't2-tasks-overdue-demo',
  TASKS.some(x => x.due < TODAY && !x.done)
);

// ── Zone A money ──────────────────────────────────────────────────────────
{
  const money = execMoney({
    employees: EMPLOYEES,
    assignments: ASSIGNMENTS,
    invoices: INVOICES,
    targetPct: 0,
    todayIso: TODAY
  });
  eq(
    't2-money-core',
    {
      revenue: money.revenue,
      crewCost: money.crewCost,
      crewMargin: money.crewMargin,
      crewMarginPct: money.crewMarginPct,
      overhead: money.overhead,
      crewHeads: money.crewHeads,
      overheadHeads: money.overheadHeads,
      net: money.margin,
      receivables: money.receivables
    },
    {
      revenue: 64600,
      crewCost: 63811,
      crewMargin: 789,
      crewMarginPct: 1.22,
      overhead: 50697.88,
      crewHeads: 18,
      overheadHeads: 6,
      net: -49908.88,
      receivables: 6574.17
    }
  );
  eq(
    't2-money-runway',
    money.runway.map(r => `${r.month}:${r.revenue}`),
    [
      '2026-09:64600',
      '2026-10:64600',
      '2026-11:64600',
      '2026-12:64600',
      '2027-01:47000',
      '2027-02:41400'
    ]
  );
  eq(
    't2-money-clients',
    money.perClient.map(c => `${c.id}:${c.heads}:${c.revenue}:${c.margin}`),
    ['CL-002:7:23200:555', 'CL-001:11:41400:234']
  );
}

// ── chart RTL policy ──────────────────────────────────────────────────────
eq('t2-rtl-hbar', applyRtl({ xAxis: {} }, 'ar', 'hbar'), { xAxis: { inverse: true } });
eq(
  't2-rtl-hbar-radius',
  applyRtl({ xAxis: {}, series: [{ itemStyle: { borderRadius: [0, 4, 4, 0] } }] }, 'ar', 'hbar'),
  { xAxis: { inverse: true }, series: [{ itemStyle: { borderRadius: [4, 0, 0, 4] } }] }
);
eq('t2-rtl-time-kept', applyRtl({ xAxis: {} }, 'ar', 'time'), { xAxis: {} });
eq('t2-rtl-en-kept', applyRtl({ xAxis: {} }, 'en', 'hbar'), { xAxis: {} });

// ── files referenced exist (helpers land with the dashboard build) ─────────
ok('t2-seed-file-present', readdirSync(`${R}/src/v4`).includes('hr-seed.js'));

// ── §6 ticker alerts ────────────────────────────────────────────────────────
{
  const a = tickerAlerts(
    { ajeerPermits: AJEER_PERMITS, assignments: ASSIGNMENTS, employees: EMPLOYEES, tasks: TASKS },
    { nitaqat: {} },
    TODAY
  );
  eq(
    't2-ticker-seed',
    [
      a.staleReturns.length,
      a.expiringPermits,
      a.expiringIqamas,
      a.followups,
      a.overdue,
      a.nitaqatBelow
    ],
    [1, 1, 1, 6, 1, false]
  );
  eq('t2-ticker-stale', a.staleReturns[0].no, 'AJ-2025-318');
  eq(
    't2-ticker-missing-exp',
    tickerAlerts(
      { ajeerPermits: [{ no: 'AJ-X', status: 'active', exp: '' }] },
      {},
      TODAY
    ).expiringPermits,
    0
  );
}
eq(
  't2-ticker-synth',
  tickerAlerts(
    {
      ajeerPermits: [
        { no: 'AJ-1', emp: 'E1', status: 'returned', history: [{ event: 'returned', at: '2026-09-01' }] },
        { no: 'AJ-2', emp: 'E9', status: 'returned', history: [{ event: 'returned', at: '2026-09-01' }] }
      ],
      assignments: [{ emp: 'E1', status: 'active' }],
      employees: [],
      tasks: [
        { due: '2026-09-12', done: false },
        { due: '2026-10-01', done: false },
        { due: '2026-09-10', done: true }
      ]
    },
    { nitaqat: { target: 30 } },
    TODAY
  ),
  {
    staleReturns: [{ no: 'AJ-1', emp: 'E1', at: '2026-09-01' }],
    expiringPermits: 0,
    expiringIqamas: 0,
    followups: 1,
    overdue: 0,
    nitaqatBelow: true,
    today: TODAY
  }
);

console.log(
  fail.length ? `\nT2 SEED AUDIT: ${fail.length} FAILURES` : '\nALL T2 SEED CHECKS PASSED'
);
process.exit(fail.length ? 1 : 0);
