// HR + Operations — CEO Command Center (dashboard.html). Header strip +
// Zone A business health + §1 workforce dynamics + legacy stat cards, alerts,
// deployment mix and expiries (later zones subsume the legacy cards). Idempotent.

import { t, currentLang, LANG_EVENT, applyI18n } from './i18n.js';
import { fmtSAR, fmtDate, fmtHijri, L} from './hr-locale.js';
import {
  daysUntil,
  nitaqatEstimate,
  getSettings,
  headcountByStatus,
  tenureBuckets,
  separationSeries,
  iqamaBuckets
} from './hr-statutory.js';
import { getSeed } from './hr-api.js';
import { CLIENTS, SITES, SKILLS, SPONSORS, PROFESSIONS } from './hr-seed.js';
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
  if (sel) {sel.addEventListener('change', () => { analyticsSegment = sel.value; applyAnalyticsFilters(); });}
  const exp = document.getElementById('analytics-export');
  if (exp) {exp.addEventListener('click', () => {
    import('./import-export.js').then(m => {
      const emps = getSeed('employees')||[];
      const rows = emps.map(e=>({ code:e.code, name:e.nameEn, nat:e.nat, status:e.st, join:e.join }));
      m.exportData(rows, 'analytics.csv');
    });
  });}
  const ref = document.getElementById('analytics-refresh');
  if (ref) {ref.addEventListener('click', () => location.reload());}
  applyAnalyticsFilters();
}

function alerts() {
  const out = [];
  const emps = getSeed('employees');
  emps
    .filter(e => !e.saudi && e.st === 'active')
    .forEach(e => {
      if (!e.iqamaExp) {
        out.push({
          sev: 'red',
          text: `${L('Missing Iqama expiry', 'تاريخ انتهاء الإقامة مفقود')} · ${currentLang() === 'ar' ? e.nameAr : e.nameEn}`,
          href: `employee.html?code=${e.code}`
        });
        return;
      }
      const d = daysUntil(e.iqamaExp);
      if (d <= 90) {
        out.push({
          sev: d <= 30 ? 'red' : 'yellow',
          text: `${L('Iqama', 'الإقامة')} ${fmtDate(e.iqamaExp)} (${d}${L('d', 'ي')}) · ${currentLang() === 'ar' ? e.nameAr : e.nameEn}`,
          href: `employee.html?code=${e.code}`
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
      <td data-label="${L('Worker', 'الموظف')}"><a href="employee.html?code=${e.code}">${currentLang() === 'ar' ? e.nameAr || e.nameEn : e.nameEn}</a></td>
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
  const emps = getSeed('employees');
  const active = emps.filter(e => e.st === 'active');
  const rows = CLIENTS.map((c, i) => ({
    label: currentLang() === 'ar' ? c.nameAr : c.nameEn,
    n: active.filter(e => e.client === c.id).length,
    color: ['var(--primary)', 'var(--blue)', 'var(--purple)'][i % 3]
  }));
  rows.push({ label: L('Bench', 'احتياطي'), n: active.filter(e => !e.client).length, color: 'var(--yellow)' });
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
    ? `<a class="status status-yellow" href="settings.html" style="text-decoration:none">${left} ${esc(t('hr.dashboard.setupSteps'))}</a>`
    : `<span class="status status-green">${esc(L('All set', 'تم الإعداد'))}</span>`
}
    </div>`;
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
      ? `<a class="hr-alert hr-alert-red" href="employee.html?code=${encodeURIComponent(flagged[0].code)}" style="margin-bottom:12px">
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

  // Separation: hired / exited per month, last 6.
  const sep = separationSeries(emps, [], todayIso());
  const { labels, hired, exited } = sep;
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
          name: t('hr.dashboard.exitedW'),
          type: 'bar',
          data: exited,
          itemStyle: { color: tk.red, borderRadius: [4, 4, 0, 0] }
        }
      ]
    }),
    L(
      `Last 6 months: hired ${hired.reduce((a, b) => a + b, 0)}, exited ${exited.reduce((a, b) => a + b, 0)}.`,
      `آخر ٦ أشهر: المعينون ${hired.reduce((a, b) => a + b, 0)}، الخارجون ${exited.reduce((a, b) => a + b, 0)}.`
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

function renderRoster(siteId) {
  const box = document.getElementById('site-roster');
  if (!box) {
    return;
  }
  box.dataset.site = siteId || '';
  const rows = getSeed('employees').filter(
    e => (!siteId || e.site === siteId) && e.st !== 'exited' && e.st !== 'huroob'
  );
  box.innerHTML =
    `<div class="vac-group-head"><strong>${esc(siteId ? siteName(siteId) : t('hr.dashboard.selectSite'))}</strong>` +
    (siteId ? `<span class="status status-blue">${rows.length}</span>` : '') +
    '</div>' +
    (siteId
      ? rows.length
        ? tableOpen(t('hr.dashboard.rosterTitle'), [L('Worker', 'الموظف'), L('Basic', 'الأساسي')]) +
          rows
            .map(
              e => `<tr>
      <td><a href="employee.html?code=${encodeURIComponent(e.code)}">${esc(empName(e.code))}</a><br><small style="color:var(--text-secondary)">${esc(profName(e.prof))}</small></td>
      <td dir="ltr" style="text-align:end;white-space:nowrap">${esc(fmtSAR(e.basic))}</td>
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
  const hcOf = id => emps.filter(e => e.site === id).length;

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
  const qiwaTone = n.qiwaPct >= 85 ? 'green' : n.qiwaPct >= 70 ? 'yellow' : 'red';
  document.getElementById('compliance-chips').innerHTML =
    `<span class="status status-${qiwaTone}">Qiwa ${n.qiwaPct}%</span>`;

  const met = s.nitaqat.target > 0 && n.pct >= s.nitaqat.target;
  document.getElementById('nitaqat-meter').innerHTML =
    `<div class="meter-top"><strong>${n.pct}%</strong><span>${esc(t('hr.dashboard.gap'))}: ${n.gap}% · ${esc(L('Target', 'المستهدف'))}: ${s.nitaqat.target > 0 ? `${s.nitaqat.target}%` : '—'}</span></div>` +
    `<div class="meter"><div class="meter-fill" style="width:${Math.min(100, n.pct)}%;background:var(--${s.nitaqat.target > 0 ? (met ? 'green' : 'yellow') : 'blue'})"></div></div>` +
    `<div class="stat-subtext">${n.saudiUnits} / ${n.total} ${esc(t('hr.dashboard.heads'))}</div>`;

  const bk = iqamaBuckets(emps, today);
  document.getElementById('iqama-buckets').innerHTML =
    `<span class="status status-red">≤30: ${bk.le30}</span>` +
    `<span class="status status-yellow">31–60: ${bk.le60}</span>` +
    `<span class="status status-blue">61–90: ${bk.le90}</span>`;

  const reds = bk.le30;
  const meta = document.getElementById('zone-compliance-meta');
  if (meta) {
    meta.innerHTML = reds
      ? `<span class="status status-red">${reds} ${esc(t('common.urgent'))}</span>`
      : '<span class="status status-green">✓</span>';
  }
}

function renderAll() {
  renderHead();
  renderS1();
  renderS3();
  renderS4();
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
