// HR + Operations — job offers (hr_offers.html).
// Flow: draft → approved → sent → accepted/declined. The bilingual letter
// renders template L1; Saudi offers below the SAR 4,000 Nitaqat floor raise a
// hint. Accepting moves the candidate to hired; Hire opens onboarding.

import { showToast } from './toast.js';
import { showModal } from './modal.js';
import { t, currentLang, LANG_EVENT, applyI18n } from './i18n.js';
import { fmtSAR } from './hr-locale.js';
import { renderTemplate, nitaqatWageOk, nitaqatWageFloor } from './hr-statutory.js';
import { getSeed, patchSeedRow, saveImportedRows } from './hr-api.js';
import { buildValues } from './contract-values.js';
import { moveCandidate } from './candidates.js';
import { exportData, exportCSV } from './import-export.js';

let booted = false;

const ST_CLS = {
  draft: 'blue',
  approved: 'purple',
  sent: 'yellow',
  accepted: 'green',
  declined: 'red'
};

function L(en, ar) {
  return currentLang() === 'ar' ? ar : en;
}

function stLabel(st) {
  return (
    {
      draft: t('status.draft'),
      approved: t('status.approved'),
      sent: t('status.sent'),
      accepted: L('Accepted', 'مقبول'),
      declined: L('Declined', 'مرفوض')
    }[st] || st
  );
}

function cand(id) {
  return getSeed('candidates').find(c => c.id === id);
}

function candName(id) {
  const c = cand(id);
  if (!c) {
    return id;
  }
  return currentLang() === 'ar' ? c.nameAr || c.nameEn : c.nameEn;
}

function jobOf(o) {
  return getSeed('jobs').find(j => j.id === o.job);
}

function totalOf(o) {
  return (Number(o.basic) || 0) + (Number(o.housing) || 0) + (Number(o.transport) || 0);
}

function belowFloor(o) {
  const c = cand(o.candidate);
  return !!c?.saudi && !nitaqatWageOk(true, o.basic);
}

function nextId(prefix) {
  const year = new Date().getFullYear();
  let n = 0;
  const coll = prefix === 'OF' ? getSeed('offers') : getSeed('onboarding');
  for (const r of coll) {
    const m = String(r.id).match(new RegExp(`^${prefix === 'OF' ? 'OF' : 'OB'}-${year}-(\\d+)$`));
    if (m) {
      n = Math.max(n, Number(m[1]));
    }
  }
  return `${prefix === 'OF' ? 'OF' : 'OB'}-${year}-${String(n + 1).padStart(3, '0')}`;
}

function letterHTML(o) {
  const x = getSeed('templates').find(t => t.code === 'L1');
  const v = buildValues(x, o.candidate, {
    wage_basic: o.basic,
    wage_housing: o.housing,
    wage_transport: o.transport,
    start_date: o.start,
    validity_date: o.validUntil
  });
  return `<div class="hr-form-2col">
    <div class="inv-doc" style="white-space:pre-line;font-size:12.5px" dir="ltr">${renderTemplate(x.bodyEn, v)}</div>
    <div class="inv-doc" style="white-space:pre-line;font-size:12.5px" dir="rtl">${renderTemplate(x.bodyAr, v)}</div>
  </div>`;
}

function renderAll() {
  const set = (id, v) => {
    const el = document.getElementById(id);
    if (el) {
      el.textContent = v;
    }
  };
  const list = getSeed('offers');
  set('of-stat-draft', String(list.filter(o => o.status === 'draft').length));
  set('of-stat-sent', String(list.filter(o => ['approved', 'sent'].includes(o.status)).length));
  set('of-stat-acc', String(list.filter(o => o.status === 'accepted').length));
  set(
    'of-stat-total',
    fmtSAR(list.filter(o => o.status === 'accepted').reduce((s, o) => s + totalOf(o), 0))
  );
  const el = document.getElementById('of-rows');
  if (el) {
    el.innerHTML = list
      .map(o => {
        const acts = [
          `<button class="btn btn-outline btn-sm" data-letter="${o.id}">${L('Letter', 'الخطاب')}</button>`
        ];
        if (o.status === 'draft') {
          acts.push(
            `<button class="btn btn-outline btn-sm" data-approve="${o.id}">${t('status.approved')}</button>`
          );
        }
        if (o.status === 'approved') {
          acts.push(
            `<button class="btn btn-outline btn-sm" data-send="${o.id}">${t('status.sent')}</button>`
          );
        }
        if (o.status === 'sent') {
          acts.push(
            `<button class="btn btn-outline btn-sm" data-accept="${o.id}">${L('Accept', 'قبول')}</button>`
          );
          acts.push(
            `<button class="btn btn-outline btn-sm" data-decline="${o.id}">${L('Decline', 'رفض')}</button>`
          );
        }
        if (o.status === 'accepted') {
          acts.push(
            `<button class="btn btn-outline btn-sm" data-hire="${o.id}">${L('Hire → onboarding', 'تعيين ← إلحاق')}</button>`
          );
        }
        return `<tr>
      <td data-label="#"><strong dir="ltr">${o.id}</strong></td>
      <td data-label="${L('Candidate', 'المرشح')}">${candName(o.candidate)}</td>
      <td data-label="${L('Job', 'الوظيفة')}" dir="ltr">${o.job}</td>
      <td data-label="${L('Total', 'الإجمالي')}" dir="ltr"><strong>${fmtSAR(totalOf(o))}</strong>
        ${belowFloor(o) ? `<div><span class="status status-yellow">${L('Below Nitaqat floor', 'دون حد نطاقات')}</span></div>` : ''}</td>
      <td data-label="${L('Valid until', 'صالح حتى')}" dir="ltr">${o.validUntil}</td>
      <td data-label="${t('common.status')}"><span class="status status-${ST_CLS[o.status] || 'blue'}">${stLabel(o.status)}</span></td>
      <td data-label=""><div style="display:flex;gap:6px;flex-wrap:wrap">${acts.join('')}</div></td>
    </tr>`;
      })
      .join('');
  }
  applyI18n(document.querySelector('[data-hr-offers]') || document);
}

function openOfferModal() {
  const cands = getSeed('candidates').filter(c => ['interview', 'offer'].includes(c.stage));
  if (!cands.length) {
    showToast(L('No candidates at interview/offer stage', 'لا مرشحين في مرحلة المقابلة/العرض'), {
      variant: 'warning'
    });
    return;
  }
  showModal({
    title: L('New offer', 'عرض جديد'),
    body: `<div class="hr-form-2col">
        <div class="form-group"><label class="form-label" for="no-cand">${L('Candidate', 'المرشح')}</label>
          <select class="form-control" id="no-cand">${cands.map(c => `<option value="${c.id}">${c.id} — ${candName(c.id)}</option>`).join('')}</select></div>
        <div class="form-group"><label class="form-label" for="no-b">${L('Basic (SAR)', 'الأساسي (ر.س)')}</label>
          <input class="form-control" id="no-b" type="number" min="0" step="1" dir="ltr"></div>
        <div class="form-group"><label class="form-label" for="no-h">${L('Housing (SAR)', 'السكن (ر.س)')}</label>
          <input class="form-control" id="no-h" type="number" min="0" step="1" dir="ltr"></div>
        <div class="form-group"><label class="form-label" for="no-tr">${L('Transport (SAR)', 'النقل (ر.س)')}</label>
          <input class="form-control" id="no-tr" type="number" min="0" step="1" dir="ltr"></div>
        <div class="form-group"><label class="form-label" for="no-start">${L('Expected start', 'البدء المتوقع')}</label>
          <input class="form-control" id="no-start" type="date" dir="ltr"></div>
        <div class="form-group"><label class="form-label" for="no-valid">${L('Valid until', 'صالح حتى')}</label>
          <input class="form-control" id="no-valid" type="date" dir="ltr"></div>
      </div>
      <div id="no-hint"></div>`,
    actions: [
      { label: t('common.cancel'), variant: 'ghost' },
      {
        label: t('common.save'),
        variant: 'primary',
        action: ({ body }) => {
          const v = sel => body.querySelector(sel).value;
          const basic = Number(v('#no-b')) || 0;
          if (!(basic > 0) || !v('#no-start') || !v('#no-valid')) {
            showToast(
              L('Basic, start and validity are required', 'الأساسي والبدء والصلاحية مطلوبة'),
              { variant: 'warning' }
            );
            return false;
          }
          const c = cand(v('#no-cand'));
          saveImportedRows('offers', [
            {
              id: nextId('OF'),
              candidate: c.id,
              job: c.job,
              basic,
              housing: Number(v('#no-h')) || 0,
              transport: Number(v('#no-tr')) || 0,
              start: v('#no-start'),
              validUntil: v('#no-valid'),
              status: 'draft',
              templateVer: getSeed('templates').find(x => x.code === 'L1')?.version || 1
            }
          ]);
          if (c.stage === 'interview') {
            moveCandidate(c.id, 'offer');
          }
          renderAll();
          showToast(L('Offer drafted', 'أُنشئ العرض'), { variant: 'success' });
          return true;
        }
      }
    ]
  });
  const dlg = document.querySelector('.modal-backdrop:last-child') || document;
  const prefill = () => {
    const c = cand(dlg.querySelector('#no-cand')?.value);
    const j = c ? getSeed('jobs').find(x => x.id === c.job) : null;
    if (j) {
      dlg.querySelector('#no-b').value = j.basic || 0;
      dlg.querySelector('#no-h').value = j.housing || 0;
      dlg.querySelector('#no-tr').value = j.transport || 0;
    }
    hint();
  };
  const hint = () => {
    const c = cand(dlg.querySelector('#no-cand')?.value);
    const basic = Number(dlg.querySelector('#no-b')?.value) || 0;
    const box = dlg.querySelector('#no-hint');
    if (!box) {
      return;
    }
    box.innerHTML =
      c?.saudi && !nitaqatWageOk(true, basic)
        ? `<div class="hr-note" style="border-color:var(--warning)">⚠️ ${L(`Saudi offer below the SAR ${nitaqatWageFloor().toLocaleString('en-US')} Nitaqat floor — the hire will not count toward Saudization.`, `عرض السعودي دون حد نطاقات ${nitaqatWageFloor().toLocaleString('en-US')} ر.س — لن يُحتسب المعيّن في السعودة.`)}</div>`
        : '';
  };
  prefill();
  dlg.querySelector('#no-cand')?.addEventListener('change', prefill);
  dlg.querySelector('#no-b')?.addEventListener('input', hint);
}

function openLetterModal(id) {
  const o = getSeed('offers').find(r => r.id === id);
  if (!o) {
    return;
  }
  showModal({
    title: `${o.id} · ${candName(o.candidate)}`,
    size: 'lg',
    body: letterHTML(o),
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
}

function hireFromOffer(id) {
  const o = getSeed('offers').find(r => r.id === id);
  const c = o ? cand(o.candidate) : null;
  if (!o || !c) {
    return;
  }
  const dup = getSeed('onboarding').some(x => x.nameEn === c.nameEn);
  if (dup) {
    showToast(L('Onboarding case already exists', 'قضية الإلحاق موجودة'), { variant: 'warning' });
    return;
  }
  const type =
    c.source === 'transfer'
      ? 'transfer'
      : String(c.source || '').startsWith('AG-')
        ? 'overseas'
        : 'local';
  saveImportedRows('onboarding', [
    {
      id: nextId('OB'),
      type,
      emp: '',
      nameEn: c.nameEn,
      nameAr: c.nameAr || '',
      nat: c.nat,
      prof: c.prof,
      agent: String(c.source || '').startsWith('AG-') ? c.source : '',
      visa: '',
      stage: 1,
      stages: { 1: new Date().toISOString().slice(0, 10) },
      costs: []
    }
  ]);
  showToast(L('Onboarding case opened', 'فُتحت قضية إلحاق'), { variant: 'success' });
}

export function initOffers() {
  const root = document.querySelector('[data-hr-offers]');
  if (!root) {
    return;
  }
  renderAll();
  if (booted) {
    return;
  }
  booted = true;
  document.getElementById('of-new')?.addEventListener('click', openOfferModal);
  document.getElementById('of-rows')?.addEventListener('click', e => {
    const q = sel => e.target.closest(sel);
    const lt = q('[data-letter]');
    const ap = q('[data-approve]');
    const sn = q('[data-send]');
    const ac = q('[data-accept]');
    const dc = q('[data-decline]');
    const hr = q('[data-hire]');
    if (lt) {
      openLetterModal(lt.dataset.letter);
    } else if (ap) {
      const o = getSeed('offers').find(r => r.id === ap.dataset.approve);
      if (o) {
        patchSeedRow('offers', o, { status: 'approved' });
        renderAll();
      }
    } else if (sn) {
      const o = getSeed('offers').find(r => r.id === sn.dataset.send);
      if (o) {
        patchSeedRow('offers', o, { status: 'sent' });
        renderAll();
      }
    } else if (ac) {
      const o = getSeed('offers').find(r => r.id === ac.dataset.accept);
      if (!o) {
        return;
      }
      patchSeedRow('offers', o, { status: 'accepted' });
      moveCandidate(o.candidate, 'hired');
      const j = jobOf(o);
      if (j) {
        const hired = (j.hired || 0) + 1;
        patchSeedRow('jobs', j, {
          hired,
          status: hired >= (j.headcount || 0) ? 'filled' : j.status
        });
      }
      renderAll();
      showToast(L('Accepted — candidate hired', 'قُبل — عُيّن المرشح'), { variant: 'success' });
    } else if (dc) {
      const o = getSeed('offers').find(r => r.id === dc.dataset.decline);
      if (!o) {
        return;
      }
      patchSeedRow('offers', o, { status: 'declined' });
      renderAll();
    } else if (hr) {
      hireFromOffer(hr.dataset.hire);
    }
  });
  const cols = [
    { key: 'id', label: 'Offer' },
    { key: 'candidate', label: 'Candidate' },
    { key: 'job', label: 'Job' },
    { key: 'basic', label: 'Basic (SAR)' },
    { key: 'housing', label: 'Housing (SAR)' },
    { key: 'transport', label: 'Transport (SAR)' },
    { key: 'start', label: 'Start' },
    { key: 'validUntil', label: 'Valid until' },
    { key: 'status', label: 'Status' }
  ];
  document.getElementById('of-export-xlsx')?.addEventListener('click', () => {
    exportData('xlsx', 'offers', cols, getSeed('offers'), 'Offers');
  });
  document.getElementById('of-export-csv')?.addEventListener('click', () => {
    exportCSV('offers.csv', cols, getSeed('offers'));
  });
  window.addEventListener(LANG_EVENT, renderAll);
}
