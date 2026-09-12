// HR + Operations — 360 feedback wall (hr_feedback.html).
// Praise / coaching / shoutout cards by kind; sender defaults to the
// currently-selected demo user (hr:my-code).

import { showToast } from './toast.js';
import { showModal } from './modal.js';
import { t, currentLang, LANG_EVENT, applyI18n } from './i18n.js';
import { getSeed, saveImportedRows } from './hr-api.js';
import { exportData, exportCSV } from './import-export.js';
import { logAudit } from './hr-audit.js';

let booted = false;
let kindFilter = '';

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

function me() {
  try {
    return localStorage.getItem('hr:my-code') || getSeed('employees')[0]?.code;
  } catch (_e) {
    return getSeed('employees')[0]?.code;
  }
}

const KIND_CLS = { praise: 'green', coaching: 'yellow', shoutout: 'purple' };
const KIND_ICON = { praise: '💐', coaching: '🌱', shoutout: '📣' };

function kindLabel(k) {
  return (
    {
      praise: L('Praise', 'ثناء'),
      coaching: L('Coaching', 'توجيه'),
      shoutout: L('Shoutout', 'إشادة')
    }[k] || k
  );
}

function nextId() {
  const year = new Date().getFullYear();
  let n = 0;
  for (const f of getSeed('feedback')) {
    const m = String(f.id).match(new RegExp(`^FB-${year}-(\\d+)$`));
    if (m) {
      n = Math.max(n, Number(m[1]));
    }
  }
  return `FB-${year}-${String(n + 1).padStart(3, '0')}`;
}

function renderAll() {
  const set = (id, v) => {
    const el = document.getElementById(id);
    if (el) {
      el.textContent = v;
    }
  };
  const list = getSeed('feedback');
  set('fb-stat-total', String(list.length));
  set('fb-stat-praise', String(list.filter(f => f.kind === 'praise').length));
  set('fb-stat-coach', String(list.filter(f => f.kind === 'coaching').length));
  set('fb-stat-shout', String(list.filter(f => f.kind === 'shoutout').length));
  const el = document.getElementById('fb-wall');
  if (el) {
    const rows = (kindFilter ? list.filter(f => f.kind === kindFilter) : list).slice().reverse();
    el.innerHTML = rows.length
      ? rows
          .map(
            f => `<div class="hr-card" style="padding:16px">
        <div style="display:flex;justify-content:space-between;align-items:center;gap:8px">
          <span class="status status-${KIND_CLS[f.kind] || 'blue'}">${KIND_ICON[f.kind] || '💬'} ${kindLabel(f.kind)}</span>
          <span style="font-size:12px;color:var(--text-muted)" dir="ltr">${f.date}</span>
        </div>
        <h3 style="margin:10px 0 4px;font-size:15px">${empName(f.to)} <span style="color:var(--text-muted);font-weight:400">← ${empName(f.from)}</span></h3>
        <p style="margin:0">${currentLang() === 'ar' ? f.textAr || f.textEn : f.textEn}</p>
      </div>`
          )
          .join('')
      : `<div class="hr-empty">${L('No feedback yet', 'لا ملاحظات بعد')}</div>`;
  }
  applyI18n(document.querySelector('[data-hr-feedback]') || document);
}

function openFeedbackModal() {
  const emps = getSeed('employees');
  const mine = me();
  showModal({
    title: L('Give feedback', 'إبداء ملاحظة'),
    body: `<div class="hr-form-2col">
        <div class="form-group"><label class="form-label" for="nf-from">${L('From', 'من')}</label>
          <select class="form-control" id="nf-from">${emps.map(e => `<option value="${e.code}"${mine === e.code ? ' selected' : ''}>${e.code} — ${empName(e.code)}</option>`).join('')}</select></div>
        <div class="form-group"><label class="form-label" for="nf-to">${L('To', 'إلى')}</label>
          <select class="form-control" id="nf-to">${emps.map(e => `<option value="${e.code}">${e.code} — ${empName(e.code)}</option>`).join('')}</select></div>
        <div class="form-group"><label class="form-label" for="nf-kind">${L('Kind', 'النوع')}</label>
          <select class="form-control" id="nf-kind">${['praise', 'coaching', 'shoutout'].map(k => `<option value="${k}">${kindLabel(k)}</option>`).join('')}</select></div>
        <div class="form-group"><label class="form-label" for="nf-te">${L('Message (EN)', 'الرسالة (EN)')}</label>
          <input class="form-control" id="nf-te"></div>
        <div class="form-group" style="grid-column:1/-1"><label class="form-label" for="nf-ta">${L('Message (AR)', 'الرسالة (AR)')}</label>
          <input class="form-control" id="nf-ta"></div>
      </div>`,
    actions: [
      { label: t('common.cancel'), variant: 'ghost' },
      {
        label: L('Post', 'نشر'),
        variant: 'primary',
        action: ({ body }) => {
          const v = sel => body.querySelector(sel).value;
          if (v('#nf-from') === v('#nf-to')) {
            showToast(L('Cannot give feedback to yourself', 'لا يمكن إبداء ملاحظة لنفسك'), {
              variant: 'warning'
            });
            return false;
          }
          if (!v('#nf-te').trim() && !v('#nf-ta').trim()) {
            showToast(L('Write a message', 'اكتب رسالة'), { variant: 'warning' });
            return false;
          }
          const id = nextId();
          saveImportedRows('feedback', [
            {
              id,
              from: v('#nf-from'),
              to: v('#nf-to'),
              kind: v('#nf-kind'),
              textEn: v('#nf-te').trim(),
              textAr: v('#nf-ta').trim(),
              date: new Date().toISOString().slice(0, 10)
            }
          ]);
          logAudit('feedback.create', id, `${v('#nf-from')} → ${v('#nf-to')}`);
          renderAll();
          showToast(L('Posted', 'نُشرت'), { variant: 'success' });
          return true;
        }
      }
    ]
  });
}

export function initFeedback() {
  const root = document.querySelector('[data-hr-feedback]');
  if (!root) {
    return;
  }
  renderAll();
  if (booted) {
    return;
  }
  booted = true;
  document.getElementById('fb-new')?.addEventListener('click', openFeedbackModal);
  document.querySelectorAll('[data-fb-kind]').forEach(b =>
    b.addEventListener('click', () => {
      kindFilter = b.dataset.fbKind;
      document
        .querySelectorAll('[data-fb-kind]')
        .forEach(x => x.classList.toggle('btn-primary', x === b));
      renderAll();
    })
  );
  const cols = [
    { key: 'id', label: 'Feedback' },
    { key: 'from', label: 'From' },
    { key: 'to', label: 'To' },
    { key: 'kind', label: 'Kind' },
    { key: 'textEn', label: 'Message' },
    { key: 'date', label: 'Date' }
  ];
  document.getElementById('fb-export-xlsx')?.addEventListener('click', () => {
    exportData('xlsx', 'feedback', cols, getSeed('feedback'), 'Feedback');
  });
  document.getElementById('fb-export-csv')?.addEventListener('click', () => {
    exportCSV('feedback.csv', cols, getSeed('feedback'));
  });
  window.addEventListener(LANG_EVENT, renderAll);
}
