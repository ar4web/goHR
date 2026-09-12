// HR + Operations — clients register (hr_clients.html).
// Profiles + Nitaqat/WPS standing + deployment counts. Idempotent.

import { showToast } from './toast.js';
import { showModal } from './modal.js';
import { t, currentLang, LANG_EVENT, applyI18n } from './i18n.js';
import { fmtSAR } from './hr-locale.js';
import { getSeed, patchSeedRow, saveImportedRows } from './hr-api.js';
import { exportData } from './import-export.js';
import { openImportModal } from './import-modal.js';

let booted = false;

function L(en, ar) {
  return currentLang() === 'ar' ? ar : en;
}

const NITAQAT = ['High Green', 'Mid Green', 'Low Green', 'Yellow', 'Red'];

function cname(c) {
  return currentLang() === 'ar' ? c.nameAr || c.nameEn : c.nameEn;
}

function deployedOf(clientId) {
  return getSeed('assignments').filter(a => a.client === clientId && a.status === 'active');
}

function openReqsOf(clientId) {
  return getSeed('requests').filter(
    r => r.client === clientId && !['fulfilled', 'cancelled'].includes(r.status)
  );
}

function sitesOf(clientId) {
  return getSeed('sites').filter(s => s.client === clientId);
}

function nitaqatCls(v) {
  if (v === 'Red') {
    return 'red';
  }
  if (v === 'Yellow') {
    return 'yellow';
  }
  return 'green';
}

function renderStats() {
  const clients = getSeed('clients');
  const set = (id, v) => {
    const el = document.getElementById(id);
    if (el) {
      el.textContent = v;
    }
  };
  set('cl-stat-count', clients.length);
  set('cl-stat-deployed', getSeed('assignments').filter(a => a.status === 'active').length);
  set(
    'cl-stat-open',
    getSeed('requests').filter(r => !['fulfilled', 'cancelled'].includes(r.status)).length
  );
  const run = getSeed('assignments')
    .filter(a => a.status === 'active')
    .reduce((s, a) => s + (a.rate || 0), 0);
  set('cl-stat-runrate', fmtSAR(run));
}

function renderRows() {
  const el = document.getElementById('cl-rows');
  if (!el) {
    return;
  }
  el.innerHTML = getSeed('clients')
    .map(c => {
      const sites = sitesOf(c.id);
      const dep = deployedOf(c.id).length;
      const open = openReqsOf(c.id).length;
      return `<tr>
      <td data-label="${L('Client', 'العميل')}"><strong>${cname(c)}</strong>
        <div style="font-size:11.5px;color:var(--text-muted)" dir="ltr">${c.id} · CR ${c.cr || '—'}</div></td>
      <td data-label="${L('City', 'المدينة')}">${c.city || '—'}</td>
      <td data-label="Nitaqat"><span class="status status-${nitaqatCls(c.nitaqat)}">${c.nitaqat || '—'}</span></td>
      <td data-label="WPS"><span class="status status-${c.wpsOk === false ? 'red' : 'green'}">${c.wpsOk === false ? L('Fail', 'متعثر') : L('OK', 'سليم')}</span></td>
      <td data-label="${L('Sites', 'المواقع')}" dir="ltr">${sites.length}</td>
      <td data-label="${L('Deployed', 'المُسند')}" dir="ltr">${dep}</td>
      <td data-label="${L('Open reqs', 'طلبات مفتوحة')}" dir="ltr">${open}</td>
      <td data-label="${L('Billing day', 'يوم الفوترة')}" dir="ltr">${c.billingDay || '—'}</td>
      <td data-label=""><button class="btn btn-outline btn-sm" data-edit="${c.id}">${t('common.edit')}</button></td>
    </tr>`;
    })
    .join('');
}

function renderAll() {
  renderStats();
  renderRows();
  applyI18n(document.querySelector('[data-hr-clients]') || document);
}

function nextClientId() {
  const n = getSeed('clients').length + 1;
  return `CL-${String(n).padStart(3, '0')}`;
}

function openClientModal(id) {
  const c = id ? getSeed('clients').find(x => x.id === id) : null;
  const d = c || {
    nameEn: '',
    nameAr: '',
    cr: '',
    contactEn: '',
    phone: '',
    email: '',
    city: 'Riyadh',
    nitaqat: 'Mid Green',
    wpsOk: true,
    billingDay: 5
  };
  showModal({
    title: c ? `${t('common.edit')} · ${c.id}` : L('New client', 'عميل جديد'),
    body: `<div class="hr-form-2col">
        <div class="form-group"><label class="form-label" for="cc-en">${L('Name (EN)', 'الاسم (إنجليزي)')}</label>
          <input class="form-control" id="cc-en" value="${d.nameEn}" dir="ltr"></div>
        <div class="form-group"><label class="form-label" for="cc-ar">${L('Name (AR)', 'الاسم (عربي)')}</label>
          <input class="form-control" id="cc-ar" value="${d.nameAr || ''}"></div>
      </div>
      <div class="hr-form-2col">
        <div class="form-group"><label class="form-label" for="cc-cr">CR</label>
          <input class="form-control" id="cc-cr" value="${d.cr || ''}" dir="ltr"></div>
        <div class="form-group"><label class="form-label" for="cc-city">${L('City', 'المدينة')}</label>
          <input class="form-control" id="cc-city" value="${d.city || ''}"></div>
      </div>
      <div class="hr-form-2col">
        <div class="form-group"><label class="form-label" for="cc-contact">${L('Contact', 'جهة الاتصال')}</label>
          <input class="form-control" id="cc-contact" value="${d.contactEn || ''}"></div>
        <div class="form-group"><label class="form-label" for="cc-phone">${L('Phone', 'الهاتف')}</label>
          <input class="form-control" id="cc-phone" value="${d.phone || ''}" dir="ltr"></div>
      </div>
      <div class="hr-form-2col">
        <div class="form-group"><label class="form-label" for="cc-nit">Nitaqat</label>
          <select class="form-control" id="cc-nit">${NITAQAT.map(v => `<option${d.nitaqat === v ? ' selected' : ''}>${v}</option>`).join('')}</select></div>
        <div class="form-group"><label class="form-label" for="cc-bill">${L('Billing day', 'يوم الفوترة')}</label>
          <input class="form-control" id="cc-bill" type="number" min="1" max="28" value="${d.billingDay || 5}" dir="ltr"></div>
      </div>
      <label class="ob-check"><input type="checkbox" id="cc-wps"${d.wpsOk !== false ? ' checked' : ''}> ${L('WPS compliant', 'ملتزم بحماية الأجور')}</label>`,
    actions: [
      { label: t('common.cancel'), variant: 'ghost' },
      {
        label: t('common.save'),
        variant: 'primary',
        action: ({ body }) => {
          const nameEn = body.querySelector('#cc-en').value.trim();
          if (!nameEn) {
            showToast(L('Name is required', 'الاسم مطلوب'), { variant: 'warning' });
            return false;
          }
          const patch = {
            nameEn,
            nameAr: body.querySelector('#cc-ar').value.trim(),
            cr: body.querySelector('#cc-cr').value.trim(),
            contactEn: body.querySelector('#cc-contact').value.trim(),
            phone: body.querySelector('#cc-phone').value.trim(),
            city: body.querySelector('#cc-city').value.trim(),
            nitaqat: body.querySelector('#cc-nit').value,
            wpsOk: body.querySelector('#cc-wps').checked,
            billingDay: Number(body.querySelector('#cc-bill').value) || 5
          };
          if (c) {
            patchSeedRow('clients', c, patch);
          } else {
            saveImportedRows('clients', [{ id: nextClientId(), email: '', av: 'blue', ...patch }]);
          }
          renderAll();
          showToast(L('Client saved', 'تم حفظ العميل'), { variant: 'success' });
          return true;
        }
      }
    ]
  });
}

const CL_SCHEMA = [
  { key: 'nameEn', en: 'Name (EN)', ar: 'الاسم (إنجليزي)', required: true },
  { key: 'nameAr', en: 'Name (AR)', ar: 'الاسم (عربي)' },
  { key: 'cr', en: 'CR no.', ar: 'السجل التجاري' },
  { key: 'contactEn', en: 'Contact', ar: 'جهة الاتصال' },
  { key: 'phone', en: 'Phone', ar: 'الهاتف' },
  { key: 'email', en: 'Email', ar: 'البريد' },
  { key: 'city', en: 'City', ar: 'المدينة' },
  { key: 'nitaqat', en: 'Nitaqat band', ar: 'نطاق نطاقات' },
  { key: 'wpsOk', en: 'WPS ok (yes/no)', ar: 'حماية الأجور' },
  { key: 'billingDay', en: 'Billing day', ar: 'يوم الفوترة', type: 'number' }
];

export function initClients() {
  const root = document.querySelector('[data-hr-clients]');
  if (!root) {
    return;
  }
  renderAll();
  if (booted) {
    return;
  }
  booted = true;
  document.getElementById('cl-new')?.addEventListener('click', () => openClientModal());
  document.getElementById('cl-rows')?.addEventListener('click', e => {
    const btn = e.target.closest('[data-edit]');
    if (btn) {
      openClientModal(btn.dataset.edit);
    }
  });
  document.getElementById('cl-import')?.addEventListener('click', () =>
    openImportModal({
      titleEn: 'Import clients (Excel / CSV)',
      titleAr: 'استيراد العملاء (Excel / CSV)',
      filename: 'clients',
      schema: CL_SCHEMA,
      example: {
        nameEn: 'New Client Co.',
        nameAr: 'شركة عميل جديد',
        cr: '1010999888',
        contactEn: 'Eng. Test',
        phone: '+966555000000',
        email: '',
        city: 'Riyadh',
        nitaqat: 'Mid Green',
        wpsOk: 'yes',
        billingDay: '5'
      },
      onImport: rows => {
        let n = getSeed('clients').length;
        saveImportedRows(
          'clients',
          rows.map(r => {
            n += 1;
            return {
              id: `CL-${String(n).padStart(3, '0')}`,
              nameEn: r.nameEn,
              nameAr: r.nameAr || '',
              cr: r.cr || '',
              contactEn: r.contactEn || '',
              phone: r.phone || '',
              email: r.email || '',
              city: r.city || '',
              nitaqat: NITAQAT.includes(r.nitaqat) ? r.nitaqat : 'Mid Green',
              wpsOk: !/^(0|n|no|false)$/i.test((r.wpsOk || 'yes').trim()),
              billingDay: Number(r.billingDay) || 5,
              av: 'blue'
            };
          })
        );
        renderAll();
        return rows.length;
      }
    })
  );
  document.getElementById('cl-export')?.addEventListener('click', () => {
    exportData(
      'xlsx',
      'clients',
      [
        { key: 'id', label: 'ID' },
        { key: 'nameEn', label: 'Name (EN)' },
        { key: 'nameAr', label: 'Name (AR)' },
        { key: 'cr', label: 'CR' },
        { key: 'city', label: 'City' },
        { key: 'nitaqat', label: 'Nitaqat' },
        { key: 'billingDay', label: 'Billing day' }
      ],
      getSeed('clients'),
      'Clients'
    );
  });
  window.addEventListener(LANG_EVENT, renderAll);
}
