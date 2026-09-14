// HR + Operations — CEO Command Center (hr_dashboard.html). Header strip +
// Zone A business health + §1 workforce dynamics + legacy stat cards, alerts,
// deployment mix and expiries (later zones subsume the legacy cards). Idempotent.

import { ICONS } from './shell-render.js';
import { t, currentLang, LANG_EVENT, applyI18n } from './i18n.js';
import { fmtSAR, fmtDate, fmtHijri, L} from './hr-locale.js';
import {
  daysUntil,
  nitaqatEstimate,
  ajeerCheck,
  getSettings,
  execMoney,
  headcountByStatus,
  tenureBuckets,
  separationSeries,
  leaveWindows,
  returnStats,
  eligibleForVacation,
  expiryDeck,
  iqamaBuckets,
  contractsEnding,
  permitStatus,
  invoiceTotals,
  perfRanking,
  cohortTrend,
  tickerAlerts
} from './hr-statutory.js';
import { getSeed } from './hr-api.js';
import { CLIENTS, LEAVE_DELAY_REASONS, SITES, SKILLS, SPONSORS, PROFESSIONS } from './hr-seed.js';
import { renderEchart } from './chart-helper.js';
import { escapeHtml as esc } from './markup.js';

let booted = false;
let analyticsRange = '6M';
let analyticsSegment = 'all';

function applyAnalyticsFilters() {
  const meta = document.getElementById('analytics-meta');
  if (meta) {
    const emps = getSeed('employees') || [];
    const base = analyticsSegment === 'saudi' ? emps.filter(e=>e.saudi) : analyticsSegment === 'expat' ? emps.filter(e=>!e.saudi) : analyticsSegment === 'ops' ? emps.filter(e=>e.dept==='OPS') : analyticsSegment === 'hr' ? emps.filter(e=>e.dept==='HR') : emps;
    meta.textContent = `${analyticsRange} · ${base.length} heads · ${analyticsSegment}`;
  }
}

function bindAnalyticsBar() {
  document.querySelectorAll('[data-range]').forEach(b => {
    b.addEventListener('click', () => {
      analyticsRange = b.dataset.range;
      document.querySelectorAll('[data-range]').forEach(x=>x.classList.remove('active'));
      b.classList.add('active');
      applyAnalyticsFilters();
    });
  });
  const sel = document.getElementById('analytics-segment');
  if (sel) sel.addEventListener('change', () => { analyticsSegment = sel.value; applyAnalyticsFilters(); });
  const exp = document.getElementById('analytics-export');
  if (exp) exp.addEventListener('click', () => {
    import('./import-export.js').then(m => {
      const emps = getSeed('employees')||[];
      const rows = emps.map(e=>({ code:e.code, name:e.nameEn, nat:e.nat, status:e.st, join:e.join }));
      m.exportData(rows, 'analytics.csv');
    });
  });
  const ref = document.getElementById('analytics-refresh');
  if (ref) ref.addEventListener('click', () => location.reload());
  applyAnalyticsFilters();
}

function alerts() {
  const out = [];
  const emps = getSeed('employees');
  getSeed('assignments').forEach(a => {
    const e = emps.find(x => x.code === a.emp);
    const c = CLIENTS.find(x => x.id === a.client);
    if (!e) {
      return;
    }
    const g = ajeerCheck(a, e, c);
    if (!g.ok) {
      out.push({
        sev:
          g.reasons.includes('no-ajeer-ref') || g.reasons.includes('ajeer-expired')
            ? 'red'
            : 'yellow',
        text: `${a.id} · ${currentLang() === 'ar' ? e.nameAr : e.nameEn} — ${g.reasons.join(', ')}`,
        href: `hr_employee.html?code=${e.code}`
      });
    }
  });
  emps
    .filter(e => !e.saudi && e.st === 'active')
    .forEach(e => {
      if (!e.iqamaExp) {
        out.push({
          sev: 'red',
          text: `${L('Missing Iqama expiry', 'تاريخ انتهاء الإقامة مفقود')} · ${currentLang() === 'ar' ? e.nameAr : e.nameEn}`,
          href: `hr_employee.html?code=${e.code}`
        });
        return;
      }
      const d = daysUntil(e.iqamaExp);
      if (d <= 90) {
        out.push({
          sev: d <= 30 ? 'red' : 'yellow',
          text: `${L('Iqama', 'الإقامة')} ${fmtDate(e.iqamaExp)} (${d}${L('d', 'ي')}) · ${currentLang() === 'ar' ? e.nameAr : e.nameEn}`,
          href: `hr_employee.html?code=${e.code}`
        });
      }
    });
  const rank = { red: 0, yellow: 1 };
  return out.sort((a, b) => rank[a.sev] - rank[b.sev]);
}
function renderAlerts() {
  const el = document.getElementById('hr-alerts');
  if (!el) {
    return;
  }
  const items = alerts().slice(0, 8);
  el.innerHTML = items.length
    ? items
        .map(
          a => `
    <a class="hr-alert hr-alert-${a.sev}" href="${a.href}">
      <span class="status status-${a.sev}">${a.sev === 'red' ? t('common.urgent') : t('common.attention')}</span>
      <span>${a.text}</span>
    </a>`
        )
        .join('')
    : `<div class="hr-empty">${t('common.noData')}</div>`;
}

function tableOpen(label, headers = []) {
  const head = headers.length
    ? `<thead class="sr-only"><tr>${headers.map(h => `<th scope="col">${h}</th>`).join('')}</tr></thead>`
    : '';
  return `<div class="table-responsive"><table class="table hr-table" aria-label="${esc(label)}">${head}<tbody>`;
}

function renderExpiries() {
  const el = document.getElementById('hr-expiries');
  if (!el) {
    return;
  }
  const rows = getSeed('employees')
    .filter(e => !e.saudi && e.iqamaExp)
    .map(e => ({ e, d: daysUntil(e.iqamaExp) }))
    .filter(r => r.d <= 120)
    .sort((a, b) => a.d - b.d)
    .slice(0, 6);
  el.innerHTML = rows.length
    ? tableOpen(t('hr.dashboard.expiries'), [L('Worker', 'الموظف'), L('Expiry', 'الانتهاء'), t('common.status')]) +
      rows
        .map(
          ({ e, d }) => `<tr>
      <td data-label="${L('Worker', 'الموظف')}"><a href="hr_employee.html?code=${e.code}">${currentLang() === 'ar' ? e.nameAr || e.nameEn : e.nameEn}</a></td>
      <td data-label="${L('Expiry', 'الانتهاء')}">${fmtDate(e.iqamaExp)}</td>
      <td data-label="${t('common.status')}"><span class="status status-${d <= 30 ? 'red' : 'yellow'}">${d}${L('d', 'ي')}</span></td>
    </tr>`
        )
        .join('') +
      '</tbody></table></div>'
    : `<div class="hr-empty">${t('common.noData')}</div>`;
}

function renderMix() {
  const el = document.getElementById('hr-deploy');
  if (!el) {
    return;
  }
  const assigns = getSeed('assignments');
  const emps = getSeed('employees');
  const bench = emps.filter(
    e => !e.saudi && e.st === 'active' && !assigns.some(a => a.emp === e.code)
  ).length;
  const rows = CLIENTS.map((c, i) => ({
    label: currentLang() === 'ar' ? c.nameAr : c.nameEn,
    n: assigns.filter(a => a.client === c.id).length,
    color: ['var(--primary)', 'var(--blue)', 'var(--purple)'][i % 3]
  }));
  rows.push({ label: L('Bench', 'احتياطي'), n: bench, color: 'var(--yellow)' });
  const max = Math.max(1, ...rows.map(r => r.n));
  el.innerHTML = rows
    .map(
      r => `
    <div class="hr-bar-row">
      <div class="hr-bar-top"><span>${r.label}</span><strong>${r.n}</strong></div>
      <div class="hr-bar-track"><div class="hr-bar-fill" style="width:${Math.round((r.n / max) * 100)}%;background:${r.color}"></div></div>
    </div>`
    )
    .join('');
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function setupSteps() {
  const s = getSettings();
  return [
    { done: !!(s.company.cr && !String(s.company.cr).includes('XXX')) },
    { done: !!(s.nitaqat.activity && s.nitaqat.target > 0) },
    { done: s.licence.confirmed === true }
  ];
}

function renderHead() {
  const el = document.getElementById('dash-head');
  if (!el) {
    return;
  }
  const today = todayIso();
  const s = getSettings();
  const n = nitaqatEstimate(getSeed('employees'), s.nitaqat.target || 0);
  const steps = setupSteps();
  const left = steps.filter(x => !x.done).length;
  const tone = s.nitaqat.target > 0 ? (n.pct >= s.nitaqat.target ? 'green' : 'yellow') : 'blue';
  el.innerHTML = `
    <div class="dash-dates">
      <strong>${esc(fmtHijri(today))}</strong>
      <span>${esc(fmtDate(today))}</span>
    </div>
    <div class="dash-chips">
      <span class="status status-${tone}">${esc(t('hr.dashboard.nitaqat'))} ${esc(String(n.pct))}%${s.nitaqat.target > 0 ? ` / ${esc(String(s.nitaqat.target))}%` : ''}</span>
      ${
  left
    ? `<a class="status status-yellow" href="hr_settings.html" style="text-decoration:none">${left} ${esc(t('hr.dashboard.setupSteps'))}</a>`
    : `<span class="status status-green">${esc(L('All set', 'تم الإعداد'))}</span>`
}
    </div>`;
}

function marginTone(pct) {
  if (pct >= 15) {
    return 'green';
  }
  if (pct >= 5) {
    return 'yellow';
  }
  return 'red';
}

function sparkBars(values, color) {
  const max = Math.max(...values, 0);
  return values
    .map(
      v =>
        `<div class="bar" style="height:${max > 0 ? Math.max(8, Math.round((v / max) * 100)) : 8}%;${color ? `background:${esc(color)};` : ''}"></div>`
    )
    .join('');
}

// Trailing `n` calendar months ending with the month of `endIso`
// (YYYY-MM-DD), oldest first: ['2026-04', …, '2026-09'].
function trailingMonths(n, endIso) {
  const [y, m] = endIso.slice(0, 7).split('-').map(Number);
  const out = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(y, m - 1 - i, 1);
    out.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  }
  return out;
}

function moneyCard({ icon, color, label, value, sub, href, change, spark, sparkColor, bar }) {
  const arrow =
    change && change.dir === 'down'
      ? '<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 3v6M3 6l3 3 3-3"/></svg>'
      : '<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9V3M3 6l3-3 3 3"/></svg>';
  return `
    <a class="card hr-card-link" href="${esc(href)}">
      <div class="stat">
        <div class="stat-icon ${esc(color)}">${ICONS[icon] || ''}</div>
        <div class="stat-content">
          <div class="stat-label">${esc(label)}</div>
          <div class="stat-value-row"><span class="stat-value">${esc(value)}</span>${change ? `<span class="stat-change ${change.dir}">${arrow}${esc(change.text)}</span>` : ''}</div>
          <div class="stat-subtext">${esc(sub)}</div>
        </div>
        ${spark && spark.length ? `<div class="stat-spark">${sparkBars(spark, sparkColor)}</div>` : ''}
      </div>
      ${bar ? `<div style="padding:0 16px 12px"><div class="progress-thin"><div class="bar" style="width:${bar.pct}%;background:${esc(bar.color)}"></div></div></div>` : ''}
    </a>`;
}

function clientName(id) {
  const c = CLIENTS.find(x => x.id === id);
  if (!c) {
    return id;
  }
  return currentLang() === 'ar' ? c.nameAr || c.nameEn : c.nameEn;
}

function renderZoneA() {
  if (!document.getElementById('money-cards')) {
    return;
  }
  const s = getSettings();
  const money = execMoney({
    employees: getSeed('employees'),
    assignments: getSeed('assignments'),
    invoices: getSeed('invoices'),
    targetPct: s.nitaqat.target || 0,
    todayIso: todayIso()
  });
  const tone = marginTone(money.crewMarginPct);
  // Monthly billed revenue, oldest first — sparkline + MoM badge render only
  // when the seed actually spans months (no fake history).
  const revByMonth = new Map();
  for (const r of getSeed('invoices')) {
    const m = String(r.month || '').slice(0, 7);
    if (!m) {continue;}
    revByMonth.set(m, (revByMonth.get(m) || 0) + invoiceTotals(r.lines || []).total);
  }
  const revMonths = [...revByMonth.keys()].sort();
  const revSpark = revMonths.length >= 3 ? revMonths.map(m => revByMonth.get(m)) : null;
  let revChange = null;
  if (revMonths.length >= 2) {
    const cur = revByMonth.get(revMonths[revMonths.length - 1]);
    const prev = revByMonth.get(revMonths[revMonths.length - 2]);
    if (prev > 0) {
      const pct = Math.round(((cur - prev) / prev) * 100);
      revChange = { dir: pct >= 0 ? 'up' : 'down', text: `${pct >= 0 ? '+' : ''}${pct}%` };
    }
  }
  // Margin vs the 15% healthy threshold: badge + progress bar.
  const marginPts = Math.round((money.crewMarginPct - 15) * 10) / 10;
  const marginChange = {
    dir: marginPts >= 0 ? 'up' : 'down',
    text: `${marginPts >= 0 ? '+' : ''}${marginPts} ${t('hr.dashboard.vsTarget')}`
  };
  const toneVar = tone === 'green' ? 'var(--green)' : tone === 'yellow' ? 'var(--yellow)' : 'var(--red)';
  document.getElementById('money-cards').innerHTML =
    moneyCard({
      icon: 'wallet',
      color: 'green',
      label: t('hr.dashboard.revenue'),
      value: fmtSAR(money.revenue),
      sub: `${money.crewHeads} ${t('hr.dashboard.heads')}`,
      href: 'hr_client_dashboard.html',
      change: revChange,
      spark: revSpark,
      sparkColor: 'var(--green)'
    }) +
    moneyCard({
      icon: 'briefcase',
      color: 'blue',
      label: t('hr.dashboard.crewCost'),
      value: fmtSAR(money.crewCost),
      sub: `${L('Pay + levy + GOSI', 'الأجر + المقابل + التأمينات')}`,
      href: 'hr_payroll.html'
    }) +
    moneyCard({
      icon: 'flag',
      color: tone,
      label: t('hr.dashboard.crewMargin'),
      value: fmtSAR(money.crewMargin),
      sub: `${money.crewMarginPct}%`,
      href: 'hr_client_dashboard.html',
      change: marginChange,
      bar: { pct: Math.max(0, Math.min(100, Math.round((money.crewMarginPct / 15) * 100))), color: toneVar }
    }) +
    moneyCard({
      icon: 'doc',
      color: money.receivables > 0 ? 'yellow' : 'green',
      label: t('hr.dashboard.receivables'),
      value: fmtSAR(money.receivables),
      sub: L('Unpaid invoices', 'فواتير غير مسددة'),
      href: 'hr_invoices.html'
    });

  const meta = document.getElementById('zone-money-meta');
  if (meta) {
    meta.innerHTML = `<span class="status status-${tone}">${money.crewMarginPct}%</span>`;
  }

  // (Runway chart archived to removed/runway-chart.js — card deleted.)

  const tc = document.getElementById('top-clients');
  if (tc) {
    tc.innerHTML =
      tableOpen(t('hr.dashboard.topClients'), [L('Client', 'العميل'), t('hr.dashboard.revenue'), t('hr.dashboard.crewMargin')]) +
      money.perClient
        .map(
          c => `<tr>
      <td><strong>${esc(clientName(c.id))}</strong><br><small style="color:var(--text-secondary)">${c.heads} ${esc(t('hr.dashboard.heads'))}</small></td>
      <td dir="ltr" style="text-align:end">${esc(fmtSAR(c.revenue))}</td>
      <td dir="ltr" style="text-align:end"><span class="status status-${c.margin >= 0 ? 'green' : 'red'}">${esc(fmtSAR(c.margin))}</span></td>
    </tr>`
        )
        .join('') +
      '</tbody></table></div>';
  }

  const net = document.getElementById('money-net');
  if (net) {
    net.innerHTML = `
      <div class="hr-bar-row">
        <div class="hr-bar-top"><span>${esc(t('hr.dashboard.overhead'))}</span><strong>${esc(fmtSAR(money.overhead))}</strong></div>
        <div class="stat-subtext">${money.overheadHeads} ${esc(t('hr.dashboard.heads'))}</div>
      </div>
      <div class="hr-bar-row">
        <div class="hr-bar-top"><span>${esc(t('hr.dashboard.net'))}</span><strong class="${money.margin >= 0 ? 'text-success' : 'text-danger'}">${esc(fmtSAR(money.margin))}</strong></div>
      </div>
      ${
  money.crewMarginPct < 5
    ? `<a class="hr-alert hr-alert-red" href="hr_client_dashboard.html"><span class="status status-red">${esc(t('common.urgent'))}</span><span>${esc(t('hr.dashboard.thinMargin'))}</span></a>`
    : ''
}`;
  }

  const formula = document.getElementById('money-formula');
  if (formula) {
    formula.textContent =
      `${t('hr.dashboard.formulaCrew')} (${money.crewHeads}). ` +
      `${t('hr.dashboard.formulaNet')} (${money.overheadHeads}). ` +
      (!money.bandOk ? t('hr.dashboard.levyStd') : '');
  }
}

function renderS1() {
  if (!document.getElementById('chart-headcount')) {
    return;
  }
  const emps = getSeed('employees');
  const hc = headcountByStatus(emps);
  const meta = document.getElementById('zone-workforce-meta');
  if (meta) {
    meta.textContent = `${emps.length} ${t('hr.dashboard.heads')}`;
  }

  // Huroob alert card (red, links the case file + compliance).
  const hc2 = document.getElementById('huroob-card');
  if (hc2) {
    const flagged = emps.filter(e => e.st === 'huroob');
    hc2.innerHTML = flagged.length
      ? `<a class="hr-alert hr-alert-red" href="hr_employee.html?code=${encodeURIComponent(flagged[0].code)}" style="margin-bottom:12px">
          <span class="status status-red">${flagged.length} × ${esc(t('status.huroob'))}</span>
          <span><strong>${esc(t('hr.dashboard.huroobTitle'))}</strong> — ${flagged.map(e => esc(currentLang() === 'ar' ? e.nameAr || e.nameEn : e.nameEn)).join(currentLang() === 'ar' ? '، ' : ', ')} · ${esc(flagged[0].reportedAt || '')}</span>
        </a>`
      : '';
  }

  // Headcount ring (huroob tracked separately in the card above).
  const ring = [
    { k: 'active', v: hc.active, c: t => t.green },
    { k: 'on-leave', v: hc['on-leave'], c: t => t.yellow },
    { k: 'probation', v: hc.probation, c: t => t.blue },
    { k: 'exited', v: hc.exited, c: t => t.textMuted }
  ];
  const counted = ring.reduce((s, r) => s + r.v, 0);
  renderEchart(
    document.getElementById('chart-headcount'),
    tk => ({
      tooltip: { trigger: 'item' },
      legend: { bottom: 0, textStyle: { color: tk.textMuted, fontSize: 11 } },
      series: [
        {
          type: 'pie',
          radius: ['55%', '78%'],
          center: ['50%', '44%'],
          label: { show: false },
          emphasis: { label: { show: true, fontSize: 13, fontWeight: 600 } },
          data: ring.map(r => ({
            name: t(`status.${r.k}`),
            value: r.v,
            itemStyle: { color: r.c(tk) }
          }))
        }
      ]
    }),
    L(
      `Headcount ${counted}: ${hc.active} active, ${hc['on-leave']} on leave, ${hc.probation} in probation, ${hc.exited} exited. ${hc.huroob} huroob case tracked separately.`,
      `القوى العاملة ${counted}: ${hc.active} نشط، ${hc['on-leave']} في إجازة، ${hc.probation} تحت التجربة، ${hc.exited} منتهية خدماتهم. ${hc.huroob} بلاغ هروب يُتابع بشكل منفصل.`
    )
  );

  // Tenure bars (horizontal → mirrored in RTL).
  const tb = tenureBuckets(emps, todayIso());
  const bands = [
    { k: 'tBand1', v: tb.lt1 },
    { k: 'tBand2', v: tb.y1_3 },
    { k: 'tBand3', v: tb.y3_5 },
    { k: 'tBand4', v: tb.gte5 }
  ];
  renderEchart(
    document.getElementById('chart-tenure'),
    tk => ({
      tooltip: { trigger: 'axis' },
      grid: { left: 8, right: 8, top: 8, bottom: 8 },
      xAxis: { type: 'value', splitLine: { lineStyle: { color: tk.borderLight, type: [4, 3] } } },
      yAxis: {
        type: 'category',
        data: bands.map(b => t(`hr.dashboard.${b.k}`)),
        axisLabel: { color: tk.textMuted, fontSize: 11 }
      },
      series: [
        {
          type: 'bar',
          data: bands.map(b => b.v),
          itemStyle: { color: tk.blue, borderRadius: [0, 4, 4, 0] },
          label: { show: true, position: 'right', color: tk.textMuted, fontSize: 11 }
        }
      ]
    }),
    L(
      `Tenure: ${bands.map(b => `${t(`hr.dashboard.${b.k}`)} ${b.v}`).join(', ')}.`,
      `مدد الخدمة: ${bands.map(b => `${t(`hr.dashboard.${b.k}`)} ${b.v}`).join('، ')}.`
    ),
    { rtl: 'hbar' }
  );

  // Separation: hired / boarded / exited per month, last 6.
  const sep = separationSeries(emps, getSeed('onboarding'), todayIso());
  const { labels, hired, boarded, exited } = sep;
  renderEchart(
    document.getElementById('chart-separation'),
    tk => ({
      tooltip: { trigger: 'axis' },
      legend: { bottom: 0, textStyle: { color: tk.textMuted, fontSize: 11 } },
      grid: { left: 8, right: 8, top: 12, bottom: 52 },
      xAxis: {
        type: 'category',
        data: labels,
        axisLabel: { color: tk.textMuted, fontSize: 10 }
      },
      yAxis: { type: 'value', splitLine: { lineStyle: { color: tk.borderLight, type: [4, 3] } } },
      series: [
        {
          name: t('hr.dashboard.hired'),
          type: 'bar',
          data: hired,
          itemStyle: { color: tk.green, borderRadius: [4, 4, 0, 0] }
        },
        {
          name: t('hr.dashboard.boarded'),
          type: 'bar',
          data: boarded,
          itemStyle: { color: tk.blue, borderRadius: [4, 4, 0, 0] }
        },
        {
          name: t('hr.dashboard.exitedW'),
          type: 'bar',
          data: exited,
          itemStyle: { color: tk.red, borderRadius: [4, 4, 0, 0] }
        }
      ]
    }),
    L(
      `Last 6 months: hired ${hired.reduce((a, b) => a + b, 0)}, boarded ${boarded.reduce((a, b) => a + b, 0)}, exited ${exited.reduce((a, b) => a + b, 0)}.`,
      `آخر ٦ أشهر: المعينون ${hired.reduce((a, b) => a + b, 0)}، الملتحقون ${boarded.reduce((a, b) => a + b, 0)}، الخارجون ${exited.reduce((a, b) => a + b, 0)}.`
    ),
    { rtl: 'time' }
  );
}

function empName(code) {
  const e = getSeed('employees').find(x => x.code === code);
  if (!e) {
    return code;
  }
  return currentLang() === 'ar' ? e.nameAr || e.nameEn : e.nameEn;
}

function delayReasonName(code) {
  const d = LEAVE_DELAY_REASONS.find(x => x.code === code);
  if (!d) {
    return code;
  }
  return currentLang() === 'ar' ? d.ar : d.en;
}

function renderS2() {
  if (!document.getElementById('vac-cards')) {
    return;
  }
  const reqs = getSeed('leaveRequests');
  const byId = id => reqs.find(r => r.id === id);
  const w = leaveWindows(reqs, todayIso());

  // Departures per trailing month (by start date) — sparkline + MoM badge.
  // Returns per trailing month (by end date, approved only) — MoM badge.
  const months6 = trailingMonths(6, todayIso());
  const [prevMo, curMo] = trailingMonths(2, todayIso());
  const depByMonth = new Map(months6.map(m => [m, 0]));
  const retByMonth = new Map(months6.map(m => [m, 0]));
  for (const r of reqs) {
    const fromMo = String(r.from || '').slice(0, 7);
    if (depByMonth.has(fromMo)) {depByMonth.set(fromMo, depByMonth.get(fromMo) + 1);}
    if (r.status === 'approved') {
      const toMo = String(r.to || '').slice(0, 7);
      if (retByMonth.has(toMo)) {retByMonth.set(toMo, retByMonth.get(toMo) + 1);}
    }
  }
  const momBadge = (cur, prev) => {
    const d = cur - prev;
    if (d === 0) {return null;}
    return { dir: d > 0 ? 'up' : 'down', text: `${d > 0 ? '+' : ''}${d} ${t('hr.dashboard.vsLastMo')}` };
  };

  document.getElementById('vac-cards').innerHTML =
    moneyCard({
      icon: 'calendar',
      color: 'blue',
      label: t('hr.dashboard.vacNow'),
      value: String(w.onVacation.length),
      sub: t('hr.dashboard.heads'),
      href: 'hr_leave.html'
    }) +
    moneyCard({
      icon: 'clock',
      color: 'yellow',
      label: t('hr.dashboard.vacDeparting'),
      value: String(w.departing.length),
      sub: t('hr.dashboard.heads'),
      href: 'hr_leave.html',
      change: momBadge(depByMonth.get(curMo), depByMonth.get(prevMo)),
      spark: months6.map(m => depByMonth.get(m)),
      sparkColor: 'var(--yellow)'
    }) +
    moneyCard({
      icon: 'inbox',
      color: 'green',
      label: t('hr.dashboard.vacReturning'),
      value: String(w.returning.length),
      sub: t('hr.dashboard.heads'),
      href: 'hr_leave.html',
      change: momBadge(retByMonth.get(curMo), retByMonth.get(prevMo))
    });

  const meta = document.getElementById('zone-leave-meta');
  if (meta) {
    meta.innerHTML = `<span class="status status-blue">${w.onVacation.length} ${esc(t('hr.dashboard.vacNow'))}</span>`;
  }

  const groups = [
    { ids: w.onVacation, label: t('hr.dashboard.vacNow') },
    { ids: w.departing, label: t('hr.dashboard.vacDeparting') },
    { ids: w.returning, label: t('hr.dashboard.vacReturning') }
  ];
  document.getElementById('vac-list').innerHTML = groups
    .map(
      g =>
        `<div class="vac-group"><div class="vac-group-head"><strong>${esc(g.label)}</strong><span class="status status-blue">${g.ids.length}</span></div>` +
        (g.ids.length
          ? tableOpen(g.label, [L('Worker', 'الموظف'), L('Period', 'الفترة'), t('common.days')]) +
            g.ids
              .map(id => byId(id))
              .filter(Boolean)
              .map(
                r => `<tr>
        <td><a href="hr_employee.html?code=${encodeURIComponent(r.emp)}">${esc(empName(r.emp))}</a><br><small style="color:var(--text-secondary)" dir="ltr">${esc(r.id)}</small></td>
        <td dir="ltr" style="text-align:end;white-space:nowrap">${esc(fmtDate(r.from))} → ${esc(fmtDate(r.to))}</td>
        <td dir="ltr" style="text-align:end;white-space:nowrap">${esc(String(r.days))} ${esc(t('common.days'))}</td>
      </tr>`
              )
              .join('') +
            '</tbody></table></div>'
          : `<div class="hr-empty">${esc(t('common.noData'))}</div>`) +
        '</div>'
    )
    .join('');

  const rs = returnStats(reqs);
  renderEchart(
    document.getElementById('chart-return'),
    tk => ({
      tooltip: { trigger: 'item' },
      legend: { bottom: 0, textStyle: { color: tk.textMuted, fontSize: 11 } },
      series: [
        {
          type: 'pie',
          radius: ['55%', '78%'],
          center: ['50%', '44%'],
          label: { show: false },
          emphasis: { label: { show: true, fontSize: 13, fontWeight: 600 } },
          data: [
            { name: t('status.on-time'), value: rs.onTime, itemStyle: { color: tk.green } },
            { name: t('status.overdue'), value: rs.overdue, itemStyle: { color: tk.red } }
          ]
        }
      ]
    }),
    L(
      `Return efficiency: ${rs.onTime} of ${rs.total} vacations ended on time (${rs.pct}%), ${rs.overdue} overdue.`,
      `كفاءة العودة: ${rs.onTime} من ${rs.total} إجازات انتهت في موعدها (${rs.pct}٪)، ${rs.overdue} متأخرة.`
    )
  );

  const overdue = reqs.filter(r => r.type === 'annual' && r.returnStatus === 'overdue');
  const ot = document.getElementById('overdue-table');
  if (ot) {
    ot.innerHTML = overdue.length
      ? tableOpen(t('hr.dashboard.overdueTitle'), [L('Worker', 'الموظف'), t('hr.dashboard.daysLate')]) +
        overdue
          .map(r => {
            const late = Math.max(
              0,
              Math.round((new Date(r.returnedAt) - new Date(r.to)) / 86400000)
            );
            return `<tr>
      <td><a href="hr_employee.html?code=${encodeURIComponent(r.emp)}">${esc(empName(r.emp))}</a><br><small style="color:var(--text-secondary)" dir="ltr">${esc(r.id)}</small></td>
      <td><span class="status status-red">${late} ${esc(t('hr.dashboard.daysLate'))}</span><br><small style="color:var(--text-secondary)">${esc(t('hr.dashboard.reason'))}: ${esc(delayReasonName(r.delayReason))}</small></td>
    </tr>`;
          })
          .join('') +
        '</tbody></table></div>'
      : `<div class="hr-empty">${esc(t('common.noData'))}</div>`;
  }

  const reasons = LEAVE_DELAY_REASONS.map(d => ({
    name: currentLang() === 'ar' ? d.ar : d.en,
    v: overdue.filter(r => r.delayReason === d.code).length
  })).filter(r => r.v > 0);
  renderEchart(
    document.getElementById('chart-delayreasons'),
    tk => ({
      tooltip: { trigger: 'axis' },
      grid: { left: 8, right: 8, top: 8, bottom: 8 },
      xAxis: { type: 'value', splitLine: { lineStyle: { color: tk.borderLight, type: [4, 3] } } },
      yAxis: {
        type: 'category',
        data: reasons.map(r => r.name),
        axisLabel: { color: tk.textMuted, fontSize: 11 }
      },
      series: [
        {
          type: 'bar',
          data: reasons.map(r => r.v),
          itemStyle: { color: tk.red, borderRadius: [0, 4, 4, 0] },
          label: { show: true, position: 'right', color: tk.textMuted, fontSize: 11 }
        }
      ]
    }),
    L(
      `Overdue by reason: ${reasons.map(r => `${r.name} ${r.v}`).join(', ') || 'none'}.`,
      `التأخر حسب السبب: ${reasons.map(r => `${r.name} ${r.v}`).join('، ') || 'لا يوجد'}.`
    ),
    { rtl: 'hbar' }
  );

  const elig = eligibleForVacation(getSeed('employees'), reqs, todayIso());
  const et = document.getElementById('eligible-table');
  if (et) {
    et.innerHTML =
      tableOpen(t('hr.dashboard.eligibleTitle'), [L('Worker', 'الموظف'), t('common.days'), L('Last vacation', 'آخر إجازة'), t('common.actions')]) +
      elig
        .map(
          x => `<tr>
    <td><a href="hr_employee.html?code=${encodeURIComponent(x.code)}">${esc(empName(x.code))}</a></td>
    <td dir="ltr" style="white-space:nowrap">${esc(String(x.left))} ${esc(t('common.days'))}</td>
    <td dir="ltr" style="white-space:nowrap">${x.lastTo ? esc(fmtDate(x.lastTo)) : '—'}</td>
    <td style="text-align:end"><a class="btn btn-outline btn-sm" href="hr_leave.html">${esc(t('hr.dashboard.request'))}</a></td>
  </tr>`
        )
        .join('') +
      '</tbody></table></div>';
  }
}

function profName(code) {
  const p = PROFESSIONS.find(x => x.code === code);
  if (!p) {
    return code;
  }
  return currentLang() === 'ar' ? p.ar : p.en;
}

function skillName(code) {
  const k = SKILLS.find(x => x.code === code);
  if (!k) {
    return code;
  }
  return currentLang() === 'ar' ? k.ar : k.en;
}

function siteName(id) {
  const s2 = SITES.find(x => x.id === id);
  if (!s2) {
    return id;
  }
  return currentLang() === 'ar' ? s2.nameAr || s2.nameEn : s2.nameEn;
}

function payableEmps() {
  return getSeed('employees').filter(e => e.st !== 'exited' && e.st !== 'huroob');
}

function activeAssigns() {
  return getSeed('assignments').filter(a => a.status === 'active');
}

function renderRoster(siteId) {
  const box = document.getElementById('site-roster');
  if (!box) {
    return;
  }
  box.dataset.site = siteId || '';
  const rows = activeAssigns().filter(a => !siteId || a.site === siteId);
  box.innerHTML =
    `<div class="vac-group-head"><strong>${esc(siteId ? siteName(siteId) : t('hr.dashboard.selectSite'))}</strong>` +
    (siteId ? `<span class="status status-blue">${rows.length}</span>` : '') +
    '</div>' +
    (siteId
      ? rows.length
        ? tableOpen(t('hr.dashboard.rosterTitle'), [L('Worker', 'الموظف'), L('Rate', 'الأجر')]) +
          rows
            .map(
              a => `<tr>
      <td><a href="hr_employee.html?code=${encodeURIComponent(a.emp)}">${esc(empName(a.emp))}</a><br><small style="color:var(--text-secondary)">${esc(profName((getSeed('employees').find(e => e.code === a.emp) || {}).prof))}</small></td>
      <td dir="ltr" style="text-align:end;white-space:nowrap">${esc(fmtSAR(a.rate))}</td>
    </tr>`
            )
            .join('') +
          '</tbody></table></div>'
        : `<div class="hr-empty">${esc(t('common.noData'))}</div>`
      : '');
}

function donutOption(tk, slices) {
  return {
    tooltip: { trigger: 'item' },
    legend: { bottom: 0, textStyle: { color: tk.textMuted, fontSize: 11 } },
    series: [
      {
        type: 'pie',
        radius: ['55%', '78%'],
        center: ['50%', '44%'],
        label: { show: false },
        emphasis: { label: { show: true, fontSize: 13, fontWeight: 600 } },
        data: slices.map(s2 => ({ name: s2.name, value: s2.v, itemStyle: { color: s2.c(tk) } }))
      }
    ]
  };
}

function renderS3() {
  const emps = payableEmps();
  const assigns = activeAssigns();
  const hcOf = id => assigns.filter(a => a.site === id).length;

  const cities = {};
  SITES.forEach(s2 => {
    cities[s2.city] = (cities[s2.city] || 0) + hcOf(s2.id);
  });
  const chipsBox = document.getElementById('city-chips');
  if (chipsBox) {
    chipsBox.innerHTML = Object.entries(cities)
      .sort((a, b) => b[1] - a[1])
      .map(([c, n]) => `<span class="status status-blue">${esc(c)} · ${n}</span>`)
      .join('');
  }

  const meta = document.getElementById('zone-geo-meta');
  if (meta) {
    meta.innerHTML = `<span class="status status-blue">${SITES.length} ${esc(t('hr.dashboard.mapSites'))} · ${Object.keys(cities).length} ${esc(L('cities', 'مدن'))}</span>`;
  }

  // Workforce map card archived — mount only if a #site-map host exists
  // (none on the dashboard anymore); roster/chips/meta below still fill.
  // This also keeps the 1.1MB dev / 148KB prod vendor-maps chunk off the page.
  const mapEl = document.getElementById('site-map');
  if (mapEl) {
    import('./map-helper.js').then(({ renderSiteMap }) => renderSiteMap(mapEl, {
      sites: SITES,
      clients: CLIENTS,
      headcountOf: hcOf,
      labels: {
        sites: t('hr.dashboard.mapSites'),
        clients: t('hr.dashboard.mapClients'),
        workers: t('hr.dashboard.mapWorkers')
      },
      onSelect: renderRoster
    }));
  }
  const roster = document.getElementById('site-roster');
  const current = roster && roster.dataset.site;
  const fallback = [...SITES].sort((a, b) => hcOf(b.id) - hcOf(a.id))[0];
  renderRoster(current && SITES.some(s2 => s2.id === current) ? current : fallback.id);

  const nats = {};
  emps.forEach(e => {
    nats[e.nat] = (nats[e.nat] || 0) + 1;
  });
  const palette = [tk => tk.primary, tk => tk.blue, tk => tk.purple, tk => tk.yellow, tk => tk.green, tk => tk.red, tk => tk.azure];
  const natSlices = Object.entries(nats)
    .sort((a, b) => b[1] - a[1])
    .map(([name, v], i) => ({ name, v, c: palette[i % palette.length] }));
  renderEchart(
    document.getElementById('chart-nationality'),
    tk => donutOption(tk, natSlices),
    L(
      `Nationalities (${emps.length}): ${natSlices.map(s2 => `${s2.name} ${s2.v}`).join(', ')}.`,
      `الجنسيات (${emps.length}): ${natSlices.map(s2 => `${s2.name} ${s2.v}`).join('، ')}.`
    )
  );

  const saudis = emps.filter(e => e.saudi).length;
  renderEchart(
    document.getElementById('chart-saudiexp'),
    tk =>
      donutOption(tk, [
        { name: t('hr.employees.saudi'), v: saudis, c: x => x.green },
        { name: t('hr.employees.expat'), v: emps.length - saudis, c: x => x.blue }
      ]),
    L(
      `Saudi ${saudis}, expat ${emps.length - saudis}.`,
      `سعودي ${saudis}، أجنبي ${emps.length - saudis}.`
    )
  );

  const females = emps.filter(e => e.gender === 'F').length;
  renderEchart(
    document.getElementById('chart-gender'),
    tk =>
      donutOption(tk, [
        { name: t('hr.dashboard.male'), v: emps.length - females, c: x => x.blue },
        { name: t('hr.dashboard.female'), v: females, c: x => x.purple }
      ]),
    L(
      `Gender: male ${emps.length - females}, female ${females}.`,
      `الجنس: ذكر ${emps.length - females}، أنثى ${females}.`
    )
  );

  const profs = {};
  emps.forEach(e => {
    profs[e.prof] = (profs[e.prof] || 0) + 1;
  });
  const profRows = Object.entries(profs).sort((a, b) => b[1] - a[1]);
  renderEchart(
    document.getElementById('chart-profession'),
    tk => ({
      tooltip: { trigger: 'axis' },
      grid: { left: 8, right: 8, top: 8, bottom: 8 },
      xAxis: { type: 'value', splitLine: { lineStyle: { color: tk.borderLight, type: [4, 3] } } },
      yAxis: {
        type: 'category',
        data: profRows.map(([p]) => profName(p)),
        axisLabel: { color: tk.textMuted, fontSize: 11 }
      },
      series: [
        {
          type: 'bar',
          data: profRows.map(([, v]) => v),
          itemStyle: { color: tk.purple, borderRadius: [0, 4, 4, 0] },
          label: { show: true, position: 'right', color: tk.textMuted, fontSize: 11 }
        }
      ]
    }),
    L(
      `Professions: ${profRows.map(([p, v]) => `${profName(p)} ${v}`).join(', ')}.`,
      `المهن: ${profRows.map(([p, v]) => `${profName(p)} ${v}`).join('، ')}.`
    ),
    { rtl: 'hbar' }
  );

  const mx = document.getElementById('sponsor-matrix');
  if (mx) {
    mx.innerHTML =
      tableOpen(t('hr.dashboard.sponsorMatrix'), [L('Sponsor', 'الكفيل'), t('hr.dashboard.heads')]) +
      SPONSORS.map(p => {
        const n = emps.filter(e => e.sponsor === p.id).length;
        const nm = currentLang() === 'ar' ? p.nameAr : p.nameEn;
        return `<tr>
    <td><strong>${esc(nm)}</strong><br><small style="color:var(--text-secondary)" dir="ltr">CR ${esc(p.cr)} · ${esc(p.city)}</small></td>
    <td dir="ltr" style="text-align:end"><span class="status status-blue">${n} ${esc(t('hr.dashboard.heads'))}</span></td>
  </tr>`;
      }).join('') +
      '</tbody></table></div>';
  }

  const counts = {};
  emps.forEach(e => {
    (e.skills || []).forEach(k => {
      counts[k] = (counts[k] || 0) + 1;
    });
  });
  const max = Math.max(1, ...Object.values(counts));
  const cloud = document.getElementById('skills-cloud');
  if (cloud) {
    cloud.innerHTML = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(
        ([k, v]) =>
          `<span class="skill-tag" title="${v}" style="font-size:${11 + Math.round((v / max) * 7)}px">${esc(skillName(k))} <small>${v}</small></span>`
      )
      .join('');
  }
}

function renderS4() {
  if (!document.getElementById('nitaqat-meter')) {
    return;
  }
  const today = todayIso();
  const s = getSettings();
  const emps = getSeed('employees');
  const n = nitaqatEstimate(emps, s.nitaqat.target || 0);
  const money = execMoney({
    employees: emps,
    assignments: getSeed('assignments'),
    invoices: getSeed('invoices'),
    targetPct: s.nitaqat.target || 0,
    todayIso: today
  });

  const runs = [...getSeed('payRuns')].sort((a, b) => ((a.month || '') < (b.month || '') ? 1 : -1));
  const last = runs[0];
  const wpsTone = !last ? 'blue' : { paid: 'green', accepted: 'blue', submitted: 'yellow' }[last.wps] || 'blue';
  const qiwaTone = n.qiwaPct >= 85 ? 'green' : n.qiwaPct >= 70 ? 'yellow' : 'red';
  document.getElementById('compliance-chips').innerHTML =
    `<span class="status status-${qiwaTone}">Qiwa ${n.qiwaPct}%</span>` +
    (last
      ? `<span class="status status-${wpsTone}">WPS ${esc(last.month)} · ${esc(t(`status.${last.wps}`))}</span>`
      : '') +
    `<span class="status status-blue">GOSI ${esc(fmtSAR(money.gosiEmployer))}/${esc(L('mo', 'شهر'))}</span>`;

  const met = s.nitaqat.target > 0 && n.pct >= s.nitaqat.target;
  document.getElementById('nitaqat-meter').innerHTML =
    `<div class="meter-top"><strong>${n.pct}%</strong><span>${esc(t('hr.dashboard.gap'))}: ${n.gap}% · ${esc(L('Target', 'المستهدف'))}: ${s.nitaqat.target > 0 ? `${s.nitaqat.target}%` : '—'}</span></div>` +
    `<div class="meter"><div class="meter-fill" style="width:${Math.min(100, n.pct)}%;background:var(--${s.nitaqat.target > 0 ? (met ? 'green' : 'yellow') : 'blue'})"></div></div>` +
    `<div class="stat-subtext">${n.saudiUnits} / ${n.total} ${esc(t('hr.dashboard.heads'))}</div>`;

  const permits = getSeed('ajeerPermits').filter(p => p.status === 'active');
  const pCount = { active: 0, expiring: 0, expired: 0, missing: 0 };
  permits.forEach(p => {
    pCount[permitStatus(p.exp, today)] += 1;
  });
  const missingRef = getSeed('assignments').filter(a => a.status === 'active' && !a.ajeer).length;
  const ajRows = [
    [t('status.valid'), pCount.active, 'green'],
    [t('status.expiring'), pCount.expiring, 'yellow'],
    [t('status.expired'), pCount.expired, 'red'],
    [t('status.missing'), pCount.missing + missingRef, 'red']
  ];
  document.getElementById('ajeer-validity').innerHTML = ajRows
    .map(
      ([label, v, tone]) =>
        `<div class="hr-bar-row"><div class="hr-bar-top"><span><span class="aj-dot" style="background:var(--${tone})"></span>${esc(label)}</span><strong>${v}</strong></div></div>`
    )
    .join('');

  document.getElementById('levy-card').innerHTML =
    `<div class="meter-top"><strong>${esc(fmtSAR(money.levy))}</strong></div>` +
    `<div class="stat-subtext">${esc(fmtSAR(money.levyHead))} × ${money.expatN} · ${esc(t(money.bandOk ? 'hr.dashboard.redBand' : 'hr.dashboard.stdBand'))}</div>`;

  const bk = iqamaBuckets(emps, today);
  document.getElementById('iqama-buckets').innerHTML =
    `<span class="status status-red">≤30: ${bk.le30}</span>` +
    `<span class="status status-yellow">31–60: ${bk.le60}</span>` +
    `<span class="status status-blue">61–90: ${bk.le90}</span>`;

  const deck = expiryDeck(emps, getSeed('residencyDocs'), today);
  const deckDefs = [
    ['chart-exp-iqama', t('hr.dashboard.iqamaDoc'), deck.iqama],
    ['chart-exp-passport', t('hr.dashboard.passportDoc'), deck.passport],
    ['chart-exp-insurance', t('hr.dashboard.insDoc'), deck.insurance]
  ];
  deckDefs.forEach(([id, label, bands]) => {
    renderEchart(
      document.getElementById(id),
      tk =>
        donutOption(tk, [
          { name: t('status.valid'), v: bands.valid, c: x => x.green },
          { name: t('status.expiring'), v: bands.expiring, c: x => x.yellow },
          { name: t('status.expired'), v: bands.expired, c: x => x.red },
          { name: t('status.missing'), v: bands.missing, c: x => x.purple }
        ]),
      `${label}: ${t('status.valid')} ${bands.valid}, ${t('status.expiring')} ${bands.expiring}, ${t('status.expired')} ${bands.expired}, ${t('status.missing')} ${bands.missing}.`
    );
  });

  const kanbanCard = x =>
    `<div class="kanban-card"><strong dir="ltr">${esc(x.id)}</strong>` +
    `<span>${esc(currentLang() === 'ar' ? x.nameAr || x.nameEn : x.nameEn)}</span>` +
    `<small>${esc(x.from)} · ${esc(fmtSAR(x.fee))}</small>` +
    `<small>${esc(fmtDate(x.noticeEnd))} · ${x.released ? '✓' : '…'}</small></div>`;
  const stages = ['requested', 'in-progress', 'awaiting-release', 'completed'];
  const transfers = getSeed('transfers');
  document.getElementById('transfer-kanban').innerHTML = stages
    .map(st => {
      const cols = transfers.filter(x => x.status === st);
      return (
        `<div class="kanban-col"><div class="kanban-head"><span>${esc(t(`status.${st}`))}</span><strong>${cols.length}</strong></div>` +
        (cols.length ? cols.map(kanbanCard).join('') : '<div class="hr-empty">—</div>') +
        '</div>'
      );
    })
    .join('');

  const watch = contractsEnding(getSeed('contracts'), 90, today);
  document.getElementById('contracts-watch').innerHTML = watch.length
    ? tableOpen(t('hr.dashboard.contractsWatch'), [L('Contract', 'العقد'), L('End', 'الانتهاء'), t('hr.dashboard.daysLeft')]) +
      watch
        .map(
          c => `<tr>
    <td><a href="hr_contracts.html" dir="ltr">${esc(c.id)}</a><br><small style="color:var(--text-secondary)">${esc(c.partyKind === 'employee' ? empName(c.party) : clientName(c.party))}</small></td>
    <td dir="ltr" style="text-align:end;white-space:nowrap">${esc(fmtDate(c.end))}</td>
    <td style="text-align:end"><span class="status status-${c.days <= 30 ? 'red' : 'yellow'}">${c.days} ${esc(t('hr.dashboard.daysLeft'))}</span></td>
  </tr>`
        )
        .join('') +
      '</tbody></table></div>'
    : `<div class="hr-empty">${esc(t('common.noData'))}</div>`;

  const reds =
    deck.iqama.expired +
    deck.passport.expired +
    deck.insurance.expired +
    missingRef +
    watch.filter(c => c.days <= 30).length;
  const meta = document.getElementById('zone-compliance-meta');
  if (meta) {
    meta.innerHTML = reds
      ? `<span class="status status-red">${reds} ${esc(t('common.urgent'))}</span>`
      : '<span class="status status-green">✓</span>';
  }
}

function renderAll() {
  renderHead();
  renderZoneA();
  renderS1();
  renderS2();
  renderS3();
  renderS4();
  renderS5();
  renderS6();
  renderAlerts();
  renderExpiries();
  renderMix();
  bindZoneMemory();
  bindZoneBulk();
  applyI18n(document.querySelector('[data-hr-dashboard]') || document);
}

// Collapse-all / Expand-all header buttons: set every zone at once and
// persist each one through the same keys the per-zone memory uses.
function bindZoneBulk() {
  const apply = (open) => {
    document.querySelectorAll('details.zone[data-zone]').forEach(d => {
      if (d.open === open) {return;}
      if (open) {d.setAttribute('open', '');}
      else {d.removeAttribute('open');}
      try {
        localStorage.setItem(`hr:ui:zone:${d.dataset.zone}`, open ? '1' : '0');
      } catch (_e) {
        /* private mode */
      }
    });
  };
  // Header buttons persist across re-renders — bind once.
  const c = document.getElementById('zones-collapse');
  if (c && !c.dataset.bound) {
    c.dataset.bound = '1';
    c.addEventListener('click', () => apply(false));
  }
  const x = document.getElementById('zones-expand');
  if (x && !x.dataset.bound) {
    x.dataset.bound = '1';
    x.addEventListener('click', () => apply(true));
  }
}

function bindZoneMemory() {
  document.querySelectorAll('details.zone[data-zone]').forEach(d => {
    const key = `hr:ui:zone:${d.dataset.zone}`;
    try {
      if (localStorage.getItem(key) === '0') {
        d.removeAttribute('open');
      }
    } catch (_e) {
      /* private mode */
    }
    if (d.dataset.zoneBound) {
      return;
    }
    d.dataset.zoneBound = '1';
    d.addEventListener('toggle', () => {
      try {
        localStorage.setItem(key, d.open ? '1' : '0');
      } catch (_e) {
        /* private mode */
      }
    });
  });
}

export function initHrDashboard() {
  const root = document.querySelector('[data-hr-dashboard]');
  if (!root) {
    return;
  }
  renderAll();
  bindAnalyticsBar();
  if (booted) {
    return;
  }
  booted = true;
  window.addEventListener(LANG_EVENT, renderAll);
}

// ── T2 §5 accounts & performance ───────────────────────────────────────────
function renderS5() {
  if (!document.getElementById('chart-expense')) {
    return;
  }
  const ex = getSeed('expenses');
  const cats = getSeed('expenseCategories');
  const byCat = {};
  ex.forEach(r => {
    byCat[r.cat] = (byCat[r.cat] || 0) + Number(r.amount || 0);
  });
  const palette = [
    tk => tk.primary,
    tk => tk.blue,
    tk => tk.purple,
    tk => tk.yellow,
    tk => tk.green,
    tk => tk.red,
    tk => tk.azure
  ];
  const slices = Object.keys(byCat)
    .sort((a, b) => byCat[b] - byCat[a])
    .map((code, i) => {
      const c = cats.find(x => x.code === code) || { en: code, ar: code };
      return {
        name: L(c.en, c.ar),
        v: Math.round(byCat[code] * 100) / 100,
        c: palette[i % palette.length]
      };
    });
  renderEchart(
    document.getElementById('chart-expense'),
    tk => donutOption(tk, slices),
    slices.map(x => `${x.name} ${fmtSAR(x.v)}`).join(' · ')
  );
  const inv = getSeed('invoices');
  document.querySelector('#billing-history tbody').innerHTML = inv
    .map(r => {
      const tot = invoiceTotals(r.lines || []).total;
      const tone = { paid: 'green', issued: 'yellow' }[r.status] || 'blue';
      return (
        `<tr><td dir="ltr">${esc(r.month)}</td><td>${esc(clientName(r.client))}</td>` +
        `<td class="num" dir="ltr">${esc(fmtSAR(tot))}</td>` +
        `<td><span class="status status-${tone}">${esc(t(`status.${r.status}`))}</span></td></tr>`
      );
    })
    .join('');
  const d = {
    attendance: getSeed('attendance'),
    goals: getSeed('goals'),
    feedback: getSeed('feedback'),
    timesheets: getSeed('timesheets')
  };
  const rank = perfRanking(d);
  const top = rank.slice(0, 5);
  const bottom = rank.slice(-5).reverse();
  const rows = list =>
    list
      .map(
        (r, i) =>
          `<tr><td>${i + 1}</td><td>${esc(empName(r.code))}</td>` +
          `<td class="num">${r.index}</td><td class="num">${r.signals}/4</td></tr>`
      )
      .join('');
  document.querySelector('#perf-top tbody').innerHTML = rows(top);
  document.querySelector('#perf-bottom tbody').innerHTML = rows(bottom);
  const tTop = cohortTrend(
    top.map(r => r.code),
    d.attendance
  );
  const tBot = cohortTrend(
    bottom.map(r => r.code),
    d.attendance
  );
  const dates = tTop.map(p => p.date.slice(5));
  const botByDate = Object.fromEntries(tBot.map(p => [p.date, p.score]));
  renderEchart(
    document.getElementById('chart-perf-trend'),
    tk => ({
      tooltip: { trigger: 'axis' },
      legend: { bottom: 0, textStyle: { color: tk.textMuted, fontSize: 11 } },
      grid: { left: 8, right: 8, top: 12, bottom: 52 },
      xAxis: { type: 'category', data: dates, axisLabel: { color: tk.textMuted, fontSize: 10 } },
      yAxis: {
        type: 'value',
        min: 0,
        max: 100,
        splitLine: { lineStyle: { color: tk.borderLight, type: [4, 3] } }
      },
      series: [
        {
          name: t('hr.dashboard.top5'),
          type: 'line',
          data: tTop.map(p => p.score),
          lineStyle: { color: tk.green, width: 2 },
          itemStyle: { color: tk.green },
          symbol: 'circle',
          symbolSize: 5
        },
        {
          name: t('hr.dashboard.bottom5'),
          type: 'line',
          data: tTop.map(p => (botByDate[p.date] === undefined ? null : botByDate[p.date])),
          lineStyle: { color: tk.red, width: 2 },
          itemStyle: { color: tk.red },
          symbol: 'circle',
          symbolSize: 5
        }
      ]
    }),
    `${t('hr.dashboard.top5')}: ${top.map(r => r.index).join(', ')} · ${t('hr.dashboard.bottom5')}: ${bottom
      .map(r => r.index)
      .join(', ')}`
  );
  const meta = document.getElementById('zone-accounts-meta');
  if (meta) {
    meta.innerHTML = `<span class="status status-green">${rank.length} · ${esc(t('hr.dashboard.top5'))} ${
      top.length ? top[0].index : '—'
    }</span>`;
  }
}

// ── T2 §6 action center ────────────────────────────────────────────────────
function taskOwnerName(owner) {
  const roles = {
    pro: t('role.pro'),
    hr: t('role.hr'),
    manager: t('role.manager'),
    payroll: t('role.payroll'),
    finance: t('role.finance')
  };
  if (roles[owner]) {
    return roles[owner];
  }
  if (String(owner).startsWith('EMP-')) {
    return empName(owner);
  }
  return owner;
}

function renderS6() {
  if (!document.getElementById('ticker-track')) {
    return;
  }
  const today = todayIso();
  const s = getSettings();
  const a = tickerAlerts(
    {
      ajeerPermits: getSeed('ajeerPermits'),
      assignments: getSeed('assignments'),
      employees: getSeed('employees'),
      tasks: getSeed('tasks')
    },
    s,
    today
  );
  const bands = [];
  a.staleReturns.forEach(r => {
    bands.push(['red', `${t('hr.dashboard.staleReturn')} ${r.no} · ${r.emp} · ${r.at}`]);
  });
  if (a.expiringPermits) {
    bands.push([
      'red',
      `${a.expiringPermits} ${t('hr.dashboard.permitsExpiring')} ≤30${L('d', 'ي')}`
    ]);
  }
  if (a.expiringIqamas) {
    bands.push(['dark', `${a.expiringIqamas} ${t('hr.dashboard.iqamasExpiring')}`]);
  }
  if (a.overdue) {
    bands.push([
      'red',
      `${a.overdue} ${t('hr.dashboard.tasksTitle')} ${t('hr.dashboard.overdue')}`
    ]);
  }
  if (a.followups) {
    bands.push(['dark', `${a.followups} ${t('hr.dashboard.tasksDue')}`]);
  }
  if (a.nitaqatBelow) {
    bands.push(['red', t('hr.dashboard.nitaqatBelow')]);
  }
  if (!bands.length) {
    bands.push(['green', t('hr.dashboard.noAlerts')]);
  }
  const half = bands
    .map(([tone, text]) => `<span class="ticker-band ${tone}">${esc(text)}</span>`)
    .join('');
  document.getElementById('ticker-track').innerHTML =
    half + `<span aria-hidden="true" style="display:contents">${half}</span>`;
  document.getElementById('ticker').setAttribute('aria-label', t('hr.dashboard.tickerTitle'));

  const tasks = getSeed('tasks') || [];
  const prio = { high: 0, medium: 1, low: 2 };
  const open = tasks
    .filter(x => !x.done)
    .sort(
      (x, y) =>
        (x.due < today ? 0 : 1) - (y.due < today ? 0 : 1) ||
        (x.due < y.due ? -1 : x.due > y.due ? 1 : 0) ||
        (prio[x.priority] ?? 1) - (prio[y.priority] ?? 1)
    )
    .slice(0, 5);
  document.getElementById('tasks-formula').textContent =
    `${tasks.filter(x => x.done).length} / ${tasks.length} ${t('hr.dashboard.doneOf')}`;
  document.querySelector('#tasks-table tbody').innerHTML = open
    .map(x => {
      const d = daysUntil(x.due, today);
      const chip =
        d < 0
          ? `<span class="status status-red">${-d}d ${esc(t('hr.dashboard.overdue'))}</span>`
          : `<span class="status status-blue">${d}d ${esc(t('hr.dashboard.leftD'))}</span>`;
      const href = /^hr_[a-z0-9_]+\.html(\?[^"]*)?$/.test(x.link || '') ? x.link : '#';
      return (
        `<tr><td><a href="${esc(href)}">${esc(L(x.titleEn, x.titleAr))}</a></td>` +
        `<td>${esc(taskOwnerName(x.owner))}</td><td dir="ltr">${esc(x.due)} ${chip}</td></tr>`
      );
    })
    .join('');

  const steps = setupSteps();
  const labels = [
    t('hr.dashboard.setupCompany'),
    t('hr.dashboard.setupNitaqat'),
    t('hr.dashboard.setupLicence')
  ];
  const doneCount = steps.filter(x => x.done).length;
  const pct = Math.round((doneCount / steps.length) * 100);
  const bar = document.getElementById('setup-progress');
  bar.setAttribute('aria-valuenow', String(pct));
  document.getElementById('setup-progress-fill').style.width = `${pct}%`;
  document.getElementById('setup-checklist').innerHTML = steps
    .map(
      (x, i) =>
        `<div class="check-item ${x.done ? 'done' : 'todo'}"><span class="tick">✓</span><span>${esc(labels[i])}</span></div>`
    )
    .join('');

  const reds = a.staleReturns.length + a.overdue + (a.nitaqatBelow ? 1 : 0);
  const meta = document.getElementById('zone-actions-meta');
  if (meta) {
    meta.innerHTML = reds
      ? `<span class="status status-red">${reds} ${esc(t('common.urgent'))}</span>`
      : '<span class="status status-green">✓</span>';
  }
}
