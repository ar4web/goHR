// goHR — topbar + sidebar chrome wiring.
//
// Topbar (right cluster, far-right → left as built LTR):
//   user profile · messages · language · notifications · theme · search bar
// Sidebar:
//   settings gear pinned to the bottom-left corner.
//
// Panels reuse the generic popover system in menus.js (openPanel). Notifications
// are derived live from the roster (huroob, iqama expiry, Qiwa drafts); the
// message inbox is lightweight demo data. All visible strings pass through t()
// so the language toggle translates the chrome at open time.

import { openPanel, closeMenu } from './menus.js';
import { openCommandPalette } from './command-palette.js';
import { setLang, currentLang, t, LANG_EVENT } from './i18n.js';
import { setTheme, getTheme, THEMES } from './theme.js';
import { getSeed } from './hr-api.js';
import { daysUntil } from './hr-statutory.js';
import { showToast } from './toast.js';
import { escapeHtml as esc } from './markup.js';

// ── Inline icon set (16–18px, currentColor) ───────────────────────────────
const ICON = {
  alert:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><path d="M12 7.5v5M12 16.2h.01"/></svg>',
  warn:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><path d="M12 7.5V12l3 2"/></svg>',
  info:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h6"/></svg>',
  ok:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M22 11.1V12a10 10 0 1 1-5.9-9.1"/><path d="M22 4L12 14l-3-3"/></svg>',
  moon:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z"/></svg>',
  sun:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2.2M12 19.3v2.2M4.6 4.6l1.6 1.6M17.8 17.8l1.6 1.6M2.5 12h2.2M19.3 12h2.2M4.6 19.4l1.6-1.6M17.8 6.2l1.6-1.6"/></svg>',
  globe:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>'
};

// Session read-state (kept light deliberately; no backend inbox).
const INITIALLY_READ = new Set(['gosi']);
const state = { notifsRead: false, msgsRead: new Set(INITIALLY_READ) };

function nameOf(e) {
  const ar = currentLang() === 'ar';
  return ar ? e.nameAr || e.nameEn : e.nameEn;
}

// Roster-derived alerts — same source of truth as the Employees ticker.
function collectAlerts() {
  const out = [];
  const emps = getSeed('employees') || [];
  const push = (tone, icon, e, line, time) =>
    out.push({ tone, icon, name: nameOf(e), line, time, goto: 'analytics.html' });

  emps.forEach(e => {
    if (e.st === 'huroob') {
      push('alert', 'alert', e, t('notif.huroob'), t('notif.today'));
    }
    if (!e.saudi && e.iqamaExp) {
      const d = daysUntil(e.iqamaExp);
      if (d < 0) {
        push('alert', 'alert', e, t('notif.iqamaExpired'), `${-d}${t('notif.dayShort')}`);
      } else if (d <= 30) {
        push('warn', 'warn', e, t('notif.iqamaExpiring'), `${d}${t('notif.dayShort')}`);
      }
    }
    if (e.q === 'draft') {
      push('info', 'info', e, t('notif.qiwaDraft'), t('notif.today'));
    }
  });
  const rank = { alert: 0, warn: 1, info: 2 };
  return out.sort((a, b) => rank[a.tone] - rank[b.tone]);
}

function buildPanelRow(al) {
  const row = document.createElement('button');
  row.type = 'button';
  row.className = 'panel-row unread';
  row.innerHTML = `
    <span class="panel-icon panel-icon-${al.tone}">${ICON[al.icon] || ICON.info}</span>
    <span class="panel-body">
      <span class="panel-from">${esc(al.name)}</span>
      <span class="panel-text">${esc(al.line)}</span>
    </span>
    <span class="panel-time">${esc(al.time || '')}</span>`;
  if (al.goto) {
    row.addEventListener('click', () => {
      closeMenu();
      window.location.href = al.goto;
    });
  }
  return row;
}

// ── Notifications panel ───────────────────────────────────────────────────
function buildNotificationsPanel() {
  const alerts = collectAlerts();
  const shown = alerts.slice(0, 6);
  const root = document.createElement('div');
  root.className = 'panel-content';
  root.innerHTML = `
    <div class="panel-header">
      <span class="panel-title">${esc(t('nav.notifications'))}</span>
      ${alerts.length && !state.notifsRead ? `<span class="panel-badge">${alerts.length}</span>` : ''}
      <button class="panel-action" type="button" data-mark-read>${esc(t('common.markAllRead'))}</button>
    </div>
    <div class="panel-list"></div>
    <div class="panel-footer"><a class="panel-link" href="analytics.html">${esc(t('common.viewAllNotif'))}</a></div>`;
  const list = root.querySelector('.panel-list');
  if (state.notifsRead || !shown.length) {
    list.innerHTML = `<div class="panel-empty">${esc(t('common.emptyInbox'))}</div>`;
  } else {
    shown.forEach(a => list.appendChild(buildPanelRow(a)));
  }
  root.querySelector('[data-mark-read]').addEventListener('click', e => {
    e.stopPropagation();
    state.notifsRead = true;
    updateBadges();
    list.innerHTML = `<div class="panel-empty">${esc(t('common.emptyInbox'))}</div>`;
    const badge = root.querySelector('.panel-badge');
    if (badge) {badge.remove();}
  });
  root.querySelector('.panel-link')?.addEventListener('click', () => closeMenu());
  return root;
}

// ── Messages panel ────────────────────────────────────────────────────────
function demoMessages() {
  return [
    { id: 'rec', tone: 'task', icon: 'info', from: t('msg.rec'), body: t('msg.recBody'), time: '2m', unread: !state.msgsRead.has('rec') },
    { id: 'pay', tone: 'info', icon: 'ok', from: t('msg.pay'), body: t('msg.payBody'), time: '1h', unread: !state.msgsRead.has('pay') },
    { id: 'gosi', tone: 'ok', icon: 'ok', from: t('msg.gosi'), body: t('msg.gosiBody'), time: '3h', unread: !state.msgsRead.has('gosi') }
  ];
}

function buildMessagesPanel() {
  const msgs = demoMessages();
  const root = document.createElement('div');
  root.className = 'panel-content';
  root.innerHTML = `
    <div class="panel-header">
      <span class="panel-title">${esc(t('common.messages'))}</span>
      <span class="panel-badge" id="msg-panel-badge"></span>
      <button class="panel-action" type="button" data-mark-read>${esc(t('common.markAllRead'))}</button>
    </div>
    <div class="panel-list"></div>`;
  const list = root.querySelector('.panel-list');
  const unreadCount = () => msgs.filter(m => m.unread && !state.msgsRead.has(m.id)).length;
  const badge = root.querySelector('#msg-panel-badge');
  const refreshBadge = () => {
    const n = unreadCount();
    badge.textContent = n ? String(n) : '';
    badge.style.display = n ? '' : 'none';
  };
  refreshBadge();
  msgs.forEach(m => {
    const row = document.createElement('button');
    row.type = 'button';
    row.className = `panel-row${m.unread ? ' unread' : ''}`;
    row.innerHTML = `
      <span class="panel-icon panel-icon-${m.tone}">${ICON[m.icon]}</span>
      <span class="panel-body">
        <span class="panel-from">${esc(m.from)}</span>
        <span class="panel-text">${esc(m.body)}</span>
      </span>
      <span class="panel-time">${esc(m.time)}</span>`;
    row.addEventListener('click', () => {
      state.msgsRead.add(m.id);
      m.unread = false;
      row.classList.remove('unread');
      updateBadges();
      refreshBadge();
    });
    list.appendChild(row);
  });
  root.querySelector('[data-mark-read]').addEventListener('click', e => {
    e.stopPropagation();
    msgs.forEach(m => {m.unread = false; state.msgsRead.add(m.id);});
    list.querySelectorAll('.panel-row.unread').forEach(r => r.classList.remove('unread'));
    updateBadges();
    refreshBadge();
  });
  return root;
}

// ── User profile panel ────────────────────────────────────────────────────
function buildUserPanel() {
  const root = document.createElement('div');
  root.className = 'panel-content user-panel';
  root.innerHTML = `
    <div class="user-panel-head">
      <span class="user-panel-avatar">HA</span>
      <span class="user-panel-id">
        <strong>HR Admin</strong>
        <span>admin@gohr.app</span>
        <span class="user-panel-role">${esc(t('profile.role'))}</span>
      </span>
    </div>
    <button class="menu-item" type="button" data-pref>${esc(t('common.preferences'))}</button>
    <a class="menu-item" href="employees.html">${esc(t('common.employeeDirectory'))}</a>
    <div class="menu-separator"></div>
    <button class="menu-item menu-item-danger" type="button" data-signout>${esc(t('common.signOut'))}</button>`;
  root.querySelector('[data-pref]').addEventListener('click', () => {
    closeMenu();
    const gear = document.getElementById('sidebar-settings');
    if (gear) {openSettingsPanel(gear);}
  });
  root.querySelector('a.menu-item').addEventListener('click', () => closeMenu());
  root.querySelector('[data-signout]').addEventListener('click', () => {
    closeMenu();
    showToast(t('common.signedOut'));
  });
  return root;
}

// ── Sidebar settings panel (bottom-left gear) ─────────────────────────────
export function openSettingsPanel(trigger) {
  const ar = currentLang() === 'ar';
  const dark = getTheme() === THEMES.DARK;
  const root = document.createElement('div');
  root.className = 'panel-content';
  root.innerHTML = `
    <div class="panel-header">
      <span class="panel-title">${esc(t('nav.settings'))}</span>
    </div>
    <button class="panel-row" type="button" data-theme-row>
      <span class="panel-icon panel-icon-task">${dark ? ICON.sun : ICON.moon}</span>
      <span class="panel-body">
        <span class="panel-from">${esc(t('common.appearance'))}</span>
        <span class="panel-text" data-theme-state>${esc(dark ? t('st.themeDark') : t('st.themeLight'))}</span>
      </span>
    </button>
    <button class="panel-row" type="button" data-lang-row>
      <span class="panel-icon panel-icon-info">${ICON.globe}</span>
      <span class="panel-body">
        <span class="panel-from">${esc(t('common.language'))}</span>
        <span class="panel-text" data-lang-state>${ar ? 'العربية' : 'English'}</span>
      </span>
    </button>`;
  root.querySelector('[data-theme-row]').addEventListener('click', () => {
    const next = dark ? THEMES.LIGHT : THEMES.DARK;
    setTheme(next);
    closeMenu();
    showToast(next === THEMES.DARK ? t('st.themeDark') : t('st.themeLight'));
  });
  root.querySelector('[data-lang-row]').addEventListener('click', () => {
    setLang(ar ? 'en' : 'ar');
    closeMenu();
  });
  openPanel(trigger, root, { width: 300 });
}

// ── Badges + translated chrome labels ─────────────────────────────────────
function setDot(id, n) {
  const dot = document.getElementById(id);
  if (!dot) {return;}
  dot.hidden = !(n > 0);
  const label = dot.querySelector('span');
  if (label) {label.textContent = n > 9 ? '9+' : String(n);}
}

function updateBadges() {
  const notifN = state.notifsRead ? 0 : collectAlerts().length;
  const msgN = demoMessages().filter(m => m.unread).length;
  setDot('topbar-notif-badge', notifN);
  setDot('topbar-msg-badge', msgN);
}

function updateChromeStrings() {
  const ar = currentLang() === 'ar';
  const setLabel = (id, key) => {
    const el = document.getElementById(id);
    if (el) {el.setAttribute('aria-label', t(key));}
  };
  setLabel('topbar-search', 'common.searchPh');
  setLabel('topbar-notifications', 'nav.notifications');
  setLabel('topbar-messages', 'common.messages');
  setLabel('lang-toggle', 'common.language');
  setLabel('topbar-user', 'nav.profile');
  setLabel('sidebar-settings', 'nav.settings');
  const langLabel = document.getElementById('topbar-lang-label');
  if (langLabel) {langLabel.textContent = ar ? 'ع' : 'EN';}
  const role = document.getElementById('topbar-user-role');
  if (role) {role.textContent = t('profile.role');}
}

// ── Boot ──────────────────────────────────────────────────────────────────
export function initShellChrome() {
  if (document.body.dataset.shellChromeBound) {return;}
  document.body.dataset.shellChromeBound = '1';

  document.getElementById('topbar-search')?.addEventListener('click', () => {
    openCommandPalette();
  });
  document.getElementById('topbar-notifications')?.addEventListener('click', e => {
    e.stopPropagation();
    openPanel(e.currentTarget, buildNotificationsPanel(), { width: 360 });
  });
  document.getElementById('topbar-messages')?.addEventListener('click', e => {
    e.stopPropagation();
    openPanel(e.currentTarget, buildMessagesPanel(), { width: 360 });
  });
  document.getElementById('topbar-user')?.addEventListener('click', e => {
    e.stopPropagation();
    openPanel(e.currentTarget, buildUserPanel(), { width: 280 });
  });
  document.getElementById('sidebar-settings')?.addEventListener('click', e => {
    e.stopPropagation();
    openSettingsPanel(e.currentTarget);
  });

  updateBadges();
  updateChromeStrings();
  window.addEventListener(LANG_EVENT, updateChromeStrings);
}
