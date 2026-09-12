// HR + Operations — document vault (hr_documents.html).
// Vault + expiries + required-doc coverage gaps. Idempotent.

import { showToast } from './toast.js';
import { showModal } from './modal.js';
import { t, currentLang, LANG_EVENT, applyI18n } from './i18n.js';
import { fmtDate } from './hr-locale.js';
import { daysUntil, expiryBand } from './hr-statutory.js';
import { getSeed, saveImportedRows } from './hr-api.js';
import { exportData } from './import-export.js';
import { openImportModal } from './import-modal.js';
import { DOC_TYPES } from './hr-seed.js';

let booted = false;
let filter = { q: '', type: '', expiring: false };

const REQUIRED = ['contract', 'iqama', 'passport', 'insurance'];

function L(en, ar) {
  return currentLang() === 'ar' ? ar : en;
}

function typeName(code) {
  const d = DOC_TYPES.find(x => x.code === code);
  if (!d) {
    return code;
  }
  return currentLang() === 'ar' ? d.ar : d.en;
}

function empName(code) {
  const e = getSeed('employees').find(x => x.code === code);
  if (!e) {
    return code;
  }
  return currentLang() === 'ar' ? e.nameAr || e.nameEn : e.nameEn;
}

function bandBadge(iso) {
  if (!iso) {
    return '<span style="color:var(--text-muted)">—</span>';
  }
  const band = expiryBand(daysUntil(iso));
  const cls = { expired: 'red', critical: 'red', urgent: 'yellow', soon: 'blue', ok: 'green' }[
    band
  ];
  return `<span class="status status-${cls}">${fmtDate(iso)}</span>`;
}

function linkedLabel(d) {
  if (d.emp) {
    return `<a href="hr_employee.html?code=${d.emp}">${empName(d.emp)}</a>`;
  }
  if (d.client) {
    const c = getSeed('clients').find(x => x.id === d.client);
    return c ? (currentLang() === 'ar' ? c.nameAr : c.nameEn) : d.client;
  }
  return '<span style="color:var(--text-muted)">—</span>';
}

function expats() {
  return getSeed('employees').filter(e => !e.saudi && e.st !== 'exited');
}

function gaps() {
  const docs = getSeed('documents');
  return expats()
    .map(e => {
      const have = new Set(docs.filter(d => d.emp === e.code).map(d => d.type));
      const missing = REQUIRED.filter(r => !have.has(r));
      return { e, missing };
    })
    .filter(g => g.missing.length);
}

function renderStats() {
  const docs = getSeed('documents');
  const exp = docs.filter(
    d => d.expires && daysUntil(d.expires) <= 90 && daysUntil(d.expires) >= 0
  ).length;
  const dead = docs.filter(d => d.expires && daysUntil(d.expires) < 0).length;
  const list = expats();
  const full = list.length - gaps().length;
  const set = (id, v) => {
    const el = document.getElementById(id);
    if (el) {
      el.textContent = v;
    }
  };
  set('doc-stat-total', docs.length);
  set('doc-stat-exp', exp);
  set('doc-stat-dead', dead);
  set('doc-stat-cover', `${full}/${list.length}`);
}

function visible() {
  const q = filter.q.trim().toLowerCase();
  return getSeed('documents').filter(
    d =>
      (!q || d.title.toLowerCase().includes(q) || (d.emp || '').toLowerCase().includes(q)) &&
      (!filter.type || d.type === filter.type) &&
      (!filter.expiring || (d.expires && daysUntil(d.expires) <= 90))
  );
}

function renderRows() {
  const el = document.getElementById('doc-rows');
  if (!el) {
    return;
  }
  el.innerHTML =
    visible()
      .map(
        d => `<tr>
      <td data-label="${L('Document', 'المستند')}"><strong>${d.title}</strong>
        <div style="font-size:11.5px;color:var(--text-muted)" dir="ltr">${d.id} · ${d.size || ''}${d.local ? ` · ${L('local', 'محلي')}` : ''}</div></td>
      <td data-label="${L('Type', 'النوع')}"><span class="status status-blue">${typeName(d.type)}</span></td>
      <td data-label="${L('Linked to', 'مرتبط بـ')}">${linkedLabel(d)}</td>
      <td data-label="${L('Uploaded', 'الرُفع')}" style="font-size:12.5px">${fmtDate(d.uploaded)}</td>
      <td data-label="${L('Expires', 'الانتهاء')}">${bandBadge(d.expires)}</td>
      <td data-label=""><button class="btn btn-outline btn-sm" data-view="${d.id}">${t('common.view')}</button></td>
    </tr>`
      )
      .join('') ||
    `<tr><td colspan="6" style="text-align:center;color:var(--text-muted);padding:24px">${t('common.noData')}</td></tr>`;
}

function renderGaps() {
  const el = document.getElementById('doc-gaps');
  if (!el) {
    return;
  }
  const rows = gaps();
  el.innerHTML = rows.length
    ? `<div class="table-responsive"><table class="table"><thead><tr>
      <th>${L('Worker', 'العامل')}</th><th>${L('Missing', 'المفقود')}</th><th></th></tr></thead><tbody>${rows
        .map(
          g => `<tr>
        <td data-label="${L('Worker', 'العامل')}"><a href="hr_employee.html?code=${g.e.code}">${empName(g.e.code)}</a></td>
        <td data-label="${L('Missing', 'المفقود')}">${g.missing.map(m => `<span class="status status-yellow">${typeName(m)}</span>`).join(' ')}</td>
        <td data-label=""><button class="btn btn-outline btn-sm" data-upload-for="${g.e.code}">${t('common.upload')}</button></td>
      </tr>`
        )
        .join('')}</tbody></table></div>`
    : `<div class="hr-empty">${L('Every expat has the full required set. 🎉', 'كل أجنبي لديه المجموعة الكاملة. 🎉')}</div>`;
}

function renderAll() {
  renderStats();
  renderRows();
  renderGaps();
  applyI18n(document.querySelector('[data-hr-documents]') || document);
}

function openViewModal(id) {
  const d = getSeed('documents').find(x => x.id === id);
  if (!d) {
    return;
  }
  showModal({
    title: d.title,
    body: `<div class="hr-kv-grid">
      <div class="hr-kv"><span>ID</span><strong dir="ltr">${d.id}</strong></div>
      <div class="hr-kv"><span>${L('Type', 'النوع')}</span><strong>${typeName(d.type)}</strong></div>
      <div class="hr-kv"><span>${L('Linked to', 'مرتبط بـ')}</span><strong>${d.emp || d.client || '—'}</strong></div>
      <div class="hr-kv"><span>${L('Uploaded', 'الرُفع')}</span><strong>${fmtDate(d.uploaded)}</strong></div>
      <div class="hr-kv"><span>${L('Expires', 'الانتهاء')}</span><strong>${d.expires ? fmtDate(d.expires) : '—'}</strong></div>
      <div class="hr-kv"><span>${L('Size', 'الحجم')}</span><strong dir="ltr">${d.size || '—'}</strong></div>
      </div>
      <p style="font-size:12px;color:var(--text-muted);margin:10px 0 0">${L('Seed mode stores metadata records. File binaries arrive with the API backend (P6 hardening).', 'وضع البيانات التجريبية يحفظ السجلات فقط. ملفات المحتوى تصل مع الواجهة الخلفية.')}</p>`,
    actions: [{ label: t('common.close'), variant: 'ghost' }]
  });
}

function nextDocId() {
  const n = getSeed('documents').length + 1;
  return `DOC-${String(n).padStart(3, '0')}`;
}

function openUploadModal(presetEmp = '') {
  const emps = getSeed('employees');
  showModal({
    title: t('common.upload'),
    body: `<div class="form-group"><label class="form-label" for="up-title">${L('Title', 'العنوان')}</label>
        <input class="form-control" id="up-title"></div>
      <div class="hr-form-2col">
        <div class="form-group"><label class="form-label" for="up-type">${L('Type', 'النوع')}</label>
          <select class="form-control" id="up-type">${DOC_TYPES.map(x => `<option value="${x.code}">${L(x.en, x.ar)}</option>`).join('')}</select></div>
        <div class="form-group"><label class="form-label" for="up-exp">${L('Expiry (optional)', 'الانتهاء (اختياري)')}</label>
          <input class="form-control" id="up-exp" type="date" dir="ltr"></div>
      </div>
      <div class="form-group"><label class="form-label" for="up-emp">${L('Link to worker (optional)', 'ربط بعامل (اختياري)')}</label>
        <select class="form-control" id="up-emp"><option value="">—</option>
        ${emps.map(e => `<option value="${e.code}"${presetEmp === e.code ? ' selected' : ''}>${e.code} · ${currentLang() === 'ar' ? e.nameAr || e.nameEn : e.nameEn}</option>`).join('')}</select></div>
      <div class="form-group" style="margin-bottom:0"><label class="form-label">${L('File', 'الملف')}</label>
        <input class="form-control" id="up-file" type="file">
        <p style="font-size:11.5px;color:var(--text-muted);margin:6px 0 0">${L('Demo: name + size are kept; content is not stored.', 'تجريبي: يُحفظ الاسم والحجم فقط؛ لا يُحفظ المحتوى.')}</p></div>`,
    actions: [
      { label: t('common.cancel'), variant: 'ghost' },
      {
        label: t('common.upload'),
        variant: 'primary',
        action: ({ body }) => {
          const title = body.querySelector('#up-title').value.trim();
          const file = body.querySelector('#up-file').files[0];
          if (!title) {
            showToast(L('Title is required', 'العنوان مطلوب'), { variant: 'warning' });
            return false;
          }
          const size = file ? `${Math.max(1, Math.round(file.size / 1024))} KB` : '—';
          saveImportedRows('documents', [
            {
              id: nextDocId(),
              type: body.querySelector('#up-type').value,
              emp: body.querySelector('#up-emp').value,
              title,
              uploaded: new Date().toISOString().slice(0, 10),
              expires: body.querySelector('#up-exp').value,
              size,
              local: true
            }
          ]);
          renderAll();
          showToast(L('Document filed', 'تمت أرشفة المستند'), { variant: 'success' });
          return true;
        }
      }
    ]
  });
}

export function initDocuments() {
  const root = document.querySelector('[data-hr-documents]');
  if (!root) {
    return;
  }
  renderAll();
  if (booted) {
    return;
  }
  booted = true;
  const typeSel = document.getElementById('doc-type');
  if (typeSel && !typeSel.options.length) {
    typeSel.innerHTML =
      `<option value="">${L('All types', 'كل الأنواع')}</option>` +
      DOC_TYPES.map(x => `<option value="${x.code}">${L(x.en, x.ar)}</option>`).join('');
  }
  document.getElementById('doc-search')?.addEventListener('input', e => {
    filter.q = e.target.value;
    renderRows();
  });
  typeSel?.addEventListener('change', e => {
    filter.type = e.target.value;
    renderRows();
  });
  document.getElementById('doc-expiring')?.addEventListener('change', e => {
    filter.expiring = e.target.checked;
    renderRows();
  });
  document.getElementById('doc-upload')?.addEventListener('click', () => openUploadModal());
  const docSchema = [
    { key: 'title', en: 'Title', ar: 'العنوان', required: true },
    { key: 'type', en: 'Type code', ar: 'رمز النوع', required: true },
    { key: 'emp', en: 'Employee code', ar: 'رقم الموظف' },
    { key: 'expires', en: 'Expiry (YYYY-MM-DD)', ar: 'الانتهاء', type: 'date' }
  ];
  document.getElementById('doc-import')?.addEventListener('click', () =>
    openImportModal({
      titleEn: 'Import vault rows (Excel / CSV)',
      titleAr: 'استيراد صفوف المستودع (Excel / CSV)',
      filename: 'documents',
      schema: docSchema,
      example: {
        title: 'Iqama copy — new hire',
        type: 'iqama',
        emp: 'EMP-0006',
        expires: '2027-03-14'
      },
      onImport: rows => {
        const today = new Date().toISOString().slice(0, 10);
        saveImportedRows(
          'documents',
          rows.map(r => ({
            id: nextDocId(),
            type: r.type,
            emp: r.emp || '',
            title: r.title,
            uploaded: today,
            expires: r.expires || '',
            size: '—',
            local: true
          }))
        );
        renderAll();
        return rows.length;
      }
    })
  );
  document.getElementById('doc-export')?.addEventListener('click', () => {
    exportData(
      'xlsx',
      'document-vault',
      [
        { key: 'id', label: 'ID' },
        { key: 'type', label: 'Type' },
        { key: 'title', label: 'Title' },
        { key: 'emp', label: 'Employee' },
        { key: 'client', label: 'Client' },
        { key: 'uploaded', label: 'Uploaded' },
        { key: 'expires', label: 'Expires' },
        { key: 'size', label: 'Size' }
      ],
      visible(),
      'Vault'
    );
  });
  document.getElementById('doc-rows')?.addEventListener('click', e => {
    const btn = e.target.closest('[data-view]');
    if (btn) {
      openViewModal(btn.dataset.view);
    }
  });
  document.getElementById('doc-gaps')?.addEventListener('click', e => {
    const btn = e.target.closest('[data-upload-for]');
    if (btn) {
      openUploadModal(btn.dataset.uploadFor);
    }
  });
  window.addEventListener(LANG_EVENT, renderAll);
}
