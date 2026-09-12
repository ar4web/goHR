// HR + Operations — Hijri holidays (hr_holidays.html).
// Register + weekend-shifted observance + custom days. Idempotent.

import { showToast } from './toast.js';
import { showModal } from './modal.js';
import { t, currentLang, LANG_EVENT, applyI18n } from './i18n.js';
import { fmtDate, fmtHijri } from './hr-locale.js';
import { observedHoliday } from './hr-statutory.js';
import { getSeed, saveImportedRows } from './hr-api.js';
import { exportData } from './import-export.js';
import { openImportModal } from './import-modal.js';

let booted = false;
let yearFilter = '';

function L(en, ar) {
  return currentLang() === 'ar' ? ar : en;
}

function weekday(iso) {
  const days =
    currentLang() === 'ar'
      ? ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']
      : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return days[new Date(`${iso}T00:00:00`).getDay()];
}

function rows() {
  const list = getSeed('holidays');
  return yearFilter ? list.filter(h => h.start.startsWith(yearFilter)) : list;
}

function renderStats() {
  const list = rows();
  const set = (id, v) => {
    const el = document.getElementById(id);
    if (el) {
      el.textContent = v;
    }
  };
  set(
    'hol-stat-days',
    list.reduce((s, h) => s + (h.days || 1), 0)
  );
  set('hol-stat-events', list.length);
  set('hol-stat-shifted', list.filter(h => observedHoliday(h.start).shifted).length);
}

function renderRows() {
  const el = document.getElementById('hol-rows');
  if (!el) {
    return;
  }
  el.innerHTML = rows()
    .map(h => {
      const obs = observedHoliday(h.start);
      return `<tr>
      <td data-label="${L('Holiday', 'العطلة')}"><strong>${currentLang() === 'ar' ? h.ar : h.en}</strong>
        <div style="font-size:11.5px;color:var(--text-muted)">${currentLang() === 'ar' ? h.en : h.ar}</div></td>
      <td data-label="${L('Gregorian', 'الميلادي')}">${fmtDate(h.start)} <span style="color:var(--text-muted)">(${weekday(h.start)})</span></td>
      <td data-label="${L('Hijri', 'الهجري')}" dir="ltr">${h.hijri || fmtHijri(h.start)}</td>
      <td data-label="${L('Days', 'الأيام')}" dir="ltr">${h.days || 1}</td>
      <td data-label="${L('Observed', 'المعتمد')}">${obs.shifted ? `<span class="status status-yellow">${fmtDate(obs.observed)} · ${L('shifted', 'مُزاحة')}</span>` : `<span class="status status-green">${L('as-is', 'كما هي')}</span>`}</td>
    </tr>`;
    })
    .join('');
}

function renderAll() {
  const sel = document.getElementById('hol-year');
  if (sel && !sel.options.length) {
    const years = [...new Set(getSeed('holidays').map(h => h.start.slice(0, 4)))].sort();
    sel.innerHTML =
      `<option value="">${L('All years', 'كل السنوات')}</option>` +
      years.map(y => `<option>${y}</option>`).join('');
  }
  renderStats();
  renderRows();
  applyI18n(document.querySelector('[data-hr-holidays]') || document);
}

function openAddModal() {
  showModal({
    title: L('Add observance', 'إضافة عطلة'),
    body: `<div class="hr-form-2col">
        <div class="form-group"><label class="form-label" for="ho-en">${L('Name (EN)', 'الاسم (إنجليزي)')}</label>
          <input class="form-control" id="ho-en" dir="ltr"></div>
        <div class="form-group"><label class="form-label" for="ho-ar">${L('Name (AR)', 'الاسم (عربي)')}</label>
          <input class="form-control" id="ho-ar"></div>
      </div>
      <div class="hr-form-2col">
        <div class="form-group"><label class="form-label" for="ho-start">${L('Start', 'البداية')}</label>
          <input class="form-control" id="ho-start" type="date" dir="ltr"></div>
        <div class="form-group"><label class="form-label" for="ho-days">${L('Days', 'الأيام')}</label>
          <input class="form-control" id="ho-days" type="number" min="1" value="1" dir="ltr"></div>
      </div>
      <div class="form-group" style="margin-bottom:0"><label class="form-label" for="ho-hijri">Hijri</label>
        <input class="form-control" id="ho-hijri" placeholder="1448-01-01" dir="ltr"></div>`,
    actions: [
      { label: t('common.cancel'), variant: 'ghost' },
      {
        label: t('common.save'),
        variant: 'primary',
        action: ({ body }) => {
          const en = body.querySelector('#ho-en').value.trim();
          const start = body.querySelector('#ho-start').value;
          if (!en || !start) {
            showToast(L('Name and start are required', 'الاسم والبداية مطلوبان'), {
              variant: 'warning'
            });
            return false;
          }
          saveImportedRows('holidays', [
            {
              id: `H-${start}`,
              en,
              ar: body.querySelector('#ho-ar').value.trim() || en,
              start,
              days: Number(body.querySelector('#ho-days').value) || 1,
              hijri: body.querySelector('#ho-hijri').value.trim()
            }
          ]);
          renderAll();
          showToast(L('Holiday added', 'أُضيفت العطلة'), { variant: 'success' });
          return true;
        }
      }
    ]
  });
}

export function initHolidays() {
  const root = document.querySelector('[data-hr-holidays]');
  if (!root) {
    return;
  }
  renderAll();
  if (booted) {
    return;
  }
  booted = true;
  document.getElementById('hol-year')?.addEventListener('change', e => {
    yearFilter = e.target.value;
    renderAll();
  });
  document.getElementById('hol-add')?.addEventListener('click', openAddModal);
  const holSchema = [
    { key: 'en', en: 'Name (EN)', ar: 'الاسم (إنجليزي)', required: true },
    { key: 'ar', en: 'Name (AR)', ar: 'الاسم (عربي)' },
    { key: 'start', en: 'Start (YYYY-MM-DD)', ar: 'البداية', required: true, type: 'date' },
    { key: 'days', en: 'Days', ar: 'الأيام', type: 'number' },
    { key: 'hijri', en: 'Hijri (YYYY-MM-DD)', ar: 'الهجري' }
  ];
  document.getElementById('hol-import')?.addEventListener('click', () =>
    openImportModal({
      titleEn: 'Import holidays (Excel / CSV)',
      titleAr: 'استيراد العطل (Excel / CSV)',
      filename: 'holidays',
      schema: holSchema,
      example: { en: 'Company day', ar: 'يوم الشركة', start: '2026-11-05', days: '1', hijri: '' },
      onImport: rows => {
        saveImportedRows(
          'holidays',
          rows.map(r => ({
            id: `H-${r.start}`,
            en: r.en,
            ar: r.ar || r.en,
            start: r.start,
            days: Number(r.days) || 1,
            hijri: r.hijri || ''
          }))
        );
        renderAll();
        return rows.length;
      }
    })
  );
  document.getElementById('hol-export')?.addEventListener('click', () => {
    exportData(
      'xlsx',
      'holidays',
      [
        { key: 'en', label: 'Name (EN)' },
        { key: 'ar', label: 'Name (AR)' },
        { key: 'start', label: 'Start' },
        { key: 'days', label: 'Days' },
        { key: 'hijri', label: 'Hijri' }
      ],
      rows(),
      'Holidays'
    );
  });
  window.addEventListener(LANG_EVENT, renderAll);
}
