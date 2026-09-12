// HR + Operations — contract view/print/sign (hr_contract.html).
// Renders the pinned template version with stored values; sign-state and
// filing actions mirror the registers.

import { showToast } from './toast.js';
import { showModal } from './modal.js';
import { t, currentLang, LANG_EVENT, applyI18n } from './i18n.js';
import { renderTemplate } from './hr-statutory.js';
import { getSeed, patchSeedRow } from './hr-api.js';
import { buildValues, partyLabel } from './contract-values.js';

let booted = false;

function L(en, ar) {
  return currentLang() === 'ar' ? ar : en;
}

function cur() {
  const id = new URLSearchParams(location.search).get('id');
  return getSeed('contracts').find(c => c.id === id);
}

function docHTML(c) {
  const x = getSeed('templates').find(t => t.code === c.type);
  if (!x) {
    return `<div class="hr-empty">${L('Template missing', 'القالب مفقود')}</div>`;
  }
  const v = buildValues(x, c.party, {
    ...(c.values || {}),
    ...(c.start ? { start_date: c.start } : {}),
    ...(c.end ? { end_date: c.end } : {})
  });
  return `<div class="hr-form-2col">
    <div class="inv-doc" style="white-space:pre-line;font-size:12.5px" dir="ltr">${renderTemplate(x.bodyEn, v)}</div>
    <div class="inv-doc" style="white-space:pre-line;font-size:12.5px" dir="rtl">${renderTemplate(x.bodyAr, v)}</div>
  </div>`;
}

function render() {
  const c = cur();
  const root = document.querySelector('[data-hr-contract]');
  if (!root) {
    return;
  }
  if (!c) {
    root.innerHTML = `<div class="hr-empty">${L('Contract not found', 'العقد غير موجود')}</div>`;
    return;
  }
  const x = getSeed('templates').find(t => t.code === c.type);
  const set = (id, v) => {
    const el = document.getElementById(id);
    if (el) {
      el.innerHTML = v;
    }
  };
  set('cd-title', `${c.id} · ${x ? (currentLang() === 'ar' ? x.ar : x.en) : c.type}`);
  set('cd-party', x ? partyLabel(x, c.party) : c.party);
  set('cd-period', `<span dir="ltr">${c.start || '—'} → ${c.end || '∞'}</span>`);
  set('cd-status', c.status);
  set(
    'cd-sign',
    `${c.sign}${c.signedAt ? ` · <span dir="ltr">${c.signedAt}</span>` : ''}${c.filed ? ` · 🗄️ ${L('Filed', 'مؤرشف')}` : ''}`
  );
  set(
    'cd-ver',
    `v${c.templateVer}${x && x.version !== c.templateVer ? ` (${L('latest', 'الأحدث')} v${x.version})` : ''}`
  );
  set('cd-qiwa', c.qiwa || '—');
  const box = document.getElementById('cd-doc');
  if (box) {
    box.innerHTML = docHTML(c);
  }
  const sg = document.getElementById('cd-sign-btn');
  if (sg) {
    sg.style.display = c.sign === 'signed' ? 'none' : '';
  }
  const fl = document.getElementById('cd-file-btn');
  if (fl) {
    fl.style.display = c.sign === 'signed' && !c.filed ? '' : 'none';
  }
  applyI18n(root);
}

export function initContract() {
  const root = document.querySelector('[data-hr-contract]');
  if (!root) {
    return;
  }
  render();
  if (booted) {
    return;
  }
  booted = true;
  document.getElementById('cd-sign-btn')?.addEventListener('click', () => {
    const c = cur();
    if (!c) {
      return;
    }
    const next = c.sign === 'unsigned' ? 'acknowledged' : 'signed';
    const patch = { sign: next };
    if (next === 'signed') {
      patch.signedAt = new Date().toISOString().slice(0, 10);
      if (c.status === 'issued') {
        patch.status = 'signed';
      }
    }
    patchSeedRow('contracts', c, patch);
    render();
    showToast(L('Signature recorded', 'سُجل التوقيع'), { variant: 'success' });
  });
  document.getElementById('cd-file-btn')?.addEventListener('click', () => {
    const c = cur();
    if (!c) {
      return;
    }
    patchSeedRow('contracts', c, { filed: true });
    render();
    showToast(L('Filed to vault', 'أُرشف في الخزينة'), { variant: 'success' });
  });
  document.getElementById('cd-print')?.addEventListener('click', () => {
    const c = cur();
    if (!c) {
      return;
    }
    showModal({
      title: c.id,
      size: 'lg',
      body: docHTML(c),
      actions: [
        { label: t('common.close'), variant: 'ghost' },
        {
          label: t('common.print'),
          variant: 'outline',
          action: () => {
            document.body.classList.add('inv-print');
            window.print();
            setTimeout(() => document.body.classList.remove('inv-print'), 500);
            return true;
          }
        }
      ]
    });
  });
  window.addEventListener(LANG_EVENT, render);
}
