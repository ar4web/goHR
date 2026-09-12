// HR + Operations — residency & renewals (hr_residency.html).
// Expiry board + pre-renewal checklist auto-eval + Qiwa transfer cases.

import { showToast } from './toast.js';
import { showModal } from './modal.js';
import { t, currentLang, LANG_EVENT, applyI18n } from './i18n.js';
import { fmtSAR, fmtDate } from './hr-locale.js';
import { daysUntil, expiryBand, renewalChecklist } from './hr-statutory.js';
import { getSeed, patchSeedRow, saveImportedRows } from './hr-api.js';
import { exportData } from './import-export.js';
import { openImportModal } from './import-modal.js';

let booted = false;
let selected = '';

function L(en, ar) {
  return currentLang() === 'ar' ? ar : en;
}

function empName(e) {
  return currentLang() === 'ar' ? e.nameAr || e.nameEn : e.nameEn;
}

function docsOf(code) {
  return getSeed('residencyDocs').find(d => d.emp === code) || {};
}

function bandBadge(iso) {
  if (!iso) {
    return `<span class="status status-red">${t('status.missing')}</span>`;
  }
  const band = expiryBand(daysUntil(iso));
  const cls = { expired: 'red', critical: 'red', urgent: 'yellow', soon: 'blue', ok: 'green' }[
    band
  ];
  const d = daysUntil(iso);
  const extra = band === 'ok' ? '' : ` · ${d}${L('d', 'ي')}`;
  return `<span class="status status-${cls}">${fmtDate(iso)}${extra}</span>`;
}

function checksOf(e) {
  return renewalChecklist(e, docsOf(e.code));
}

function expats() {
  return getSeed('employees').filter(e => !e.saudi && e.st !== 'exited');
}

function renderStats() {
  const list = expats();
  const iqama30 = list.filter(e => e.iqamaExp && daysUntil(e.iqamaExp) <= 30).length;
  const missingIq = list.filter(e => !e.iqamaExp).length;
  const insBad = list.filter(e => {
    const d = docsOf(e.code);
    return !d.insExp || daysUntil(d.insExp) < 0;
  }).length;
  const finesOpen = list.filter(e => (docsOf(e.code).fines || 0) > 0).length;
  const ready = list.filter(e => checksOf(e).every(c => c.ok)).length;
  const set = (id, v) => {
    const el = document.getElementById(id);
    if (el) {
      el.textContent = v;
    }
  };
  set('res-stat-total', list.length);
  set('res-stat-iqama', iqama30 + missingIq);
  set('res-stat-ins', insBad);
  set('res-stat-fines', finesOpen);
  set('res-stat-ready', `${ready}/${list.length}`);
}

function renderBoard() {
  const el = document.getElementById('res-rows');
  if (!el) {
    return;
  }
  const rows = expats()
    .map(e => ({ e, d: e.iqamaExp ? daysUntil(e.iqamaExp) : -9999 }))
    .sort((a, b) => a.d - b.d);
  el.innerHTML = rows
    .map(({ e }) => {
      const d = docsOf(e.code);
      const checks = checksOf(e);
      const okN = checks.filter(c => c.ok).length;
      return `<tr class="${selected === e.code ? 'row-selected' : ''}">
      <td data-label="${L('Worker', 'العامل')}"><a href="hr_employee.html?code=${e.code}">${empName(e)}</a>
        <div style="font-size:11.5px;color:var(--text-muted)" dir="ltr">${e.iqama || '—'}</div></td>
      <td data-label="${L('Iqama', 'الإقامة')}">${bandBadge(e.iqamaExp)}</td>
      <td data-label="${L('Passport', 'الجواز')}">${bandBadge(d.passportExp)}</td>
      <td data-label="${L('Insurance', 'التأمين')}">${bandBadge(d.insExp)}</td>
      <td data-label="${L('Fines', 'المخالفات')}">${d.fines ? `<span class="status status-red">${fmtSAR(d.fines)}</span>` : '<span class="status status-green">✓</span>'}</td>
      <td data-label="${L('Ready', 'الجاهزية')}"><span class="status status-${okN === checks.length ? 'green' : 'yellow'}">${okN}/${checks.length}</span></td>
      <td data-label=""><button class="btn btn-outline btn-sm" data-review="${e.code}">${t('common.open')}</button></td>
    </tr>`;
    })
    .join('');
}

const CHECK_LABEL = {
  passport: ['Passport ≥ 6 months', 'الجواز ≥ 6 أشهر'],
  insurance: ['Insurance active', 'التأمين ساري'],
  fines: ['No traffic fines', 'لا مخالفات مرورية'],
  gosi: ['GOSI chain (expat 2%)', 'سلسلة التأمينات (2% أجنبي)']
};

function renderDetail() {
  const el = document.getElementById('res-detail');
  if (!el) {
    return;
  }
  const e = getSeed('employees').find(x => x.code === selected);
  if (!e) {
    el.innerHTML = `<div class="hr-empty">${L('Select a worker from the board to review the renewal file.', 'اختر عاملًا من اللوحة لمراجعة ملف التجديد.')}</div>`;
    return;
  }
  const d = docsOf(e.code);
  const checks = checksOf(e);
  el.innerHTML = `
    <div class="hr-360-top" style="margin-bottom:12px">
      <div style="flex:1;min-width:0">
        <div class="cell-strong" style="font-size:15px">${empName(e)}</div>
        <div style="font-size:12.5px;color:var(--text-muted)">${e.code} · <span dir="ltr">${e.iqama || '—'}</span></div>
      </div>
      <a class="btn btn-ghost btn-sm" href="hr_employee.html?code=${e.code}">${L('Full file', 'الملف الكامل')}</a>
    </div>
    <div style="font-size:12.5px;font-weight:700;margin-bottom:6px">${t('common.checklist')}</div>
    ${checks
      .map(
        c => `<div class="check-row ${c.ok ? 'ok' : 'fail'}">
        <span class="check-dot">${c.ok ? '✓' : '✗'}</span>
        <span>${L(...(CHECK_LABEL[c.key] || [c.key, c.key]))}</span>
        <span class="check-detail" dir="ltr">${c.detail}</span>
      </div>`
      )
      .join('')}
    <div class="hr-kv-grid" style="margin-top:12px">
      <div class="hr-kv"><span>${L('Iqama expiry', 'انتهاء الإقامة')}</span><strong>${e.iqamaExp ? fmtDate(e.iqamaExp) : t('status.missing')}</strong></div>
      <div class="hr-kv"><span>${L('Insurer', 'شركة التأمين')}</span><strong>${d.ins || '—'}</strong></div>
    </div>
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px">
      <button class="btn btn-primary btn-sm" id="res-renew">${t('common.renew')}</button>
      <button class="btn btn-outline btn-sm" id="res-ins">${L('Record insurance', 'تسجيل التأمين')}</button>
      ${d.fines ? `<button class="btn btn-outline btn-sm" id="res-fines">${L('Clear fines', 'تصفية المخالفات')}</button>` : ''}
    </div>`;
  document.getElementById('res-renew')?.addEventListener('click', () => openRenewModal(e));
  document.getElementById('res-ins')?.addEventListener('click', () => openInsuranceModal(e));
  document.getElementById('res-fines')?.addEventListener('click', () => {
    patchSeedRow('residencyDocs', { emp: e.code, ...d }, { fines: 0 });
    renderAll();
    showToast(L('Fines cleared', 'تمت تصفية المخالفات'), { variant: 'success' });
  });
}

function addYear(iso) {
  const base =
    iso && iso > new Date().toISOString().slice(0, 10)
      ? iso
      : new Date().toISOString().slice(0, 10);
  const d = new Date(`${base}T00:00:00`);
  d.setFullYear(d.getFullYear() + 1);
  return d.toISOString().slice(0, 10);
}

function openRenewModal(e) {
  const next = addYear(e.iqamaExp);
  showModal({
    title: `${t('common.renew')} · ${e.code}`,
    body: `<p style="font-size:13px;margin:0 0 10px">${L('New Iqama expiry after renewal:', 'تاريخ انتهاء الإقامة الجديد بعد التجديد:')}</p>
      <div class="form-group" style="margin-bottom:0"><input class="form-control" id="rn-exp" type="date" value="${next}" dir="ltr"></div>`,
    actions: [
      { label: t('common.cancel'), variant: 'ghost' },
      {
        label: t('common.renew'),
        variant: 'primary',
        action: ({ body }) => {
          const exp = body.querySelector('#rn-exp').value;
          if (!exp) {
            showToast(L('Expiry date is required', 'تاريخ الانتهاء مطلوب'), { variant: 'warning' });
            return false;
          }
          patchSeedRow('employees', e, { iqamaExp: exp });
          renderAll();
          showToast(L(`Iqama renewed to ${exp}`, `تم تجديد الإقامة حتى ${exp}`), {
            variant: 'success'
          });
          return true;
        }
      }
    ]
  });
}

function openInsuranceModal(e) {
  const d = docsOf(e.code);
  showModal({
    title: `${L('Record insurance', 'تسجيل التأمين')} · ${e.code}`,
    body: `<div class="form-group"><label class="form-label" for="in-co">${L('Insurer', 'شركة التأمين')}</label>
        <input class="form-control" id="in-co" value="${d.ins || ''}"></div>
      <div class="form-group" style="margin-bottom:0"><label class="form-label" for="in-exp">${L('Policy expiry', 'انتهاء الوثيقة')}</label>
        <input class="form-control" id="in-exp" type="date" value="${d.insExp || ''}" dir="ltr"></div>`,
    actions: [
      { label: t('common.cancel'), variant: 'ghost' },
      {
        label: t('common.save'),
        variant: 'primary',
        action: ({ body }) => {
          const ins = body.querySelector('#in-co').value.trim();
          const insExp = body.querySelector('#in-exp').value;
          if (!ins || !insExp) {
            showToast(L('Insurer and expiry are required', 'الشركة والانتهاء مطلوبان'), {
              variant: 'warning'
            });
            return false;
          }
          patchSeedRow('residencyDocs', { emp: e.code, ...d }, { ins, insExp });
          renderAll();
          showToast(L('Insurance recorded', 'تم تسجيل التأمين'), { variant: 'success' });
          return true;
        }
      }
    ]
  });
}

function renderTransfers() {
  const el = document.getElementById('res-transfers');
  if (!el) {
    return;
  }
  const rows = getSeed('transfers');
  el.innerHTML = `<div class="table-responsive"><table class="table"><thead><tr>
    <th>${L('Case', 'القضية')}</th><th>${L('Worker', 'العامل')}</th><th>${L('From sponsor', 'الكفيل السابق')}</th>
    <th>${L('Fee', 'الرسوم')}</th><th>${L('Notice ends', 'نهاية الإشعار')}</th><th>${L('Released', 'مُخلى')}</th><th>${t('common.status')}</th><th></th>
  </tr></thead><tbody>${rows
    .map(
      x => `<tr>
      <td data-label="${L('Case', 'القضية')}" dir="ltr">${x.id}</td>
      <td data-label="${L('Worker', 'العامل')}">${x.ob ? `<a href="hr_onboarding.html?case=${x.ob}">${currentLang() === 'ar' ? x.nameAr || x.nameEn : x.nameEn}</a>` : currentLang() === 'ar' ? x.nameAr || x.nameEn : x.nameEn}</td>
      <td data-label="${L('From sponsor', 'الكفيل السابق')}" style="font-size:12.5px">${x.from}</td>
      <td data-label="${L('Fee', 'الرسوم')}">${fmtSAR(x.fee)}</td>
      <td data-label="${L('Notice ends', 'نهاية الإشعار')}" style="font-size:12.5px">${fmtDate(x.noticeEnd)}</td>
      <td data-label="${L('Released', 'مُخلى')}"><span class="status status-${x.released ? 'green' : 'yellow'}">${x.released ? '✓' : '…'}</span></td>
      <td data-label="${t('common.status')}"><span class="status status-${x.status === 'completed' ? 'green' : 'yellow'}">${t(`status.${x.status}`)}</span></td>
      <td data-label="">${x.status !== 'completed' ? `<button class="btn btn-outline btn-sm" data-complete="${x.id}">${L('Complete', 'إتمام')}</button>` : `<span style="font-size:11.5px;color:var(--text-muted)" dir="ltr">${x.completed || ''}</span>`}</td>
    </tr>`
    )
    .join('')}</tbody></table></div>`;
}

function openTransferModal() {
  showModal({
    title: L('New transfer case', 'قضية نقل جديدة'),
    body: `<div class="form-group"><label class="form-label" for="tr-name">${L('Worker name', 'اسم العامل')}</label>
        <input class="form-control" id="tr-name"></div>
      <div class="form-group"><label class="form-label" for="tr-from">${L('From sponsor', 'الكفيل السابق')}</label>
        <input class="form-control" id="tr-from"></div>
      <div class="hr-form-2col">
        <div class="form-group"><label class="form-label" for="tr-fee">${L('Transfer fee (SAR)', 'رسوم النقل')}</label>
          <select class="form-control" id="tr-fee" dir="ltr"><option>2000</option><option>4000</option><option>6000</option></select></div>
        <div class="form-group"><label class="form-label" for="tr-notice">${L('Notice ends', 'نهاية الإشعار')}</label>
          <input class="form-control" id="tr-notice" type="date" dir="ltr"></div>
      </div>`,
    actions: [
      { label: t('common.cancel'), variant: 'ghost' },
      {
        label: t('common.save'),
        variant: 'primary',
        action: ({ body }) => {
          const nameEn = body.querySelector('#tr-name').value.trim();
          const from = body.querySelector('#tr-from').value.trim();
          const fee = Number(body.querySelector('#tr-fee').value);
          const noticeEnd = body.querySelector('#tr-notice').value;
          if (!nameEn || !from || !noticeEnd) {
            showToast(
              L('Name, sponsor and notice end are required', 'الاسم والكفيل ونهاية الإشعار مطلوبة'),
              { variant: 'warning' }
            );
            return false;
          }
          const n = getSeed('transfers').length + 21;
          saveImportedRows('transfers', [
            {
              id: `QX-2026-0${n}`,
              ob: '',
              nameEn,
              from,
              fee,
              requested: new Date().toISOString().slice(0, 10),
              noticeEnd,
              released: false,
              status: 'in-progress'
            }
          ]);
          renderAll();
          showToast(L('Transfer case opened', 'تم فتح قضية النقل'), { variant: 'success' });
          return true;
        }
      }
    ]
  });
}

function renderAll() {
  renderStats();
  renderBoard();
  renderDetail();
  renderTransfers();
  applyI18n(document.querySelector('[data-hr-residency]') || document);
}

const BOARD_COLS = [
  { key: 'code', label: 'Code' },
  { key: 'nameEn', label: 'Name (EN)' },
  { key: 'iqama', label: 'Iqama' },
  { key: 'iqamaExp', label: 'Iqama expiry' },
  { key: 'passportExp', label: 'Passport expiry' },
  { key: 'insExp', label: 'Insurance expiry' },
  { key: 'fines', label: 'Fines' },
  { key: 'ready', label: 'Checklist ready' }
];

export function initResidency() {
  const root = document.querySelector('[data-hr-residency]');
  if (!root) {
    return;
  }
  renderAll();
  if (booted) {
    return;
  }
  booted = true;
  document.getElementById('res-rows')?.addEventListener('click', e => {
    const btn = e.target.closest('[data-review]');
    if (!btn) {
      return;
    }
    selected = btn.dataset.review;
    renderBoard();
    renderDetail();
    document.getElementById('res-detail')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });
  const resSchema = [
    { key: 'emp', en: 'Employee code', ar: 'رقم الموظف', required: true },
    { key: 'passport', en: 'Passport no.', ar: 'رقم الجواز' },
    { key: 'passportExp', en: 'Passport expiry (YYYY-MM-DD)', ar: 'انتهاء الجواز', type: 'date' },
    { key: 'ins', en: 'Insurance provider', ar: 'شركة التأمين' },
    { key: 'insExp', en: 'Insurance expiry (YYYY-MM-DD)', ar: 'انتهاء التأمين', type: 'date' },
    { key: 'fines', en: 'Fines (SAR)', ar: 'المخالفات', type: 'number' }
  ];
  document.getElementById('res-import')?.addEventListener('click', () =>
    openImportModal({
      titleEn: 'Import residency docs (Excel / CSV)',
      titleAr: 'استيراد مستندات الإقامة (Excel / CSV)',
      filename: 'residency-docs',
      schema: resSchema,
      example: {
        emp: 'EMP-0006',
        passport: 'N100006',
        passportExp: '2029-04-11',
        ins: 'Bupa',
        insExp: '2027-03-14',
        fines: '0'
      },
      onImport: rows => {
        saveImportedRows(
          'residencyDocs',
          rows.map(r => ({
            emp: r.emp,
            passport: r.passport || '',
            passportExp: r.passportExp || '',
            ins: r.ins || '',
            insExp: r.insExp || '',
            fines: Number(r.fines) || 0
          }))
        );
        renderAll();
        return rows.length;
      }
    })
  );
  document.getElementById('res-export')?.addEventListener('click', () => {
    const rows = expats().map(e => {
      const d = docsOf(e.code);
      return {
        code: e.code,
        nameEn: e.nameEn,
        iqama: e.iqama || '',
        iqamaExp: e.iqamaExp || '',
        passportExp: d.passportExp || '',
        insExp: d.insExp || '',
        fines: d.fines || 0,
        ready: checksOf(e).every(c => c.ok) ? 'yes' : 'no'
      };
    });
    exportData('xlsx', 'residency-board', BOARD_COLS, rows, 'Residency');
  });
  document.getElementById('res-transfer-new')?.addEventListener('click', openTransferModal);
  document.getElementById('res-transfers')?.addEventListener('click', e => {
    const btn = e.target.closest('[data-complete]');
    if (!btn) {
      return;
    }
    const x = getSeed('transfers').find(r => r.id === btn.dataset.complete);
    if (!x) {
      return;
    }
    patchSeedRow('transfers', x, {
      status: 'completed',
      completed: new Date().toISOString().slice(0, 10)
    });
    renderAll();
    showToast(L('Transfer completed', 'تم إتمام النقل'), { variant: 'success' });
  });
  window.addEventListener(LANG_EVENT, renderAll);
}
