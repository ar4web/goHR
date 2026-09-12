// HR + Operations — shifts & Ramadan (hr_shifts.html).
// Shift templates + site mapping + Ramadan periods. Idempotent.

import { showToast } from './toast.js';
import { showModal } from './modal.js';
import { t, currentLang, LANG_EVENT, applyI18n } from './i18n.js';
import { fmtDate } from './hr-locale.js';
import { inRamadan } from './hr-statutory.js';
import { getSeed, patchSeedRow, saveImportedRows } from './hr-api.js';
import { exportData } from './import-export.js';
import { openImportModal } from './import-modal.js';
import { SITES, RAMADAN_PERIODS } from './hr-seed.js';

let booted = false;

function L(en, ar) {
  return currentLang() === 'ar' ? ar : en;
}

const DAY_LBL = {
  sun: ['Sun', 'أحد'],
  mon: ['Mon', 'إثنين'],
  tue: ['Tue', 'ثلاثاء'],
  wed: ['Wed', 'أربعاء'],
  thu: ['Thu', 'خميس'],
  fri: ['Fri', 'جمعة'],
  sat: ['Sat', 'سبت']
};

function siteName(id) {
  const s = SITES.find(x => x.id === id);
  if (!s) {
    return id;
  }
  return currentLang() === 'ar' ? s.nameAr : s.nameEn;
}

function renderBanner() {
  const el = document.getElementById('shift-banner');
  if (!el) {
    return;
  }
  const today = new Date().toISOString().slice(0, 10);
  const ram = inRamadan(today, RAMADAN_PERIODS);
  el.innerHTML = ram
    ? `<span class="status status-blue">${L('Today is in Ramadan — 6h day / 36h week applies', 'اليوم في رمضان — يسري دوام 6 ساعات/يوم')}</span>`
    : `<span style="font-size:12.5px;color:var(--text-muted)">${L('Standard time — 8h day / 48h week. Ramadan rows below show the reduced hours.', 'وقت معياري — 8 ساعات/يوم. صفوف رمضان أدناه توضح الدوام المخفض.')}</span>`;
}

function renderShifts() {
  const el = document.getElementById('shift-cards');
  if (!el) {
    return;
  }
  el.innerHTML =
    '<div class="row col-3">' +
    getSeed('shifts')
      .map(
        s => `
    <div class="card"><div class="stat"><div class="stat-content">
      <div class="stat-label">${L(s.en, s.ar)} <span style="color:var(--text-muted)" dir="ltr">${s.id}</span></div>
      <div class="stat-value-row"><span class="stat-value" dir="ltr" style="font-size:20px">${s.start}–${s.end}</span></div>
      <div class="stat-subtext">${L('Break', 'الراحة')}: ${s.breakMin}m · ${s.days.map(d => L(...DAY_LBL[d])).join(' ')}</div>
      <div class="stat-subtext">${L('Ramadan', 'رمضان')}: <span dir="ltr">${s.ramadanStart}–${s.ramadanEnd}</span></div>
      <div style="margin-top:8px"><button class="btn btn-outline btn-sm" data-shift="${s.id}">${t('common.edit')}</button></div>
    </div></div></div>`
      )
      .join('') +
    '</div>';
}

function renderSites() {
  const el = document.getElementById('shift-sites');
  if (!el) {
    return;
  }
  const shifts = getSeed('shifts');
  el.innerHTML =
    `<div class="table-responsive"><table class="table"><thead><tr>
    <th>${L('Site', 'الموقع')}</th><th>${L('Shift', 'الوردية')}</th><th>${L('Hours', 'الساعات')}</th><th></th>
  </tr></thead><tbody>` +
    getSeed('siteShifts')
      .map(m => {
        const s = shifts.find(x => x.id === m.shift);
        return `<tr>
      <td data-label="${L('Site', 'الموقع')}">${siteName(m.site)} <span style="color:var(--text-muted)" dir="ltr">${m.site}</span></td>
      <td data-label="${L('Shift', 'الوردية')}">${s ? L(s.en, s.ar) : m.shift}</td>
      <td data-label="${L('Hours', 'الساعات')}" dir="ltr">${s ? `${s.start}–${s.end}` : '—'}</td>
      <td data-label=""><button class="btn btn-outline btn-sm" data-map="${m.site}">${L('Change', 'تغيير')}</button></td>
    </tr>`;
      })
      .join('') +
    '</tbody></table></div>';
}

function renderRamadan() {
  const el = document.getElementById('shift-ramadan');
  if (!el) {
    return;
  }
  el.innerHTML =
    `<div class="table-responsive"><table class="table"><thead><tr>
    <th>${L('Year', 'السنة')}</th><th>${L('Start', 'البداية')}</th><th>${L('End', 'النهاية')}</th><th>Hijri</th>
  </tr></thead><tbody>` +
    RAMADAN_PERIODS.map(
      p => `<tr>
    <td data-label="${L('Year', 'السنة')}" dir="ltr">${p.year}</td>
    <td data-label="${L('Start', 'البداية')}">${fmtDate(p.start)}</td>
    <td data-label="${L('End', 'النهاية')}">${fmtDate(p.end)}</td>
    <td data-label="Hijri" dir="ltr">${p.hijri}</td>
  </tr>`
    ).join('') +
    '</tbody></table></div>';
}

function renderAll() {
  renderBanner();
  renderShifts();
  renderSites();
  renderRamadan();
  applyI18n(document.querySelector('[data-hr-shifts]') || document);
}

function openShiftModal(id) {
  const s = getSeed('shifts').find(x => x.id === id);
  if (!s) {
    return;
  }
  showModal({
    title: `${t('common.edit')} · ${s.id}`,
    body: `<div class="hr-form-2col">
        <div class="form-group"><label class="form-label" for="sh-start">${L('Start', 'البداية')}</label>
          <input class="form-control" id="sh-start" type="time" value="${s.start}" dir="ltr"></div>
        <div class="form-group"><label class="form-label" for="sh-end">${L('End', 'النهاية')}</label>
          <input class="form-control" id="sh-end" type="time" value="${s.end}" dir="ltr"></div>
      </div>
      <div class="hr-form-2col">
        <div class="form-group"><label class="form-label" for="sh-rstart">${L('Ramadan start', 'بداية رمضان')}</label>
          <input class="form-control" id="sh-rstart" type="time" value="${s.ramadanStart}" dir="ltr"></div>
        <div class="form-group"><label class="form-label" for="sh-rend">${L('Ramadan end', 'نهاية رمضان')}</label>
          <input class="form-control" id="sh-rend" type="time" value="${s.ramadanEnd}" dir="ltr"></div>
      </div>`,
    actions: [
      { label: t('common.cancel'), variant: 'ghost' },
      {
        label: t('common.save'),
        variant: 'primary',
        action: ({ body }) => {
          const patch = {
            start: body.querySelector('#sh-start').value,
            end: body.querySelector('#sh-end').value,
            ramadanStart: body.querySelector('#sh-rstart').value,
            ramadanEnd: body.querySelector('#sh-rend').value
          };
          if (!patch.start || !patch.end) {
            showToast(L('Start and end are required', 'البداية والنهاية مطلوبتان'), {
              variant: 'warning'
            });
            return false;
          }
          patchSeedRow('shifts', s, patch);
          renderAll();
          showToast(L('Shift updated', 'تم تحديث الوردية'), { variant: 'success' });
          return true;
        }
      }
    ]
  });
}

function openMapModal(site) {
  const m = getSeed('siteShifts').find(x => x.site === site);
  if (!m) {
    return;
  }
  const shifts = getSeed('shifts');
  showModal({
    title: `${L('Site shift', 'وردية الموقع')} · ${site}`,
    body: `<div class="form-group" style="margin-bottom:0"><label class="form-label" for="mp-shift">${L('Shift', 'الوردية')}</label>
      <select class="form-control" id="mp-shift">${shifts.map(s => `<option value="${s.id}"${m.shift === s.id ? ' selected' : ''}>${L(s.en, s.ar)}</option>`).join('')}</select></div>`,
    actions: [
      { label: t('common.cancel'), variant: 'ghost' },
      {
        label: t('common.save'),
        variant: 'primary',
        action: ({ body }) => {
          patchSeedRow(
            'siteShifts',
            { id: m.site, ...m },
            { shift: body.querySelector('#mp-shift').value }
          );
          renderAll();
          showToast(L('Site shift updated', 'تم تحديث وردية الموقع'), { variant: 'success' });
          return true;
        }
      }
    ]
  });
}

export function initShifts() {
  const root = document.querySelector('[data-hr-shifts]');
  if (!root) {
    return;
  }
  renderAll();
  if (booted) {
    return;
  }
  booted = true;
  document.getElementById('shift-cards')?.addEventListener('click', e => {
    const btn = e.target.closest('[data-shift]');
    if (btn) {
      openShiftModal(btn.dataset.shift);
    }
  });
  document.getElementById('shift-sites')?.addEventListener('click', e => {
    const btn = e.target.closest('[data-map]');
    if (btn) {
      openMapModal(btn.dataset.map);
    }
  });
  const shiftSchema = [
    { key: 'id', en: 'Shift ID', ar: 'رمز الوردية', required: true },
    { key: 'en', en: 'Name (EN)', ar: 'الاسم (إنجليزي)', required: true },
    { key: 'ar', en: 'Name (AR)', ar: 'الاسم (عربي)' },
    { key: 'start', en: 'Start (HH:MM)', ar: 'البداية' },
    { key: 'end', en: 'End (HH:MM)', ar: 'النهاية' },
    { key: 'breakMin', en: 'Break (min)', ar: 'الراحة', type: 'number' },
    { key: 'days', en: 'Days (comma, sun..sat)', ar: 'الأيام' },
    { key: 'ramadanStart', en: 'Ramadan start', ar: 'بداية رمضان' },
    { key: 'ramadanEnd', en: 'Ramadan end', ar: 'نهاية رمضان' }
  ];
  document.getElementById('shift-import')?.addEventListener('click', () =>
    openImportModal({
      titleEn: 'Import shifts (Excel / CSV)',
      titleAr: 'استيراد الورديات (Excel / CSV)',
      filename: 'shifts',
      schema: shiftSchema,
      example: {
        id: 'SH-NIGHT',
        en: 'Night shift',
        ar: 'وردية ليلية',
        start: '22:00',
        end: '06:00',
        breakMin: '30',
        days: 'sun,mon,tue,wed,thu',
        ramadanStart: '22:00',
        ramadanEnd: '04:00'
      },
      onImport: rows => {
        saveImportedRows(
          'shifts',
          rows.map(r => ({
            id: r.id,
            en: r.en,
            ar: r.ar || r.en,
            start: r.start || '08:00',
            end: r.end || '17:00',
            breakMin: Number(r.breakMin) || 0,
            days: (r.days || 'sun,mon,tue,wed,thu')
              .split(',')
              .map(d => d.trim())
              .filter(Boolean),
            ramadanStart: r.ramadanStart || r.start || '08:00',
            ramadanEnd: r.ramadanEnd || r.end || '17:00'
          }))
        );
        renderAll();
        return rows.length;
      }
    })
  );
  document.getElementById('shift-export')?.addEventListener('click', () => {
    exportData(
      'xlsx',
      'shifts',
      [
        { key: 'id', label: 'ID' },
        { key: 'en', label: 'Name (EN)' },
        { key: 'start', label: 'Start' },
        { key: 'end', label: 'End' },
        { key: 'breakMin', label: 'Break (min)' },
        { key: 'ramadanStart', label: 'Ramadan start' },
        { key: 'ramadanEnd', label: 'Ramadan end' }
      ],
      getSeed('shifts'),
      'Shifts'
    );
  });
  window.addEventListener(LANG_EVENT, renderAll);
}
