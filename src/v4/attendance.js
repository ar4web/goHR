// HR + Operations — site attendance (hr_attendance.html).
// Day board + check-in/out + 14-day history. Idempotent.

import { showToast } from './toast.js';
import { showModal } from './modal.js';
import { t, currentLang, LANG_EVENT, applyI18n } from './i18n.js';
import { fmtDate } from './hr-locale.js';
import { inRamadan, RAMADAN_DAY_HOURS, NORMAL_DAY_HOURS } from './hr-statutory.js';
import { getSeed, patchSeedRow, saveImportedRows } from './hr-api.js';
import { exportData } from './import-export.js';
import { openImportModal } from './import-modal.js';
import { SITES, RAMADAN_PERIODS } from './hr-seed.js';

let booted = false;
let day = '';
let siteFilter = '';

function L(en, ar) {
  return currentLang() === 'ar' ? ar : en;
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
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

function dayRows() {
  return getSeed('attendance').filter(
    r => r.date === day && (!siteFilter || r.site === siteFilter)
  );
}

function fmtDur(mins) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}:${String(m).padStart(2, '0')}`;
}

const ST_CLS = { present: 'green', late: 'yellow', absent: 'red' };

function renderStats() {
  const rows = dayRows();
  const set = (id, v) => {
    const el = document.getElementById(id);
    if (el) {
      el.textContent = v;
    }
  };
  set('att-stat-present', rows.filter(r => r.status === 'present').length);
  set('att-stat-late', rows.filter(r => r.status === 'late').length);
  set('att-stat-absent', rows.filter(r => r.status === 'absent').length);
  const ot = rows.reduce((s, r) => s + (r.otMin || 0), 0);
  set('att-stat-ot', fmtDur(ot));
  const cap = document.getElementById('att-cap');
  if (cap) {
    const ram = inRamadan(day, RAMADAN_PERIODS);
    cap.innerHTML = ram
      ? `<span class="status status-blue">${L('Ramadan hours: 6h/day', 'دوام رمضان: 6 ساعات/يوم')}</span>`
      : `<span style="font-size:12px;color:var(--text-muted)">${L('Standard cap', 'الحد المعياري')}: ${NORMAL_DAY_HOURS}h · ${L('Ramadan', 'رمضان')}: ${RAMADAN_DAY_HOURS}h</span>`;
  }
}

function renderRows() {
  const el = document.getElementById('att-rows');
  if (!el) {
    return;
  }
  const rows = dayRows().sort((a, b) => (a.site + a.emp).localeCompare(b.site + b.emp));
  el.innerHTML =
    rows
      .map(
        r => `<tr>
      <td data-label="${L('Worker', 'العامل')}"><a href="hr_employee.html?code=${r.emp}">${empName(r.emp)}</a>
        <div style="font-size:11.5px;color:var(--text-muted)" dir="ltr">${r.emp}</div></td>
      <td data-label="${L('Site', 'الموقع')}" style="font-size:12.5px">${siteName(r.site)}</td>
      <td data-label="${L('In', 'حضور')}" dir="ltr">${r.in || '—'}</td>
      <td data-label="${L('Out', 'انصراف')}" dir="ltr">${r.out || '—'}</td>
      <td data-label="${L('Worked', 'الدوام')}" dir="ltr">${r.mins ? fmtDur(r.mins) : '—'}</td>
      <td data-label="${L('OT', 'إضافي')}" dir="ltr">${r.otMin ? `+${fmtDur(r.otMin)}` : '—'}</td>
      <td data-label="${t('common.status')}"><span class="status status-${ST_CLS[r.status] || 'blue'}">${t(`status.${r.status}`)}</span>
        ${r.lateMin ? `<div style="font-size:11.5px;color:var(--text-muted)" dir="ltr">+${r.lateMin}m</div>` : ''}</td>
      <td data-label=""><button class="btn btn-outline btn-sm" data-edit="${r.id}">${t('common.edit')}</button></td>
    </tr>`
      )
      .join('') ||
    `<tr><td colspan="8" style="text-align:center;color:var(--text-muted);padding:24px">${t('common.noData')}</td></tr>`;
}

function crew() {
  const seen = new Set();
  const out = [];
  for (const a of getSeed('assignments')) {
    if (a.status !== 'active' || seen.has(a.emp)) {
      continue;
    }
    seen.add(a.emp);
    out.push({ emp: a.emp, site: a.site, client: a.client });
  }
  return out;
}

function openCheckinModal(existing = null) {
  const list = crew();
  const d = existing || { emp: list[0]?.emp || '', date: day, in: '', out: '' };
  showModal({
    title: existing ? `${t('common.edit')} · ${existing.id}` : L('Record check-in', 'تسجيل حضور'),
    body: `<div class="form-group"><label class="form-label" for="ci-emp">${L('Worker', 'العامل')}</label>
        <select class="form-control" id="ci-emp" ${existing ? 'disabled' : ''}>
        ${list.map(w => `<option value="${w.emp}"${d.emp === w.emp ? ' selected' : ''}>${w.emp} · ${empName(w.emp)}</option>`).join('')}</select></div>
      <div class="form-group"><label class="form-label" for="ci-date">${L('Date', 'التاريخ')}</label>
        <input class="form-control" id="ci-date" type="date" value="${d.date}" dir="ltr" ${existing ? 'disabled' : ''}></div>
      <div class="hr-form-2col">
        <div class="form-group"><label class="form-label" for="ci-in">${L('In', 'حضور')}</label>
          <input class="form-control" id="ci-in" type="time" value="${d.in || ''}" dir="ltr"></div>
        <div class="form-group"><label class="form-label" for="ci-out">${L('Out (empty = absent)', 'انصراف (فارغ = غياب)')}</label>
          <input class="form-control" id="ci-out" type="time" value="${d.out || ''}" dir="ltr"></div>
      </div>`,
    actions: [
      { label: t('common.cancel'), variant: 'ghost' },
      {
        label: t('common.save'),
        variant: 'primary',
        action: ({ body }) => {
          const emp = existing ? existing.emp : body.querySelector('#ci-emp').value;
          const date = existing ? existing.date : body.querySelector('#ci-date').value;
          const tin = body.querySelector('#ci-in').value;
          const tout = body.querySelector('#ci-out').value;
          if (!emp || !date) {
            showToast(L('Worker and date are required', 'العامل والتاريخ مطلوبان'), {
              variant: 'warning'
            });
            return false;
          }
          const w = list.find(x => x.emp === emp) || { site: '', client: '' };
          const id = existing ? existing.id : `ATT-${date}-${emp}`;
          if (!tin || !tout) {
            patchSeedRow(
              'attendance',
              existing || { id, emp, site: w.site, client: w.client, date },
              {
                in: '',
                out: '',
                mins: 0,
                lateMin: 0,
                otMin: 0,
                status: 'absent'
              }
            );
          } else {
            const [ih, im] = tin.split(':').map(Number);
            const [oh, om] = tout.split(':').map(Number);
            const inMin = ih * 60 + im;
            const outMin = oh * 60 + om;
            if (outMin <= inMin) {
              showToast(L('Out must be after in', 'الانصراف يجب أن يكون بعد الحضور'), {
                variant: 'warning'
              });
              return false;
            }
            const worked = outMin - inMin - 60;
            patchSeedRow(
              'attendance',
              existing || { id, emp, site: w.site, client: w.client, date },
              {
                in: tin,
                out: tout,
                mins: worked,
                lateMin: inMin > 8 * 60 + 5 ? inMin - (8 * 60 + 5) : 0,
                otMin: Math.max(0, worked - 480),
                status: inMin > 8 * 60 + 5 ? 'late' : 'present'
              }
            );
          }
          renderAll();
          showToast(L('Attendance saved', 'تم حفظ الحضور'), { variant: 'success' });
          return true;
        }
      }
    ]
  });
}

function renderAll() {
  const label = document.getElementById('att-day-label');
  if (label) {
    label.textContent = fmtDate(day);
  }
  renderStats();
  renderRows();
  applyI18n(document.querySelector('[data-hr-attendance]') || document);
}

export function initAttendance() {
  const root = document.querySelector('[data-hr-attendance]');
  if (!root) {
    return;
  }
  if (!day) {
    day = todayIso();
  }
  const dayInput = document.getElementById('att-day');
  if (dayInput && !dayInput.value) {
    dayInput.value = day;
  }
  const siteSel = document.getElementById('att-site');
  if (siteSel && !siteSel.options.length) {
    siteSel.innerHTML =
      `<option value="">${L('All sites', 'كل المواقع')}</option>` +
      SITES.map(s => `<option value="${s.id}">${L(s.nameEn, s.nameAr)}</option>`).join('');
  }
  renderAll();
  if (booted) {
    return;
  }
  booted = true;
  dayInput?.addEventListener('change', e => {
    day = e.target.value || todayIso();
    renderAll();
  });
  siteSel?.addEventListener('change', e => {
    siteFilter = e.target.value;
    renderAll();
  });
  document.getElementById('att-checkin')?.addEventListener('click', () => openCheckinModal());
  const attSchema = [
    { key: 'emp', en: 'Employee code', ar: 'رقم الموظف', required: true },
    { key: 'date', en: 'Date (YYYY-MM-DD)', ar: 'التاريخ', required: true, type: 'date' },
    { key: 'in', en: 'In (HH:MM, empty = absent)', ar: 'الحضور' },
    { key: 'out', en: 'Out (HH:MM)', ar: 'الانصراف' },
    { key: 'site', en: 'Site (fallback)', ar: 'الموقع' }
  ];
  document.getElementById('att-import')?.addEventListener('click', () =>
    openImportModal({
      titleEn: 'Import attendance (Excel / CSV)',
      titleAr: 'استيراد الحضور (Excel / CSV)',
      filename: 'attendance',
      schema: attSchema,
      example: { emp: 'EMP-0013', date: '2026-09-10', in: '07:55', out: '16:05', site: '' },
      onImport: rows => {
        const list = crew();
        saveImportedRows(
          'attendance',
          rows.map(r => {
            const w = list.find(x => x.emp === r.emp) || { site: r.site || '', client: '' };
            const base = {
              id: `ATT-${r.date}-${r.emp}`,
              emp: r.emp,
              site: w.site,
              client: w.client || '',
              date: r.date
            };
            if (!r.in || !r.out) {
              return { ...base, in: '', out: '', mins: 0, lateMin: 0, otMin: 0, status: 'absent' };
            }
            const [ih, im] = r.in.split(':').map(Number);
            const [oh, om] = r.out.split(':').map(Number);
            const inMin = ih * 60 + im;
            const worked = oh * 60 + om - inMin - 60;
            const late = inMin > 8 * 60 + 5 ? inMin - (8 * 60 + 5) : 0;
            return {
              ...base,
              in: r.in,
              out: r.out,
              mins: worked,
              lateMin: late,
              otMin: Math.max(0, worked - 480),
              status: late ? 'late' : 'present'
            };
          })
        );
        renderAll();
        return rows.length;
      }
    })
  );
  document.getElementById('att-export')?.addEventListener('click', () => {
    exportData(
      'xlsx',
      `attendance-${day}`,
      [
        { key: 'emp', label: 'Employee' },
        { key: 'site', label: 'Site' },
        { key: 'date', label: 'Date' },
        { key: 'in', label: 'In' },
        { key: 'out', label: 'Out' },
        { key: 'mins', label: 'Minutes' },
        { key: 'otMin', label: 'OT minutes' },
        { key: 'status', label: 'Status' }
      ],
      dayRows(),
      'Attendance'
    );
  });
  document.getElementById('att-rows')?.addEventListener('click', e => {
    const btn = e.target.closest('[data-edit]');
    if (!btn) {
      return;
    }
    const r = getSeed('attendance').find(x => x.id === btn.dataset.edit);
    if (r) {
      openCheckinModal(r);
    }
  });
  window.addEventListener(LANG_EVENT, renderAll);
}
