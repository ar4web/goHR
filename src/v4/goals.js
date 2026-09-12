// HR + Operations — goals / OKRs (hr_goals.html).
// Owner + metric + target/current + due + status; progress bars derive from
// current/target.

import { showToast } from './toast.js';
import { showModal } from './modal.js';
import { t, currentLang, LANG_EVENT, applyI18n } from './i18n.js';
import { getSeed, patchSeedRow, saveImportedRows } from './hr-api.js';
import { exportData, exportCSV } from './import-export.js';
import { logAudit } from './hr-audit.js';

let booted = false;

const ST_CLS = { draft: 'blue', active: 'green', 'at-risk': 'yellow', done: 'purple' };

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

function stLabel(st) {
  return (
    {
      draft: t('status.draft'),
      active: t('status.active'),
      'at-risk': L('At risk', 'متعثر'),
      done: L('Done', 'مُنجز')
    }[st] || st
  );
}

function progress(g) {
  const t2 = Number(g.target) || 0;
  if (!(t2 > 0)) {
    return 0;
  }
  return Math.max(0, Math.min(100, Math.round(((Number(g.current) || 0) / t2) * 100)));
}

function nextId() {
  const year = new Date().getFullYear();
  let n = 0;
  for (const g of getSeed('goals')) {
    const m = String(g.id).match(new RegExp(`^G-${year}-(\\d+)$`));
    if (m) {
      n = Math.max(n, Number(m[1]));
    }
  }
  return `G-${year}-${String(n + 1).padStart(2, '0')}`;
}

function renderAll() {
  const set = (id, v) => {
    const el = document.getElementById(id);
    if (el) {
      el.textContent = v;
    }
  };
  const list = getSeed('goals');
  set('gl-stat-active', String(list.filter(g => g.status === 'active').length));
  set('gl-stat-risk', String(list.filter(g => g.status === 'at-risk').length));
  set('gl-stat-done', String(list.filter(g => g.status === 'done').length));
  set(
    'gl-stat-prog',
    list.length ? `${Math.round(list.reduce((s, g) => s + progress(g), 0) / list.length)}%` : '—'
  );
  const el = document.getElementById('gl-rows');
  if (el) {
    el.innerHTML = list
      .map(g => {
        const p = progress(g);
        return `<tr>
      <td data-label="#"><strong dir="ltr">${g.id}</strong></td>
      <td data-label="${L('Owner', 'المالك')}">${empName(g.owner)}</td>
      <td data-label="${L('Goal', 'الهدف')}"><strong>${currentLang() === 'ar' ? g.titleAr || g.titleEn : g.titleEn}</strong>
        <div style="font-size:11.5px;color:var(--text-muted)" dir="ltr">${g.current} / ${g.target} ${g.metric || ''}</div></td>
      <td data-label="${L('Progress', 'التقدم')}" dir="ltr">
        <div class="hr-bar"><span style="width:${p}%"></span></div> ${p}%</td>
      <td data-label="${L('Due', 'الاستحقاق')}" dir="ltr">${g.due || '—'}</td>
      <td data-label="${t('common.status')}"><span class="status status-${ST_CLS[g.status] || 'blue'}">${stLabel(g.status)}</span></td>
      <td data-label=""><button class="btn btn-outline btn-sm" data-edit="${g.id}">${L('Edit', 'تحرير')}</button></td>
    </tr>`;
      })
      .join('');
  }
  applyI18n(document.querySelector('[data-hr-goals]') || document);
}

function openGoalModal(id) {
  const g = id ? getSeed('goals').find(r => r.id === id) : null;
  const emps = getSeed('employees');
  showModal({
    title: g ? `${L('Edit', 'تحرير')} ${g.id}` : L('New goal', 'هدف جديد'),
    body: `<div class="hr-form-2col">
        <div class="form-group"><label class="form-label" for="ng-owner">${L('Owner', 'المالك')}</label>
          <select class="form-control" id="ng-owner">${emps.map(e => `<option value="${e.code}"${g?.owner === e.code ? ' selected' : ''}>${e.code} — ${empName(e.code)}</option>`).join('')}</select></div>
        <div class="form-group"><label class="form-label" for="ng-due">${L('Due', 'الاستحقاق')}</label>
          <input class="form-control" id="ng-due" type="date" value="${g?.due || ''}" dir="ltr"></div>
        <div class="form-group"><label class="form-label" for="ng-te">${L('Title (EN)', 'العنوان (EN)')}</label>
          <input class="form-control" id="ng-te" value="${g?.titleEn || ''}"></div>
        <div class="form-group"><label class="form-label" for="ng-ta">${L('Title (AR)', 'العنوان (AR)')}</label>
          <input class="form-control" id="ng-ta" value="${g?.titleAr || ''}"></div>
        <div class="form-group"><label class="form-label" for="ng-metric">${L('Metric', 'المقياس')}</label>
          <input class="form-control" id="ng-metric" value="${g?.metric || ''}"></div>
        <div class="form-group"><label class="form-label" for="ng-target">${L('Target', 'المستهدف')}</label>
          <input class="form-control" id="ng-target" type="number" step="any" value="${g?.target ?? ''}" dir="ltr"></div>
        <div class="form-group"><label class="form-label" for="ng-current">${L('Current', 'الحالي')}</label>
          <input class="form-control" id="ng-current" type="number" step="any" value="${g?.current ?? ''}" dir="ltr"></div>
        <div class="form-group"><label class="form-label" for="ng-status">${L('Status', 'الحالة')}</label>
          <select class="form-control" id="ng-status">${['draft', 'active', 'at-risk', 'done'].map(s => `<option value="${s}"${g?.status === s ? ' selected' : ''}>${stLabel(s)}</option>`).join('')}</select></div>
      </div>`,
    actions: [
      { label: t('common.cancel'), variant: 'ghost' },
      {
        label: t('common.save'),
        variant: 'primary',
        action: ({ body }) => {
          const v = sel => body.querySelector(sel).value;
          if (!v('#ng-te').trim()) {
            showToast(L('Enter a title', 'أدخل العنوان'), { variant: 'warning' });
            return false;
          }
          const row = {
            owner: v('#ng-owner'),
            titleEn: v('#ng-te').trim(),
            titleAr: v('#ng-ta').trim(),
            metric: v('#ng-metric').trim(),
            target: Number(v('#ng-target')) || 0,
            current: Number(v('#ng-current')) || 0,
            due: v('#ng-due'),
            status: v('#ng-status')
          };
          if (g) {
            patchSeedRow('goals', g, row);
            logAudit('goal.update', g.id, `${row.current}/${row.target} ${row.metric}`);
          } else {
            const id2 = nextId();
            saveImportedRows('goals', [{ id: id2, ...row }]);
            logAudit('goal.create', id2, row.titleEn);
          }
          renderAll();
          showToast(L('Goal saved', 'حُفظ الهدف'), { variant: 'success' });
          return true;
        }
      }
    ]
  });
}

export function initGoals() {
  const root = document.querySelector('[data-hr-goals]');
  if (!root) {
    return;
  }
  renderAll();
  if (booted) {
    return;
  }
  booted = true;
  document.getElementById('gl-new')?.addEventListener('click', () => openGoalModal(null));
  document.getElementById('gl-rows')?.addEventListener('click', e => {
    const b = e.target.closest('[data-edit]');
    if (b) {
      openGoalModal(b.dataset.edit);
    }
  });
  const cols = [
    { key: 'id', label: 'Goal' },
    { key: 'owner', label: 'Owner' },
    { key: 'titleEn', label: 'Title' },
    { key: 'metric', label: 'Metric' },
    { key: 'target', label: 'Target' },
    { key: 'current', label: 'Current' },
    { key: 'due', label: 'Due' },
    { key: 'status', label: 'Status' }
  ];
  document.getElementById('gl-export-xlsx')?.addEventListener('click', () => {
    exportData('xlsx', 'goals', cols, getSeed('goals'), 'Goals');
  });
  document.getElementById('gl-export-csv')?.addEventListener('click', () => {
    exportCSV('goals.csv', cols, getSeed('goals'));
  });
  window.addEventListener(LANG_EVENT, renderAll);
}
