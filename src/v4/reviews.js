// HR + Operations — review cycles (hr_reviews.html).
// Cycle: draft → self → manager → calibrated → published → acked.
// Ratings live on the detail page; published reviews are immutable.

import { showToast } from './toast.js';
import { showModal } from './modal.js';
import { t, currentLang, LANG_EVENT, applyI18n } from './i18n.js';
import { getSeed, saveImportedRows } from './hr-api.js';
import { exportData, exportCSV } from './import-export.js';
import { logAudit } from './hr-audit.js';

let booted = false;

export const REVIEW_FLOW = ['draft', 'self', 'manager', 'calibrated', 'published', 'acked'];

export function reviewLabel(st) {
  const map = {
    draft: t('status.draft'),
    self: currentLang() === 'ar' ? 'التقييم الذاتي' : 'Self review',
    manager: currentLang() === 'ar' ? 'تقييم المدير' : 'Manager review',
    calibrated: currentLang() === 'ar' ? 'معايَرة' : 'Calibrated',
    published: currentLang() === 'ar' ? 'منشور' : 'Published',
    acked: currentLang() === 'ar' ? 'مُقرّ' : 'Acknowledged'
  };
  return map[st] || st;
}

const ST_CLS = {
  draft: 'blue',
  self: 'yellow',
  manager: 'purple',
  calibrated: 'yellow',
  published: 'green',
  acked: 'green'
};

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

function nextId() {
  const year = new Date().getFullYear();
  let n = 0;
  for (const r of getSeed('reviews')) {
    const m = String(r.id).match(new RegExp(`^RV-${year}-(\\d+)$`));
    if (m) {
      n = Math.max(n, Number(m[1]));
    }
  }
  return `RV-${year}-${String(n + 1).padStart(3, '0')}`;
}

function renderAll() {
  const set = (id, v) => {
    const el = document.getElementById(id);
    if (el) {
      el.textContent = v;
    }
  };
  const list = getSeed('reviews');
  set(
    'rv-stat-cycle',
    String(list.filter(r => ['draft', 'self', 'manager', 'calibrated'].includes(r.status)).length)
  );
  set('rv-stat-pub', String(list.filter(r => ['published', 'acked'].includes(r.status)).length));
  const finals = list.filter(r => r.finalRating > 0);
  set(
    'rv-stat-avg',
    finals.length ? (finals.reduce((s, r) => s + r.finalRating, 0) / finals.length).toFixed(1) : '—'
  );
  set('rv-stat-ack', String(list.filter(r => r.status === 'acked').length));
  const el = document.getElementById('rv-rows');
  if (el) {
    el.innerHTML = list
      .map(r => {
        const rate = v => (v > 0 ? `${v}/5` : '—');
        return `<tr>
      <td data-label="#"><strong dir="ltr">${r.id}</strong></td>
      <td data-label="${L('Employee', 'الموظف')}">${empName(r.emp)}</td>
      <td data-label="${L('Cycle', 'الدورة')}" dir="ltr">${r.cycle}</td>
      <td data-label="${L('Self', 'الذاتي')}" dir="ltr">${rate(r.selfRating)}</td>
      <td data-label="${L('Manager', 'المدير')}" dir="ltr">${rate(r.mgrRating)}</td>
      <td data-label="${L('Final', 'النهائي')}" dir="ltr"><strong>${rate(r.finalRating)}</strong></td>
      <td data-label="${t('common.status')}"><span class="status status-${ST_CLS[r.status] || 'blue'}">${reviewLabel(r.status)}</span></td>
      <td data-label=""><a class="btn btn-outline btn-sm" href="hr_review.html?id=${r.id}">${L('Open', 'فتح')}</a></td>
    </tr>`;
      })
      .join('');
  }
  applyI18n(document.querySelector('[data-hr-reviews]') || document);
}

function openReviewModal() {
  const emps = getSeed('employees');
  const cycles = [...new Set(getSeed('reviews').map(r => r.cycle))];
  cycles.push('2026-H2', '2027-H1');
  const uniq = [...new Set(cycles)];
  showModal({
    title: L('New review', 'تقييم جديد'),
    body: `<div class="hr-form-2col">
        <div class="form-group"><label class="form-label" for="nr-emp">${L('Employee', 'الموظف')}</label>
          <select class="form-control" id="nr-emp">${emps.map(e => `<option value="${e.code}">${e.code} — ${empName(e.code)}</option>`).join('')}</select></div>
        <div class="form-group"><label class="form-label" for="nr-cycle">${L('Cycle', 'الدورة')}</label>
          <select class="form-control" id="nr-cycle">${uniq.map(c => `<option${c === '2026-H2' ? ' selected' : ''}>${c}</option>`).join('')}</select></div>
      </div>`,
    actions: [
      { label: t('common.cancel'), variant: 'ghost' },
      {
        label: t('common.save'),
        variant: 'primary',
        action: ({ body }) => {
          const emp = body.querySelector('#nr-emp').value;
          const cycle = body.querySelector('#nr-cycle').value;
          if (getSeed('reviews').some(r => r.emp === emp && r.cycle === cycle)) {
            showToast(L('Review already exists for this cycle', 'يوجد تقييم لهذه الدورة'), {
              variant: 'warning'
            });
            return false;
          }
          const id = nextId();
          saveImportedRows('reviews', [
            {
              id,
              emp,
              cycle,
              status: 'draft',
              selfRating: 0,
              selfNotes: '',
              mgrRating: 0,
              mgrNotes: '',
              finalRating: 0,
              publishedAt: '',
              ackedAt: ''
            }
          ]);
          logAudit('review.create', id, `${emp} ${cycle}`);
          renderAll();
          showToast(L('Review created', 'أُنشئ التقييم'), { variant: 'success' });
          return true;
        }
      }
    ]
  });
}

export function initReviews() {
  const root = document.querySelector('[data-hr-reviews]');
  if (!root) {
    return;
  }
  renderAll();
  if (booted) {
    return;
  }
  booted = true;
  document.getElementById('rv-new')?.addEventListener('click', openReviewModal);
  const cols = [
    { key: 'id', label: 'Review' },
    { key: 'emp', label: 'Employee' },
    { key: 'cycle', label: 'Cycle' },
    { key: 'status', label: 'Status' },
    { key: 'selfRating', label: 'Self' },
    { key: 'mgrRating', label: 'Manager' },
    { key: 'finalRating', label: 'Final' }
  ];
  document.getElementById('rv-export-xlsx')?.addEventListener('click', () => {
    exportData('xlsx', 'reviews', cols, getSeed('reviews'), 'Reviews');
  });
  document.getElementById('rv-export-csv')?.addEventListener('click', () => {
    exportCSV('reviews.csv', cols, getSeed('reviews'));
  });
  window.addEventListener(LANG_EVENT, renderAll);
}
