// HRGO — settings engine (settings.html).
// Four sections bound straight to the statutory settings store
// (getSettings/saveSettings): company profile, Saudization & licence,
// role preview, preferences. Vanilla + idempotent: render() rebuilds all
// bodies from the store, one delegated change/click listener persists.

import { t, currentLang, setLang, LANG_EVENT, applyI18n } from './i18n.js';
import { getSettings, saveSettings } from './hr-statutory.js';
import { getSeed } from './hr-api.js';
import { viewedRole, setViewedRole } from './roles.js';
import { showToast } from './toast.js';
import { showModal } from './modal.js';
import { escapeHtml as esc } from './markup.js';

let booted = false;
let saveTimer = 0;

function setPath(obj, path, value) {
  const parts = path.split('.');
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const k = parts[i];
    cur[k] = cur[k] ?? (/^\d+$/.test(parts[i + 1]) ? [] : {});
    cur = cur[k];
  }
  cur[parts[parts.length - 1]] = value;
}

function persist(path, value) {
  const patch = {};
  setPath(patch, path, value);
  saveSettings(patch);
  window.clearTimeout(saveTimer);
  saveTimer = window.setTimeout(() => showToast(t('st.saved'), { variant: 'success' }), 600);
}

function field(label, inner, hint = '') {
  return `<label class="set-field"><span class="set-label">${label}</span>${inner}${
    hint ? `<span class="caption-muted">${hint}</span>` : ''
  }</label>`;
}

function input(path, value, attrs = '') {
  return `<input class="form-control" data-set="${path}" value="${esc(value ?? '')}" ${attrs}>`;
}

function renderGeneral(s) {
  const c = (s.companies && s.companies[0]) || {};
  const el = document.getElementById('set-general');
  if (!el) {
    return;
  }
  el.innerHTML =
    '<div class="set-grid">' +
    field(t('st.coNameEn'), input('companies.0.nameEn', c.nameEn)) +
    field(t('st.coNameAr'), input('companies.0.nameAr', c.nameAr, 'dir="auto"')) +
    field(t('st.cr'), input('companies.0.cr', c.cr, 'dir="ltr" inputmode="numeric"')) +
    field(t('st.vat'), input('companies.0.vat', c.vat, 'dir="ltr" inputmode="numeric"')) +
    field(t('st.phone'), input('companies.0.phone', c.phone, 'dir="ltr" type="tel"')) +
    field(t('st.address'), input('companies.0.address', c.address, 'dir="auto"')) +
    field(
      t('st.language'),
      '<select class="form-control" data-set="language">' +
        `<option value="en"${s.language === 'en' ? ' selected' : ''}>English</option>` +
        `<option value="ar"${s.language === 'ar' ? ' selected' : ''}>العربية</option>` +
        '</select>'
    ) +
    '</div>';
}

function renderNitaqat(s) {
  const el = document.getElementById('set-nitaqat');
  if (!el) {
    return;
  }
  const n = s.nitaqat || {};
  const lic = s.licence || {};
  el.innerHTML =
    '<div class="set-grid">' +
    field(
      t('st.target'),
      `<input class="form-control" data-set="nitaqat.target" type="number" min="0" max="100" step="1" value="${esc(
        n.target ?? ''
      )}" dir="ltr">`
    ) +
    field(t('st.activity'), `<div class="form-static">${esc(n.activity || '—')}</div>`) +
    field(t('st.size'), `<div class="form-static">${esc(n.size || '—')}</div>`) +
    field(t('st.licScope'), `<div class="form-static">${esc(lic.scope || '—')}</div>`) +
    '</div>' +
    '<div class="set-row">' +
    `<div class="toggle${lic.confirmed ? ' on' : ''}" data-set="licence.confirmed" data-bool="1" role="switch" tabindex="0" aria-checked="${lic.confirmed ? 'true' : 'false'}" aria-label="${esc(t('st.licConfirm'))}"></div>` +
    `<div><div class="set-label">${t('st.licConfirm')}</div><div class="caption-muted">${t('st.licConfirmD')}</div></div>` +
    '</div>';
}

function renderPerms() {
  const el = document.getElementById('set-perms');
  if (!el) {
    return;
  }
  const roles = getSeed('roles');
  el.innerHTML =
    '<div class="set-grid">' +
    field(
      t('st.previewAs'),
      '<select class="form-control" id="set-role-preview">' +
        roles
          .map(
            r =>
              `<option value="${esc(r.code)}"${r.code === viewedRole() ? ' selected' : ''}>${esc(currentLang() === 'ar' ? r.ar || r.en : r.en)}</option>`
          )
          .join('') +
        '</select>'
    ) +
    '</div>';
}

function renderPrefs() {
  const el = document.getElementById('set-prefs');
  if (!el) {
    return;
  }
  const theme = document.documentElement.getAttribute('data-theme') || 'dark';
  el.innerHTML =
    '<div class="set-grid">' +
    field(
      t('st.theme'),
      `<div class="btn-group" data-group="theme" role="group" aria-label="${esc(t('st.theme'))}">` +
        `<button type="button" class="btn${theme === 'light' ? ' active' : ''}" data-theme-pick="light" aria-pressed="${theme === 'light'}">${t('st.themeLight')}</button>` +
        `<button type="button" class="btn${theme === 'dark' ? ' active' : ''}" data-theme-pick="dark" aria-pressed="${theme === 'dark'}">${t('st.themeDark')}</button>` +
        '</div>'
    ) +
    '</div>' +
    '<div class="set-row set-danger">' +
    `<div><div class="set-label">${t('st.reset')}</div><div class="caption-muted">${t('st.resetD')}</div></div>` +
    `<button type="button" class="btn btn-outline" id="set-reset">${t('st.reset')}</button>` +
    '</div>';
}

function applyTheme(next) {
  document.documentElement.setAttribute('data-theme', next);
  document.documentElement.style.background = next === 'dark' ? '#111111' : '#f5f7fb';
  try {
    localStorage.setItem('theme', next);
  } catch (_e) {
    /* private mode */
  }
}

function renderAll() {
  const root = document.querySelector('[data-hr-settings]');
  if (!root) {
    return;
  }
  const s = getSettings();
  renderGeneral(s);
  renderNitaqat(s);
  renderPerms();
  renderPrefs();
  applyI18n(root);
}

function markNav(hash) {
  document.querySelectorAll('#set-nav .settings-nav-link').forEach(a => {
    a.classList.toggle('active', a.getAttribute('href') === hash);
  });
}

function resetWorkspace() {
  showModal({
    title: t('st.reset'),
    size: 'sm',
    body: `<p style="font-size:13px;color:var(--text-secondary);line-height:1.6;margin:0">${esc(t('st.resetD'))}</p>`,
    actions: [
      { label: t('common.cancel'), variant: 'ghost' },
      {
        label: t('st.reset'),
        variant: 'primary',
        action: () => {
          try {
            const drop = [];
            for (let i = 0; i < localStorage.length; i++) {
              const k = localStorage.key(i);
              if (k && k.startsWith('hr:')) {
                drop.push(k);
              }
            }
            drop.forEach(k => localStorage.removeItem(k));
          } catch (_e) {
            /* private mode */
          }
          window.location.reload();
        }
      }
    ]
  });
}

export function initSettings() {
  const root = document.querySelector('[data-hr-settings]');
  if (!root) {
    return;
  }
  renderAll();
  // Bindings live on the elements themselves (not the module flag) so a
  // re-mounted document (or a second init call) wires the live tree exactly
  // once — InitX() stays safe to call twice.
  if (!root.dataset.bound) {
    root.dataset.bound = '1';

    root.addEventListener('change', e => {
      const el = e.target.closest('[data-set]');
      if (!el) {
        return;
      }
      const path = el.getAttribute('data-set');
      let value;
      if (el.getAttribute('data-bool') === '1') {
        return; // toggles persist on click below
      } else if (el.type === 'number') {
        value = el.value === '' ? '' : Number(el.value);
      } else {
        value = el.value;
      }
      persist(path, value);
      if (path === 'language') {
        setLang(value);
      }
    });

    // Toggles flip their own .on class first (global delegation in main-v4
    // runs before this listener); persist the resulting state here.
    root.addEventListener('click', e => {
      const tog = e.target.closest('.toggle[data-set]');
      if (tog && tog.getAttribute('data-bool') === '1') {
        window.setTimeout(() => {
          const on = tog.classList.contains('on');
          tog.setAttribute('aria-checked', on ? 'true' : 'false');
          persist(tog.getAttribute('data-set'), on);
        }, 0);
        return;
      }
      const pick = e.target.closest('[data-theme-pick]');
      if (pick) {
        applyTheme(pick.getAttribute('data-theme-pick'));
        renderPrefs();
        applyI18n(root);
        return;
      }
      if (e.target.closest('#set-reset')) {
        resetWorkspace();
      }
    });

    root.addEventListener('keydown', e => {
      const tog = e.target.closest('.toggle[data-set]');
      if (tog && (e.key === 'Enter' || e.key === ' ')) {
        e.preventDefault();
        tog.click();
      }
    });

    root.addEventListener('change', e => {
      if (e.target.id === 'set-role-preview') {
        setViewedRole(e.target.value);
        showToast(t('st.saved'), { variant: 'success' });
      }
    });
  } // end root bindings (guarded by root.dataset.bound above)

  const nav = document.getElementById('set-nav');
  if (nav && !nav.dataset.bound) {
    nav.dataset.bound = '1';
    markNav(window.location.hash || '#sec-general');
    nav.addEventListener('click', e => {
      const a = e.target.closest('.settings-nav-link');
      if (a) {
        markNav(a.getAttribute('href'));
      }
    });
  }
  if (!booted) {
    booted = true;
    window.addEventListener(LANG_EVENT, renderAll);
  }
}
