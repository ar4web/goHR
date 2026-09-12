// HR + Operations — announcements (hr_announcements.html).
// Draft → publish → archive board with per-employee read receipts; reads
// attribute to the currently-selected demo user (hr:my-code).

import { showToast } from './toast.js';
import { showModal } from './modal.js';
import { t, currentLang, LANG_EVENT, applyI18n } from './i18n.js';
import { getSeed, patchSeedRow, saveImportedRows } from './hr-api.js';
import { exportData, exportCSV } from './import-export.js';
import { logAudit } from './hr-audit.js';

let booted = false;

const ST_CLS = { draft: 'blue', published: 'green', archived: 'yellow' };

function L(en, ar) {
  return currentLang() === 'ar' ? ar : en;
}

function me() {
  try {
    return localStorage.getItem('hr:my-code') || getSeed('employees')[0]?.code;
  } catch (_e) {
    return getSeed('employees')[0]?.code;
  }
}

function stLabel(st) {
  return (
    {
      draft: t('status.draft'),
      published: L('Published', 'منشور'),
      archived: L('Archived', 'مؤرشف')
    }[st] || st
  );
}

function expired(a) {
  return a.expires && a.expires < new Date().toISOString().slice(0, 10);
}

function nextId() {
  const year = new Date().getFullYear();
  let n = 0;
  for (const a of getSeed('announcements')) {
    const m = String(a.id).match(new RegExp(`^AN-${year}-(\\d+)$`));
    if (m) {
      n = Math.max(n, Number(m[1]));
    }
  }
  return `AN-${year}-${String(n + 1).padStart(3, '0')}`;
}

function renderAll() {
  const set = (id, v) => {
    const el = document.getElementById(id);
    if (el) {
      el.textContent = v;
    }
  };
  const list = getSeed('announcements');
  set('an-stat-pub', String(list.filter(a => a.status === 'published').length));
  set('an-stat-draft', String(list.filter(a => a.status === 'draft').length));
  set('an-stat-exp', String(list.filter(expired).length));
  const el = document.getElementById('an-list');
  if (el) {
    el.innerHTML = list
      .slice()
      .reverse()
      .map(a => {
        const mine = me();
        const read = (a.reads || []).includes(mine);
        return `<div class="hr-card" style="padding:16px">
        <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap">
          <span class="status status-${ST_CLS[a.status] || 'blue'}">${stLabel(a.status)}</span>
          <span style="font-size:12px;color:var(--text-muted)" dir="ltr">${a.date} → ${a.expires || '—'}</span>
        </div>
        <h3 style="margin:10px 0 4px;font-size:15px">${currentLang() === 'ar' ? a.titleAr || a.titleEn : a.titleEn}</h3>
        <p style="margin:0 0 8px">${currentLang() === 'ar' ? a.bodyAr || a.bodyEn : a.bodyEn}</p>
        <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap">
          <span style="font-size:12.5px;color:var(--text-muted)">${L('To', 'إلى')}: ${a.audience} · 👁 ${(a.reads || []).length}/${getSeed('employees').filter(e => e.st === 'active').length}</span>
          <div style="display:flex;gap:6px">
            ${!read ? `<button class="btn btn-outline btn-sm" data-read="${a.id}">✓ ${L('Read', 'قرأت')}</button>` : ''}
            ${a.status === 'draft' ? `<button class="btn btn-primary btn-sm" data-pub="${a.id}">${L('Publish', 'نشر')}</button>` : ''}
            ${a.status === 'published' ? `<button class="btn btn-outline btn-sm" data-arc="${a.id}">${L('Archive', 'أرشفة')}</button>` : ''}
            <button class="btn btn-outline btn-sm" data-edit="${a.id}">${L('Edit', 'تحرير')}</button>
          </div>
        </div>
        ${expired(a) ? `<div class="hr-note">⏳ ${L('Expired', 'منتهٍ')}</div>` : ''}
      </div>`;
      })
      .join('');
  }
  applyI18n(document.querySelector('[data-hr-announcements]') || document);
}

function openAnnModal(id) {
  const a = id ? getSeed('announcements').find(r => r.id === id) : null;
  showModal({
    title: a ? `${L('Edit', 'تحرير')} ${a.id}` : L('New announcement', 'إعلان جديد'),
    body: `<div class="hr-form-2col">
        <div class="form-group"><label class="form-label" for="nn-te">${L('Title (EN)', 'العنوان (EN)')}</label>
          <input class="form-control" id="nn-te" value="${a?.titleEn || ''}"></div>
        <div class="form-group"><label class="form-label" for="nn-ta">${L('Title (AR)', 'العنوان (AR)')}</label>
          <input class="form-control" id="nn-ta" value="${a?.titleAr || ''}"></div>
        <div class="form-group" style="grid-column:1/-1"><label class="form-label" for="nn-be">${L('Body (EN)', 'النص (EN)')}</label>
          <textarea class="form-control" id="nn-be" rows="2">${a?.bodyEn || ''}</textarea></div>
        <div class="form-group" style="grid-column:1/-1"><label class="form-label" for="nn-ba">${L('Body (AR)', 'النص (AR)')}</label>
          <textarea class="form-control" id="nn-ba" rows="2">${a?.bodyAr || ''}</textarea></div>
        <div class="form-group"><label class="form-label" for="nn-aud">${L('Audience', 'الجمهور')}</label>
          <input class="form-control" id="nn-aud" value="${a?.audience || 'all'}" dir="ltr"></div>
        <div class="form-group"><label class="form-label" for="nn-exp">${L('Expires', 'ينتهي')}</label>
          <input class="form-control" id="nn-exp" type="date" value="${a?.expires || ''}" dir="ltr"></div>
      </div>`,
    actions: [
      { label: t('common.cancel'), variant: 'ghost' },
      {
        label: t('common.save'),
        variant: 'primary',
        action: ({ body }) => {
          const v = sel => body.querySelector(sel).value;
          if (!v('#nn-te').trim()) {
            showToast(L('Enter a title', 'أدخل العنوان'), { variant: 'warning' });
            return false;
          }
          const row = {
            titleEn: v('#nn-te').trim(),
            titleAr: v('#nn-ta').trim(),
            bodyEn: v('#nn-be').trim(),
            bodyAr: v('#nn-ba').trim(),
            audience: v('#nn-aud').trim() || 'all',
            expires: v('#nn-exp')
          };
          if (a) {
            patchSeedRow('announcements', a, row);
            logAudit('announcement.update', a.id, row.titleEn);
          } else {
            const id2 = nextId();
            const today = new Date().toISOString().slice(0, 10);
            saveImportedRows('announcements', [
              { id: id2, status: 'draft', date: today, reads: [], ...row }
            ]);
            logAudit('announcement.create', id2, row.titleEn);
          }
          renderAll();
          showToast(L('Announcement saved', 'حُفظ الإعلان'), { variant: 'success' });
          return true;
        }
      }
    ]
  });
}

export function initAnnouncements() {
  const root = document.querySelector('[data-hr-announcements]');
  if (!root) {
    return;
  }
  renderAll();
  if (booted) {
    return;
  }
  booted = true;
  document.getElementById('an-new')?.addEventListener('click', () => openAnnModal(null));
  document.getElementById('an-list')?.addEventListener('click', e => {
    const rd = e.target.closest('[data-read]');
    const pb = e.target.closest('[data-pub]');
    const ar2 = e.target.closest('[data-arc]');
    const ed = e.target.closest('[data-edit]');
    if (ed) {
      openAnnModal(ed.dataset.edit);
      return;
    }
    const id = (rd || pb || ar2)?.dataset.read || (pb || ar2)?.dataset.pub || ar2?.dataset.arc;
    const a = getSeed('announcements').find(r => r.id === id);
    if (!a) {
      return;
    }
    if (rd) {
      patchSeedRow('announcements', a, { reads: [...(a.reads || []), me()] });
    } else if (pb) {
      patchSeedRow('announcements', a, { status: 'published' });
      logAudit('announcement.publish', a.id, a.titleEn);
    } else if (ar2) {
      patchSeedRow('announcements', a, { status: 'archived' });
      logAudit('announcement.archive', a.id, a.titleEn);
    }
    renderAll();
  });
  const cols = [
    { key: 'id', label: 'Announcement' },
    { key: 'titleEn', label: 'Title' },
    { key: 'audience', label: 'Audience' },
    { key: 'date', label: 'Date' },
    { key: 'expires', label: 'Expires' },
    { key: 'status', label: 'Status' }
  ];
  document.getElementById('an-export-xlsx')?.addEventListener('click', () => {
    exportData('xlsx', 'announcements', cols, getSeed('announcements'), 'Announcements');
  });
  document.getElementById('an-export-csv')?.addEventListener('click', () => {
    exportCSV('announcements.csv', cols, getSeed('announcements'));
  });
  window.addEventListener(LANG_EVENT, renderAll);
}
