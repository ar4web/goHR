// HR + Operations — interviews (hr_interviews.html).
// Passing moves the candidate interview → offer; failing rejects them.

import { showToast } from './toast.js';
import { showModal } from './modal.js';
import { t, currentLang, LANG_EVENT, applyI18n } from './i18n.js';
import { getSeed, patchSeedRow, saveImportedRows } from './hr-api.js';
import { moveCandidate } from './candidates.js';
import { exportData, exportCSV } from './import-export.js';

let booted = false;

const R_CLS = { scheduled: 'blue', passed: 'green', failed: 'red' };

function L(en, ar) {
  return currentLang() === 'ar' ? ar : en;
}

function candName(id) {
  const c = getSeed('candidates').find(x => x.id === id);
  if (!c) {
    return id;
  }
  return currentLang() === 'ar' ? c.nameAr || c.nameEn : c.nameEn;
}

function empName(code) {
  const e = getSeed('employees').find(x => x.code === code);
  if (!e) {
    return code;
  }
  return currentLang() === 'ar' ? e.nameAr || e.nameEn : e.nameEn;
}

function rLabel(r) {
  return r === 'passed'
    ? L('Passed', 'ناجح')
    : r === 'failed'
      ? L('Failed', 'راسب')
      : L('Scheduled', 'مجدولة');
}

function nextId() {
  const year = new Date().getFullYear();
  let n = 0;
  for (const r of getSeed('interviews')) {
    const m = String(r.id).match(new RegExp(`^IV-${year}-(\\d+)$`));
    if (m) {
      n = Math.max(n, Number(m[1]));
    }
  }
  return `IV-${year}-${String(n + 1).padStart(3, '0')}`;
}

function renderAll() {
  const set = (id, v) => {
    const el = document.getElementById(id);
    if (el) {
      el.textContent = v;
    }
  };
  const list = getSeed('interviews');
  set('iv-stat-sch', String(list.filter(r => r.result === 'scheduled').length));
  set('iv-stat-pass', String(list.filter(r => r.result === 'passed').length));
  set('iv-stat-fail', String(list.filter(r => r.result === 'failed').length));
  const week = new Date();
  week.setDate(week.getDate() + 7);
  set(
    'iv-stat-week',
    String(list.filter(r => r.result === 'scheduled' && new Date(r.at) <= week).length)
  );
  const el = document.getElementById('iv-rows');
  if (el) {
    el.innerHTML = [...list]
      .sort((a, b) => String(a.at).localeCompare(String(b.at)))
      .map(r => {
        const c = getSeed('candidates').find(x => x.id === r.candidate);
        const acts =
          r.result === 'scheduled'
            ? `<button class="btn btn-outline btn-sm" data-pass="${r.id}">${L('Pass', 'ناجح')}</button>
             <button class="btn btn-outline btn-sm" data-fail="${r.id}">${L('Fail', 'راسب')}</button>`
            : '';
        return `<tr>
      <td data-label="#"><strong dir="ltr">${r.id}</strong></td>
      <td data-label="${L('Candidate', 'المرشح')}">${candName(r.candidate)}
        <div style="font-size:11.5px;color:var(--text-muted)" dir="ltr">${c?.job || ''}</div></td>
      <td data-label="${L('When', 'الموعد')}" dir="ltr">${String(r.at).replace('T', ' ')}</td>
      <td data-label="${L('Interviewer', 'المقابِل')}">${empName(r.interviewer)}</td>
      <td data-label="${L('Kind', 'النوع')}">${r.kind}</td>
      <td data-label="${L('Result', 'النتيجة')}"><span class="status status-${R_CLS[r.result] || 'blue'}">${rLabel(r.result)}</span></td>
      <td data-label=""><div style="display:flex;gap:6px;flex-wrap:wrap">${acts}</div></td>
    </tr>`;
      })
      .join('');
  }
  applyI18n(document.querySelector('[data-hr-interviews]') || document);
}

function openInterviewModal(preCand) {
  const cands = getSeed('candidates').filter(c => !['hired', 'rejected'].includes(c.stage));
  const emps = getSeed('employees');
  showModal({
    title: L('Schedule interview', 'جدولة مقابلة'),
    body: `<div class="hr-form-2col">
        <div class="form-group"><label class="form-label" for="ni-cand">${L('Candidate', 'المرشح')}</label>
          <select class="form-control" id="ni-cand">${cands.map(c => `<option value="${c.id}"${c.id === preCand ? ' selected' : ''}>${c.id} — ${candName(c.id)}</option>`).join('')}</select></div>
        <div class="form-group"><label class="form-label" for="ni-at">${L('Date & time', 'التاريخ والوقت')}</label>
          <input class="form-control" id="ni-at" type="datetime-local" dir="ltr"></div>
        <div class="form-group"><label class="form-label" for="ni-who">${L('Interviewer', 'المقابِل')}</label>
          <select class="form-control" id="ni-who">${emps.map(e => `<option value="${e.code}">${e.code} — ${empName(e.code)}</option>`).join('')}</select></div>
        <div class="form-group"><label class="form-label" for="ni-kind">${L('Kind', 'النوع')}</label>
          <select class="form-control" id="ni-kind"><option value="phone">phone</option><option value="video">video</option><option value="onsite">onsite</option></select></div>
      </div>
      <div class="form-group"><label class="form-label" for="ni-notes">${L('Notes', 'ملاحظات')}</label>
        <input class="form-control" id="ni-notes"></div>`,
    actions: [
      { label: t('common.cancel'), variant: 'ghost' },
      {
        label: t('common.save'),
        variant: 'primary',
        action: ({ body }) => {
          const cand = body.querySelector('#ni-cand').value;
          const at = body.querySelector('#ni-at').value;
          if (!cand || !at) {
            showToast(L('Candidate and time are required', 'المرشح والوقت مطلوبان'), {
              variant: 'warning'
            });
            return false;
          }
          saveImportedRows('interviews', [
            {
              id: nextId(),
              candidate: cand,
              at,
              interviewer: body.querySelector('#ni-who').value,
              kind: body.querySelector('#ni-kind').value,
              result: 'scheduled',
              notes: body.querySelector('#ni-notes').value.trim()
            }
          ]);
          const c = getSeed('candidates').find(x => x.id === cand);
          if (c && ['new', 'screening'].includes(c.stage)) {
            moveCandidate(cand, 'interview');
          }
          renderAll();
          showToast(L('Interview scheduled', 'جُدولت المقابلة'), { variant: 'success' });
          return true;
        }
      }
    ]
  });
}

export function initInterviews() {
  const root = document.querySelector('[data-hr-interviews]');
  if (!root) {
    return;
  }
  renderAll();
  if (booted) {
    return;
  }
  booted = true;
  document.getElementById('iv-new')?.addEventListener('click', () => {
    openInterviewModal(new URLSearchParams(location.search).get('candidate'));
  });
  document.getElementById('iv-rows')?.addEventListener('click', e => {
    const ps = e.target.closest('[data-pass]');
    const fl = e.target.closest('[data-fail]');
    if (ps) {
      const r = getSeed('interviews').find(x => x.id === ps.dataset.pass);
      if (!r) {
        return;
      }
      patchSeedRow('interviews', r, { result: 'passed' });
      const c = getSeed('candidates').find(x => x.id === r.candidate);
      if (c && c.stage === 'interview') {
        moveCandidate(c.id, 'offer');
      }
      renderAll();
      showToast(L('Passed — candidate moved to Offer', 'نجح — انتقل المرشح إلى العرض'), {
        variant: 'success'
      });
    } else if (fl) {
      const r = getSeed('interviews').find(x => x.id === fl.dataset.fail);
      if (!r) {
        return;
      }
      patchSeedRow('interviews', r, { result: 'failed' });
      moveCandidate(r.candidate, 'rejected');
      renderAll();
      showToast(L('Failed — candidate rejected', 'رسب — رُفض المرشح'), { variant: 'success' });
    }
  });
  const cols = [
    { key: 'id', label: 'Interview' },
    { key: 'candidate', label: 'Candidate' },
    { key: 'at', label: 'When' },
    { key: 'interviewer', label: 'Interviewer' },
    { key: 'kind', label: 'Kind' },
    { key: 'result', label: 'Result' }
  ];
  document.getElementById('iv-export-xlsx')?.addEventListener('click', () => {
    exportData('xlsx', 'interviews', cols, getSeed('interviews'), 'Interviews');
  });
  document.getElementById('iv-export-csv')?.addEventListener('click', () => {
    exportCSV('interviews.csv', cols, getSeed('interviews'));
  });
  window.addEventListener(LANG_EVENT, renderAll);
}
