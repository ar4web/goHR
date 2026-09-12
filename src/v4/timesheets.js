// HR + Operations — timesheets (hr_timesheets.html).
// Week grid per site + submit + lock. Approval happens in hr_approvals.

import { showToast } from './toast.js';
import { showModal } from './modal.js';
import { t, currentLang, LANG_EVENT, applyI18n } from './i18n.js';
import { MAX_DAY_HOURS, RAMADAN_DAY_HOURS } from './hr-statutory.js';
import { getSeed, patchSeedRow, saveImportedRows } from './hr-api.js';
import { exportData } from './import-export.js';
import { openImportModal } from './import-modal.js';
import { SITES } from './hr-seed.js';

let booted = false;
let selected = '';

function L(en, ar) {
  return currentLang() === 'ar' ? ar : en;
}

function empName(code) {
  const e = getSeed('employees').find(x => x.code === code);
  if (!e) {
    return code;
  }
  return currentLang() === 'ar' ? e.nameAr || e.nameEn : e.nameEn;
}

function siteName(id) {
  const s = SITES.find(x => x.id === id);
  if (!s) {
    return id;
  }
  return currentLang() === 'ar' ? s.nameAr : s.nameEn;
}

function totals(ts) {
  return (ts.lines || []).reduce(
    (s, l) => ({
      days: s.days + (l.days || 0),
      reg: s.reg + (l.regH || 0),
      ot: s.ot + (l.otH || 0)
    }),
    { days: 0, reg: 0, ot: 0 }
  );
}

// KSA guards: ≤11h/day average; Ramadan regular ≤6h/day average.
function guard(ts) {
  const problems = [];
  for (const l of ts.lines || []) {
    const d = l.days || 0;
    if (!d) {
      continue;
    }
    const avg = ((l.regH || 0) + (l.otH || 0)) / d;
    if (avg > MAX_DAY_HOURS + 1e-9) {
      problems.push(`${l.emp}: ${avg.toFixed(1)}h/${L('day', 'يوم')} > ${MAX_DAY_HOURS}h`);
    }
    if (ts.ramadan && (l.regH || 0) / d > RAMADAN_DAY_HOURS + 1e-9) {
      problems.push(
        `${l.emp}: ${L('Ramadan regular over 6h/day', 'الأساسي في رمضان فوق 6 ساعات')}`
      );
    }
  }
  return problems;
}

const TS_CLS = { draft: 'blue', submitted: 'yellow', approved: 'green', rejected: 'red' };

function renderStats() {
  const list = getSeed('timesheets');
  const set = (id, v) => {
    const el = document.getElementById(id);
    if (el) {
      el.textContent = v;
    }
  };
  set('ts-stat-draft', list.filter(x => x.status === 'draft').length);
  set('ts-stat-sub', list.filter(x => x.status === 'submitted').length);
  set('ts-stat-appr', list.filter(x => x.status === 'approved').length);
  const ot = list.reduce((s, x) => s + totals(x).ot, 0);
  set('ts-stat-ot', `${ot}h`);
}

function renderList() {
  const el = document.getElementById('ts-rows');
  if (!el) {
    return;
  }
  el.innerHTML = getSeed('timesheets')
    .map(x => {
      const tt = totals(x);
      return `<tr class="${selected === x.id ? 'row-selected' : ''}">
      <td data-label="#"><span dir="ltr">${x.id}</span></td>
      <td data-label="${L('Site', 'الموقع')}">${siteName(x.site)}</td>
      <td data-label="${L('Week', 'الأسبوع')}" style="font-size:12.5px" dir="ltr">${x.weekStart}${x.ramadan ? ` <span class="status status-blue">${L('Ramadan', 'رمضان')}</span>` : ''}</td>
      <td data-label="${L('Reg / OT', 'أساسي / إضافي')}" dir="ltr">${tt.reg}h / ${tt.ot}h</td>
      <td data-label="${t('common.status')}"><span class="status status-${TS_CLS[x.status] || 'blue'}">${t(`status.${x.status}`)}</span></td>
      <td data-label=""><button class="btn btn-outline btn-sm" data-open="${x.id}">${t('common.open')}</button></td>
    </tr>`;
    })
    .join('');
}

function renderDetail() {
  const el = document.getElementById('ts-detail');
  if (!el) {
    return;
  }
  const x = selected ? getSeed('timesheets').find(r => r.id === selected) : null;
  if (!x) {
    el.innerHTML = `<div class="hr-empty">${L('Select a timesheet to review the week grid.', 'اختر كشفًا لمراجعة شبكة الأسبوع.')}</div>`;
    return;
  }
  const tt = totals(x);
  const locked = x.status !== 'draft';
  const problems = guard(x);
  el.innerHTML = `
    <div class="hr-360-top" style="margin-bottom:12px">
      <div style="flex:1;min-width:0">
        <div class="cell-strong" style="font-size:15px" dir="ltr">${x.id}</div>
        <div style="font-size:12.5px;color:var(--text-muted)">${siteName(x.site)} · <span dir="ltr">${x.weekStart}</span></div>
      </div>
      <span class="status status-${TS_CLS[x.status]}">${t(`status.${x.status}`)}</span>
    </div>
    ${problems.length && !locked ? `<div style="margin-bottom:10px">${problems.map(p => `<div><span class="status status-red" dir="auto">${p}</span></div>`).join('')}</div>` : ''}
    <div class="table-responsive"><table class="table"><thead><tr>
      <th>${L('Worker', 'العامل')}</th><th>${L('Days', 'الأيام')}</th><th>${L('Regular h', 'الأساسي')}</th><th>${L('OT h', 'الإضافي')}</th><th>${L('Total', 'الإجمالي')}</th>${locked ? '' : '<th></th>'}
    </tr></thead><tbody>
    ${(x.lines || [])
      .map(
        l => `<tr>
      <td data-label="${L('Worker', 'العامل')}"><a href="hr_employee.html?code=${l.emp}">${empName(l.emp)}</a></td>
      <td data-label="${L('Days', 'الأيام')}" dir="ltr">${l.days}</td>
      <td data-label="${L('Regular h', 'الأساسي')}" dir="ltr">${l.regH}</td>
      <td data-label="${L('OT h', 'الإضافي')}" dir="ltr">${l.otH}</td>
      <td data-label="${L('Total', 'الإجمالي')}" dir="ltr"><b>${(l.regH || 0) + (l.otH || 0)}</b></td>
      ${locked ? '' : `<td data-label=""><button class="btn btn-outline btn-sm" data-line="${l.emp}">${t('common.edit')}</button></td>`}
    </tr>`
      )
      .join('')}
    </tbody></table></div>
    <div class="hr-kv-grid" style="margin-top:10px">
      <div class="hr-kv"><span>${L('Total regular', 'إجمالي الأساسي')}</span><strong dir="ltr">${tt.reg}h</strong></div>
      <div class="hr-kv"><span>${L('Total overtime', 'إجمالي الإضافي')}</span><strong dir="ltr">${tt.ot}h</strong></div>
    </div>
    ${
      locked
        ? `<p style="font-size:12.5px;color:var(--text-muted)">${x.status === 'approved' ? L('Locked — feeds client billing (P3).', 'مقفل — يغذي فوترة العملاء.') : L('Locked — waiting in the approvals queue.', 'مقفل — بانتظار الموافقات.')} <a href="hr_approvals.html">${L('Open approvals', 'فتح الموافقات')}</a></p>`
        : `<div style="display:flex;gap:8px;margin-top:10px"><button class="btn btn-primary btn-sm" id="ts-submit">${L('Submit for approval', 'اعتماد وإرسال')}</button></div>`
    }`;
  document.getElementById('ts-submit')?.addEventListener('click', () => {
    const p = guard(x);
    if (p.length) {
      showToast(L('Fix guard violations first', 'أصلح المخالفات أولًا'), { variant: 'warning' });
      return;
    }
    patchSeedRow('timesheets', x, {
      status: 'submitted',
      step: 0,
      submittedBy: 'Site supervisor',
      submittedAt: new Date().toISOString().slice(0, 10)
    });
    renderAll();
    showToast(L('Submitted to approvals', 'أُرسل للموافقات'), { variant: 'success' });
  });
  el.querySelectorAll('[data-line]').forEach(b =>
    b.addEventListener('click', () => openLineModal(x, b.dataset.line))
  );
}

function openLineModal(x, emp) {
  const line = (x.lines || []).find(l => l.emp === emp);
  if (!line) {
    return;
  }
  showModal({
    title: `${L('Week line', 'سطر الأسبوع')} · ${emp}`,
    body: `<div class="hr-form-2col">
        <div class="form-group"><label class="form-label" for="tl-days">${L('Days', 'الأيام')}</label>
          <input class="form-control" id="tl-days" type="number" min="0" max="7" value="${line.days}" dir="ltr"></div>
        <div class="form-group"><label class="form-label" for="tl-reg">${L('Regular h', 'الأساسي')}</label>
          <input class="form-control" id="tl-reg" type="number" min="0" value="${line.regH}" dir="ltr"></div>
      </div>
      <div class="form-group" style="margin-bottom:0"><label class="form-label" for="tl-ot">${L('OT h', 'الإضافي')}</label>
        <input class="form-control" id="tl-ot" type="number" min="0" value="${line.otH}" dir="ltr"></div>`,
    actions: [
      { label: t('common.cancel'), variant: 'ghost' },
      {
        label: t('common.save'),
        variant: 'primary',
        action: ({ body }) => {
          const days = Number(body.querySelector('#tl-days').value);
          const regH = Number(body.querySelector('#tl-reg').value);
          const otH = Number(body.querySelector('#tl-ot').value);
          const lines = (x.lines || []).map(l => (l.emp === emp ? { ...l, days, regH, otH } : l));
          patchSeedRow('timesheets', x, { lines });
          renderAll();
          showToast(L('Line saved', 'تم حفظ السطر'), { variant: 'success' });
          return true;
        }
      }
    ]
  });
}

function openNewModal() {
  const sunday = (() => {
    const d = new Date();
    d.setDate(d.getDate() - d.getDay());
    return d.toISOString().slice(0, 10);
  })();
  showModal({
    title: L('New timesheet', 'كشف دوام جديد'),
    body: `<div class="form-group"><label class="form-label" for="tn-site">${L('Site', 'الموقع')}</label>
        <select class="form-control" id="tn-site">${SITES.map(s => `<option value="${s.id}">${L(s.nameEn, s.nameAr)}</option>`).join('')}</select></div>
      <div class="form-group" style="margin-bottom:0"><label class="form-label" for="tn-week">${L('Week start (Sunday)', 'بداية الأسبوع (الأحد)')}</label>
        <input class="form-control" id="tn-week" type="date" value="${sunday}" dir="ltr"></div>`,
    actions: [
      { label: t('common.cancel'), variant: 'ghost' },
      {
        label: t('common.save'),
        variant: 'primary',
        action: ({ body }) => {
          const site = body.querySelector('#tn-site').value;
          const weekStart = body.querySelector('#tn-week').value;
          if (!weekStart) {
            showToast(L('Week start is required', 'بداية الأسبوع مطلوبة'), { variant: 'warning' });
            return false;
          }
          const crew = [
            ...new Set(
              getSeed('assignments')
                .filter(a => a.site === site && a.status === 'active')
                .map(a => a.emp)
            )
          ];
          const id = `TS-${weekStart.slice(0, 4)}-${weekStart.slice(5, 7)}${weekStart.slice(8, 10)}-${site}`;
          saveImportedRows('timesheets', [
            {
              id,
              site,
              weekStart,
              ramadan: false,
              status: 'draft',
              step: 0,
              submittedBy: '',
              submittedAt: '',
              history: [],
              lines: crew.map(emp => ({ emp, days: 0, regH: 0, otH: 0 }))
            }
          ]);
          selected = id;
          renderAll();
          showToast(`${L('Draft created', 'أُنشئت مسودة')} ${id}`, { variant: 'success' });
          return true;
        }
      }
    ]
  });
}

function renderAll() {
  renderStats();
  renderList();
  renderDetail();
  applyI18n(document.querySelector('[data-hr-timesheets]') || document);
}

export function initTimesheets() {
  const root = document.querySelector('[data-hr-timesheets]');
  if (!root) {
    return;
  }
  renderAll();
  if (booted) {
    return;
  }
  booted = true;
  document.getElementById('ts-rows')?.addEventListener('click', e => {
    const btn = e.target.closest('[data-open]');
    if (!btn) {
      return;
    }
    selected = btn.dataset.open;
    renderList();
    renderDetail();
  });
  document.getElementById('ts-new')?.addEventListener('click', openNewModal);
  const tsSchema = [
    { key: 'sheet', en: 'Sheet ID (draft)', ar: 'رمز الكشف', required: true },
    { key: 'emp', en: 'Employee code', ar: 'رقم الموظف', required: true },
    { key: 'days', en: 'Days', ar: 'الأيام', type: 'number' },
    { key: 'regH', en: 'Regular hours', ar: 'الأساسي', type: 'number' },
    { key: 'otH', en: 'OT hours', ar: 'الإضافي', type: 'number' }
  ];
  document.getElementById('ts-import')?.addEventListener('click', () =>
    openImportModal({
      titleEn: 'Import week lines (Excel / CSV)',
      titleAr: 'استيراد سطور الأسبوع (Excel / CSV)',
      filename: 'timesheet-lines',
      schema: tsSchema,
      example: { sheet: 'TS-2026-W37-ST1', emp: 'EMP-0013', days: '5', regH: '40', otH: '2' },
      onImport: rows => {
        const sheets = getSeed('timesheets');
        const bad = [...new Set(rows.map(r => r.sheet))].filter(id => {
          const x = sheets.find(s => s.id === id);
          return !x || x.status !== 'draft';
        });
        if (bad.length) {
          showToast(
            `${L('Unknown or locked sheets', 'كشوف غير معروفة أو مقفلة')}: ${bad.join(', ')}`,
            {
              variant: 'warning'
            }
          );
          return false;
        }
        for (const r of rows) {
          const x = getSeed('timesheets').find(s => s.id === r.sheet);
          const lines = [...(x.lines || [])];
          const line = {
            emp: r.emp,
            days: Number(r.days) || 0,
            regH: Number(r.regH) || 0,
            otH: Number(r.otH) || 0
          };
          const i = lines.findIndex(l => l.emp === r.emp);
          if (i >= 0) {
            lines[i] = line;
          } else {
            lines.push(line);
          }
          patchSeedRow('timesheets', x, { lines });
        }
        renderAll();
        return rows.length;
      }
    })
  );
  document.getElementById('ts-export')?.addEventListener('click', () => {
    const rows = [];
    for (const x of getSeed('timesheets')) {
      for (const l of x.lines || []) {
        rows.push({
          sheet: x.id,
          site: x.site,
          week: x.weekStart,
          status: x.status,
          emp: l.emp,
          days: l.days,
          regH: l.regH,
          otH: l.otH
        });
      }
    }
    exportData(
      'xlsx',
      'timesheets',
      [
        { key: 'sheet', label: 'Sheet' },
        { key: 'site', label: 'Site' },
        { key: 'week', label: 'Week' },
        { key: 'status', label: 'Status' },
        { key: 'emp', label: 'Employee' },
        { key: 'days', label: 'Days' },
        { key: 'regH', label: 'Regular h' },
        { key: 'otH', label: 'OT h' }
      ],
      rows,
      'Timesheets'
    );
  });
  window.addEventListener(LANG_EVENT, renderAll);
}
