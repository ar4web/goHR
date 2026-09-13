// HR + Operations — EOSB + final settlement (hr_eosb.html).
// Art. 84: ½ month per year for the first 5 years, 1 month after, pro-rata.
// Art. 85 (2026 nuance): the resignation haircut applies ONLY to fixed-term
// resignation; Art. 80 dismissal forfeits the award. Wage basis + cap come
// from getEosbConfig() (counsel-configured). Settlement = EOSB + unused leave +
// outstanding salary + repatriation ticket — tax-free in KSA (§0.9).

import { showToast } from './toast.js';
import { showModal } from './modal.js';
import { t, currentLang, LANG_EVENT, applyI18n } from './i18n.js';
import { fmtSAR, L, setText} from './hr-locale.js';
import { calcEOSB, annualEntitlement, yearsBetween, getEosbConfig, sellerProfile } from './hr-statutory.js';
import { getSeed } from './hr-api.js';
import { exportData, exportCSV } from './import-export.js';

let booted = false;

const REASONS = [
  { code: 'termination', en: 'Termination by employer — full', ar: 'إنهاء من صاحب العمل — كامل' },
  { code: 'resignation', en: 'Resignation (indefinite) — full', ar: 'استقالة (غير محددة) — كامل' },
  {
    code: 'resignation-fixed',
    en: 'Resignation (fixed-term) — Art. 85 haircut',
    ar: 'استقالة (محددة المدة) — حسم المادة 85'
  },
  { code: 'art80', en: 'Art. 80 dismissal — forfeited', ar: 'فصل بالمادة 80 — سقوط الحق' },
  { code: 'art81', en: 'Art. 81 exit for cause — full', ar: 'ترك للسبب بالمادة 81 — كامل' }
];



function emp(code) {
  return getSeed('employees').find(e => e.code === code);
}

function empName(e) {
  return currentLang() === 'ar' ? e.nameAr || e.nameEn : e.nameEn;
}

function basisOf(e, basis) {
  return basis === 'basic+housing' ? (e.basic || 0) + (e.housing || 0) : e.basic || 0;
}

function capped(net, wage) {
  if (getEosbConfig().capMonths > 0) {
    return Math.min(net, wage * getEosbConfig().capMonths);
  }
  return net;
}

function reasonLabel(code) {
  const r = REASONS.find(x => x.code === code);
  return r ? (currentLang() === 'ar' ? r.ar : r.en) : code;
}

function fillEmpSelect(id, keep) {
  const sel = document.getElementById(id);
  if (!sel || sel.options.length) {
    return;
  }
  sel.innerHTML = getSeed('employees').map(
    e => `<option value="${e.code}">${e.code} — ${empName(e)}</option>`
  );
  if (keep) {
    sel.value = keep;
  }
}

// ── Calculator ──────────────────────────────────────────────────────────

function calcResult() {
  const e = emp(document.getElementById('eo-emp')?.value);
  const end = document.getElementById('eo-end')?.value || new Date().toISOString().slice(0, 10);
  const reason = document.getElementById('eo-reason')?.value || 'termination';
  const basis = document.getElementById('eo-basis')?.value || getEosbConfig().basis;
  if (!e) {
    return null;
  }
  const wage = basisOf(e, basis);
  const r = calcEOSB({ basic: wage, joinDate: e.join, endDate: end, endReason: reason });
  const net = capped(r.net, wage);
  const payDays =
    reason === 'resignation' || reason === 'resignation-fixed'
      ? getEosbConfig().payDaysResign
      : getEosbConfig().payDaysEmployer;
  const payBy = new Date(`${end}T00:00:00`);
  payBy.setDate(payBy.getDate() + payDays);
  return { e, end, reason, basis, wage, r, net, payBy: payBy.toISOString().slice(0, 10) };
}

function renderCalc() {
  const box = document.getElementById('eo-result');
  if (!box) {
    return;
  }
  const c = calcResult();
  if (!c) {
    return;
  }
  const factorLbl =
    c.r.factor === 1
      ? L('Full award', 'كامل المكافأة')
      : c.r.factor === 0
        ? L('Forfeited', 'ساقطة')
        : `× ${c.r.factor === 1 / 3 ? '⅓' : '⅔'}`;
  box.innerHTML = `<div class="hr-kv"><span>${L('Service', 'الخدمة')}</span><strong dir="ltr">${c.r.years} ${L('years', 'سنة')}</strong></div>
    <div class="hr-kv"><span>${L('Wage basis', 'أجر الأساس')} (${c.basis === 'basic' ? L('basic', 'أساسي') : L('basic+housing', 'أساسي+سكن')})</span><strong dir="ltr">${fmtSAR(c.wage)}</strong></div>
    <div class="hr-kv"><span>${L('Gross award (Art. 84)', 'المكافأة (مادة 84)')}</span><strong dir="ltr">${fmtSAR(c.r.gross)}</strong></div>
    <div class="hr-kv"><span>${L('Haircut / factor', 'الحسم / المعامل')}</span><strong>${factorLbl} · <span dir="ltr">${fmtSAR(c.r.haircut)}</span></strong></div>
    <div class="hr-kv" style="font-size:16px"><span><strong>${L('Net EOSB', 'صافي المكافأة')}</strong></span><strong dir="ltr">${fmtSAR(c.net)}</strong></div>
    ${getEosbConfig().capMonths > 0 ? `<div class="hr-note">⚠️ ${L(`Cap applied: ${getEosbConfig().capMonths} months`, `طُبق الحد: ${getEosbConfig().capMonths} أشهر`)}</div>` : ''}
    <div class="hr-note">🗓️ ${L('Pay by', 'تُدفع قبل')} <span dir="ltr">${c.payBy}</span> · ${reasonLabel(c.reason)}</div>`;
}

// ── Accrual provision ───────────────────────────────────────────────────

function accrualRows() {
  const today = new Date().toISOString().slice(0, 10);
  return getSeed('employees').map(e => {
    const wage = basisOf(e, getEosbConfig().basis);
    const years = yearsBetween(e.join, today);
    const r = calcEOSB({ basic: wage, joinDate: e.join, endDate: today, endReason: 'termination' });
    const monthly = (wage * (years < 5 ? 0.5 : 1)) / 12;
    return {
      e,
      years,
      wage,
      accrued: capped(r.net, wage),
      monthly: Math.round(monthly * 100) / 100
    };
  });
}

function renderAccrual() {

  const rs = accrualRows();
  setText('eo-stat-prov', fmtSAR(rs.reduce((s, r) => s + r.accrued, 0)));
  setText('eo-stat-month', fmtSAR(rs.reduce((s, r) => s + r.monthly, 0)));
  const el = document.getElementById('eo-rows');
  if (el) {
    el.innerHTML = rs
      .map(
        ({ e, years, wage, accrued, monthly }) => `<tr>
      <td data-label="${L('Employee', 'الموظف')}"><strong>${empName(e)}</strong>
        <div style="font-size:11.5px;color:var(--text-muted)" dir="ltr">${e.code}</div></td>
      <td data-label="${L('Service', 'الخدمة')}" dir="ltr">${years.toFixed(1)} ${L('y', 'سنة')}</td>
      <td data-label="${L('Basis', 'الأساس')}" dir="ltr">${fmtSAR(wage)}</td>
      <td data-label="${L('Accrued', 'المستحق')}" dir="ltr"><strong>${fmtSAR(accrued)}</strong></td>
      <td data-label="${L('Monthly provision', 'مخصص شهري')}" dir="ltr">${fmtSAR(monthly)}</td>
    </tr>`
      )
      .join('');
  }
}

// ── Settlement ──────────────────────────────────────────────────────────

function seller() {
  return sellerProfile();
}

function unusedLeave(e, end) {
  return Math.max(0, annualEntitlement(e.join, end) - (e.annualUsed || 0));
}

function settlementVals() {
  const e = emp(document.getElementById('es-emp')?.value);
  if (!e) {
    return null;
  }
  const end = document.getElementById('es-end')?.value || new Date().toISOString().slice(0, 10);
  const reason = document.getElementById('es-reason')?.value || 'termination';
  const wage = basisOf(e, getEosbConfig().basis);
  const full = (e.basic || 0) + (e.housing || 0) + (e.transport || 0);
  const r = calcEOSB({ basic: wage, joinDate: e.join, endDate: end, endReason: reason });
  const eosb = capped(r.net, wage);
  const leaveInput = document.getElementById('es-leave');
  const leaveDays =
    leaveInput && leaveInput.value !== '' ? Number(leaveInput.value) : unusedLeave(e, end);
  const daily = Math.round((full / 30) * 100) / 100;
  const salary = Number(document.getElementById('es-salary')?.value) || 0;
  const ticket = Number(document.getElementById('es-ticket')?.value) || 0;
  const other = Number(document.getElementById('es-other')?.value) || 0;
  const total = Math.round((eosb + leaveDays * daily + salary + ticket + other) * 100) / 100;
  return { e, end, reason, r, eosb, leaveDays, daily, salary, ticket, other, total };
}

function settlementDoc(v) {
  const s = seller();
  const kv = (lbl, amt) =>
    `<div class="hr-kv"><span>${lbl}</span><strong dir="ltr">${fmtSAR(amt)}</strong></div>`;
  return `<div class="inv-doc">
    <div class="inv-head">
      <div><div class="inv-title">${currentLang() === 'ar' ? s.nameAr || s.nameEn : s.nameEn}</div>
        <div style="font-size:12px;color:var(--text-muted)" dir="ltr">CR ${s.cr || '—'} · VAT ${s.vat || '—'}</div></div>
      <div style="text-align:end"><div class="inv-title">${L('FINAL SETTLEMENT', 'تسوية نهائية')}</div>
        <div style="font-size:12px" dir="ltr">${v.end}</div></div>
    </div>
    <div class="hr-form-2col" style="margin:12px 0;font-size:12.5px">
      <div><strong>${empName(v.e)}</strong><br><span dir="ltr">${v.e.code}</span> · ${L('Service', 'الخدمة')}: <span dir="ltr">${v.r.years} ${L('years', 'سنة')}</span></div>
      <div>${L('End reason', 'سبب الإنهاء')}: ${reasonLabel(v.reason)}</div>
    </div>
    ${kv(L('EOSB (Art. 84/85)', 'مكافأة نهاية الخدمة'), v.eosb)}
    ${kv(`${L('Unused leave payout', 'مقابل الإجازات')} (${v.leaveDays}d × ${fmtSAR(v.daily)})`, v.leaveDays * v.daily)}
    ${kv(L('Outstanding salary', 'رواتب مستحقة'), v.salary)}
    ${kv(L('Repatriation ticket', 'تذكرة العودة'), v.ticket)}
    ${kv(L('Other', 'أخرى'), v.other)}
    <div class="hr-kv" style="font-size:16px"><span><strong>${L('Total settlement', 'إجمالي التسوية')}</strong></span><strong dir="ltr">${fmtSAR(v.total)}</strong></div>
    <div style="font-size:12px;color:var(--text-muted);margin-top:8px" dir="auto">
      ${L('EOSB is tax-free in KSA; the destination country may tax it.', 'مكافأة نهاية الخدمة معفاة من الضريبة في السعودية؛ وقد تخضع للضريبة في بلد الوجهة.')}
    </div>
  </div>`;
}

function renderSettlement() {
  const box = document.getElementById('es-doc');
  if (!box) {
    return;
  }
  const v = settlementVals();
  if (v) {
    box.innerHTML = settlementDoc(v);
  }
}

function prefillLeave() {
  const e = emp(document.getElementById('es-emp')?.value);
  const end = document.getElementById('es-end')?.value || new Date().toISOString().slice(0, 10);
  const li = document.getElementById('es-leave');
  if (e && li) {
    li.value = unusedLeave(e, end);
    li.placeholder = li.value;
  }
}

export function initEosb() {
  const root = document.querySelector('[data-hr-eosb]');
  if (!root) {
    return;
  }
  fillEmpSelect('eo-emp');
  fillEmpSelect('es-emp');
  const rr = (id, val) => {
    const sel = document.getElementById(id);
    if (sel && !sel.options.length) {
      sel.innerHTML = REASONS.map(
        r => `<option value="${r.code}">${currentLang() === 'ar' ? r.ar : r.en}</option>`
      );
      if (val) {
        sel.value = val;
      }
    }
  };
  rr('eo-reason', 'termination');
  rr('es-reason', 'termination');
  const eb = document.getElementById('eo-basis');
  if (eb && !eb.options.length) {
    eb.innerHTML = `<option value="basic">${L('Basic wage', 'الأجر الأساسي')}</option>
      <option value="basic+housing"${getEosbConfig().basis === 'basic+housing' ? ' selected' : ''}>${L('Basic + housing', 'أساسي + سكن')}</option>`;
  }
  const today = new Date().toISOString().slice(0, 10);
  const ee = document.getElementById('eo-end');
  if (ee && !ee.value) {
    ee.value = today;
  }
  const se = document.getElementById('es-end');
  if (se && !se.value) {
    se.value = today;
  }
  prefillLeave();
  renderCalc();
  renderAccrual();
  renderSettlement();
  applyI18n(root);
  if (booted) {
    return;
  }
  booted = true;
  ['eo-emp', 'eo-end', 'eo-reason', 'eo-basis'].forEach(id =>
    document.getElementById(id)?.addEventListener('change', renderCalc)
  );
  ['es-emp', 'es-end', 'es-reason', 'es-leave', 'es-salary', 'es-ticket', 'es-other'].forEach(id =>
    document.getElementById(id)?.addEventListener('change', renderSettlement)
  );
  document.getElementById('es-emp')?.addEventListener('change', () => {
    prefillLeave();
    renderSettlement();
  });
  document.getElementById('es-end')?.addEventListener('change', () => {
    prefillLeave();
    renderSettlement();
  });
  document.getElementById('es-print')?.addEventListener('click', () => {
    const v = settlementVals();
    if (!v) {
      return;
    }
    showModal({
      title: `${v.e.code} · ${L('Settlement', 'التسوية')}`,
      size: 'lg',
      body: settlementDoc(v),
      actions: [
        { label: t('common.close'), variant: 'ghost' },
        {
          label: t('common.print'),
          variant: 'outline',
          action: () => {
            document.body.classList.add('inv-print');
            window.print();
            setTimeout(() => document.body.classList.remove('inv-print'), 500);
            return true;
          }
        }
      ]
    });
  });
  const cols = [
    { key: 'emp', label: 'Employee' },
    { key: 'name', label: 'Name' },
    { key: 'years', label: 'Service years' },
    { key: 'wage', label: 'Basis (SAR)' },
    { key: 'accrued', label: 'Accrued (SAR)' },
    { key: 'monthly', label: 'Monthly provision (SAR)' }
  ];
  document.getElementById('eo-export-xlsx')?.addEventListener('click', () => {
    exportData(
      'xlsx',
      'eosb-accrual',
      cols,
      accrualRows().map(r => ({
        emp: r.e.code,
        name: r.e.nameEn,
        years: r.years,
        wage: r.wage,
        accrued: r.accrued,
        monthly: r.monthly
      })),
      'EOSB accrual'
    );
  });
  document.getElementById('eo-export-csv')?.addEventListener('click', () => {
    exportCSV(
      'eosb-accrual.csv',
      cols,
      accrualRows().map(r => ({
        emp: r.e.code,
        name: r.e.nameEn,
        years: r.years,
        wage: r.wage,
        accrued: r.accrued,
        monthly: r.monthly
      }))
    );
  });
  document.getElementById('eo-copy')?.addEventListener('click', async () => {
    const c = calcResult();
    if (!c) {
      return;
    }
    try {
      await navigator.clipboard.writeText(
        `EOSB ${c.e.code} ${c.end} ${c.reason}: service ${c.r.years}y, gross ${c.r.gross}, net ${c.net} SAR`
      );
      showToast(L('Copied', 'نُسخ'), { variant: 'success' });
    } catch (_e) {
      showToast(L('Copy failed', 'فشل النسخ'), { variant: 'error' });
    }
  });
  window.addEventListener(LANG_EVENT, () => {
    renderCalc();
    renderAccrual();
    renderSettlement();
    applyI18n(root);
  });
}
