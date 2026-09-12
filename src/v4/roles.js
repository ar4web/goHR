// HR + Operations — roles & access (hr_roles.html).
// UX-only permission matrix: it drives which sidebar items are shown in
// this demo client. The server ALWAYS re-checks permissions — never trust
// client-side hiding as a security boundary.

import { showToast } from './toast.js';
import { t, currentLang, LANG_EVENT, applyI18n } from './i18n.js';
import { getSeed } from './hr-api.js';
import { getSettings, saveSettings } from './hr-statutory.js';
import { logAudit } from './hr-audit.js';

let booted = false;
const VIEW_KEY = 'hr:role-view';

function L(en, ar) {
  return currentLang() === 'ar' ? ar : en;
}

// Sidebar page keys grouped the way the nav renders them.
export const ROLE_MODULES = [
  {
    group: 'hr.navgroup.overview',
    pages: ['hr-dashboard', 'hr-reports']
  },
  {
    group: 'hr.navgroup.people',
    pages: ['hr-employees', 'hr-onboarding', 'hr-org', 'hr-tracker', 'hr-documents', 'hr-my-team']
  },
  {
    group: 'hr.navgroup.compliance',
    pages: ['hr-sa-compliance', 'hr-visas', 'hr-residency', 'hr-contracts']
  },
  {
    group: 'hr.navgroup.time',
    pages: ['hr-attendance', 'hr-timesheets', 'hr-leave', 'hr-leave-calendar', 'hr-approvals']
  },
  {
    group: 'hr.navgroup.operations',
    pages: ['hr-clients', 'hr-requests', 'hr-assignments', 'hr-ajeer']
  },
  {
    group: 'hr.navgroup.employee',
    pages: ['hr-payroll', 'hr-gosi', 'hr-wps', 'hr-eosb']
  },
  {
    group: 'hr.navgroup.accounts',
    pages: ['hr-invoices', 'hr-expenses']
  },
  {
    group: 'hr.navgroup.hiring',
    pages: ['hr-jobs', 'hr-candidates', 'hr-pipeline', 'hr-interviews', 'hr-offers']
  },
  {
    group: 'hr.navgroup.growth',
    pages: ['hr-goals', 'hr-reviews', 'hr-feedback', 'hr-trainings', 'hr-announcements']
  },
  {
    group: 'hr.navgroup.portals',
    pages: ['hr-my-space', 'hr-client']
  },
  {
    group: 'hr.navgroup.settings',
    pages: [
      'hr-settings',
      'hr-departments',
      'hr-roles',
      'hr-templates',
      'hr-holidays',
      'hr-shifts',
      'hr-audit'
    ]
  }
];

export function roleScopes() {
  const s = getSettings();
  const base = getSeed('roleScopes') || {};
  return { ...base, ...(s.roles?.scopes || {}) };
}

export function viewedRole() {
  try {
    return localStorage.getItem(VIEW_KEY) || 'admin';
  } catch (_e) {
    return 'admin';
  }
}

/** Gateway entry: remember the chosen role (honest preview, not auth). */
export function setViewedRole(role) {
  try {
    localStorage.setItem(VIEW_KEY, role);
  } catch (_e) {
    /* private mode */
  }
}

// Sidebar ask: can this page key be shown for the preview role?
export function canShow(page) {
  const scopes = roleScopes();
  const allow = scopes[viewedRole()];
  if (!allow) {
    return true;
  }
  return allow.includes('*') || allow.includes(page);
}

function renderAll() {
  const set = (id, v) => {
    const el = document.getElementById(id);
    if (el) {
      el.textContent = v;
    }
  };
  const roles = getSeed('roles');
  set('ro-stat-total', String(roles.length));
  const scopes = roleScopes();
  set('ro-stat-custom', String(Object.keys(getSettings().roles?.scopes || {}).length));
  set('ro-stat-view', roles.find(r => r.code === viewedRole())?.label || viewedRole());
  const sel = document.getElementById('ro-preview');
  if (sel && !sel.options.length) {
    sel.innerHTML = roles.map(r => `<option value="${r.code}">${r.label}</option>`).join('');
    sel.value = viewedRole();
  } else if (sel) {
    sel.value = viewedRole();
  }
  const el = document.getElementById('ro-matrix');
  if (el) {
    const allPages = ROLE_MODULES.flatMap(g => g.pages);
    el.innerHTML = `<thead><tr><th>${L('Role', 'الدور')}</th>${allPages.map(p => `<th dir="ltr">${L(t(`nav.${p}`), t(`nav.${p}`))}</th>`).join('')}</tr></thead><tbody>${roles
      .map(r => {
        const allow = scopes[r.code] || [];
        const star = allow.includes('*');
        return `<tr><td data-label="${L('Role', 'الدور')}"><strong>${r.label}</strong>
          <div style="font-size:11.5px;color:var(--text-muted)">${r.code}</div></td>${allPages
            .map(p => {
              const on = star || allow.includes(p);
              return `<td data-label="${p}" dir="ltr"><input type="checkbox" data-role="${r.code}" data-page="${p}"${on ? ' checked' : ''}${r.code === 'admin' ? ' disabled' : ''} aria-label="${r.code} ${p}"></td>`;
            })
            .join('')}</tr>`;
      })
      .join('')}</tbody>`;
  }
  applyI18n(document.querySelector('[data-hr-roles]') || document);
}

export function initRoles() {
  const root = document.querySelector('[data-hr-roles]');
  if (!root) {
    return;
  }
  renderAll();
  if (booted) {
    return;
  }
  booted = true;
  document.getElementById('ro-preview')?.addEventListener('change', e => {
    try {
      localStorage.setItem(VIEW_KEY, e.target.value);
    } catch (_e) {
      /* ignore */
    }
    logAudit('role.preview', e.target.value, 'sidebar preview');
    renderAll();
    showToast(
      L(
        'Sidebar preview updated — reload to see it',
        'حُدّثت معاينة القائمة — أعد التحميل لرؤيتها'
      ),
      { variant: 'success' }
    );
  });
  document.getElementById('ro-save')?.addEventListener('click', () => {
    const scopes = {};
    for (const box of document.querySelectorAll('#ro-matrix [data-role]')) {
      const r = box.dataset.role;
      if (r === 'admin') {
        continue;
      }
      scopes[r] = scopes[r] || [];
      if (box.checked) {
        scopes[r].push(box.dataset.page);
      }
    }
    saveSettings({ roles: { scopes } });
    logAudit('role.update', 'matrix', `${Object.keys(scopes).length} roles`);
    renderAll();
    showToast(L('Permissions saved', 'حُفظت الصلاحيات'), { variant: 'success' });
  });
  document.getElementById('ro-reset')?.addEventListener('click', () => {
    saveSettings({ roles: { scopes: {} } });
    logAudit('role.reset', 'matrix', 'defaults restored');
    renderAll();
    showToast(L('Restored defaults', 'عادت الافتراضيات'), { variant: 'success' });
  });
  window.addEventListener(LANG_EVENT, renderAll);
}
