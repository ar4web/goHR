// HR + Operations — template library (hr_templates.html).
// Bilingual bodies with {{placeholders}}; every save is linted (balanced
// braces + known names only) and bumps the version — issued contracts keep
// their pinned version.

import { showToast } from './toast.js';
import { showModal } from './modal.js';
import { t, currentLang, LANG_EVENT, applyI18n } from './i18n.js';
import { lintTemplate, KNOWN_PLACEHOLDERS } from './hr-statutory.js';
import { getSeed, patchSeedRow } from './hr-api.js';

let booted = false;
let catFilter = 'all';

function L(en, ar) {
  return currentLang() === 'ar' ? ar : en;
}

const CATS = () => ({
  E: L('Employee contracts', 'عقود العمل'),
  A: L('Assignment docs', 'مستندات الإعارة'),
  C: L('Client agreements', 'اتفاقيات العملاء'),
  L: L('HR letters', 'خطابات الموارد')
});

function rows() {
  const list = getSeed('templates');
  return catFilter === 'all' ? list : list.filter(x => x.cat === catFilter);
}

function renderAll() {
  const set = (id, v) => {
    const el = document.getElementById(id);
    if (el) {
      el.textContent = v;
    }
  };
  const list = getSeed('templates');
  set('tp-stat-n', String(list.length));
  set('tp-stat-e', String(list.filter(x => x.cat === 'E').length));
  set('tp-stat-c', String(list.filter(x => x.cat === 'C').length));
  set('tp-stat-l', String(list.filter(x => x.cat === 'L').length));
  const el = document.getElementById('tp-rows');
  if (el) {
    el.innerHTML = rows()
      .map(x => {
        const ph = new Set([
          ...lintTemplate(x.bodyEn).placeholders,
          ...lintTemplate(x.bodyAr).placeholders
        ]).size;
        return `<tr>
      <td data-label="#"><strong dir="ltr">${x.code}</strong></td>
      <td data-label="${L('Name', 'الاسم')}">${currentLang() === 'ar' ? x.ar : x.en}</td>
      <td data-label="${L('Category', 'الفئة')}">${CATS()[x.cat]}</td>
      <td data-label="${L('Version', 'الإصدار')}" dir="ltr">v${x.version}</td>
      <td data-label="${L('Placeholders', 'المتغيرات')}" dir="ltr">${ph}</td>
      <td data-label="${L('Updated', 'حُدث')}" dir="ltr">${x.updatedAt || '—'}</td>
      <td data-label=""><div style="display:flex;gap:6px;flex-wrap:wrap">
        <button class="btn btn-outline btn-sm" data-view="${x.code}">${t('common.view')}</button>
        <button class="btn btn-outline btn-sm" data-edit="${x.code}">${L('Edit', 'تحرير')}</button>
      </div></td>
    </tr>`;
      })
      .join('');
  }
  const ref = document.getElementById('tp-ref');
  if (ref) {
    ref.innerHTML = KNOWN_PLACEHOLDERS.map(k => `<code dir="ltr">{{${k}}}</code>`).join(' ');
  }
  applyI18n(document.querySelector('[data-hr-templates]') || document);
}

function openViewModal(code) {
  const x = getSeed('templates').find(r => r.code === code);
  if (!x) {
    return;
  }
  showModal({
    title: `${x.code} · v${x.version}`,
    size: 'lg',
    body: `<div class="hr-form-2col">
      <div class="inv-doc" style="white-space:pre-line;font-size:12.5px" dir="ltr">${x.bodyEn}</div>
      <div class="inv-doc" style="white-space:pre-line;font-size:12.5px" dir="rtl">${x.bodyAr}</div>
    </div>`,
    actions: [{ label: t('common.close'), variant: 'ghost' }]
  });
}

function lintBox(en, ar) {
  const e1 = lintTemplate(en);
  const e2 = lintTemplate(ar);
  const errs = [...e1.errors.map(e => `EN: ${e}`), ...e2.errors.map(e => `AR: ${e}`)];
  if (!errs.length) {
    return { ok: true, html: `<div class="hr-note">✅ ${L('Lint clean', 'الفحص سليم')}</div>` };
  }
  return {
    ok: false,
    html: `<div class="hr-note" style="border-color:var(--danger)">⛔ ${L('Fix before saving:', 'صحح قبل الحفظ:')}<br>• ${errs.join('<br>• ')}</div>`
  };
}

function openEditModal(code) {
  const x = getSeed('templates').find(r => r.code === code);
  if (!x) {
    return;
  }
  showModal({
    title: `${L('Edit', 'تحرير')} ${x.code} (v${x.version} → v${x.version + 1})`,
    size: 'lg',
    body: `<div class="form-group"><label class="form-label" for="te-en">EN</label>
        <textarea class="form-control" id="te-en" rows="10" dir="ltr">${x.bodyEn}</textarea></div>
      <div class="form-group"><label class="form-label" for="te-ar">AR</label>
        <textarea class="form-control" id="te-ar" rows="10" dir="rtl">${x.bodyAr}</textarea></div>
      <div id="te-lint"></div>
      <div class="hr-note">ℹ️ ${L(
        'Issued contracts keep their pinned version; only new issues use the new text.',
        'العقود المصدرة تحتفظ بنسختها المثبتة؛ والنص الجديد للإصدارات الجديدة فقط.'
      )}</div>`,
    actions: [
      { label: t('common.cancel'), variant: 'ghost' },
      {
        label: t('common.save'),
        variant: 'primary',
        action: ({ body }) => {
          const en = body.querySelector('#te-en').value;
          const ar = body.querySelector('#te-ar').value;
          const chk = lintBox(en, ar);
          if (!chk.ok) {
            showToast(L('Template lint failed — not saved', 'فشل فحص القالب — لم يُحفظ'), {
              variant: 'error'
            });
            return false;
          }
          patchSeedRow('templates', x, {
            bodyEn: en,
            bodyAr: ar,
            version: x.version + 1,
            updatedAt: new Date().toISOString().slice(0, 10)
          });
          renderAll();
          showToast(L('Template saved as new version', 'حُفظ القالب كنسخة جديدة'), {
            variant: 'success'
          });
          return true;
        }
      }
    ]
  });
  const dlg = document.querySelector('.modal-backdrop:last-child') || document;
  const refresh = () => {
    const box = dlg.querySelector('#te-lint');
    if (box) {
      box.innerHTML = lintBox(
        dlg.querySelector('#te-en').value,
        dlg.querySelector('#te-ar').value
      ).html;
    }
  };
  refresh();
  dlg.querySelector('#te-en')?.addEventListener('input', refresh);
  dlg.querySelector('#te-ar')?.addEventListener('input', refresh);
}

export function initTemplates() {
  const root = document.querySelector('[data-hr-templates]');
  if (!root) {
    return;
  }
  renderAll();
  if (booted) {
    return;
  }
  booted = true;
  document.getElementById('tp-cat')?.addEventListener('change', e => {
    catFilter = e.target.value;
    renderAll();
  });
  document.getElementById('tp-rows')?.addEventListener('click', e => {
    const vw = e.target.closest('[data-view]');
    const ed = e.target.closest('[data-edit]');
    if (vw) {
      openViewModal(vw.dataset.view);
    } else if (ed) {
      openEditModal(ed.dataset.edit);
    }
  });
  window.addEventListener(LANG_EVENT, renderAll);
}
