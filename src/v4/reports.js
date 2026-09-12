// HR + Operations — reports (hr_reports.html).
// Five exportable packs: workforce, hiring funnel, finance (payroll + GOSI
// + EOSB provision + expenses + billing), billing, compliance expiries.
// KPI cards + tables + CSS bars — the shared chart layer exposes no page
// factories, so nothing here depends on it.

import { currentLang, LANG_EVENT, applyI18n } from './i18n.js';
import { getSeed } from './hr-api.js';
import { getSettings } from './hr-statutory.js';
import {
  calcPayLine,
  nitaqatEstimate,
  invoiceTotals,
  calcEOSB,
  daysUntil
} from './hr-statutory.js';
import { STAGES, stageLabel } from './candidates.js';
import { exportData, exportCSV } from './import-export.js';

let booted = false;

function L(en, ar) {
  return currentLang() === 'ar' ? ar : en;
}

function fmt(n) {
  return (Number(n) || 0).toLocaleString(currentLang() === 'ar' ? 'ar-SA' : 'en-US');
}

function latestPaidRun() {
  return (
    getSeed('payRuns')
      .filter(r => r.status === 'paid')
      .sort((a, b) => String(a.month).localeCompare(String(b.month)))
      .pop() || null
  );
}

function runTotals(run) {
  let gross = 0;
  let er = 0;
  let emp = 0;
  let net = 0;
  for (const e of getSeed('employees').filter(x => x.st === 'active')) {
    const adj = run?.adjustments?.[e.code] || {};
    const line = calcPayLine(e, {
      otH: adj.otH || 0,
      extras: adj.extras || 0,
      deductions: adj.deductions || [],
      at: run ? `${run.month}-28` : null
    });
    gross += line.gross;
    er += line.gosiEr;
    emp += line.gosiEmp;
    net += line.net;
  }
  return { gross, er, emp, net };
}

function eosbProvision() {
  const today = new Date().toISOString().slice(0, 10);
  let total = 0;
  for (const e of getSeed('employees').filter(x => x.st === 'active')) {
    total +=
      calcEOSB({ basic: e.basic, joinDate: e.join, endDate: today, endReason: 'termination' })
        .net || 0;
  }
  return total;
}

function invoiceRow(inv) {
  const t = invoiceTotals(inv.lines);
  const outstanding = ['issued', 'sent', 'overdue'].includes(inv.status) ? t.total : 0;
  return { ...inv, ...t, outstanding };
}

function renderAll() {
  const set = (id, v) => {
    const el = document.getElementById(id);
    if (el) {
      el.textContent = v;
    }
  };
  const K = (id, v) => {
    const el = document.getElementById(id);
    if (el) {
      el.innerHTML = v;
    }
  };

  // ── 1. Workforce ──────────────────────────────────────────────────
  const emps = getSeed('employees');
  const active = emps.filter(e => e.st === 'active');
  const nit = nitaqatEstimate(active, getSettings().nitaqat?.target ?? 0);
  K(
    'rp-workforce',
    [
      [L('Active headcount', 'العاملون'), fmt(nit.total)],
      [L('Saudis', 'السعوديون'), fmt(nit.saudis)],
      [L('Expats', 'الوافدون'), fmt(nit.expats)],
      [L('Saudization', 'السعودة'), `${nit.pct}%`],
      [L('Qiwa authenticated', 'موثق قوى'), `${nit.qiwaPct}%`]
    ]
      .map(
        ([k, v]) =>
          `<div class="hr-kpi"><div class="hr-kpi-v" dir="ltr">${v}</div><div class="hr-kpi-l">${k}</div></div>`
      )
      .join('')
  );

  // ── 2. Hiring funnel ──────────────────────────────────────────────
  const cands = getSeed('candidates');
  const max = Math.max(1, ...STAGES.map(s => cands.filter(c => c.stage === s).length));
  K(
    'rp-funnel',
    STAGES.map(s => {
      const n = cands.filter(c => c.stage === s).length;
      return `<div class="hr-funnel-row"><span>${stageLabel(s)}</span>
        <span class="hr-bar" dir="ltr"><span style="width:${Math.round((n / max) * 100)}%"></span></span>
        <strong dir="ltr">${n}</strong></div>`;
    }).join('') +
      `<div class="hr-note">${L('Offers', 'العروض')}: ${
        getSeed('offers')
          .map(o => o.status)
          .filter(Boolean).length
      } · ${L('Hired', 'معيّنون')}: ${getSeed('offers').filter(o => o.status === 'accepted').length}</div>`
  );

  // ── 3. Finance pack ───────────────────────────────────────────────
  const run = latestPaidRun();
  const pt = runTotals(run);
  const eosb = eosbProvision();
  const openExp = getSeed('expenses')
    .filter(x => !['paid', 'rejected'].includes(x.status))
    .reduce((s, x) => s + (Number(x.amount) || 0), 0);
  const outInv = getSeed('invoices').reduce((s, inv) => s + invoiceRow(inv).outstanding, 0);
  K(
    'rp-finance',
    [
      [
        L('Payroll (gross)', 'الرواتب (إجمالي)'),
        `${fmt(pt.gross)} ${L('SAR', 'ر.س')}`,
        run ? run.month : '—'
      ],
      [L('GOSI employer', 'التأمينات (صاحب العمل)'), fmt(pt.er), ''],
      [L('Net paid', 'الصافي المدفوع'), fmt(pt.net), ''],
      [L('EOSB provision', 'مخصص مكافأة النهاية'), fmt(eosb), L('termination basis', 'أساس الفصل')],
      [L('Open expenses', 'مصاريف مفتوحة'), fmt(openExp), ''],
      [L('Outstanding invoices', 'فواتير مستحقة'), fmt(outInv), '']
    ]
      .map(
        ([k, v, sub]) =>
          `<div class="hr-kpi"><div class="hr-kpi-v" dir="ltr">${v}</div><div class="hr-kpi-l">${k}${sub ? ` <span dir="ltr">· ${sub}</span>` : ''}</div></div>`
      )
      .join('')
  );

  // ── 4. Billing ────────────────────────────────────────────────────
  const invs = getSeed('invoices').map(invoiceRow);
  const bel = document.getElementById('rp-billing');
  if (bel) {
    bel.innerHTML = invs
      .map(
        i => `<tr>
      <td data-label="#"><span dir="ltr">${i.id}</span></td>
      <td data-label="${L('Client', 'العميل')}" dir="ltr">${i.client}</td>
      <td data-label="${L('Month', 'الشهر')}" dir="ltr">${i.month}</td>
      <td data-label="${L('Total', 'الإجمالي')}" dir="ltr">${fmt(i.total)}</td>
      <td data-label="${L('Outstanding', 'المستحق')}" dir="ltr">${i.outstanding ? fmt(i.outstanding) : '—'}</td>
      <td data-label="${L('Status', 'الحالة')}">${i.status}</td>
    </tr>`
      )
      .join('');
  }
  set('rp-bill-total', fmt(invs.reduce((s, i) => s + i.total, 0)));
  set('rp-bill-out', fmt(invs.reduce((s, i) => s + i.outstanding, 0)));

  // ── 5. Compliance expiries ────────────────────────────────────────
  const rows = [];
  for (const e of active.filter(x => !x.saudi && x.iqamaExp)) {
    const d = daysUntil(e.iqamaExp);
    if (d <= 60) {
      rows.push({ kind: L('Iqama', 'الإقامة'), ref: `${e.code} · ${e.iqama}`, exp: e.iqamaExp, d });
    }
  }
  for (const c of getSeed('contracts').filter(x => x.status === 'active' && x.end)) {
    const d = daysUntil(c.end);
    if (d <= 90) {
      rows.push({ kind: L('Contract', 'العقد'), ref: c.id, exp: c.end, d });
    }
  }
  for (const p of getSeed('ajeerPermits').filter(x => x.status === 'active' && x.exp)) {
    const d = daysUntil(p.exp);
    if (d <= 60) {
      rows.push({ kind: L('Ajeer', 'أجير'), ref: p.no, exp: p.exp, d });
    }
  }
  rows.sort((a, b) => a.d - b.d);
  const cel = document.getElementById('rp-compliance');
  if (cel) {
    cel.innerHTML = rows.length
      ? rows
          .map(
            r => `<tr>
        <td data-label="${L('Type', 'النوع')}">${r.kind}</td>
        <td data-label="${L('Ref', 'المرجع')}" dir="ltr">${r.ref}</td>
        <td data-label="${L('Expiry', 'الانتهاء')}" dir="ltr">${r.exp}</td>
        <td data-label="${L('Days left', 'المتبقي')}" dir="ltr"><span class="status status-${r.d < 0 ? 'red' : r.d <= 30 ? 'yellow' : 'blue'}">${r.d}</span></td>
      </tr>`
          )
          .join('')
      : `<tr><td colspan="4" class="hr-empty">${L('Nothing expiring soon', 'لا شيء ينتهي قريبًا')}</td></tr>`;
  }
  set('rp-comp-count', String(rows.length));
  applyI18n(document.querySelector('[data-hr-reports]') || document);
}

export function initReports() {
  const root = document.querySelector('[data-hr-reports]');
  if (!root) {
    return;
  }
  renderAll();
  if (booted) {
    return;
  }
  booted = true;
  const wire = (x, c, fn) => {
    document.getElementById(x)?.addEventListener('click', () => {
      const [name, cols, rows, sheet] = fn();
      exportData('xlsx', name, cols, rows, sheet);
    });
    document.getElementById(c)?.addEventListener('click', () => {
      const [name, cols, rows] = fn();
      exportCSV(`${name}.csv`, cols, rows);
    });
  };
  wire('rp-emp-xlsx', 'rp-emp-csv', () => [
    'workforce',
    [
      { key: 'code', label: 'Code' },
      { key: 'nameEn', label: 'Name' },
      { key: 'saudi', label: 'Saudi' },
      { key: 'dept', label: 'Dept' },
      { key: 'st', label: 'Status' }
    ],
    getSeed('employees'),
    'Workforce'
  ]);
  wire('rp-hire-xlsx', 'rp-hire-csv', () => [
    'hiring',
    [
      { key: 'id', label: 'Candidate' },
      { key: 'nameEn', label: 'Name' },
      { key: 'stage', label: 'Stage' },
      { key: 'prof', label: 'Profession' }
    ],
    getSeed('candidates'),
    'Hiring'
  ]);
  wire('rp-fin-xlsx', 'rp-fin-csv', () => {
    const run = latestPaidRun();
    const pt = runTotals(run);
    const rows = [
      { kpi: 'Payroll month', value: run ? run.month : '—' },
      { kpi: 'Payroll gross', value: Math.round(pt.gross * 100) / 100 },
      { kpi: 'GOSI employer', value: Math.round(pt.er * 100) / 100 },
      { kpi: 'Net paid', value: Math.round(pt.net * 100) / 100 },
      { kpi: 'EOSB provision', value: Math.round(eosbProvision() * 100) / 100 },
      {
        kpi: 'Open expenses',
        value: getSeed('expenses')
          .filter(x => !['paid', 'rejected'].includes(x.status))
          .reduce((s, x) => s + (Number(x.amount) || 0), 0)
      },
      {
        kpi: 'Outstanding invoices',
        value:
          Math.round(
            getSeed('invoices').reduce((s, inv) => s + invoiceRow(inv).outstanding, 0) * 100
          ) / 100
      }
    ];
    return [
      'finance-pack',
      [
        { key: 'kpi', label: 'KPI' },
        { key: 'value', label: 'Value' }
      ],
      rows,
      'Finance'
    ];
  });
  wire('rp-inv-xlsx', 'rp-inv-csv', () => [
    'billing',
    [
      { key: 'id', label: 'Invoice' },
      { key: 'client', label: 'Client' },
      { key: 'month', label: 'Month' },
      { key: 'total', label: 'Total' },
      { key: 'outstanding', label: 'Outstanding' },
      { key: 'status', label: 'Status' }
    ],
    getSeed('invoices').map(invoiceRow),
    'Billing'
  ]);
  window.addEventListener(LANG_EVENT, renderAll);
}
