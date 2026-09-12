// HR + Operations — pay runs (hr_payroll.html).
// Lines are computed live from employees + per-run adjustments via calcPayLine
// so seed math can never drift; approved/paid runs are locked in the UI.
// Art. 40: employer-borne deduction cats (iqama/levy/insurance/recruitment)
// are rejected at save with an explanatory error and never persisted.

import { showToast } from './toast.js';
import { showModal } from './modal.js';
import { t, currentLang, LANG_EVENT, applyI18n } from './i18n.js';
import { fmtSAR } from './hr-locale.js';
import { calcPayLine, isBlockedDeduction } from './hr-statutory.js';
import { getSeed, patchSeedRow } from './hr-api.js';
import { exportData, exportCSV } from './import-export.js';

let booted = false;
let runId = null;

const DED_CATS = [
  { code: 'advance', en: 'Advance settlement', ar: 'سداد سلفة' },
  { code: 'loan', en: 'Loan installment', ar: 'قسط قرض' },
  { code: 'absence', en: 'Unpaid absence', ar: 'غياب بدون أجر' },
  { code: 'damage', en: 'Damage / loss', ar: 'تعويض تلف' },
  { code: 'other', en: 'Other (allowed)', ar: 'أخرى (مسموحة)' }
];

const ST_CLS = { draft: 'blue', approved: 'yellow', paid: 'green' };

function L(en, ar) {
  return currentLang() === 'ar' ? ar : en;
}

function emp(code) {
  return getSeed('employees').find(e => e.code === code);
}

function empName(code) {
  const e = emp(code);
  if (!e) {
    return code;
  }
  return currentLang() === 'ar' ? e.nameAr || e.nameEn : e.nameEn;
}

function runs() {
  return getSeed('payRuns');
}

function cur() {
  return runs().find(r => r.id === runId) || runs()[runs().length - 1];
}

function runLines(run) {
  const at = `${run.month}-15`;
  return getSeed('employees')
    .filter(e => e.st !== 'exited' && e.st !== 'huroob')
    .map(e => ({
    e,
    line: calcPayLine(e, { ...((run.adjustments || {})[e.code] || {}), at })
  }));
}

function totals(rows) {
  const sum = k => rows.reduce((s, r) => s + r.line[k], 0);
  return { gross: sum('gross'), gosi: sum('gosiEmp'), ded: sum('dedTotal'), net: sum('net') };
}

function statusChip(st) {
  return `<span class="status status-${ST_CLS[st] || 'blue'}">${t(`status.${st}`)}</span>`;
}

function renderRunSelect() {
  const sel = document.getElementById('pr-run');
  if (!sel) {
    return;
  }
  sel.innerHTML = runs().map(
    r => `<option value="${r.id}"${r.id === runId ? ' selected' : ''}>${r.id} · ${r.month}</option>`
  );
}

function renderHead(run) {
  const set = (id, v) => {
    const el = document.getElementById(id);
    if (el) {
      el.textContent = v;
    }
  };
  const chip = document.getElementById('pr-status');
  if (chip) {
    chip.innerHTML = statusChip(run.status);
  }
  set('pr-month', run.month);
  set('pr-paidon', run.paidOn || '—');
  const ap = document.getElementById('pr-approve');
  const py = document.getElementById('pr-pay');
  if (ap) {
    ap.disabled = run.status !== 'draft';
  }
  if (py) {
    py.disabled = run.status !== 'approved';
  }
  const note = document.getElementById('pr-lock');
  if (note) {
    note.style.display = run.status === 'draft' ? 'none' : '';
  }
}

function renderStats(rows) {
  const set = (id, v) => {
    const el = document.getElementById(id);
    if (el) {
      el.textContent = v;
    }
  };
  const tt = totals(rows);
  set('pr-stat-gross', fmtSAR(tt.gross));
  set('pr-stat-gosi', fmtSAR(tt.gosi));
  set('pr-stat-ded', fmtSAR(tt.ded));
  set('pr-stat-net', fmtSAR(tt.net));
}

function renderRows(run, rows) {
  const el = document.getElementById('pr-rows');
  if (!el) {
    return;
  }
  const locked = run.status !== 'draft';
  el.innerHTML = rows
    .map(({ e, line }) => {
      const wage = (e.basic || 0) + (e.housing || 0) + (e.transport || 0);
      const flag = line.blocked.length
        ? `<div><span class="status status-red">${L('Blocked deduction!', 'استقطاع محظور!')}</span></div>`
        : '';
      return `<tr>
      <td data-label="${L('Employee', 'الموظف')}"><strong>${empName(e.code)}</strong>
        <div style="font-size:11.5px;color:var(--text-muted)" dir="ltr">${e.code}</div>${flag}</td>
      <td data-label="${L('Wage', 'الأجر')}" dir="ltr">${fmtSAR(wage)}</td>
      <td data-label="OT" dir="ltr">${line.otH ? `${line.otH}h · ${fmtSAR(line.otPay)}` : '—'}</td>
      <td data-label="${L('Extras', 'إضافي')}" dir="ltr">${line.extras ? fmtSAR(line.extras) : '—'}</td>
      <td data-label="${L('Gross', 'الإجمالي')}" dir="ltr"><strong>${fmtSAR(line.gross)}</strong></td>
      <td data-label="${L('GOSI', 'التأمينات')}" dir="ltr">${fmtSAR(line.gosiEmp)}</td>
      <td data-label="${L('Deductions', 'الاستقطاعات')}" dir="ltr">${line.dedTotal ? fmtSAR(line.dedTotal) : '—'}</td>
      <td data-label="${L('Net', 'الصافي')}" dir="ltr"><strong>${fmtSAR(line.net)}</strong></td>
      <td data-label=""><div style="display:flex;gap:6px;flex-wrap:wrap">
        ${locked ? '' : `<button class="btn btn-outline btn-sm" data-adj="${e.code}">${L('Adjust', 'تعديل')}</button>`}
        <a class="btn btn-outline btn-sm" href="hr_payslip.html?run=${run.id}&emp=${e.code}">${L('Payslip', 'القسيمة')}</a>
      </div></td>
    </tr>`;
    })
    .join('');
}

function renderAll() {
  const run = cur();
  if (!run) {
    return;
  }
  runId = run.id;
  renderRunSelect();
  renderHead(run);
  const rows = runLines(run);
  renderStats(rows);
  renderRows(run, rows);
  applyI18n(document.querySelector('[data-hr-payroll]') || document);
}

function dedCatLabel(code) {
  const c = DED_CATS.find(x => x.code === code);
  if (!c) {
    return code;
  }
  return currentLang() === 'ar' ? c.ar : c.en;
}

function openAdjustModal(code) {
  const run = cur();
  const e = emp(code);
  if (!run || !e || run.status !== 'draft') {
    return;
  }
  const adj = {
    otH: 0,
    extras: 0,
    extrasLabel: '',
    deductions: [],
    ...((run.adjustments || {})[code] || {})
  };
  const dedRows = () =>
    (adj.deductions || [])
      .map(
        (
          d,
          i
        ) => `<div class="hr-kv" data-ded="${i}"><span>${d.label || ''} <em style="color:var(--text-muted)">(${dedCatLabel(d.cat)})</em></span>
        <span><strong dir="ltr">${fmtSAR(d.amount)}</strong>
        <button type="button" class="btn btn-outline btn-sm" data-ded-del="${i}">${L('Remove', 'إزالة')}</button></span></div>`
      )
      .join('') || `<div class="hr-empty">${L('No deductions', 'لا استقطاعات')}</div>`;
  showModal({
    title: `${L('Adjust', 'تعديل')} — ${empName(code)}`,
    size: 'lg',
    body: `<div class="hr-form-2col">
        <div class="form-group"><label class="form-label" for="ad-ot">${L('Overtime hours', 'ساعات إضافية')}</label>
          <input class="form-control" id="ad-ot" type="number" min="0" step="0.5" value="${adj.otH || 0}" dir="ltr"></div>
        <div class="form-group"><label class="form-label" for="ad-ex">${L('Extras (SAR)', 'إضافي (ر.س)')}</label>
          <input class="form-control" id="ad-ex" type="number" min="0" step="1" value="${adj.extras || 0}" dir="ltr"></div>
      </div>
      <div class="form-group"><label class="form-label" for="ad-exl">${L('Extras label', 'بيان الإضافي')}</label>
        <input class="form-control" id="ad-exl" value="${adj.extrasLabel || ''}" placeholder="${L('e.g. Site allowance', 'مثال: بدل موقع')}"></div>
      <h4 style="margin:12px 0 6px">${L('Deductions', 'الاستقطاعات')}</h4>
      <div id="ad-deds">${dedRows()}</div>
      <div class="hr-form-2col" style="margin-top:8px">
        <div class="form-group"><label class="form-label" for="ad-dl">${L('Label', 'البيان')}</label>
          <input class="form-control" id="ad-dl" placeholder="${L('e.g. Advance settlement', 'مثال: سداد سلفة')}"></div>
        <div class="form-group"><label class="form-label" for="ad-dc">${L('Category', 'الفئة')}</label>
          <select class="form-control" id="ad-dc">${DED_CATS.map(c => `<option value="${c.code}">${currentLang() === 'ar' ? c.ar : c.en}</option>`).join('')}</select></div>
        <div class="form-group"><label class="form-label" for="ad-da">${L('Amount (SAR)', 'المبلغ (ر.س)')}</label>
          <input class="form-control" id="ad-da" type="number" min="0" step="1" dir="ltr"></div>
        <div class="form-group"><label class="form-label">&nbsp;</label>
          <button type="button" class="btn btn-outline" id="ad-add">${L('Add deduction', 'إضافة استقطاع')}</button></div>
      </div>
      <div class="hr-note" style="margin-top:8px">⚖️ ${L(
        'Art. 40: Iqama / levy / insurance / recruitment costs are employer-borne and can never be deducted from pay.',
        'المادة 40: تكاليف الإقامة والرخص والتأمين والاستقدام على صاحب العمل ولا يجوز استقطاعها من الأجر.'
      )}</div>`,
    actions: [
      { label: t('common.cancel'), variant: 'ghost' },
      {
        label: t('common.save'),
        variant: 'primary',
        action: ({ body }) => {
          const deds = [...(adj.deductions || [])];
          const blocked = deds.filter(d => isBlockedDeduction(d.cat));
          if (blocked.length) {
            showToast(
              L(
                `Blocked by Art. 40: ${blocked.map(d => d.cat).join(', ')} — employer bears these costs`,
                `محظور بالمادة 40: ${blocked.map(d => d.cat).join('، ')} — هذه التكاليف على صاحب العمل`
              ),
              { variant: 'error' }
            );
            return false;
          }
          const next = {
            ...(run.adjustments || {}),
            [code]: {
              otH: Number(body.querySelector('#ad-ot').value) || 0,
              extras: Number(body.querySelector('#ad-ex').value) || 0,
              extrasLabel: body.querySelector('#ad-exl').value.trim(),
              deductions: deds
            }
          };
          patchSeedRow('payRuns', run, { adjustments: next });
          renderAll();
          showToast(L('Adjustment saved', 'حُفظ التعديل'), { variant: 'success' });
          return true;
        }
      }
    ]
  });
  const dlg = document.querySelector('.modal-backdrop:last-child') || document;
  const box = () => dlg.querySelector('#ad-deds');
  const refresh = () => {
    if (box()) {
      box().innerHTML = dedRows();
    }
  };
  dlg.querySelector('#ad-add')?.addEventListener('click', () => {
    const label = dlg.querySelector('#ad-dl').value.trim();
    const cat = dlg.querySelector('#ad-dc').value;
    const amount = Number(dlg.querySelector('#ad-da').value) || 0;
    if (!label || !(amount > 0)) {
      showToast(L('Enter a label and a positive amount', 'أدخل البيان ومبلغًا موجبًا'), {
        variant: 'warning'
      });
      return;
    }
    if (isBlockedDeduction(cat)) {
      showToast(
        L('Blocked by Art. 40: employer-borne cost', 'محظور بالمادة 40: تكلفة على صاحب العمل'),
        {
          variant: 'error'
        }
      );
      return;
    }
    adj.deductions = [...(adj.deductions || []), { label, cat, amount }];
    dlg.querySelector('#ad-dl').value = '';
    dlg.querySelector('#ad-da').value = '';
    refresh();
  });
  dlg.querySelector('#ad-deds')?.addEventListener('click', e2 => {
    const del = e2.target.closest('[data-ded-del]');
    if (!del) {
      return;
    }
    adj.deductions = (adj.deductions || []).filter((_, i) => i !== Number(del.dataset.dedDel));
    refresh();
  });
}

function exportCols() {
  return [
    { key: 'emp', label: 'Employee' },
    { key: 'name', label: 'Name' },
    { key: 'wage', label: 'Wage (SAR)' },
    { key: 'otH', label: 'OT hours' },
    { key: 'otPay', label: 'OT pay (SAR)' },
    { key: 'extras', label: 'Extras (SAR)' },
    { key: 'gross', label: 'Gross (SAR)' },
    { key: 'gosiBase', label: 'GOSI base (SAR)' },
    { key: 'gosiEmp', label: 'GOSI employee (SAR)' },
    { key: 'gosiEr', label: 'GOSI employer (SAR)' },
    { key: 'dedTotal', label: 'Deductions (SAR)' },
    { key: 'net', label: 'Net (SAR)' }
  ];
}

function exportRows(run, rows) {
  return rows.map(({ e, line }) => ({
    emp: e.code,
    name: e.nameEn,
    wage: (e.basic || 0) + (e.housing || 0) + (e.transport || 0),
    otH: line.otH,
    otPay: line.otPay,
    extras: line.extras,
    gross: line.gross,
    gosiBase: line.gosiBase,
    gosiEmp: line.gosiEmp,
    gosiEr: line.gosiEr,
    dedTotal: line.dedTotal,
    net: line.net
  }));
}

export function initPayroll() {
  const root = document.querySelector('[data-hr-payroll]');
  if (!root) {
    return;
  }
  const qs = new URLSearchParams(location.search);
  runId = qs.get('run') || null;
  renderAll();
  if (booted) {
    return;
  }
  booted = true;
  document.getElementById('pr-run')?.addEventListener('change', e => {
    runId = e.target.value;
    renderAll();
  });
  document.getElementById('pr-rows')?.addEventListener('click', e => {
    const b = e.target.closest('[data-adj]');
    if (b) {
      openAdjustModal(b.dataset.adj);
    }
  });
  document.getElementById('pr-approve')?.addEventListener('click', () => {
    const run = cur();
    if (!run || run.status !== 'draft') {
      return;
    }
    const bad = runLines(run).filter(r => r.line.blocked.length);
    if (bad.length) {
      showToast(
        L(
          `Cannot approve: Art. 40 blocked deductions on ${bad.map(r => r.e.code).join(', ')}`,
          `لا يمكن الاعتماد: استقطاعات محظورة بالمادة 40 على ${bad.map(r => r.e.code).join('، ')}`
        ),
        { variant: 'error' }
      );
      return;
    }
    patchSeedRow('payRuns', run, { status: 'approved' });
    renderAll();
    showToast(L('Run approved', 'اعتُمدت المسيرة'), { variant: 'success' });
  });
  document.getElementById('pr-pay')?.addEventListener('click', () => {
    const run = cur();
    if (!run || run.status !== 'approved') {
      return;
    }
    patchSeedRow('payRuns', run, { status: 'paid', paidOn: new Date().toISOString().slice(0, 10) });
    renderAll();
    showToast(
      L('Run marked paid — file the SIF in WPS', 'سُددت المسيرة — ارفع ملف الأجور في مدد'),
      {
        variant: 'success'
      }
    );
  });
  document.getElementById('pr-export-xlsx')?.addEventListener('click', () => {
    const run = cur();
    exportData(
      'xlsx',
      `payrun-${run.month}`,
      exportCols(),
      exportRows(run, runLines(run)),
      'Pay run'
    );
  });
  document.getElementById('pr-export-csv')?.addEventListener('click', () => {
    const run = cur();
    exportCSV(`payrun-${run.month}.csv`, exportCols(), exportRows(run, runLines(run)));
  });
  window.addEventListener(LANG_EVENT, renderAll);
}
