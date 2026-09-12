// HR + Operations — candidates (hr_candidates.html).
// Internal intake (agents/CSV/referral); exports moveCandidate() so the
// pipeline board shares the same stage rules (hired needs an accepted offer).

import { showToast } from './toast.js';
import { showModal } from './modal.js';
import { t, currentLang, LANG_EVENT, applyI18n } from './i18n.js';
import { getSeed, patchSeedRow, saveImportedRows } from './hr-api.js';
import { PROFESSIONS, AGENTS } from './hr-seed.js';
import { exportData, exportCSV } from './import-export.js';
import { openImportModal } from './import-modal.js';

let booted = false;
let jobFilter = 'all';
let stageFilter = 'all';

export const STAGES = ['new', 'screening', 'interview', 'offer', 'hired'];

function L(en, ar) {
  return currentLang() === 'ar' ? ar : en;
}

export function stageLabel(st) {
  const map = {
    new: L('New', 'جديد'),
    screening: L('Screening', 'فرز'),
    interview: L('Interview', 'مقابلة'),
    offer: L('Offer', 'عرض'),
    hired: L('Hired', 'معيّن'),
    rejected: L('Rejected', 'مرفوض')
  };
  return map[st] || st;
}

const ST_CLS = {
  new: 'blue',
  screening: 'yellow',
  interview: 'purple',
  offer: 'yellow',
  hired: 'green',
  rejected: 'red'
};

function agentLabel(id) {
  if (id === 'referral') {
    return L('Referral', 'ترشيح');
  }
  if (id === 'transfer') {
    return L('Transfer-in', 'نقل خدمات');
  }
  const a = AGENTS.find(x => x.id === id);
  return a ? a.name : id || '—';
}

function jobTitle(id) {
  const j = getSeed('jobs').find(x => x.id === id);
  if (!j) {
    return id;
  }
  return currentLang() === 'ar' ? j.titleAr || j.titleEn : j.titleEn;
}

export function moveCandidate(id, to) {
  const c = getSeed('candidates').find(r => r.id === id);
  if (!c) {
    return { ok: false };
  }
  if (to === 'hired') {
    const accepted = getSeed('offers').some(o => o.candidate === id && o.status === 'accepted');
    if (!accepted) {
      return { ok: false, msg: L('Needs an accepted offer first', 'يتطلب عرضًا مقبولًا أولًا') };
    }
  }
  patchSeedRow('candidates', c, { stage: to });
  return { ok: true };
}

function stepCandidate(id, dir) {
  const c = getSeed('candidates').find(r => r.id === id);
  if (!c || c.stage === 'rejected') {
    return;
  }
  const i = STAGES.indexOf(c.stage);
  const to = STAGES[i + dir];
  if (!to) {
    return;
  }
  const r = moveCandidate(id, to);
  if (!r.ok && r.msg) {
    showToast(r.msg, { variant: 'warning' });
  }
  renderAll();
}

function filtered() {
  return getSeed('candidates').filter(
    c =>
      (jobFilter === 'all' || c.job === jobFilter) &&
      (stageFilter === 'all' || c.stage === stageFilter)
  );
}

function nextId() {
  const year = new Date().getFullYear();
  let n = 0;
  for (const c of getSeed('candidates')) {
    const m = String(c.id).match(new RegExp(`^CD-${year}-(\\d+)$`));
    if (m) {
      n = Math.max(n, Number(m[1]));
    }
  }
  return `CD-${year}-${String(n + 1).padStart(3, '0')}`;
}

function renderAll() {
  const set = (id, v) => {
    const el = document.getElementById(id);
    if (el) {
      el.textContent = v;
    }
  };
  const list = getSeed('candidates');
  set('cd-stat-all', String(list.length));
  set(
    'cd-stat-proc',
    String(list.filter(c => ['new', 'screening', 'interview', 'offer'].includes(c.stage)).length)
  );
  set('cd-stat-hired', String(list.filter(c => c.stage === 'hired').length));
  set('cd-stat-rej', String(list.filter(c => c.stage === 'rejected').length));
  const jf = document.getElementById('cd-job');
  if (jf && !jf.options.length) {
    jf.innerHTML = `<option value="all">—</option>${getSeed('jobs')
      .map(j => `<option value="${j.id}">${j.id} — ${jobTitle(j.id)}</option>`)
      .join('')}`;
    const q = new URLSearchParams(location.search).get('job');
    if (q) {
      jf.value = q;
      jobFilter = q;
    }
  }
  const el = document.getElementById('cd-rows');
  if (el) {
    el.innerHTML = filtered()
      .map(c => {
        const acts = [];
        if (c.stage !== 'rejected') {
          acts.push(
            `<button class="btn btn-outline btn-sm" data-back="${c.id}" ${STAGES.indexOf(c.stage) <= 0 ? 'disabled' : ''}>→</button>`
          );
          acts.push(
            `<button class="btn btn-outline btn-sm" data-fwd="${c.id}" ${STAGES.indexOf(c.stage) >= STAGES.length - 1 ? 'disabled' : ''}>←</button>`
          );
          acts.push(
            `<a class="btn btn-outline btn-sm" href="hr_interviews.html?candidate=${c.id}">${L('Interview', 'مقابلة')}</a>`
          );
          acts.push(
            `<button class="btn btn-outline btn-sm" data-reject="${c.id}">${t('status.rejected')}</button>`
          );
        } else {
          acts.push(
            `<button class="btn btn-outline btn-sm" data-reopen="${c.id}">${L('Reopen', 'إعادة فتح')}</button>`
          );
        }
        return `<tr>
      <td data-label="#"><strong dir="ltr">${c.id}</strong></td>
      <td data-label="${L('Name', 'الاسم')}"><strong>${currentLang() === 'ar' ? c.nameAr || c.nameEn : c.nameEn}</strong>
        <div style="font-size:11.5px;color:var(--text-muted)" dir="ltr">${c.phone || ''}</div></td>
      <td data-label="${L('Nationality', 'الجنسية')}">${c.nat}${c.saudi ? ' 🇸🇦' : ''}</td>
      <td data-label="${L('Job', 'الوظيفة')}" dir="ltr">${c.job}</td>
      <td data-label="${L('Source', 'المصدر')}">${agentLabel(c.source)}</td>
      <td data-label="${L('Stage', 'المرحلة')}"><span class="status status-${ST_CLS[c.stage] || 'blue'}">${stageLabel(c.stage)}</span></td>
      <td data-label=""><div style="display:flex;gap:6px;flex-wrap:wrap">${acts.join('')}</div></td>
    </tr>`;
      })
      .join('');
  }
  applyI18n(document.querySelector('[data-hr-candidates]') || document);
}

function openCandidateModal() {
  const jobs = getSeed('jobs').filter(j => ['open', 'draft'].includes(j.status));
  showModal({
    title: L('New candidate', 'مرشح جديد'),
    body: `<div class="hr-form-2col">
        <div class="form-group"><label class="form-label" for="nc-job">${L('Job', 'الوظيفة')}</label>
          <select class="form-control" id="nc-job">${jobs.map(j => `<option value="${j.id}">${j.id} — ${jobTitle(j.id)}</option>`).join('')}</select></div>
        <div class="form-group"><label class="form-label" for="nc-ne">${L('Name (EN)', 'الاسم (EN)')}</label>
          <input class="form-control" id="nc-ne"></div>
        <div class="form-group"><label class="form-label" for="nc-na">${L('Name (AR)', 'الاسم (AR)')}</label>
          <input class="form-control" id="nc-na"></div>
        <div class="form-group"><label class="form-label" for="nc-nat">${L('Nationality', 'الجنسية')}</label>
          <input class="form-control" id="nc-nat"></div>
        <div class="form-group"><label class="form-label" for="nc-prof">${L('Profession', 'المهنة')}</label>
          <select class="form-control" id="nc-prof">${PROFESSIONS.map(p => `<option value="${p.code}">${currentLang() === 'ar' ? p.ar : p.en}</option>`).join('')}</select></div>
        <div class="form-group"><label class="form-label" for="nc-src">${L('Source', 'المصدر')}</label>
          <select class="form-control" id="nc-src">${[...AGENTS.map(a => ({ v: a.id, l: a.name })), { v: 'referral', l: L('Referral', 'ترشيح') }, { v: 'transfer', l: L('Transfer-in', 'نقل خدمات') }].map(o => `<option value="${o.v}">${o.l}</option>`).join('')}</select></div>
        <div class="form-group"><label class="form-label" for="nc-ph">${L('Phone', 'الجوال')}</label>
          <input class="form-control" id="nc-ph" dir="ltr"></div>
        <div class="form-group"><label class="form-label" for="nc-pp">${L('Passport', 'الجواز')}</label>
          <input class="form-control" id="nc-pp" dir="ltr"></div>
      </div>
      <div class="form-group"><label class="form-label" style="display:flex;gap:8px;align-items:center">
        <input type="checkbox" id="nc-sa"> ${L('Saudi national', 'سعودي الجنسية')}</label></div>`,
    actions: [
      { label: t('common.cancel'), variant: 'ghost' },
      {
        label: t('common.save'),
        variant: 'primary',
        action: ({ body }) => {
          const v = sel => body.querySelector(sel).value;
          if (!v('#nc-ne').trim() || !v('#nc-job')) {
            showToast(L('Name and job are required', 'الاسم والوظيفة مطلوبان'), {
              variant: 'warning'
            });
            return false;
          }
          saveImportedRows('candidates', [
            {
              id: nextId(),
              job: v('#nc-job'),
              nameEn: v('#nc-ne').trim(),
              nameAr: v('#nc-na').trim(),
              nat: v('#nc-nat').trim(),
              saudi: body.querySelector('#nc-sa').checked,
              prof: v('#nc-prof'),
              source: v('#nc-src'),
              phone: v('#nc-ph').trim(),
              passport: v('#nc-pp').trim(),
              stage: 'new'
            }
          ]);
          renderAll();
          showToast(L('Candidate added', 'أُضيف المرشح'), { variant: 'success' });
          return true;
        }
      }
    ]
  });
}

const IMPORT_SCHEMA = [
  { key: 'nameEn', en: 'Name (EN)', ar: 'الاسم (EN)', required: true },
  { key: 'nameAr', en: 'Name (AR)', ar: 'الاسم (AR)' },
  { key: 'nat', en: 'Nationality', ar: 'الجنسية' },
  { key: 'prof', en: 'Profession', ar: 'المهنة' },
  { key: 'phone', en: 'Phone', ar: 'الجوال' },
  { key: 'passport', en: 'Passport', ar: 'الجواز' },
  { key: 'job', en: 'Job', ar: 'الوظيفة', required: true },
  { key: 'source', en: 'Source', ar: 'المصدر' }
];

function openImport() {
  openImportModal({
    titleEn: 'Import candidates',
    titleAr: 'استيراد المرشحين',
    filename: 'candidates',
    schema: IMPORT_SCHEMA,
    example: {
      nameEn: 'Suresh Yadav',
      nat: 'India',
      prof: 'driver',
      phone: '',
      passport: '',
      job: 'J-2026-01',
      source: 'AG-01'
    },
    onImport: rows => {
      let n = 0;
      for (const c of getSeed('candidates')) {
        const m = String(c.id).match(/^CD-\d{4}-(\d+)$/);
        if (m) {
          n = Math.max(n, Number(m[1]));
        }
      }
      const out = [];
      for (const r of rows) {
        if (!getSeed('jobs').some(j => j.id === r.job)) {
          showToast(L(`Unknown job ${r.job} — skipped`, `وظيفة غير معروفة ${r.job} — تم تجاهلها`), {
            variant: 'warning'
          });
          continue;
        }
        n += 1;
        out.push({
          id: `CD-${new Date().getFullYear()}-${String(n).padStart(3, '0')}`,
          job: r.job,
          nameEn: r.nameEn,
          nameAr: r.nameAr || '',
          nat: r.nat || '',
          saudi: (r.nat || '').toLowerCase() === 'saudi',
          prof: r.prof || '',
          source: r.source || 'AG-01',
          phone: r.phone || '',
          passport: r.passport || '',
          stage: 'new'
        });
      }
      if (out.length) {
        saveImportedRows('candidates', out);
        renderAll();
      }
      return out.length;
    }
  });
}

export function initCandidates() {
  const root = document.querySelector('[data-hr-candidates]');
  if (!root) {
    return;
  }
  renderAll();
  if (booted) {
    return;
  }
  booted = true;
  document.getElementById('cd-job')?.addEventListener('change', e => {
    jobFilter = e.target.value;
    renderAll();
  });
  document.getElementById('cd-stage')?.addEventListener('change', e => {
    stageFilter = e.target.value;
    renderAll();
  });
  document.getElementById('cd-new')?.addEventListener('click', openCandidateModal);
  document.getElementById('cd-import')?.addEventListener('click', openImport);
  document.getElementById('cd-rows')?.addEventListener('click', e => {
    const fw = e.target.closest('[data-fwd]');
    const bk = e.target.closest('[data-back]');
    const rj = e.target.closest('[data-reject]');
    const ro = e.target.closest('[data-reopen]');
    if (fw) {
      stepCandidate(fw.dataset.fwd, 1);
    } else if (bk) {
      stepCandidate(bk.dataset.back, -1);
    } else if (rj) {
      moveCandidate(rj.dataset.reject, 'rejected');
      renderAll();
    } else if (ro) {
      moveCandidate(ro.dataset.reopen, 'new');
      renderAll();
    }
  });
  const cols = [
    { key: 'id', label: 'Candidate' },
    { key: 'nameEn', label: 'Name' },
    { key: 'nat', label: 'Nationality' },
    { key: 'prof', label: 'Profession' },
    { key: 'job', label: 'Job' },
    { key: 'source', label: 'Source' },
    { key: 'phone', label: 'Phone' },
    { key: 'stage', label: 'Stage' }
  ];
  document.getElementById('cd-export-xlsx')?.addEventListener('click', () => {
    exportData('xlsx', 'candidates', cols, getSeed('candidates'), 'Candidates');
  });
  document.getElementById('cd-export-csv')?.addEventListener('click', () => {
    exportCSV('candidates.csv', cols, getSeed('candidates'));
  });
  window.addEventListener(LANG_EVENT, renderAll);
}
