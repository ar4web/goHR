// HR + Operations — org chart (org_chart.html).
// Reporting tree from ORG_LINKS + departments summary. Idempotent.

import { t, currentLang, LANG_EVENT, applyI18n } from './i18n.js';
import { initialsOf, L} from './hr-locale.js';
import { getSeed, saveImportedRows } from './hr-api.js';
import { openImportModal } from './import-modal.js';
import { DEPARTMENTS } from './hr-seed.js';

let booted = false;

function empName(e) {
  return currentLang() === 'ar' ? e.nameAr || e.nameEn : e.nameEn;
}

function deptName(code) {
  const lists = (() => {
    try {
      return JSON.parse(localStorage.getItem('hr:custom-lists') || '{}');
    } catch (_e) {
      return {};
    }
  })();
  const arr = lists.departments || DEPARTMENTS;
  const d = arr.find(x => x.code === code);
  if (!d) {
    return code || '';
  }
  return currentLang() === 'ar' ? d.ar : d.en;
}

// Avatar backgrounds — dark variants only, so white initials pass AA.
// (Bright base hues with white text fail contrast; see _tokens.scss.)
const AV = {
  primary: 'var(--avatar-teal)',
  azure: 'var(--avatar-azure)',
  purple: 'var(--avatar-purple)',
  yellow: 'var(--avatar-yellow)',
  red: 'var(--avatar-red)',
  green: 'var(--avatar-green)',
  blue: 'var(--avatar-blue)'
};

function nodeHtml(e) {
  const title = currentLang() === 'ar' ? e.titleAr || e.titleEn : e.titleEn;
  return `<a class="org-node" href="employee.html?code=${e.code}">
    <span class="cell-avatar" style="width:30px;height:30px;font-size:11px;background:${AV[e.av] || 'var(--avatar-teal)'};color:#fff">${initialsOf(e.nameEn)}</span>
    <span class="org-meta"><strong>${empName(e)}</strong><span>${title || ''}</span></span>
    ${e.st !== 'active' ? `<span class="status status-yellow">${t(`status.${e.st}`)}</span>` : ''}
  </a>`;
}

function treeHtml(code, emps, childrenOf, depth) {
  const e = emps.find(x => x.code === code);
  if (!e || depth > 6) {
    return '';
  }
  const kids = childrenOf.get(code) || [];
  return `<li>${nodeHtml(e)}${
    kids.length
      ? `<ul>${kids.map(k => treeHtml(k, emps, childrenOf, depth + 1)).join('')}</ul>`
      : ''
  }</li>`;
}

function renderTree() {
  const el = document.getElementById('org-tree');
  if (!el) {
    return;
  }
  const emps = getSeed('employees');
  const links = getSeed('orgLinks');
  const childrenOf = new Map();
  links.forEach(l => {
    if (!l.mgr) {
      return;
    }
    if (!childrenOf.has(l.mgr)) {
      childrenOf.set(l.mgr, []);
    }
    childrenOf.get(l.mgr).push(l.emp);
  });
  const roots = links.filter(l => !l.mgr).map(l => l.emp);
  const linked = new Set(links.map(l => l.emp));
  const orphans = emps.filter(e => !linked.has(e.code));
  el.innerHTML =
    `<ul class="org-root">${roots.map(r => treeHtml(r, emps, childrenOf, 0)).join('')}</ul>` +
    (orphans.length
      ? `<div class="cell-strong" style="margin:14px 0 6px;font-size:13px">${L('Unassigned', 'غير مُسند')}</div>
        <ul class="org-root">${orphans.map(e => `<li>${nodeHtml(e)}</li>`).join('')}</ul>`
      : '');
}

function renderDepts() {
  const el = document.getElementById('org-depts');
  if (!el) {
    return;
  }
  const emps = getSeed('employees');
  const byDept = new Map();
  emps.forEach(e => byDept.set(e.dept, (byDept.get(e.dept) || 0) + 1));
  el.innerHTML = `<div class="row col-3">${[...byDept.entries()]
    .map(
      ([code, n]) => `<div class="card"><div class="stat"><div class="stat-content">
      <div class="stat-label">${deptName(code)}</div>
      <div class="stat-value-row"><span class="stat-value">${n}</span></div>
      <div class="stat-subtext" dir="ltr">${code}</div></div></div></div>`
    )
    .join('')}</div>`;
}

function renderAll() {
  renderTree();
  renderDepts();
  const n = document.getElementById('org-count');
  if (n) {
    n.textContent = `${getSeed('employees').length} ${L('people', 'شخص')}`;
  }
  applyI18n(document.querySelector('[data-hr-org]') || document);
}

export function initOrgChart() {
  const root = document.querySelector('[data-hr-org]');
  if (!root) {
    return;
  }
  renderAll();
  if (booted) {
    return;
  }
  booted = true;
  const orgSchema = [
    { key: 'emp', en: 'Employee code', ar: 'رقم الموظف', required: true },
    { key: 'mgr', en: 'Manager code (empty = top)', ar: 'رقم المدير' }
  ];
  document.getElementById('org-import')?.addEventListener('click', () =>
    openImportModal({
      titleEn: 'Import reporting lines (Excel / CSV)',
      titleAr: 'استيراد خطوط التبعية (Excel / CSV)',
      filename: 'org-links',
      schema: orgSchema,
      example: { emp: 'EMP-0013', mgr: 'EMP-0002' },
      onImport: rows => {
        saveImportedRows(
          'orgLinks',
          rows.map(r => ({ emp: r.emp, mgr: r.mgr || null }))
        );
        renderAll();
        return rows.length;
      }
    })
  );
  document.getElementById('org-print')?.addEventListener('click', () => window.print());
  window.addEventListener(LANG_EVENT, renderAll);
}
