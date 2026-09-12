// Role gateway (landing.html) — the honest entry point.
// No passwords on-device: the user picks a role, we remember it via
// setViewedRole() and route to the right start page. Real auth (device PIN,
// SSO, backend sessions) plugs into enterAs() later — see PHASE-2 notes.
//
// Upgrade path (day by day):
//   1. Device PIN: gate enterAs() behind a locally-stored PIN pad.
//   2. SSO: replace role cards with provider buttons; map claims -> roles.
//   3. Backend: exchange the session at /api/auth/*, keep role as fallback.

import { t, currentLang, setLang, LANG_EVENT, applyI18n, isSafeMediaUrl } from './i18n.js';
import { getSettings } from './hr-statutory.js';
import { ROLES } from './hr-seed.js';
import { ROLE_MODULES, roleScopes, setViewedRole } from './roles.js';
import { escapeHtml as esc } from './markup.js';

let booted = false;

const START_PAGE = {
  employee: 'hr_my_space.html',
  manager: 'hr_my_team.html'
};

function moduleCount(code) {
  const allow = (roleScopes() || {})[code];
  if (!allow) {
    return 0;
  }
  if (allow.includes('*')) {
    return ROLE_MODULES.reduce((s, g) => s + g.pages.length, 0);
  }
  return allow.length;
}

export function enterAs(code) {
  setViewedRole(code);
  window.location.assign(START_PAGE[code] || 'hr_dashboard.html');
}

function renderBrand() {
  const s = getSettings();
  const nameEl = document.getElementById('gw-name');
  if (nameEl) {
    const nm = currentLang() === 'ar' ? s.company.nameAr || s.company.nameEn : s.company.nameEn;
    nameEl.textContent = nm;
  }
  const logoEl = document.getElementById('gw-logo');
  if (logoEl) {
    logoEl.innerHTML = '';
    if (s.company.logo && isSafeMediaUrl(s.company.logo)) {
      const img = document.createElement('img');
      img.src = s.company.logo;
      img.alt = '';
      img.style.cssText = 'width:100%;height:100%;object-fit:contain';
      logoEl.appendChild(img);
    } else {
      logoEl.textContent = (s.company.nameEn || 'D').trim().charAt(0);
    }
  }
}

function renderCards() {
  const grid = document.getElementById('gw-roles');
  if (!grid) {
    return;
  }
  const ar = currentLang() === 'ar';
  grid.innerHTML = ROLES.map(r => {
    const first = ar ? r.ar : r.en;
    const second = ar ? r.en : r.ar;
    return `<button type="button" class="gw-card" data-role="${esc(r.code)}">
      <span class="gw-avatar">${esc(first.trim().charAt(0))}</span>
      <span class="gw-meta"><strong>${esc(first)}</strong><small>${esc(second)}</small></span>
      <span class="gw-count" dir="ltr">${moduleCount(r.code)} ${esc(t('common.gatewayModules'))}</span>
    </button>`;
  }).join('');
  grid.querySelectorAll('[data-role]').forEach(btn => {
    btn.addEventListener('click', () => enterAs(btn.dataset.role));
  });
}

function renderLang() {
  const box = document.getElementById('gw-lang');
  if (!box) {
    return;
  }
  box.innerHTML = `<button type="button" class="btn btn-ghost btn-sm" data-lang="en">EN</button>
    <button type="button" class="btn btn-ghost btn-sm" data-lang="ar">عربي</button>`;
  box.querySelectorAll('[data-lang]').forEach(b => {
    if (b.dataset.lang === currentLang()) {
      b.classList.add('btn-primary');
      b.classList.remove('btn-ghost');
    }
    b.addEventListener('click', () => setLang(b.dataset.lang));
  });
}

function renderAll() {
  renderBrand();
  renderCards();
  renderLang();
  applyI18n(document.querySelector('[data-gateway]') || document);
}

export function initGateway() {
  const root = document.querySelector('[data-gateway]');
  if (!root) {
    return;
  }
  renderAll();
  if (booted) {
    return;
  }
  booted = true;
  window.addEventListener(LANG_EVENT, renderAll);
}
