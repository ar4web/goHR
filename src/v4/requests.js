// HR + Operations — manpower requests pipeline (hr_requests.html).
// Client demand → sourcing → proposed → deploying → fulfilled. Idempotent.

import { showToast } from './toast.js';
import { showModal } from './modal.js';
import { t, currentLang, LANG_EVENT, applyI18n } from './i18n.js';
import { fmtSAR } from './hr-locale.js';
import { getSeed, patchSeedRow, saveImportedRows } from './hr-api.js';
import { exportData } from './import-export.js';
import { openImportModal } from './import-modal.js';
import { SITES, PROFESSIONS } from './hr-seed.js';

let booted = false;

function L(en, ar) {
  return currentLang() === 'ar' ? ar : en;
}

const FLOW = ['sourcing', 'proposed', 'deploying', 'fulfilled'];
const FLOW_LBL = {
  sourcing: ['Sourcing', 'توريد'],
  proposed: ['Proposed', 'مُقترح'],
  deploying: ['Deploying', 'قيد التوزيع'],
  fulfilled: ['Fulfilled', 'مُنجز'],
  cancelled: ['Cancelled', 'ملغي']
};

function clientName(id) {
  const c = getSeed('clients').find(x => x.id === id);
  if (!c) {
    return id;
  }
  return currentLang() === 'ar' ? c.nameAr || c.nameEn : c.nameEn;
}

function siteName(id) {
  const s = SITES.find(x => x.id === id);
  if (!s) {
    return id || '';
  }
  return currentLang() === 'ar' ? s.nameAr : s.nameEn;
}

function profName(code) {
  const p = PROFESSIONS.find(x => x.code === code);
  if (!p) {
    return code;
  }
  return currentLang() === 'ar' ? p.ar : p.en;
}

function openReqs() {
  return getSeed('requests').filter(r => !['fulfilled', 'cancelled'].includes(r.status));
}

function renderStats() {
  const set = (id, v) => {
    const el = document.getElementById(id);
    if (el) {
      el.textContent = v;
    }
  };
  const open = openReqs();
  set('rq-stat-open', open.length);
  set(
    'rq-stat-qty',
    open.reduce((s, r) => s + (r.qty || 0), 0)
  );
  set(
    'rq-stat-filled',
    open.reduce((s, r) => s + Math.min(r.filled || 0, r.qty || 0), 0)
  );
  set('rq-stat-done', getSeed('requests').filter(r => r.status === 'fulfilled').length);
}

function statusChip(st) {
  const cls =
    st === 'fulfilled'
      ? 'green'
      : st === 'cancelled'
        ? 'red'
        : st === 'deploying'
          ? 'yellow'
          : 'blue';
  const lbl = FLOW_LBL[st] || [st, st];
  return `<span class="status status-${cls}">${L(lbl[0], lbl[1])}</span>`;
}

function renderRows() {
  const el = document.getElementById('rq-rows');
  if (!el) {
    return;
  }
  el.innerHTML = getSeed('requests')
    .map(r => {
      const pct = r.qty ? Math.min(100, Math.round(((r.filled || 0) / r.qty) * 100)) : 0;
      const next = FLOW[FLOW.indexOf(r.status) + 1];
      return `<tr>
      <td data-label="#"><span dir="ltr">${r.id}</span>
        <div style="font-size:11.5px;color:var(--text-muted)">${clientName(r.client)}</div></td>
      <td data-label="${L('Site', 'الموقع')}">${siteName(r.site)}</td>
      <td data-label="${L('Profession', 'المهنة')}">${profName(r.prof)}</td>
      <td data-label="${L('Filled', 'المعبأ')}" dir="ltr">${r.filled || 0}/${r.qty || 0}
        <div style="height:6px;border-radius:3px;background:var(--border);margin-top:4px"><div style="height:6px;border-radius:3px;background:var(--primary);width:${pct}%"></div></div></td>
      <td data-label="${L('Rate', 'الأجر')}" dir="ltr">${fmtSAR(r.rate || 0)}</td>
      <td data-label="${L('Start', 'البداية')}" dir="ltr">${r.start || '—'}</td>
      <td data-label="${t('common.status')}">${statusChip(r.status)}</td>
      <td data-label=""><div style="display:flex;gap:6px">
        ${next ? `<button class="btn btn-outline btn-sm" data-adv="${r.id}">${L('Advance', 'تقديم')}</button>` : ''}
        <button class="btn btn-outline btn-sm" data-edit="${r.id}">${t('common.edit')}</button>
      </div></td>
    </tr>`;
    })
    .join('');
}

function renderAll() {
  renderStats();
  renderRows();
  applyI18n(document.querySelector('[data-hr-requests]') || document);
}

function nextReqId() {
  const nums = getSeed('requests').map(r => Number((r.id || '').split('-').pop()) || 0);
  return `REQ-2026-${String(Math.max(0, ...nums) + 1).padStart(3, '0')}`;
}

function sitesFor(clientId) {
  return getSeed('sites').filter(s => !clientId || s.client === clientId);
}

function openRequestModal(id) {
  const r = id ? getSeed('requests').find(x => x.id === id) : null;
  const clients = getSeed('clients');
  const d = r || {
    client: clients[0]?.id || '',
    site: '',
    prof: 'construction',
    qty: 1,
    rate: 3000,
    start: '',
    durMo: 12
  };
  const siteOpts = cid =>
    sitesFor(cid)
      .map(
        s =>
          `<option value="${s.id}"${d.site === s.id ? ' selected' : ''}>${currentLang() === 'ar' ? s.nameAr : s.nameEn}</option>`
      )
      .join('');
  showModal({
    title: r ? `${t('common.edit')} · ${r.id}` : L('New request', 'طلب جديد'),
    body: `<div class="hr-form-2col">
        <div class="form-group"><label class="form-label" for="nr-client">${L('Client', 'العميل')}</label>
          <select class="form-control" id="nr-client" ${r ? 'disabled' : ''}>${clients.map(c => `<option value="${c.id}"${d.client === c.id ? ' selected' : ''}>${clientName(c.id)}</option>`).join('')}</select></div>
        <div class="form-group"><label class="form-label" for="nr-site">${L('Site', 'الموقع')}</label>
          <select class="form-control" id="nr-site">${siteOpts(d.client)}</select></div>
      </div>
      <div class="hr-form-2col">
        <div class="form-group"><label class="form-label" for="nr-prof">${L('Profession', 'المهنة')}</label>
          <select class="form-control" id="nr-prof">${PROFESSIONS.map(p => `<option value="${p.code}"${d.prof === p.code ? ' selected' : ''}>${L(p.en, p.ar)}</option>`).join('')}</select></div>
        <div class="form-group"><label class="form-label" for="nr-qty">${L('Quantity', 'العدد')}</label>
          <input class="form-control" id="nr-qty" type="number" min="1" value="${d.qty}" dir="ltr"></div>
      </div>
      <div class="hr-form-2col">
        <div class="form-group"><label class="form-label" for="nr-rate">${L('Monthly rate (SAR)', 'الأجر الشهري')}</label>
          <input class="form-control" id="nr-rate" type="number" min="0" value="${d.rate}" dir="ltr"></div>
        <div class="form-group"><label class="form-label" for="nr-dur">${L('Duration (months)', 'المدة (شهر)')}</label>
          <input class="form-control" id="nr-dur" type="number" min="1" max="36" value="${d.durMo}" dir="ltr"></div>
      </div>
      <div class="form-group" style="margin-bottom:0"><label class="form-label" for="nr-start">${L('Start', 'البداية')}</label>
        <input class="form-control" id="nr-start" type="date" value="${d.start || ''}" dir="ltr"></div>`,
    actions: [
      { label: t('common.cancel'), variant: 'ghost' },
      ...(r && !['fulfilled', 'cancelled'].includes(r.status)
        ? [
            {
              label: L('Cancel request', 'إلغاء الطلب'),
              variant: 'outline',
              action: () => {
                patchSeedRow('requests', r, { status: 'cancelled' });
                renderAll();
                showToast(L('Request cancelled', 'أُلغي الطلب'), { variant: 'success' });
                return true;
              }
            }
          ]
        : []),
      {
        label: t('common.save'),
        variant: 'primary',
        action: ({ body }) => {
          const qty = Number(body.querySelector('#nr-qty').value);
          if (!qty || qty < 1) {
            showToast(L('Quantity must be ≥ 1', 'العدد يجب أن يكون ≥ 1'), { variant: 'warning' });
            return false;
          }
          const patch = {
            site: body.querySelector('#nr-site').value,
            prof: body.querySelector('#nr-prof').value,
            qty,
            rate: Number(body.querySelector('#nr-rate').value) || 0,
            start: body.querySelector('#nr-start').value,
            durMo: Number(body.querySelector('#nr-dur').value) || 12
          };
          if (r) {
            patchSeedRow('requests', r, patch);
          } else {
            saveImportedRows('requests', [
              {
                id: nextReqId(),
                client: body.querySelector('#nr-client').value,
                filled: 0,
                status: 'sourcing',
                ...patch
              }
            ]);
          }
          renderAll();
          showToast(L('Request saved', 'تم حفظ الطلب'), { variant: 'success' });
          return true;
        }
      }
    ]
  });
  const dlg = document.querySelector('.modal-backdrop:last-child') || document;
  dlg.addEventListener('change', ev => {
    if (ev.target?.id !== 'nr-client') {
      return;
    }
    const siteSel = dlg.querySelector('#nr-site');
    if (siteSel) {
      const cid = ev.target.value;
      siteSel.innerHTML = sitesFor(cid)
        .map(
          s => `<option value="${s.id}">${currentLang() === 'ar' ? s.nameAr : s.nameEn}</option>`
        )
        .join('');
    }
  });
}

function advance(id) {
  const r = getSeed('requests').find(x => x.id === id);
  if (!r) {
    return;
  }
  const next = FLOW[FLOW.indexOf(r.status) + 1];
  if (!next) {
    return;
  }
  if (next === 'fulfilled' && (r.filled || 0) < (r.qty || 0)) {
    showToast(L(`Only ${r.filled || 0}/${r.qty} filled`, `المعبأ ${r.filled || 0}/${r.qty} فقط`), {
      variant: 'warning'
    });
    return;
  }
  patchSeedRow('requests', r, { status: next });
  renderAll();
  showToast(L(`Moved to ${next}`, `نُقل إلى ${L(...FLOW_LBL[next])}`), { variant: 'success' });
}

const RQ_SCHEMA = [
  { key: 'client', en: 'Client ID', ar: 'رمز العميل', required: true },
  { key: 'site', en: 'Site ID', ar: 'رمز الموقع' },
  { key: 'prof', en: 'Profession code', ar: 'رمز المهنة', required: true },
  { key: 'qty', en: 'Quantity', ar: 'العدد', required: true, type: 'number' },
  { key: 'rate', en: 'Monthly rate (SAR)', ar: 'الأجر الشهري', type: 'number' },
  { key: 'start', en: 'Start (YYYY-MM-DD)', ar: 'البداية', type: 'date' },
  { key: 'durMo', en: 'Duration (months)', ar: 'المدة', type: 'number' }
];

export function initRequests() {
  const root = document.querySelector('[data-hr-requests]');
  if (!root) {
    return;
  }
  renderAll();
  if (booted) {
    return;
  }
  booted = true;
  document.getElementById('rq-new')?.addEventListener('click', () => openRequestModal());
  document.getElementById('rq-rows')?.addEventListener('click', e => {
    const adv = e.target.closest('[data-adv]');
    const edt = e.target.closest('[data-edit]');
    if (adv) {
      advance(adv.dataset.adv);
    } else if (edt) {
      openRequestModal(edt.dataset.edit);
    }
  });
  document.getElementById('rq-import')?.addEventListener('click', () =>
    openImportModal({
      titleEn: 'Import requests (Excel / CSV)',
      titleAr: 'استيراد الطلبات (Excel / CSV)',
      filename: 'requests',
      schema: RQ_SCHEMA,
      example: {
        client: 'CL-001',
        site: 'ST-001',
        prof: 'construction',
        qty: '5',
        rate: '3200',
        start: '2026-10-01',
        durMo: '12'
      },
      onImport: rows => {
        const clients = new Set(getSeed('clients').map(c => c.id));
        for (const r of rows) {
          if (!clients.has(r.client)) {
            showToast(`${L('Unknown client', 'عميل غير معروف')}: ${r.client}`, {
              variant: 'warning'
            });
            return false;
          }
        }
        let n = Math.max(
          0,
          ...getSeed('requests').map(r => Number((r.id || '').split('-').pop()) || 0)
        );
        saveImportedRows(
          'requests',
          rows.map(r => {
            n += 1;
            return {
              id: `REQ-2026-${String(n).padStart(3, '0')}`,
              client: r.client,
              site: r.site || '',
              prof: r.prof,
              qty: Number(r.qty) || 1,
              filled: 0,
              rate: Number(r.rate) || 0,
              start: r.start || '',
              durMo: Number(r.durMo) || 12,
              status: 'sourcing'
            };
          })
        );
        renderAll();
        return rows.length;
      }
    })
  );
  document.getElementById('rq-export')?.addEventListener('click', () => {
    exportData(
      'xlsx',
      'requests',
      [
        { key: 'id', label: 'ID' },
        { key: 'client', label: 'Client' },
        { key: 'site', label: 'Site' },
        { key: 'prof', label: 'Profession' },
        { key: 'qty', label: 'Qty' },
        { key: 'filled', label: 'Filled' },
        { key: 'rate', label: 'Rate' },
        { key: 'status', label: 'Status' }
      ],
      getSeed('requests'),
      'Requests'
    );
  });
  window.addEventListener(LANG_EVENT, renderAll);
}
