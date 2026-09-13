// HR + Operations — my team (hr_my_team.html).
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

function todayRow(code) {
  const today = new Date().toISOString().slice(0, 10);
  return getSeed('attendance').find(r => r.emp === code && r.date === today);
}

function leaveCovering(code) {
  const today = new Date().toISOString().slice(0, 10);
  return getSeed('leaveRequests').find(
    r => r.emp === code && r.status === 'approved' && today >= r.from && today <= r.to
  );
}

function pendingOf(code) {
  return getSeed('leaveRequests').filter(r => r.emp === code && r.status === 'pending');
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

function statusChip(e) {
  const r = todayRow(e.code);
  const lv = leaveCovering(e.code);
  if (e.st === 'on-leave' || lv) {
    return `<span class="status status-yellow">${t('status.on-leave')}</span>`;
  }
  if (!r) {
    const dow = new Date().getDay();
    if (dow === 5 || dow === 6) {
      return `<span class="status status-blue">${L('Weekend', 'عطلة')}</span>`;
    }
    return '<span style="color:var(--text-muted)">—</span>';
  }
  const cls = r.status === 'present' ? 'green' : r.status === 'late' ? 'yellow' : 'red';
  return `<span class="status status-${cls}">${t(`status.${r.status}`)}</span>`;
}

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
    team.filter(e => ['present', 'late'].includes(todayRow(e.code)?.status)).length
  );
  setText('tm-stat-leave', team.filter(e => e.st === 'on-leave' || leaveCovering(e.code)).length);
  const pend = team.flatMap(e => pendingOf(e.code));
  setText('tm-stat-pend', pend.length);

  const grid = document.getElementById('tm-grid');
  if (grid) {
    grid.innerHTML =
      '<div class="row col-3">' +
      team
        .map(e => {
          const title = currentLang() === 'ar' ? e.titleAr || e.titleEn : e.titleEn;
          const p = pendingOf(e.code).length;
          return `<div class="card"><div class="card-body">
        <div class="hr-360-top">
          <div class="cell-avatar" style="width:40px;height:40px;font-size:14px;background:${AV[e.av] || 'var(--avatar-teal)'};color:#fff">${initialsOf(e.nameEn)}</div>
          <div style="flex:1;min-width:0">
            <div class="cell-strong"><a href="hr_employee.html?code=${e.code}">${empName(e)}</a></div>
            <div style="font-size:11.5px;color:var(--text-muted)">${e.code} · ${title || e.dept}</div>
          </div>
        </div>
        <div style="display:flex;gap:6px;margin-top:10px;flex-wrap:wrap">${statusChip(e)}
        ${p ? `<a class="status status-yellow" href="hr_approvals.html" style="text-decoration:none">${p} ${L('pending', 'معلقة')}</a>` : ''}</div>
      </div></div>`;
        })
        .join('') +
      '</div>';
  }
  const pl = document.getElementById('tm-pend');
  if (pl) {
    pl.innerHTML = pend.length
      ? pend
          .map(r => {
            const e = getSeed('employees').find(x => x.code === r.emp);
            return `<div class="hr-kv"><span><a href="hr_employee.html?code=${r.emp}">${e ? empName(e) : r.emp}</a> · ${r.type} · <span dir="ltr">${r.from} → ${r.to}</span></span>
        <strong><a class="btn btn-outline btn-sm" href="hr_approvals.html">${L('Review', 'مراجعة')}</a></strong></div>`;
          })
          .join('')
      : `<div class="hr-empty">${L('No pending requests for this team.', 'لا طلبات معلقة لهذا الفريق.')}</div>`;
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
