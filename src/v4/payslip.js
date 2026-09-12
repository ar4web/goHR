// HR + Operations — bilingual payslip (hr_payslip.html).
// Rendered from the pay-run line (calcPayLine); GOSI-only deductions —
// KSA has no personal income tax and no wage withholding (§0.9).

import { showModal } from './modal.js';
import { t, currentLang, LANG_EVENT, applyI18n } from './i18n.js';
import { fmtSAR } from './hr-locale.js';
import { calcPayLine, sellerProfile } from './hr-statutory.js';
import { getSeed } from './hr-api.js';

let booted = false;

function L(en, ar) {
  return currentLang() === 'ar' ? ar : en;
}

function emp(code) {
  return getSeed('employees').find(e => e.code === code);
}

function empName(e) {
  if (!e) {
    return '';
  }
  return currentLang() === 'ar' ? e.nameAr || e.nameEn : e.nameEn;
}

function run(id) {
  const list = getSeed('payRuns');
  return list.find(r => r.id === id) || list[list.length - 1];
}

function seller() {
  return sellerProfile();
}

function gosiSystemLabel(sys) {
  return sys === 'old'
    ? L('Saudi — old system', 'سعودي — النظام القديم')
    : sys === 'new'
      ? L('Saudi — new system', 'سعودي — النظام الجديد')
      : L('Expat — hazards only', 'أجنبي — أخطار مهنية فقط');
}

function payslipDoc(r, e, line) {
  const s = seller();
  const idNo = e.saudi ? e.nid : e.iqama;
  const earn = [
    [L('Basic salary', 'الراتب الأساسي'), e.basic],
    [L('Housing allowance', 'بدل السكن'), e.housing],
    [L('Transport allowance', 'بدل النقل'), e.transport]
  ];
  if (line.otH) {
    earn.push([`${L('Overtime', 'عمل إضافي')} (${line.otH}h)`, line.otPay]);
  }
  if (line.extras) {
    const adj = (r.adjustments || {})[e.code] || {};
    earn.push([adj.extrasLabel || L('Extras', 'إضافي'), line.extras]);
  }
  const ded = [[`${L('GOSI — employee share', 'التأمينات — حصة الموظف')}`, line.gosiEmp]];
  for (const d of line.deductions || []) {
    ded.push([d.label, d.amount]);
  }
  const row = ([lbl, amt]) =>
    `<div class="hr-kv"><span>${lbl}</span><strong dir="ltr">${fmtSAR(amt || 0)}</strong></div>`;
  return `<div class="inv-doc">
    <div class="inv-head">
      <div><div class="inv-title">${currentLang() === 'ar' ? s.nameAr || s.nameEn : s.nameEn}</div>
        <div style="font-size:12px;color:var(--text-muted)" dir="auto">CR ${s.cr || '—'} · VAT ${s.vat || '—'} · ${s.address || ''}</div></div>
      <div style="text-align:end"><div class="inv-title">${L('PAYSLIP', 'قسيمة راتب')}</div>
        <div style="font-size:12px" dir="ltr">${r.month}</div></div>
    </div>
    <div class="hr-form-2col" style="margin:12px 0;font-size:12.5px">
      <div><strong>${empName(e)}</strong><br><span dir="ltr">${e.code}</span> · ${e.saudi ? L('National ID', 'الهوية') : L('Iqama', 'الإقامة')} <span dir="ltr">${idNo || '—'}</span></div>
      <div dir="ltr">${e.titleEn || ''} · ${e.dept || ''}<br>${L('IBAN', 'الآيبان')}: ${e.iban || '—'}</div>
    </div>
    <div class="hr-form-2col">
      <div><h4 style="margin:0 0 6px">${L('Earnings', 'المستحقات')}</h4>${earn.map(row).join('')}
        <div class="hr-kv"><span><strong>${L('Gross', 'الإجمالي')}</strong></span><strong dir="ltr">${fmtSAR(line.gross)}</strong></div></div>
      <div><h4 style="margin:0 0 6px">${L('Deductions', 'الاستقطاعات')}</h4>${ded.map(row).join('')}
        <div class="hr-kv"><span><strong>${L('Total deductions', 'إجمالي الاستقطاعات')}</strong></span><strong dir="ltr">${fmtSAR(line.gosiEmp + line.dedTotal)}</strong></div></div>
    </div>
    <div class="hr-kv" style="margin-top:10px;font-size:16px"><span><strong>${L('Net payable', 'صافي المستحق')}</strong></span><strong dir="ltr">${fmtSAR(line.net)}</strong></div>
    <div style="font-size:12px;color:var(--text-muted);margin-top:8px" dir="auto">
      ${L('GOSI base', 'وعاء التأمينات')}: <span dir="ltr">${fmtSAR(line.gosiBase)}</span> · ${gosiSystemLabel(line.gosiSystem)}<br>
      ${L('No income-tax withholding — PIT is 0% in KSA.', 'لا يوجد استقطاع ضريبة دخل — ضريبة الدخل 0% في السعودية.')}<br>
      ${r.status === 'paid' && r.paidOn ? `${L('Paid on', 'تاريخ السداد')}: <span dir="ltr">${r.paidOn}</span>` : `${L('Status', 'الحالة')}: ${t(`status.${r.status}`)}`}
    </div>
  </div>`;
}

function currentSel() {
  const r = run(document.getElementById('ps-run')?.value);
  const code = document.getElementById('ps-emp')?.value || getSeed('employees')[0]?.code;
  return { r, e: emp(code) };
}

function render() {
  const { r, e } = currentSel();
  const box = document.getElementById('ps-doc');
  if (!box || !r || !e) {
    return;
  }
  const line = calcPayLine(e, { ...((r.adjustments || {})[e.code] || {}), at: `${r.month}-15` });
  box.innerHTML = payslipDoc(r, e, line);
  applyI18n(document.querySelector('[data-hr-payslip]') || document);
}

function fillSelects() {
  const qs = new URLSearchParams(location.search);
  const rsel = document.getElementById('ps-run');
  const esel = document.getElementById('ps-emp');
  if (rsel && !rsel.options.length) {
    rsel.innerHTML = getSeed('payRuns').map(
      r =>
        `<option value="${r.id}"${r.id === qs.get('run') ? ' selected' : ''}>${r.id} · ${r.month}</option>`
    );
    if (qs.get('run')) {
      rsel.value = qs.get('run');
    } else {
      rsel.selectedIndex = rsel.options.length - 1;
    }
  }
  if (esel && !esel.options.length) {
    esel.innerHTML = getSeed('employees').map(
      e =>
        `<option value="${e.code}"${e.code === qs.get('emp') ? ' selected' : ''}>${e.code} — ${empName(e)}</option>`
    );
  }
}

export function initPayslip() {
  const root = document.querySelector('[data-hr-payslip]');
  if (!root) {
    return;
  }
  fillSelects();
  render();
  if (booted) {
    return;
  }
  booted = true;
  document.getElementById('ps-run')?.addEventListener('change', render);
  document.getElementById('ps-emp')?.addEventListener('change', render);
  document.getElementById('ps-print')?.addEventListener('click', () => {
    const { r, e } = currentSel();
    if (!r || !e) {
      return;
    }
    const line = calcPayLine(e, { ...((r.adjustments || {})[e.code] || {}), at: `${r.month}-15` });
    showModal({
      title: `${e.code} · ${r.month}`,
      size: 'lg',
      body: payslipDoc(r, e, line),
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
  window.addEventListener(LANG_EVENT, () => {
    fillSelects();
    render();
  });
}
