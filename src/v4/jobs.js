// HR + Operations — job requisitions (hr_jobs.html).
// Housing + transport are mandatory benefit-or-allowance (§0.4): a requisition
// with either at zero cannot be saved.

import { showToast } from './toast.js';
import { showModal } from './modal.js';
import { t, currentLang, LANG_EVENT, applyI18n } from './i18n.js';
import { fmtSAR } from './hr-locale.js';
import { getSeed, patchSeedRow, saveImportedRows } from './hr-api.js';
import { PROFESSIONS } from './hr-seed.js';
import { exportData, exportCSV } from './import-export.js';

let booted = false;

const ST_CLS = { open: 'green', filled: 'blue', closed: 'red', draft: 'yellow' };

function L(en, ar) {
  return currentLang() === 'ar' ? ar : en;
}

function titleOf(j) {
  return currentLang() === 'ar' ? j.titleAr || j.titleEn : j.titleEn;
}

function profLabel(code) {
  const p = PROFESSIONS.find(x => x.code === code);
  if (!p) {
    return code;
  }
  return currentLang() === 'ar' ? p.ar : p.en;
}

function stLabel(st) {
  return (
    {
      open: L('Open', 'مفتوحة'),
      filled: L('Filled', 'مكتملة'),
      closed: L('Closed', 'مغلقة'),
      draft: t('status.draft')
    }[st] || st
  );
}

function nextId() {
  const year = new Date().getFullYear();
  let n = 0;
  for (const j of getSeed('jobs')) {
    const m = String(j.id).match(new RegExp(`^J-${year}-(\\d+)$`));
    if (m) {
      n = Math.max(n, Number(m[1]));
    }
  }
  return `J-${year}-${String(n + 1).padStart(2, '0')}`;
}

function renderAll() {
  const set = (id, v) => {
    const el = document.getElementById(id);
    if (el) {
      el.textContent = v;
    }
  };
  const list = getSeed('jobs');
  const open = list.filter(j => j.status === 'open');
  set('jb-stat-open', String(open.length));
  set(
    'jb-stat-hc',
    String(open.reduce((s, j) => s + Math.max(0, (j.headcount || 0) - (j.hired || 0)), 0))
  );
  set('jb-stat-filled', String(list.filter(j => j.status === 'filled').length));
  set('jb-stat-draft', String(list.filter(j => j.status === 'draft').length));
  const el = document.getElementById('jb-rows');
  if (el) {
    el.innerHTML = list
      .map(j => {
        const acts = [
          `<button class="btn btn-outline btn-sm" data-edit="${j.id}">${L('Edit', 'تحرير')}</button>`,
          `<a class="btn btn-outline btn-sm" href="hr_candidates.html?job=${j.id}">${L('Candidates', 'المرشحون')}</a>`
        ];
        if (j.status === 'open' || j.status === 'draft') {
          acts.push(
            `<button class="btn btn-outline btn-sm" data-close="${j.id}">${L('Close', 'إغلاق')}</button>`
          );
        }
        if (j.status === 'closed') {
          acts.push(
            `<button class="btn btn-outline btn-sm" data-reopen="${j.id}">${L('Reopen', 'إعادة فتح')}</button>`
          );
        }
        return `<tr>
      <td data-label="#"><strong dir="ltr">${j.id}</strong></td>
      <td data-label="${L('Title', 'المسمى')}"><strong>${titleOf(j)}</strong>
        <div style="font-size:11.5px;color:var(--text-muted)">${profLabel(j.prof)}</div></td>
      <td data-label="${L('Headcount', 'العدد')}" dir="ltr">${j.hired || 0} / ${j.headcount}</td>
      <td data-label="${L('Salary', 'الراتب')}" dir="ltr">${fmtSAR((j.basic || 0) + (j.housing || 0) + (j.transport || 0))}</td>
      <td data-label="${L('Site', 'الموقع')}" dir="ltr">${j.site || '—'}</td>
      <td data-label="${t('common.status')}"><span class="status status-${ST_CLS[j.status] || 'blue'}">${stLabel(j.status)}</span></td>
      <td data-label=""><div style="display:flex;gap:6px;flex-wrap:wrap">${acts.join('')}</div></td>
    </tr>`;
      })
      .join('');
  }
  applyI18n(document.querySelector('[data-hr-jobs]') || document);
}

function openJobModal(id) {
  const j = id ? getSeed('jobs').find(r => r.id === id) : null;
  const sites = getSeed('sites');
  showModal({
    title: j ? `${L('Edit', 'تحرير')} ${j.id}` : L('New requisition', 'طلب توظيف جديد'),
    body: `<div class="hr-form-2col">
        <div class="form-group"><label class="form-label" for="nj-te">${L('Title (EN)', 'المسمى (EN)')}</label>
          <input class="form-control" id="nj-te" value="${j?.titleEn || ''}"></div>
        <div class="form-group"><label class="form-label" for="nj-ta">${L('Title (AR)', 'المسمى (AR)')}</label>
          <input class="form-control" id="nj-ta" value="${j?.titleAr || ''}"></div>
        <div class="form-group"><label class="form-label" for="nj-prof">${L('Profession', 'المهنة')}</label>
          <select class="form-control" id="nj-prof">${PROFESSIONS.map(p => `<option value="${p.code}"${j?.prof === p.code ? ' selected' : ''}>${currentLang() === 'ar' ? p.ar : p.en}</option>`).join('')}</select></div>
        <div class="form-group"><label class="form-label" for="nj-hc">${L('Headcount', 'العدد')}</label>
          <input class="form-control" id="nj-hc" type="number" min="1" step="1" value="${j?.headcount || 1}" dir="ltr"></div>
        <div class="form-group"><label class="form-label" for="nj-b">${L('Basic (SAR)', 'الأساسي (ر.س)')}</label>
          <input class="form-control" id="nj-b" type="number" min="0" step="1" value="${j?.basic || 0}" dir="ltr"></div>
        <div class="form-group"><label class="form-label" for="nj-h">${L('Housing (SAR) — mandatory', 'السكن (ر.س) — إلزامي')}</label>
          <input class="form-control" id="nj-h" type="number" min="0" step="1" value="${j?.housing || 0}" dir="ltr"></div>
        <div class="form-group"><label class="form-label" for="nj-tr">${L('Transport (SAR) — mandatory', 'النقل (ر.س) — إلزامي')}</label>
          <input class="form-control" id="nj-tr" type="number" min="0" step="1" value="${j?.transport || 0}" dir="ltr"></div>
        <div class="form-group"><label class="form-label" for="nj-site">${L('Site', 'الموقع')}</label>
          <select class="form-control" id="nj-site"><option value="">—</option>${sites.map(s => `<option value="${s.id}"${j?.site === s.id ? ' selected' : ''}>${s.id} — ${s.nameEn}</option>`).join('')}</select></div>
      </div>
      <div class="form-group"><label class="form-label" for="nj-note">${L('Note', 'ملاحظة')}</label>
        <input class="form-control" id="nj-note" value="${j?.note || ''}"></div>`,
    actions: [
      { label: t('common.cancel'), variant: 'ghost' },
      {
        label: t('common.save'),
        variant: 'primary',
        action: ({ body }) => {
          const v = sel => body.querySelector(sel).value;
          const housing = Number(v('#nj-h')) || 0;
          const transport = Number(v('#nj-tr')) || 0;
          if (!(housing > 0) || !(transport > 0)) {
            showToast(
              L(
                'Housing + transport are mandatory (§0.4) — blocked',
                'السكن والنقل إلزاميان (0.4) — مرفوض'
              ),
              { variant: 'error' }
            );
            return false;
          }
          if (!v('#nj-te').trim()) {
            showToast(L('Enter a title', 'أدخل المسمى'), { variant: 'warning' });
            return false;
          }
          const row = {
            titleEn: v('#nj-te').trim(),
            titleAr: v('#nj-ta').trim(),
            prof: v('#nj-prof'),
            headcount: Number(v('#nj-hc')) || 1,
            basic: Number(v('#nj-b')) || 0,
            housing,
            transport,
            site: v('#nj-site') || '',
            note: v('#nj-note').trim()
          };
          if (j) {
            patchSeedRow('jobs', j, row);
          } else {
            saveImportedRows('jobs', [{ id: nextId(), hired: 0, status: 'draft', ...row }]);
          }
          renderAll();
          showToast(L('Requisition saved', 'حُفظ الطلب'), { variant: 'success' });
          return true;
        }
      }
    ]
  });
}

export function initJobs() {
  const root = document.querySelector('[data-hr-jobs]');
  if (!root) {
    return;
  }
  renderAll();
  if (booted) {
    return;
  }
  booted = true;
  document.getElementById('jb-new')?.addEventListener('click', () => openJobModal(null));
  document.getElementById('jb-rows')?.addEventListener('click', e => {
    const ed = e.target.closest('[data-edit]');
    const cl = e.target.closest('[data-close]');
    const ro = e.target.closest('[data-reopen]');
    if (ed) {
      openJobModal(ed.dataset.edit);
    } else if (cl) {
      const j = getSeed('jobs').find(r => r.id === cl.dataset.close);
      if (j) {
        patchSeedRow('jobs', j, { status: 'closed' });
        renderAll();
      }
    } else if (ro) {
      const j = getSeed('jobs').find(r => r.id === ro.dataset.reopen);
      if (j) {
        patchSeedRow('jobs', j, { status: 'open' });
        renderAll();
      }
    }
  });
  const cols = [
    { key: 'id', label: 'Job' },
    { key: 'titleEn', label: 'Title' },
    { key: 'prof', label: 'Profession' },
    { key: 'headcount', label: 'Headcount' },
    { key: 'hired', label: 'Hired' },
    { key: 'basic', label: 'Basic (SAR)' },
    { key: 'housing', label: 'Housing (SAR)' },
    { key: 'transport', label: 'Transport (SAR)' },
    { key: 'status', label: 'Status' }
  ];
  document.getElementById('jb-export-xlsx')?.addEventListener('click', () => {
    exportData('xlsx', 'jobs', cols, getSeed('jobs'), 'Jobs');
  });
  document.getElementById('jb-export-csv')?.addEventListener('click', () => {
    exportCSV('jobs.csv', cols, getSeed('jobs'));
  });
  window.addEventListener(LANG_EVENT, renderAll);
}
