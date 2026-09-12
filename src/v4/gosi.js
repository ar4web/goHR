// HR + Operations — GOSI report (hr_gosi.html).
// Contributory wage = basic + housing (cap SAR 45,000). Old system (enrolled
// before 3 Jul 2024) is fixed 9.75/11.75; new system follows the graduated
// pension ladder; expats are hazards-only 2% employer (§0.6).

import { currentLang, LANG_EVENT, applyI18n } from './i18n.js';
import { fmtSAR } from './hr-locale.js';
import { calcGosi } from './hr-statutory.js';
import { GOSI_CAP } from './hr-seed.js';
import { getSeed } from './hr-api.js';
import { exportData, exportCSV } from './import-export.js';

let booted = false;

function L(en, ar) {
  return currentLang() === 'ar' ? ar : en;
}

function empName(e) {
  return currentLang() === 'ar' ? e.nameAr || e.nameEn : e.nameEn;
}

function monthVal() {
  const el = document.getElementById('gs-month');
  if (el && !el.value) {
    const list = getSeed('payRuns');
    el.value = (list[list.length - 1] || {}).month || new Date().toISOString().slice(0, 7);
  }
  return el?.value || new Date().toISOString().slice(0, 7);
}

function rows() {
  const at = `${monthVal()}-15`;
  return getSeed('employees')
    .filter(e => e.st !== 'exited' && e.st !== 'huroob')
    .map(e => ({
    e,
    g: calcGosi({
      basic: e.basic,
      housing: e.housing,
      isSaudi: !!e.saudi,
      enrolledOn: e.gosiOn,
      at
    })
  }));
}

function sysChip(sys) {
  const map = {
    old: ['yellow', L('Old system', 'النظام القديم')],
    new: ['green', L('New system', 'النظام الجديد')],
    expat: ['blue', L('Expat', 'أجنبي')]
  };
  const [cls, lbl] = map[sys] || map.expat;
  return `<span class="status status-${cls}">${lbl}</span>`;
}

function renderAll() {
  const set = (id, v) => {
    const el = document.getElementById(id);
    if (el) {
      el.textContent = v;
    }
  };
  const rs = rows();
  const sum = k => rs.reduce((s, r) => s + r.g[k], 0);
  set('gs-stat-base', fmtSAR(sum('base')));
  set('gs-stat-emp', fmtSAR(sum('employee')));
  set('gs-stat-er', fmtSAR(sum('employer')));
  const saudis = rs.filter(r => r.g.system !== 'expat').length;
  set('gs-stat-hc', `${rs.length} · ${L('Saudis', 'سعوديون')}: ${saudis}`);
  const el = document.getElementById('gs-rows');
  if (el) {
    el.innerHTML = rs
      .map(
        ({ e, g }) => `<tr>
      <td data-label="${L('Employee', 'الموظف')}"><strong>${empName(e)}</strong>
        <div style="font-size:11.5px;color:var(--text-muted)" dir="ltr">${e.code}</div></td>
      <td data-label="${L('System', 'النظام')}">${sysChip(g.system)}</td>
      <td data-label="${L('Base', 'الوعاء')}" dir="ltr">${fmtSAR(g.base)}</td>
      <td data-label="${L('Pension', 'المعاش')}" dir="ltr">${fmtSAR(g.pension)}</td>
      <td data-label="SANED" dir="ltr">${fmtSAR(g.saned)}</td>
      <td data-label="${L('Hazards', 'الأخطار')}" dir="ltr">${fmtSAR(g.hazards)}</td>
      <td data-label="${L('Employee', 'الموظف')}" dir="ltr"><strong>${fmtSAR(g.employee)}</strong></td>
      <td data-label="${L('Employer', 'صاحب العمل')}" dir="ltr"><strong>${fmtSAR(g.employer)}</strong></td>
    </tr>`
      )
      .join('');
  }
  const f = document.getElementById('gs-file');
  if (f) {
    f.innerHTML = `<div class="hr-kv"><span>${L('Contributory wage', 'الأجر الخاضع')}</span><strong dir="ltr">${fmtSAR(sum('base'))}</strong></div>
      <div class="hr-kv"><span>${L('Employee share (deducted in payroll)', 'حصة الموظف (تُستقطع في المسيرة)')}</span><strong dir="ltr">${fmtSAR(sum('employee'))}</strong></div>
      <div class="hr-kv"><span>${L('Employer share (company cost)', 'حصة صاحب العمل (تكلفة الشركة)')}</span><strong dir="ltr">${fmtSAR(sum('employer'))}</strong></div>
      <div class="hr-kv"><span>${L('Total filing', 'إجمالي السداد')}</span><strong dir="ltr">${fmtSAR(sum('employee') + sum('employer'))}</strong></div>
      <div class="hr-note" style="margin-top:8px">ℹ️ ${L(
        `Cap SAR ${GOSI_CAP.toLocaleString('en-US')}/month on basic+housing. Mudad cross-checks GOSI vs WPS (~20% tolerance) — keep payroll, GOSI and SIF in the same month.`,
        `الحد الأقصى ${GOSI_CAP.toLocaleString('en-US')} ر.س شهريًا على الأساسي والسكن. تقارن مدد التأمينات مع الأجور (تفاوت ~20%) — حافظ على تطابق أشهر المسيرة والتأمينات والملف.`
      )}</div>`;
  }
  applyI18n(document.querySelector('[data-hr-gosi]') || document);
}

function exportCols() {
  return [
    { key: 'emp', label: 'Employee' },
    { key: 'name', label: 'Name' },
    { key: 'system', label: 'System' },
    { key: 'base', label: 'Base (SAR)' },
    { key: 'pension', label: 'Pension (SAR)' },
    { key: 'saned', label: 'SANED (SAR)' },
    { key: 'hazards', label: 'Hazards (SAR)' },
    { key: 'employee', label: 'Employee share (SAR)' },
    { key: 'employer', label: 'Employer share (SAR)' }
  ];
}

export function initGosi() {
  const root = document.querySelector('[data-hr-gosi]');
  if (!root) {
    return;
  }
  renderAll();
  if (booted) {
    return;
  }
  booted = true;
  document.getElementById('gs-month')?.addEventListener('change', renderAll);
  const payload = () =>
    rows().map(({ e, g }) => ({ emp: e.code, name: e.nameEn, system: g.system, ...g }));
  document.getElementById('gs-export-xlsx')?.addEventListener('click', () => {
    exportData('xlsx', `gosi-${monthVal()}`, exportCols(), payload(), 'GOSI');
  });
  document.getElementById('gs-export-csv')?.addEventListener('click', () => {
    exportCSV(`gosi-${monthVal()}.csv`, exportCols(), payload());
  });
  window.addEventListener(LANG_EVENT, renderAll);
}
