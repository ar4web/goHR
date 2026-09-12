// HR + Operations — trainings (hr_trainings.html).
// Course catalog + attendees + hours rollup: audit-friendly evidence that
// mandatory training (safety, onboarding) actually happened.

import { showToast } from './toast.js';
import { showModal } from './modal.js';
import { t, currentLang, LANG_EVENT, applyI18n } from './i18n.js';
import { getSeed, patchSeedRow, saveImportedRows } from './hr-api.js';
import { exportData, exportCSV } from './import-export.js';
import { logAudit } from './hr-audit.js';

let booted = false;

const ST_CLS = { planned: 'blue', done: 'green', cancelled: 'yellow' };

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
      planned: L('Planned', 'مخطط'),
      done: L('Done', 'مُنجز'),
      cancelled: t('status.cancelled')
    }[st] || st
  );
}

function hoursPerEmp() {
  const map = {};
  for (const tr of getSeed('trainings')) {
    if (tr.status !== 'done') {
      continue;
    }
    for (const a of tr.attendees || []) {
      map[a] = (map[a] || 0) + (Number(tr.hours) || 0);
    }
  }
  return map;
}

function nextId() {
  const year = new Date().getFullYear();
  let n = 0;
  for (const tr of getSeed('trainings')) {
    const m = String(tr.id).match(new RegExp(`^T-${year}-(\\d+)$`));
    if (m) {
      n = Math.max(n, Number(m[1]));
    }
  }
  return `T-${year}-${String(n + 1).padStart(2, '0')}`;
}

function renderAll() {
  const set = (id, v) => {
    const el = document.getElementById(id);
    if (el) {
      el.textContent = v;
    }
  };
  const list = getSeed('trainings');
  const done = list.filter(tr => tr.status === 'done');
  set('tr-stat-planned', String(list.filter(tr => tr.status === 'planned').length));
  set('tr-stat-done', String(done.length));
  set(
    'tr-stat-hours',
    String(done.reduce((s, tr) => s + (Number(tr.hours) || 0) * (tr.attendees?.length || 0), 0))
  );
  set(
    'tr-stat-spend',
    done
      .reduce((s, tr) => s + (Number(tr.cost) || 0), 0)
      .toLocaleString(currentLang() === 'ar' ? 'ar-SA' : 'en-US')
  );
  const el = document.getElementById('tr-rows');
  if (el) {
    el.innerHTML = list
      .map(
        tr => `<tr>
      <td data-label="#"><strong dir="ltr">${tr.id}</strong></td>
      <td data-label="${L('Course', 'الدورة')}"><strong>${currentLang() === 'ar' ? tr.titleAr || tr.titleEn : tr.titleEn}</strong>
        <div style="font-size:11.5px;color:var(--text-muted)">${tr.provider || ''}</div></td>
      <td data-label="${L('Date', 'التاريخ')}" dir="ltr">${tr.date}</td>
      <td data-label="${L('Hours', 'الساعات')}" dir="ltr">${tr.hours}h × ${tr.attendees?.length || 0}</td>
      <td data-label="${L('Cost', 'التكلفة')}" dir="ltr">${(Number(tr.cost) || 0).toLocaleString()}</td>
      <td data-label="${t('common.status')}"><span class="status status-${ST_CLS[tr.status] || 'blue'}">${stLabel(tr.status)}</span></td>
      <td data-label=""><div style="display:flex;gap:6px">
        <button class="btn btn-outline btn-sm" data-edit="${tr.id}">${L('Edit', 'تحرير')}</button>
        ${tr.status === 'planned' ? `<button class="btn btn-primary btn-sm" data-done="${tr.id}">✓</button>` : ''}
      </div></td>
    </tr>`
      )
      .join('');
  }
  const roll = document.getElementById('tr-rollup');
  if (roll) {
    const map = hoursPerEmp();
    const rows = Object.entries(map)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8);
    roll.innerHTML = rows.length
      ? rows
          .map(
            ([c, h]) =>
              `<tr><td data-label="${L('Employee', 'الموظف')}">${empName(c)}</td><td data-label="${L('Hours', 'الساعات')}" dir="ltr">${h}h</td></tr>`
          )
          .join('')
      : `<tr><td class="hr-empty">${L('No completed training yet', 'لا تدريب مكتمل بعد')}</td></tr>`;
  }
  applyI18n(document.querySelector('[data-hr-trainings]') || document);
}

function openTrainingModal(id) {
  const tr = id ? getSeed('trainings').find(r => r.id === id) : null;
  const emps = getSeed('employees');
  const picked = new Set(tr?.attendees || []);
  showModal({
    title: tr ? `${L('Edit', 'تحرير')} ${tr.id}` : L('New training', 'تدريب جديد'),
    body: `<div class="hr-form-2col">
        <div class="form-group"><label class="form-label" for="nt-te">${L('Title (EN)', 'العنوان (EN)')}</label>
          <input class="form-control" id="nt-te" value="${tr?.titleEn || ''}"></div>
        <div class="form-group"><label class="form-label" for="nt-ta">${L('Title (AR)', 'العنوان (AR)')}</label>
          <input class="form-control" id="nt-ta" value="${tr?.titleAr || ''}"></div>
        <div class="form-group"><label class="form-label" for="nt-prov">${L('Provider', 'الجهة')}</label>
          <input class="form-control" id="nt-prov" value="${tr?.provider || ''}"></div>
        <div class="form-group"><label class="form-label" for="nt-date">${L('Date', 'التاريخ')}</label>
          <input class="form-control" id="nt-date" type="date" value="${tr?.date || ''}" dir="ltr"></div>
        <div class="form-group"><label class="form-label" for="nt-hours">${L('Hours', 'الساعات')}</label>
          <input class="form-control" id="nt-hours" type="number" step="any" value="${tr?.hours ?? ''}" dir="ltr"></div>
        <div class="form-group"><label class="form-label" for="nt-cost">${L('Cost (SAR)', 'التكلفة (ر.س)')}</label>
          <input class="form-control" id="nt-cost" type="number" step="any" value="${tr?.cost ?? ''}" dir="ltr"></div>
        <div class="form-group"><label class="form-label" for="nt-status">${L('Status', 'الحالة')}</label>
          <select class="form-control" id="nt-status">${['planned', 'done', 'cancelled'].map(s => `<option value="${s}"${tr?.status === s ? ' selected' : ''}>${stLabel(s)}</option>`).join('')}</select></div>
      </div>
      <div class="form-group"><span class="form-label">${L('Attendees', 'الحضور')}</span>
        <div class="hr-check-grid">${emps.map(e => `<label class="hr-check"><input type="checkbox" data-att="${e.code}"${picked.has(e.code) ? ' checked' : ''}>${e.code} — ${empName(e.code)}</label>`).join('')}</div></div>`,
    actions: [
      { label: t('common.cancel'), variant: 'ghost' },
      {
        label: t('common.save'),
        variant: 'primary',
        action: ({ body }) => {
          const v = sel => body.querySelector(sel).value;
          if (!v('#nt-te').trim()) {
            showToast(L('Enter a title', 'أدخل العنوان'), { variant: 'warning' });
            return false;
          }
          const att = [...body.querySelectorAll('[data-att]:checked')].map(c => c.dataset.att);
          const row = {
            titleEn: v('#nt-te').trim(),
            titleAr: v('#nt-ta').trim(),
            provider: v('#nt-prov').trim(),
            date: v('#nt-date'),
            hours: Number(v('#nt-hours')) || 0,
            cost: Number(v('#nt-cost')) || 0,
            status: v('#nt-status'),
            attendees: att
          };
          if (tr) {
            patchSeedRow('trainings', tr, row);
            logAudit('training.update', tr.id, `${att.length} attendees`);
          } else {
            const id2 = nextId();
            saveImportedRows('trainings', [{ id: id2, ...row }]);
            logAudit('training.create', id2, row.titleEn);
          }
          renderAll();
          showToast(L('Training saved', 'حُفظ التدريب'), { variant: 'success' });
          return true;
        }
      }
    ]
  });
}

export function initTrainings() {
  const root = document.querySelector('[data-hr-trainings]');
  if (!root) {
    return;
  }
  renderAll();
  if (booted) {
    return;
  }
  booted = true;
  document.getElementById('tr-new')?.addEventListener('click', () => openTrainingModal(null));
  document.getElementById('tr-rows')?.addEventListener('click', e => {
    const ed = e.target.closest('[data-edit]');
    const dn = e.target.closest('[data-done]');
    if (ed) {
      openTrainingModal(ed.dataset.edit);
    } else if (dn) {
      const tr = getSeed('trainings').find(r => r.id === dn.dataset.done);
      if (tr) {
        patchSeedRow('trainings', tr, { status: 'done' });
        logAudit('training.done', tr.id, `${tr.hours}h × ${tr.attendees?.length || 0}`);
        renderAll();
        showToast(L('Marked done', 'تم الإنجاز'), { variant: 'success' });
      }
    }
  });
  const cols = [
    { key: 'id', label: 'Training' },
    { key: 'titleEn', label: 'Course' },
    { key: 'provider', label: 'Provider' },
    { key: 'date', label: 'Date' },
    { key: 'hours', label: 'Hours' },
    { key: 'cost', label: 'Cost' },
    { key: 'status', label: 'Status' }
  ];
  document.getElementById('tr-export-xlsx')?.addEventListener('click', () => {
    exportData('xlsx', 'trainings', cols, getSeed('trainings'), 'Trainings');
  });
  document.getElementById('tr-export-evidence')?.addEventListener('click', () => {
    const rows = [];
    for (const tr of getSeed('trainings')) {
      if (tr.status !== 'done') {
        continue;
      }
      for (const a of tr.attendees || []) {
        rows.push({ employee: a, training: tr.id, date: tr.date, hours: tr.hours });
      }
    }
    exportCSV(
      'training-evidence.csv',
      [
        { key: 'employee', label: 'Employee' },
        { key: 'training', label: 'Training' },
        { key: 'date', label: 'Date' },
        { key: 'hours', label: 'Hours' }
      ],
      rows
    );
  });
  window.addEventListener(LANG_EVENT, renderAll);
}
