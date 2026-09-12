// HR + Operations — visa register (hr_visas.html).
// Blocks + per-worker visas + arrival recording + agent costing. Idempotent.

import { showToast } from './toast.js';
import { showModal } from './modal.js';
import { openMenu } from './menus.js';
import { t, currentLang, LANG_EVENT, applyI18n } from './i18n.js';
import { fmtSAR, fmtDate } from './hr-locale.js';
import { daysUntil, expiryBand } from './hr-statutory.js';
import { getSeed, saveImportedRows, patchSeedRow } from './hr-api.js';
import { exportData, templateCSV, templateXLSX, importFile } from './import-export.js';
import { AGENTS, VISA_BLOCKS, PROFESSIONS } from './hr-seed.js';
import { escapeHtml as esc } from './markup.js';

let booted = false;
let statusFilter = '';

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

function obName(id) {
  const c = getSeed('onboarding').find(x => x.id === id);
  if (!c) {
    return id;
  }
  return currentLang() === 'ar' ? c.nameAr || c.nameEn : c.nameEn;
}

function profName(code) {
  const p = PROFESSIONS.find(x => x.code === code);
  if (!p) {
    return code || '—';
  }
  return currentLang() === 'ar' ? p.ar : p.en;
}

function bandBadge(iso) {
  if (!iso) {
    return `<span class="status status-red">${t('status.missing')}</span>`;
  }
  const band = expiryBand(daysUntil(iso));
  const cls = { expired: 'red', critical: 'red', urgent: 'yellow', soon: 'blue', ok: 'green' }[
    band
  ];
  return `<span class="status status-${cls}">${fmtDate(iso)}</span>`;
}

const VISA_CLS = { used: 'green', awaiting: 'yellow', expired: 'red', cancelled: 'blue' };

function blockUse(blockId) {
  return getSeed('visas').filter(v => v.block === blockId && v.status !== 'cancelled').length;
}

function renderStats() {
  const visas = getSeed('visas');
  const quota = VISA_BLOCKS.reduce((s, b) => s + b.qty, 0);
  const used = VISA_BLOCKS.reduce((s, b) => s + blockUse(b.id), 0);
  const awaiting = visas.filter(v => v.status === 'awaiting').length;
  const expiring = visas.filter(
    v => v.status === 'awaiting' && v.validUntil && daysUntil(v.validUntil) <= 90
  ).length;
  const set = (id, v) => {
    const el = document.getElementById(id);
    if (el) {
      el.textContent = v;
    }
  };
  set('visa-stat-blocks', VISA_BLOCKS.length);
  set('visa-stat-quota', quota);
  set('visa-stat-used', used);
  set('visa-stat-avail', Math.max(0, quota - used));
  set('visa-stat-awaiting', awaiting);
  set('visa-stat-expiring', expiring);
}

function renderBlocks() {
  const el = document.getElementById('visa-blocks');
  if (!el) {
    return;
  }
  el.innerHTML =
    `<div class="table-responsive"><table class="table"><thead><tr>
    <th>${L('Block', 'المجموعة')}</th><th>${L('Profession', 'المهنة')}</th>
    <th>${L('Quota', 'الحصة')}</th><th>${L('Expires', 'الانتهاء')}</th>
    <th>${L('Agent', 'الوكيل')}</th><th>${L('Cost/visa', 'التكلفة')}</th>
  </tr></thead><tbody>` +
    VISA_BLOCKS.map(b => {
      const used = blockUse(b.id);
      const pct = Math.min(100, Math.round((used / Math.max(1, b.qty)) * 100));
      const ag = AGENTS.find(a => a.id === b.agent);
      return `<tr>
      <td data-label="${L('Block', 'المجموعة')}" dir="ltr">${esc(b.id)}</td>
      <td data-label="${L('Profession', 'المهنة')}">${esc(profName(b.profession))}</td>
      <td data-label="${L('Quota', 'الحصة')}"><div class="hr-bar-top"><span>${used} / ${esc(b.qty)}</span></div>
        <div class="hr-bar-track"><div class="hr-bar-fill" style="width:${pct}%;background:var(--primary)"></div></div></td>
      <td data-label="${L('Expires', 'الانتهاء')}">${bandBadge(b.expires)}</td>
      <td data-label="${L('Agent', 'الوكيل')}" style="font-size:12.5px">${esc(ag ? ag.name : b.agent)}</td>
      <td data-label="${L('Cost/visa', 'التكلفة')}">${fmtSAR(b.costPerVisa)}</td>
    </tr>`;
    }).join('') +
    '</tbody></table></div>';
}

function visibleVisas() {
  const list = getSeed('visas');
  return statusFilter ? list.filter(v => v.status === statusFilter) : list;
}

function renderRegister() {
  const el = document.getElementById('visa-rows');
  if (!el) {
    return;
  }
  el.innerHTML =
    visibleVisas()
      .map(v => {
        const who = v.emp
          ? `<a href="hr_employee.html?code=${encodeURIComponent(v.emp)}">${esc(empName(v.emp))}</a>`
          : v.ob
            ? `<a href="hr_onboarding.html?case=${encodeURIComponent(v.ob)}">${esc(obName(v.ob))}</a>`
            : '<span style="color:var(--text-muted)">—</span>';
        const blk = VISA_BLOCKS.find(b => b.id === v.block);
        return `<tr>
      <td data-label="${L('Visa', 'التأشيرة')}" dir="ltr">${esc(v.no)}<div style="font-size:11.5px;color:var(--text-muted)">${esc(v.type)}</div></td>
      <td data-label="${L('Worker', 'العامل')}">${who}</td>
      <td data-label="${L('Profession', 'المهنة')}" style="font-size:12.5px">${esc(profName(blk ? blk.profession : ''))}</td>
      <td data-label="${L('Issued', 'الإصدار')}" style="font-size:12.5px">${esc(fmtDate(v.issued))}</td>
      <td data-label="${L('Valid until', 'صالحة حتى')}">${bandBadge(v.validUntil)}</td>
      <td data-label="${L('Entry', 'الدخول')}" style="font-size:12.5px">${v.entry ? esc(fmtDate(v.entry)) : '—'}</td>
      <td data-label="${t('common.status')}"><span class="status status-${VISA_CLS[v.status] || 'blue'}">${esc(t(`status.${v.status}`))}</span></td>
      <td data-label="">${v.status === 'awaiting' ? `<button class="btn btn-outline btn-sm" data-arrive="${esc(v.no)}">${t('common.arrival')}</button>` : ''}</td>
    </tr>`;
      })
      .join('') ||
    `<tr><td colspan="8" style="text-align:center;color:var(--text-muted);padding:24px">${t('common.noData')}</td></tr>`;
}

function renderAll() {
  renderStats();
  renderBlocks();
  renderRegister();
  applyI18n(document.querySelector('[data-hr-visas]') || document);
}

function openArrivalModal(no) {
  const v = getSeed('visas').find(x => x.no === no);
  if (!v) {
    return;
  }
  const today = new Date().toISOString().slice(0, 10);
  showModal({
    title: `${t('common.arrival')} · ${esc(no)}`,
    body: `<div class="form-group" style="margin-bottom:0"><label class="form-label" for="va-entry">${L('Entry date (passport stamp)', 'تاريخ الدخول (ختم الجواز)')}</label>
      <input class="form-control" id="va-entry" type="date" value="${v.entry || today}" dir="ltr"></div>`,
    actions: [
      { label: t('common.cancel'), variant: 'ghost' },
      {
        label: t('common.save'),
        variant: 'primary',
        action: ({ body }) => {
          const entry = body.querySelector('#va-entry').value;
          if (!entry) {
            showToast(L('Entry date is required', 'تاريخ الدخول مطلوب'), { variant: 'warning' });
            return false;
          }
          patchSeedRow('visas', v, { entry, status: 'used' });
          renderAll();
          showToast(L('Arrival recorded — clocks started', 'تم تسجيل الوصول — بدأت الساعات'), {
            variant: 'success'
          });
          return true;
        }
      }
    ]
  });
}

const IMPORT_SCHEMA = [
  { key: 'no', en: 'Visa no.', ar: 'رقم التأشيرة', required: true },
  { key: 'block', en: 'Block', ar: 'المجموعة' },
  { key: 'type', en: 'Type', ar: 'النوع' },
  { key: 'issued', en: 'Issued (YYYY-MM-DD)', ar: 'الإصدار', type: 'date' },
  { key: 'validUntil', en: 'Valid until (YYYY-MM-DD)', ar: 'صالحة حتى', type: 'date' }
];

function openImportModal() {
  const lang = currentLang();
  showModal({
    title: lang === 'ar' ? 'استيراد تأشيرات (Excel / CSV)' : 'Import visas (Excel / CSV)',
    size: 'lg',
    body: `
      <div style="display:flex;gap:8px;margin-bottom:12px;flex-wrap:wrap">
        <button type="button" class="btn btn-outline btn-sm" data-tpl="csv">${t('common.template')} CSV</button>
        <button type="button" class="btn btn-outline btn-sm" data-tpl="xlsx">${t('common.template')} Excel</button>
      </div>
      <label class="btn btn-outline" style="cursor:pointer">${t('common.chooseFile')} (.xlsx, .csv)
        <input type="file" data-imp-file accept=".xlsx,.xls,.csv" hidden>
      </label>
      <div data-imp-result style="margin-top:12px;font-size:12.5px"></div>`,
    actions: [
      { label: t('common.cancel'), variant: 'ghost' },
      {
        label: t('common.import'),
        variant: 'primary',
        action: ({ body, close }) => {
          const pending = body._pending;
          if (!pending || !pending.rows.length) {
            showToast(lang === 'ar' ? 'اختر ملفًا صالحًا أولًا' : 'Choose a valid file first', {
              variant: 'warning'
            });
            return false;
          }
          if (pending.errors.length) {
            showToast(lang === 'ar' ? 'أصلح الأخطاء أولًا' : 'Fix validation errors first', {
              variant: 'warning'
            });
            return false;
          }
          const rows = pending.rows.map(r => ({
            no: r.no,
            block: r.block || '',
            ob: '',
            emp: '',
            type: r.type || 'work',
            issued: r.issued || '',
            validUntil: r.validUntil || '',
            entry: '',
            status: 'awaiting'
          }));
          saveImportedRows('visas', rows);
          renderAll();
          showToast(
            lang === 'ar' ? `تم استيراد ${rows.length} تأشيرة` : `Imported ${rows.length} visas`,
            { variant: 'success' }
          );
          close();
          return true;
        }
      }
    ]
  });
  const dlg = document.querySelector('.modal-backdrop:last-child') || document;
  dlg.addEventListener('click', ev => {
    const tpl = ev.target.closest('[data-tpl]');
    if (!tpl) {
      return;
    }
    const cols = IMPORT_SCHEMA.map(f => ({ key: f.key, label: lang === 'ar' ? f.ar : f.en }));
    const ex = {
      no: 'V-2026-900',
      block: 'VB-2026-01',
      type: 'work',
      issued: '2026-09-01',
      validUntil: '2027-08-31'
    };
    if (tpl.dataset.tpl === 'xlsx') {
      templateXLSX('visas', cols, ex);
    } else {
      templateCSV('visas', cols, ex);
    }
  });
  dlg.addEventListener('change', async ev => {
    const input = ev.target.closest('[data-imp-file]');
    if (!input || !input.files[0]) {
      return;
    }
    const box = dlg.querySelector('[data-imp-result]');
    box.textContent = '…';
    try {
      const res = await importFile(input.files[0], IMPORT_SCHEMA);
      const bodyEl = dlg.querySelector('.modal-body');
      if (bodyEl) {
        bodyEl._pending = res;
      }
      if (!res.rows.length) {
        box.innerHTML = '<span class="status status-red">0 rows</span>';
        return;
      }
      const errHtml = res.errors
        .slice(0, 10)
        .map(e => `<div>row ${esc(e.row)} · ${esc(e.field)} · ${esc(e.message)}</div>`)
        .join('');
      box.innerHTML = `<span class="status status-${res.errors.length ? 'red' : 'green'}">${res.rows.length} rows · ${res.errors.length} errors</span><div style="margin-top:8px;color:var(--text-muted)">${errHtml}</div>`;
    } catch (_err) {
      box.innerHTML = '<span class="status status-red">parse-error</span>';
    }
  });
}

const EXPORT_COLS = [
  { key: 'no', label: 'Visa no.' },
  { key: 'block', label: 'Block' },
  { key: 'emp', label: 'Employee' },
  { key: 'ob', label: 'Onboarding' },
  { key: 'type', label: 'Type' },
  { key: 'issued', label: 'Issued' },
  { key: 'validUntil', label: 'Valid until' },
  { key: 'entry', label: 'Entry' },
  { key: 'status', label: 'Status' }
];

export function initVisas() {
  const root = document.querySelector('[data-hr-visas]');
  if (!root) {
    return;
  }
  renderAll();
  if (booted) {
    return;
  }
  booted = true;
  document.getElementById('visa-status')?.addEventListener('change', e => {
    statusFilter = e.target.value;
    renderRegister();
  });
  document.getElementById('visa-export')?.addEventListener('click', e => {
    e.stopPropagation();
    openMenu(e.currentTarget, [
      {
        label: `${t('common.export')} CSV`,
        action: () => exportData('csv', 'visas', EXPORT_COLS, visibleVisas())
      },
      {
        label: `${t('common.export')} Excel`,
        action: () => exportData('xlsx', 'visas', EXPORT_COLS, visibleVisas(), 'Visas')
      }
    ]);
  });
  document.getElementById('visa-import')?.addEventListener('click', openImportModal);
  document.getElementById('visa-rows')?.addEventListener('click', e => {
    const btn = e.target.closest('[data-arrive]');
    if (btn) {
      openArrivalModal(btn.dataset.arrive);
    }
  });
  window.addEventListener(LANG_EVENT, renderAll);
}
