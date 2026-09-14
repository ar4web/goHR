// HR + Operations — my team (my_team.html).
// Manager view: members today + leave + pending approvals. Idempotent.

import { t, currentLang, LANG_EVENT, applyI18n } from './i18n.js';
import { initialsOf, L, setText} from './hr-locale.js';
import { getSeed } from './hr-api.js';

let booted = false;
let mgr = '';

function empName(e) {
  return currentLang() === 'ar' ? e.nameAr || e.nameEn : e.nameEn;
}

function managers() {
  const emps = getSeed('employees');
  const ids = [
    ...new Set(
      getSeed('orgLinks')
        .map(l => l.mgr)
        .filter(Boolean)
    )
  ];
  return ids.map(id => emps.find(e => e.code === id)).filter(Boolean);
}

function reportsOf(mgrCode) {
  const emps = getSeed('employees');
  return getSeed('orgLinks')
    .filter(l => l.mgr === mgrCode)
    .map(l => emps.find(e => e.code === l.emp))
    .filter(Boolean);
}

function statusChip(e) {
  if (e.st === 'on-leave') {
    return `<span class="status status-yellow">${t('status.on-leave')}</span>`;
  }
  if (e.st === 'exited' || e.st === 'huroob') {
    return `<span class="status status-red">${t(`status.${e.st}`)}</span>`;
  }
  return `<span class="status status-green">${t('status.active')}</span>`;
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

function renderAll() {
  const root = document.querySelector('[data-hr-myteam]');
  const sel = document.getElementById('tm-mgr');
  const mgrs = managers();
  if (sel && !sel.options.length) {
    sel.innerHTML = mgrs
      .map(m => `<option value="${m.code}">${m.code} · ${empName(m)}</option>`)
      .join('');
  }
  if (!mgr) {
    mgr = sel?.value || mgrs[0]?.code || '';
  }
  if (sel) {
    sel.value = mgr;
  }
  const team = reportsOf(mgr);

  setText('tm-stat-head', team.length);
  setText(
    'tm-stat-present',
    team.filter(e => e.st === 'active').length
  );
  setText('tm-stat-leave', team.filter(e => e.st === 'on-leave').length);
  setText('tm-stat-pend', 0);

  const grid = document.getElementById('tm-grid');
  if (grid) {
    grid.innerHTML =
      '<div class="row col-3">' +
      team
        .map(e => {
          const title = currentLang() === 'ar' ? e.titleAr || e.titleEn : e.titleEn;
          return `<div class="card"><div class="card-body">
        <div class="hr-360-top">
          <div class="cell-avatar" style="width:40px;height:40px;font-size:14px;background:${AV[e.av] || 'var(--avatar-teal)'};color:#fff">${initialsOf(e.nameEn)}</div>
          <div style="flex:1;min-width:0">
            <div class="cell-strong"><a href="employee.html?code=${e.code}">${empName(e)}</a></div>
            <div style="font-size:11.5px;color:var(--text-muted)">${e.code} · ${title || e.dept}</div>
          </div>
        </div>
        <div style="display:flex;gap:6px;margin-top:10px;flex-wrap:wrap">${statusChip(e)}</div>
      </div></div>`;
        })
        .join('') +
      '</div>';
  }
  const pl = document.getElementById('tm-pend');
  if (pl) {
    pl.innerHTML = `<div class="hr-empty">${L('No pending requests for this team.', 'لا طلبات معلقة لهذا الفريق.')}</div>`;
  }
  applyI18n(root || document);
}

export function initMyTeam() {
  const root = document.querySelector('[data-hr-myteam]');
  if (!root) {
    return;
  }
  renderAll();
  if (booted) {
    return;
  }
  booted = true;
  document.getElementById('tm-mgr')?.addEventListener('change', e => {
    mgr = e.target.value;
    renderAll();
  });
  window.addEventListener(LANG_EVENT, renderAll);
}
