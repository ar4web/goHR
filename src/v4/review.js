// HR + Operations — review detail (hr_review.html).
// One screen per cycle stage: self → manager → calibrate → publish → ack.
// Published/acked reviews are immutable; every transition is audit-logged.

import { showToast } from './toast.js';
import { t, currentLang, LANG_EVENT, applyI18n } from './i18n.js';
import { getSeed, patchSeedRow } from './hr-api.js';
import { REVIEW_FLOW, reviewLabel } from './reviews.js';
import { logAudit } from './hr-audit.js';

let booted = false;

function L(en, ar) {
  return currentLang() === 'ar' ? ar : en;
}

function cur() {
  const id = new URLSearchParams(location.search).get('id');
  return getSeed('reviews').find(r => r.id === id);
}

function empName(code) {
  const e = getSeed('employees').find(x => x.code === code);
  if (!e) {
    return code;
  }
  return currentLang() === 'ar' ? e.nameAr || e.nameEn : e.nameEn;
}

function locked(r) {
  return ['published', 'acked'].includes(r.status);
}

function rateSelect(id, val, dis) {
  return `<select class="form-control" id="${id}" dir="ltr"${dis ? ' disabled' : ''}>
    ${[0, 1, 2, 3, 4, 5].map(v => `<option value="${v}"${val === v ? ' selected' : ''}>${v === 0 ? '—' : `${v}/5`}</option>`).join('')}</select>`;
}

function flowBtn(r) {
  const map = {
    draft: ['rw-release', L('Release to self', 'إتاحة للذاتي')],
    self: ['rw-to-mgr', L('Submit to manager', 'إرسال للمدير')],
    manager: ['rw-to-cal', L('Send to calibration', 'إرسال للمعايرة')],
    calibrated: ['rw-publish', L('Publish (locks)', 'نشر (يُقفل)')],
    published: ['rw-ack', L('Acknowledge', 'إقرار بالاستلام')]
  };
  return map[r.status] || null;
}

function render() {
  const r = cur();
  const root = document.querySelector('[data-hr-review]');
  if (!root) {
    return;
  }
  if (!r) {
    root.innerHTML = `<div class="hr-empty">${L('Review not found', 'التقييم غير موجود')}</div>`;
    return;
  }
  const set = (id, v) => {
    const el = document.getElementById(id);
    if (el) {
      el.innerHTML = v;
    }
  };
  set('rw-title', `${r.id} · ${empName(r.emp)} · <span dir="ltr">${r.cycle}</span>`);
  const idx = REVIEW_FLOW.indexOf(r.status);
  set(
    'rw-flow',
    REVIEW_FLOW.map(
      (s, i) =>
        `<span class="status status-${i < idx ? 'green' : i === idx ? 'yellow' : 'blue'}">${reviewLabel(s)}</span>`
    ).join(' → ')
  );
  const dis = locked(r);
  set(
    'rw-self',
    `<div class="hr-form-2col">
      <div class="form-group"><label class="form-label" for="rw-self-r">${L('Self rating', 'التقييم الذاتي')}</label>${rateSelect('rw-self-r', r.selfRating, dis || r.status !== 'self')}</div>
    </div>
    <div class="form-group"><label class="form-label" for="rw-self-n">${L('Self notes', 'ملاحظات ذاتية')}</label>
      <textarea class="form-control" id="rw-self-n" rows="2"${dis || r.status !== 'self' ? ' disabled' : ''}>${r.selfNotes || ''}</textarea></div>`
  );
  set(
    'rw-mgr',
    `<div class="hr-form-2col">
      <div class="form-group"><label class="form-label" for="rw-mgr-r">${L('Manager rating', 'تقييم المدير')}</label>${rateSelect('rw-mgr-r', r.mgrRating, dis || r.status !== 'manager')}</div>
    </div>
    <div class="form-group"><label class="form-label" for="rw-mgr-n">${L('Manager notes', 'ملاحظات المدير')}</label>
      <textarea class="form-control" id="rw-mgr-n" rows="2"${dis || r.status !== 'manager' ? ' disabled' : ''}>${r.mgrNotes || ''}</textarea></div>`
  );
  set(
    'rw-cal',
    `<div class="form-group"><label class="form-label" for="rw-final-r">${L('Final rating', 'التقييم النهائي')}</label>
      ${rateSelect('rw-final-r', r.finalRating, dis || r.status !== 'calibrated')}</div>
    ${r.publishedAt ? `<div class="hr-note">📌 ${L('Published', 'نُشر')} <span dir="ltr">${r.publishedAt}</span>${r.ackedAt ? ` · ${L('Acked', 'أُقر')} <span dir="ltr">${r.ackedAt}</span>` : ''}</div>` : ''}
    ${dis ? `<div class="hr-note">🔒 ${L('Immutable once published.', 'غير قابل للتعديل بعد النشر.')}</div>` : ''}`
  );
  const bar = document.getElementById('rw-actions');
  if (bar) {
    const fb = flowBtn(r);
    bar.innerHTML = `${dis || r.status === 'acked' ? '' : `<button class="btn btn-outline" id="rw-save">${t('common.save')}</button>`}${
      fb ? `<button class="btn btn-primary" id="${fb[0]}">${fb[1]}</button>` : ''
    }`;
  }
  applyI18n(root);
}

function collect() {
  const q = (box, sel) => document.getElementById(box)?.querySelector(sel);
  return {
    selfRating: Number(q('rw-self', '#rw-self-r')?.value) || 0,
    selfNotes: q('rw-self', '#rw-self-n')?.value.trim() || '',
    mgrRating: Number(q('rw-mgr', '#rw-mgr-r')?.value) || 0,
    mgrNotes: q('rw-mgr', '#rw-mgr-n')?.value.trim() || '',
    finalRating: Number(q('rw-cal', '#rw-final-r')?.value) || 0
  };
}

export function initReview() {
  const root = document.querySelector('[data-hr-review]');
  if (!root) {
    return;
  }
  render();
  if (booted) {
    return;
  }
  booted = true;
  document.getElementById('rw-actions')?.addEventListener('click', e => {
    const r = cur();
    if (!r || locked(r)) {
      return;
    }
    const id = e.target.closest('button')?.id;
    if (!id) {
      return;
    }
    const c = collect();
    if (id === 'rw-save') {
      patchSeedRow('reviews', r, c);
      render();
      showToast(L('Saved', 'حُفظ'), { variant: 'success' });
      return;
    }
    const need = (ok, msg) => {
      if (!ok) {
        showToast(msg, { variant: 'warning' });
        return false;
      }
      return true;
    };
    if (id === 'rw-release' && r.status === 'draft') {
      patchSeedRow('reviews', r, { ...c, status: 'self' });
      logAudit('review.release', r.id, 'draft → self');
    } else if (id === 'rw-to-mgr' && r.status === 'self') {
      if (!need(c.selfRating > 0, L('Self rating required', 'التقييم الذاتي مطلوب'))) {
        return;
      }
      patchSeedRow('reviews', r, { ...c, status: 'manager' });
      logAudit('review.submit', r.id, 'self → manager');
    } else if (id === 'rw-to-cal' && r.status === 'manager') {
      if (!need(c.mgrRating > 0, L('Manager rating required', 'تقييم المدير مطلوب'))) {
        return;
      }
      patchSeedRow('reviews', r, { ...c, status: 'calibrated' });
      logAudit('review.calibrate', r.id, 'manager → calibrated');
    } else if (id === 'rw-publish' && r.status === 'calibrated') {
      if (!need(c.finalRating > 0, L('Final rating required', 'التقييم النهائي مطلوب'))) {
        return;
      }
      patchSeedRow('reviews', r, {
        ...c,
        status: 'published',
        publishedAt: new Date().toISOString().slice(0, 10)
      });
      logAudit('review.publish', r.id, `final ${c.finalRating}/5`);
    } else if (id === 'rw-ack' && r.status === 'published') {
      patchSeedRow('reviews', r, {
        status: 'acked',
        ackedAt: new Date().toISOString().slice(0, 10)
      });
      logAudit('review.ack', r.id, 'published → acked');
    } else {
      return;
    }
    render();
    showToast(L('Review advanced', 'تقدّم التقييم'), { variant: 'success' });
  });
  window.addEventListener(LANG_EVENT, render);
}
