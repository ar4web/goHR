// HR + Operations — departments (hr_departments.html).
// Shares the `hr:custom-lists` store with Settings: a single source of
// truth for codes/names, extended here with head + cost center.

import { showToast } from './toast.js';
import { showModal } from './modal.js';
import { t, currentLang, LANG_EVENT, applyI18n } from './i18n.js';
import { getSeed, saveImportedRows } from './hr-api.js';
import { exportData, exportCSV } from './import-export.js';
import { logAudit } from './hr-audit.js';

let booted = false;
const KEY = 'hr:custom-lists';

function L(en, ar) {
  return currentLang() === 'ar' ? ar : en;
}

function readLists() {
  try {
    return JSON.parse(localStorage.getItem(KEY) || '{}');
  } catch (_e) {
    return {};
  }
}

function writeLists(o) {
  try {
    localStorage.setItem(KEY, JSON.stringify(o));
  } catch (_e) {
    /* ignore */
  }
}

// Canonical department store: Settings override wins, seed is the base.
export function deptStore() {
  const o = readLists();
  if (Array.isArray(o.departments) && o.departments.length) {
    return o.departments;
  }
  return getSeed('departments');
}

export function saveDepts(rows) {
  const o = readLists();
  o.departments = rows;
  writeLists(o);
}

function empName(code) {
  const e = getSeed('employees').find(x => x.code === code);
  if (!e) {
    return code || '—';
  }
  return currentLang() === 'ar' ? e.nameAr || e.nameEn : e.nameEn;
}

function headcount(code) {
  return getSeed('employees').filter(e => e.dept === code && e.st === 'active').length;
}

function renderAll() {
  const set = (id, v) => {
    const el = document.getElementById(id);
    if (el) {
      el.textContent = v;
    }
  };
  const list = deptStore();
  set('dp-stat-total', String(list.length));
  set('dp-stat-heads', String(list.filter(d => d.head).length));
  set('dp-stat-staff', String(getSeed('employees').filter(e => e.st === 'active').length));
  const el = document.getElementById('dp-rows');
  if (el) {
    el.innerHTML = list
      .map(
        d => `<tr>
      <td data-label="${L('Code', 'الرمز')}"><strong dir="ltr">${d.code}</strong></td>
      <td data-label="${L('Department', 'الإدارة')}"><strong>${currentLang() === 'ar' ? d.ar : d.en}</strong>
        <div style="font-size:11.5px;color:var(--text-muted)">${currentLang() === 'ar' ? d.en : d.ar}</div></td>
      <td data-label="${L('Head', 'الرئيس')}">${d.head ? empName(d.head) : '—'}</td>
      <td data-label="${L('Headcount', 'عدد الموظفين')}" dir="ltr">${headcount(d.code)}</td>
      <td data-label="${L('Cost center', 'مركز التكلفة')}" dir="ltr">${d.costCenter || '—'}</td>
      <td data-label=""><div style="display:flex;gap:6px">
        <button class="btn btn-outline btn-sm" data-edit="${d.code}">${L('Edit', 'تحرير')}</button>
        <button class="btn btn-outline btn-sm" data-del="${d.code}">🗑</button>
      </div></td>
    </tr>`
      )
      .join('');
  }
  applyI18n(document.querySelector('[data-hr-departments]') || document);
}

function openDeptModal(code) {
  const d = code ? deptStore().find(r => r.code === code) : null;
  const emps = getSeed('employees').filter(e => e.st === 'active');
  showModal({
    title: d ? `${L('Edit', 'تحرير')} ${d.code}` : L('New department', 'إدارة جديدة'),
    body: `<div class="hr-form-2col">
        <div class="form-group"><label class="form-label" for="nd-code">${L('Code', 'الرمز')}</label>
          <input class="form-control" id="nd-code" value="${d?.code || ''}" dir="ltr"${d ? ' disabled' : ''}></div>
        <div class="form-group"><label class="form-label" for="nd-head">${L('Head', 'الرئيس')}</label>
          <select class="form-control" id="nd-head"><option value="">—</option>${emps.map(e => `<option value="${e.code}"${d?.head === e.code ? ' selected' : ''}>${e.code} — ${empName(e.code)}</option>`).join('')}</select></div>
        <div class="form-group"><label class="form-label" for="nd-en">${L('Name (EN)', 'الاسم (EN)')}</label>
          <input class="form-control" id="nd-en" value="${d?.en || ''}"></div>
        <div class="form-group"><label class="form-label" for="nd-ar">${L('Name (AR)', 'الاسم (AR)')}</label>
          <input class="form-control" id="nd-ar" value="${d?.ar || ''}"></div>
        <div class="form-group"><label class="form-label" for="nd-cc">${L('Cost center', 'مركز التكلفة')}</label>
          <input class="form-control" id="nd-cc" value="${d?.costCenter || ''}" dir="ltr"></div>
      </div>`,
    actions: [
      { label: t('common.cancel'), variant: 'ghost' },
      {
        label: t('common.save'),
        variant: 'primary',
        action: ({ body }) => {
          const v = sel => body.querySelector(sel).value;
          const list = deptStore().slice();
          const row = {
            en: v('#nd-en').trim(),
            ar: v('#nd-ar').trim(),
            head: v('#nd-head') || '',
            costCenter: v('#nd-cc').trim()
          };
          if (!row.en) {
            showToast(L('Enter a name', 'أدخل الاسم'), { variant: 'warning' });
            return false;
          }
          if (d) {
            saveDepts(list.map(x => (x.code === d.code ? { code: x.code, ...row } : x)));
            logAudit('dept.update', d.code, row.en);
          } else {
            const nc = v('#nd-code').trim().toUpperCase();
            if (!nc || list.some(x => x.code === nc)) {
              showToast(L('Code required and unique', 'الرمز مطلوب وفريد'), { variant: 'warning' });
              return false;
            }
            list.push({ code: nc, ...row });
            saveDepts(list);
            // Keep the hr-api overlay mirror in sync for import/export round-trips.
            saveImportedRows('departments', list);
            logAudit('dept.create', nc, row.en);
          }
          renderAll();
          showToast(L('Department saved', 'حُفظت الإدارة'), { variant: 'success' });
          return true;
        }
      }
    ]
  });
}

export function initDepartments() {
  const root = document.querySelector('[data-hr-departments]');
  if (!root) {
    return;
  }
  renderAll();
  if (booted) {
    return;
  }
  booted = true;
  document.getElementById('dp-new')?.addEventListener('click', () => openDeptModal(null));
  document.getElementById('dp-rows')?.addEventListener('click', e => {
    const ed = e.target.closest('[data-edit]');
    const del = e.target.closest('[data-del]');
    if (ed) {
      openDeptModal(ed.dataset.edit);
    } else if (del) {
      const code = del.dataset.del;
      if (headcount(code) > 0) {
        showToast(L('Cannot delete: employees assigned', 'لا يمكن الحذف: موظفون مسندون'), {
          variant: 'warning'
        });
        return;
      }
      saveDepts(deptStore().filter(d => d.code !== code));
      logAudit('dept.delete', code, '');
      renderAll();
      showToast(L('Deleted', 'حُذفت'), { variant: 'success' });
    }
  });
  const cols = [
    { key: 'code', label: 'Code' },
    { key: 'en', label: 'Name EN' },
    { key: 'ar', label: 'Name AR' },
    { key: 'head', label: 'Head' },
    { key: 'costCenter', label: 'Cost center' }
  ];
  document.getElementById('dp-export-xlsx')?.addEventListener('click', () => {
    exportData('xlsx', 'departments', cols, deptStore(), 'Departments');
  });
  document.getElementById('dp-export-csv')?.addEventListener('click', () => {
    exportCSV('departments.csv', cols, deptStore());
  });
  window.addEventListener(LANG_EVENT, renderAll);
}
