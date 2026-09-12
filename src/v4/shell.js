// Dash — runtime shell mount
// At build/dev time the Vite plugin (vite.config.js) injects sidebar/topbar/
// footer directly into each production/*.html. mountShell() is the runtime
// fallback: if the shell isn't already in the DOM (e.g. opening a raw HTML
// file), render it from the same string templates. Either way, mountShell()
// always wires up runtime behavior (mobile drawer, theme toggle).

import { renderShell, NAV, SETTINGS_NAV } from './shell-render.js';
import { getActiveCompany, getCompanies, setActiveCompany } from './hr-statutory.js';
import { roleScopes, viewedRole } from './roles.js';
import { hrAlerts } from './hr-alerts.js';
import { t, currentLang, isSafeMediaUrl, LANG_EVENT } from './i18n.js';
import { openPanel, openMenu } from './menus.js';
import { showToast } from './toast.js';
import { showModal } from './modal.js';

function injectShellIfMissing() {
  const body = document.body;
  if (body.querySelector('.sidebar')) {return;}

  const activeKey = body.dataset.page || '';

  const { sidebar, topbar } = renderShell({ activeKey });

  const tpl = document.createElement('template');
  tpl.innerHTML = sidebar.trim();
  body.insertBefore(tpl.content.firstElementChild, body.firstChild);

  const mainEl = body.querySelector('main.main');
  tpl.innerHTML = topbar.trim();
  if (mainEl) {
    body.insertBefore(tpl.content.firstElementChild, mainEl);
  }
}

// One-time migration of pre-rebrand storage keys (gentelella:* -> dash:*).
function migrateStorageKeys() {
  const moves = [
    [localStorage, 'gentelella:sidebar-rail', RAIL_KEY]
  ];
  for (const [store, oldK, newK] of moves) {
    try {
      if (store.getItem(newK) === null) {
        const v = store.getItem(oldK);
        if (v !== null) {
          store.setItem(newK, v);
        }
      }
      store.removeItem(oldK);
    } catch (_e) {
      /* private mode */
    }
  }
  try {
    sessionStorage.removeItem('gentelella:nav-open');
    sessionStorage.removeItem('dash:nav-open');
  } catch (_e) {
    /* private mode */
  }
}

// Link prefetch — sidebar clicks load separate documents (multi-page app),
// so warm them: on hover/focus immediately, plus idle-warm the sidebar once.
// Next click then serves from cache instead of a cold load with spinners.
function bindLinkPrefetch() {
  // One document, one binding — mountShell may re-run (language switch
  // re-renders), but listeners on document would pile up.
  if (document.body.dataset.prefetchBound) {return;}
  document.body.dataset.prefetchBound = '1';
  const seen = new Set();
  const warm = (href) => {
    if (!href || seen.has(href)) {return;}
    if (!/^[a-z0-9_-]+\.html([?#].*)?$/i.test(href)) {return;}
    if (typeof fetch !== 'function') {return;}
    seen.add(href);
    try {
      fetch(href, { credentials: 'same-origin' }).catch(() => { /* offline */ });
    } catch (_e) {
      /* ignore */
    }
  };
  const fromEvent = (e) => {
    const a = e.target && e.target.closest
      && e.target.closest('a.nav-parent, a.nav-page, .settings-window a.settings-cell');
    if (a) {warm(a.getAttribute('href'));}
  };
  document.addEventListener('mouseover', fromEvent);
  document.addEventListener('focusin', fromEvent);
  const idle = window.requestIdleCallback || ((fn) => setTimeout(fn, 1500));
  idle(() => {
    // Active section pages first, then every section main screen — after
    // this, any sidebar click is a cache hit.
    document.querySelectorAll('.sidebar-nav a.nav-page[href], .sidebar-nav a.nav-parent[href]').forEach(a => warm(a.getAttribute('href')));
  });
  // Graceful exit: fade the outgoing document instead of an abrupt cut to
  // the next page's backdrop. Only when an unload really follows — downloads,
  // mail links, same-page anchors and new-tab clicks stay on the page, so a
  // veil there would strand it invisible (the white-screen bug).
  window.addEventListener('pageshow', () => document.body.classList.remove('page-leave'));
  document.addEventListener('click', (e) => {
    if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) {return;}
    const a = e.target && e.target.closest && e.target.closest('a[href]');
    if (!a) {return;}
    const href = a.getAttribute('href') || '';
    if (!href || href.startsWith('#') || href.startsWith('javascript:')) {return;}
    if (a.target === '_blank' || a.hasAttribute('download')) {return;}
    if (/^(mailto|tel|sms|blob|data):/i.test(href)) {return;}
    document.body.classList.add('page-leave');
  });
}

// Sidebar toggle — desktop collapses to a 64px rail; mobile opens a drawer.
// Same button, viewport-aware behavior. Rail state persists in localStorage.
const RAIL_KEY = 'dash:sidebar-rail';

function isDesktop() { return window.matchMedia('(min-width: 769px)').matches; }

function applyRailLabels() {
  // Sets data-rail-label on every nav-link so the CSS tooltip has text to show.
  document.querySelectorAll('.sidebar .nav-link').forEach((link) => {
    const text = link.querySelector('.nav-text')?.textContent.trim();
    if (text) {link.setAttribute('data-rail-label', text);}
  });
}

// Footer company switcher: shows the ACTIVE company (logo or initial +
// name); opens a menu with all companies + Manage. Switching reloads so
// every module recomputes against the right profile.
function bindCompanySwitcher() {
  const btn = document.querySelector('.sidebar .company-switch');
  if (!btn) {return;}
  // Paint on every mount (storage may have changed); wire once.
  const paint = () => {
    const co = getActiveCompany();
    const name = currentLang() === 'ar' ? co.nameAr || co.nameEn : co.nameEn;
    const mark = btn.querySelector('.company-mark');
    const label = btn.querySelector('.company-name');
    if (label) {label.textContent = name || '—';}
    if (mark) {
      if (co.logo && isSafeMediaUrl(co.logo)) {
        mark.innerHTML = '';
        const img = document.createElement('img');
        img.src = co.logo;
        img.alt = name || '';
        mark.appendChild(img);
      } else {
        mark.textContent = (name || 'C').trim().charAt(0);
      }
    }
  };
  paint();
  if (btn.dataset.bound) {return;}
  btn.dataset.bound = '1';
  window.addEventListener(LANG_EVENT, paint);
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    const active = getActiveCompany();
    const items = getCompanies().map(co => ({
      label: `${currentLang() === 'ar' ? co.nameAr || co.nameEn : co.nameEn}${co.id === active.id ? ' ✓' : ''}`,
      action: () => {
        if (co.id === active.id) {return;}
        setActiveCompany(co.id);
        window.location.reload();
      }
    }));
    items.push('-', {
      label: t('hr.company.manage'),
      action: () => { window.location.href = 'hr_settings.html'; }
    });
    openMenu(btn, items);
  });
}

// Footer Settings opens as a centered window (modal): three columns —
// HR Settings, Customization, System — with a filter box. Content is built
// in the current language at open time. Backdrop click / Escape / close
// button dismiss (handled by the modal primitive); picking a link navigates.
function settingsLinkLabel(it) {
  if (it.key) {
    const k = `nav.${it.key}`;
    if (t(k) !== k) {return t(k);}
  }
  return it.text;
}

function buildSettingsWindow(activeKey) {
  const wrap = document.createElement('div');
  wrap.className = 'settings-window';

  const search = document.createElement('div');
  search.className = 'settings-search';
  search.innerHTML = `
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="7" cy="7" r="5"/><path d="M11 11l3.5 3.5"/></svg>`;
  const input = document.createElement('input');
  input.type = 'search';
  input.placeholder = t('common.settingsSearch');
  input.setAttribute('aria-label', t('common.settingsSearch'));
  search.appendChild(input);

  const cols = document.createElement('div');
  cols.className = 'settings-cols';

  const cellFor = (it) => {
    const a = document.createElement('a');
    a.className = 'settings-cell';
    a.href = it.href;
    const active = it.key === activeKey;
    if (active) {
      a.classList.add('active');
      a.setAttribute('aria-current', 'page');
    }
    const label = document.createElement('span');
    label.className = 'settings-cell-label';
    label.textContent = settingsLinkLabel(it);
    a.appendChild(label);
    if (it.badge) {
      const b = document.createElement('span');
      b.className = `badge ${it.badge.cls}`;
      b.textContent = it.badge.text;
      a.appendChild(b);
    }
    return a;
  };

  for (const sec of SETTINGS_NAV) {
    const col = document.createElement('section');
    col.className = 'settings-col';
    const h = document.createElement('h3');
    h.className = 'settings-col-title';
    // Static section name in EN (e.g. "HR Settings"); translated when AR.
    h.textContent = currentLang() === 'ar' ? t(sec.i18n) : sec.section;
    col.appendChild(h);
    for (const it of sec.items) {
      if (!it.children) {
        col.appendChild(cellFor(it));
        continue;
      }
      const sub = document.createElement('h4');
      sub.className = 'settings-sub-title';
      sub.textContent = it.i18n ? t(it.i18n) : it.text;
      col.appendChild(sub);
      for (const c of it.children) {
        col.appendChild(cellFor(c));
      }
    }
    cols.appendChild(col);
  }

  const empty = document.createElement('div');
  empty.className = 'settings-empty';
  empty.textContent = t('common.noMatch');
  empty.hidden = true;

  input.addEventListener('input', () => {
    const q = input.value.trim().toLowerCase();
    let visible = 0;
    cols.querySelectorAll('.settings-col').forEach((col) => {
      let colVisible = 0;
      [...col.children].forEach((el) => {
        if (el.classList.contains('settings-sub-title')) {
          el.hidden = false;
          return;
        }
        if (!el.classList.contains('settings-cell')) {return;}
        const hit = !q || el.textContent.toLowerCase().includes(q);
        el.hidden = !hit;
        if (hit) {
          colVisible += 1;
          visible += 1;
        }
      });
      // Hide sub-headers whose following links are all hidden.
      let run = 0;
      const kids = [...col.children];
      for (let i = kids.length - 1; i >= 0; i -= 1) {
        const el = kids[i];
        if (el.classList.contains('settings-cell')) {
          if (!el.hidden) {run += 1;}
        } else if (el.classList.contains('settings-sub-title')) {
          el.hidden = run === 0 && q !== '';
          run = 0;
        }
      }
      col.hidden = colVisible === 0;
    });
    empty.hidden = visible !== 0;
  });

  wrap.appendChild(search);
  wrap.appendChild(cols);
  wrap.appendChild(empty);
  return wrap;
}

function bindSidebarSettings() {
  const btn = document.querySelector('.sidebar .settings-toggle');
  if (!btn) {return;}
  btn.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    const activeKey = document.body.dataset.page || '';
    showModal({
      title: t('hr.navgroup.settings'),
      size: 'lg',
      body: buildSettingsWindow(activeKey)
    });
  });
}

function bindSidebarToggle() {
  const sidebar = document.querySelector('.sidebar');
  const toggle = document.querySelector('.sidebar-toggle');
  if (!sidebar || !toggle) {return;}

  let backdrop = document.querySelector('.sidebar-backdrop');
  if (!backdrop) {
    backdrop = document.createElement('div');
    backdrop.className = 'sidebar-backdrop';
    backdrop.hidden = true;
    document.body.appendChild(backdrop);
  }

  // ── Mobile drawer ──
  const drawerClose = () => {
    sidebar.classList.remove('open');
    backdrop.hidden = true;
    toggle.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('sidebar-open');
  };
  const drawerOpen = () => {
    sidebar.classList.add('open');
    backdrop.hidden = false;
    toggle.setAttribute('aria-expanded', 'true');
    document.body.classList.add('sidebar-open');
  };

  // ── Desktop rail ──
  const setRail = (on) => {
    document.body.classList.toggle('sidebar-rail', on);
    toggle.setAttribute('aria-pressed', on ? 'true' : 'false');
    toggle.setAttribute('aria-label', on ? 'Expand sidebar' : 'Collapse sidebar');
    try { localStorage.setItem(RAIL_KEY, on ? '1' : '0'); } catch (_e) { /* ignore */ }
    if (on) {applyRailLabels();}
  };

  // Restore stored rail preference (desktop only). Mobile ignores it so the
  // drawer/sidebar isn't shown rail-style on small screens.
  let stored = '0';
  try { stored = localStorage.getItem(RAIL_KEY) || '0'; } catch (_e) { /* ignore */ }
  if (stored === '1' && isDesktop()) {setRail(true);}

  toggle.addEventListener('click', () => {
    if (isDesktop()) {
      setRail(!document.body.classList.contains('sidebar-rail'));
    } else {
      sidebar.classList.contains('open') ? drawerClose() : drawerOpen();
    }
  });
  backdrop.addEventListener('click', drawerClose);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && sidebar.classList.contains('open')) {drawerClose();}
  });

  // Viewport changes: desktop ↔ mobile. Reset state coherently.
  const mq = window.matchMedia('(min-width: 769px)');
  mq.addEventListener('change', (e) => {
    if (e.matches) {
      // Now desktop — close any drawer, restore rail state.
      drawerClose();
      let v = '0';
      try { v = localStorage.getItem(RAIL_KEY) || '0'; } catch (_err) { /* ignore */ }
      setRail(v === '1');
    } else {
      // Now mobile — drop rail mode (drawer takes over).
      document.body.classList.remove('sidebar-rail');
    }
  });
}

function bindThemeToggle() {
  const btn = document.querySelector('.theme-toggle');
  if (!btn) {return;}

  const apply = (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    btn.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
  };

  // Sync aria-pressed with the theme set by the pre-paint script.
  const current = document.documentElement.getAttribute('data-theme') || 'light';
  btn.setAttribute('aria-pressed', current === 'dark' ? 'true' : 'false');

  btn.addEventListener('click', () => {
    const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    try { localStorage.setItem('theme', next); } catch (_e) { /* private mode */ }
    apply(next);
  });

  // Follow OS theme changes when the user hasn't explicitly chosen.
  const mq = window.matchMedia('(prefers-color-scheme: dark)');
  mq.addEventListener('change', (e) => {
    let stored;
    try { stored = localStorage.getItem('theme'); } catch (_e) { /* ignore */ }
    if (stored) {return;}
    apply(e.matches ? 'dark' : 'light');
  });
}

// ────────────────────────
//  TOPBAR DROPDOWNS
// ────────────────────────

const NOTIFICATIONS = [
  { kind: 'info',   from: 'Stripe',  text: 'Payment of $499.00 received', time: '2m', unread: true },
  { kind: 'task',   from: 'GitHub',  text: 'PR #248 ready for review',     time: '14m', unread: true },
  { kind: 'alert',  from: 'Linear',  text: 'GEN-128 marked as urgent',     time: '1h', unread: true },
  { kind: 'info',   from: 'Vercel',  text: 'Deployment succeeded in 28s',  time: '3h', unread: false },
  { kind: 'info',   from: 'Notion',  text: 'You were mentioned in Q2 OKRs', time: 'Yesterday', unread: false }
];

const MESSAGES = [
  { from: 'Sarah K.',     text: 'Can you take a look at the design?', initials: 'SK', color: 'var(--avatar-teal)',   time: '4m', unread: true },
  { from: 'Michael R.',   text: 'Lunch tomorrow at noon?',            initials: 'MR', color: 'var(--avatar-blue)',   time: '32m', unread: true },
  { from: 'Emily W.',     text: 'Sprint retro notes posted',          initials: 'EW', color: 'var(--avatar-purple)', time: '2h', unread: false },
  { from: 'Diego R.',     text: 'Customer feedback summary ready',    initials: 'DR', color: 'var(--avatar-yellow)', time: 'Mon', unread: false }
];

function openShortcutsModal() {
  const row = (k, label) => `<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--border-color-light);font-size:13px"><span style="color:var(--text)">${label}</span><span>${k.split('+').map((key) => `<kbd style="font-family:var(--font);font-size:11px;background:var(--bg-surface-secondary);border:1px solid var(--border-color);border-radius:3px;padding:2px 6px;margin-inline-start:3px">${key}</kbd>`).join('')}</span></div>`;
  showModal({
    title: 'Keyboard shortcuts',
    size: 'md',
    body: `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:0 24px">
        <div>
          <div style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;color:var(--text-muted);margin:4px 0 6px">Global</div>
          ${row('⌘+K', 'Open command palette')}
          ${row('⌘+/', 'This help')}
          ${row('Esc', 'Close modal / palette')}
          <div style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;color:var(--text-muted);margin:14px 0 6px">Navigation</div>
          ${row('G then D', 'Go to dashboard')}
          ${row('G then I', 'Go to inbox')}
          ${row('G then K', 'Go to kanban')}
        </div>
        <div>
          <div style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;color:var(--text-muted);margin:4px 0 6px">Inbox</div>
          ${row('J', 'Next message')}
          ${row('K', 'Previous message')}
          ${row('R', 'Reply')}
          ${row('S', 'Star message')}
          ${row('#', 'Move to trash')}
          ${row('C', 'Compose new')}
          <div style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;color:var(--text-muted);margin:14px 0 6px">Editor</div>
          ${row('⌘+B', 'Bold')}
          ${row('⌘+I', 'Italic')}
          ${row('⌘+K', 'Insert link')}
        </div>
      </div>
    `,
    actions: [{ label: 'Close', variant: 'primary' }]
  });
}

function openSignOutModal() {
  showModal({
    title: 'Sign out?',
    size: 'sm',
    body: '<p style="font-size:13px;color:var(--text-secondary);line-height:1.6;margin:0">You\'ll need to sign back in to access your dashboard. Any unsaved changes will be lost.</p>',
    actions: [
      { label: 'Cancel', variant: 'ghost' },
      {
        label: 'Sign out',
        variant: 'primary',
        action: () => {
          showToast('Signed out', { variant: 'success' });
          setTimeout(() => { window.location.href = 'login.html'; }, 600);
        }
      }
    ]
  });
}

const USER_MENU = [
  { label: 'Profile',            action: () => { window.location.href = 'profile.html'; } },
  { label: 'Account settings',   action: () => { window.location.href = 'settings.html'; } },
  { label: 'Theme generator',    action: () => { window.location.href = 'theme.html'; } },
  { label: 'Keyboard shortcuts', action: openShortcutsModal },
  '-',
  { label: 'Help & support',     action: () => { window.location.href = 'faq.html'; } },
  { label: 'Lock screen',        action: () => { window.location.href = 'lock_screen.html'; } },
  { label: 'Sign out',           action: openSignOutModal }
];

let PANEL_ITEMS = [];

function buildNotificationsPanel() {
  PANEL_ITEMS = [...hrAlerts(), ...NOTIFICATIONS];
  const unreadCount = PANEL_ITEMS.filter((n) => n.unread).length;
  const wrap = document.createElement('div');
  wrap.className = 'panel-content';
  wrap.innerHTML = `
    <div class="panel-header">
      <span class="panel-title">${t('nav.notifications')}</span>
      ${unreadCount ? `<span class="panel-badge">${unreadCount} new</span>` : ''}
      <button type="button" class="panel-action" data-action="mark-all">${t('common.markAllRead')}</button>
    </div>
    <div class="panel-list">
      ${PANEL_ITEMS.map((n, i) => `
        <button type="button" class="panel-row${n.unread ? ' unread' : ''}" data-i="${i}">
          <span class="panel-icon panel-icon-${n.kind}" aria-hidden="true">
            ${n.kind === 'alert' ? '<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M8 1l7 13H1L8 1z"/><path d="M8 6v4"/><circle cx="8" cy="12" r="0.5"/></svg>'
    : n.kind === 'task' ? '<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 8l3 3 7-7"/></svg>'
      : '<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="8" cy="8" r="6"/><path d="M8 5v3M8 11h.01"/></svg>'}
          </span>
          <span class="panel-body">
            <span class="panel-from">${n.from}</span>
            <span class="panel-text">${n.text}</span>
          </span>
          <span class="panel-time">${n.time}</span>
        </button>
      `).join('')}
    </div>
    <div class="panel-footer">
      <a href="notifications.html" class="panel-link">${t('common.viewAllNotif')}</a>
    </div>
  `;
  return wrap;
}

function buildMessagesPanel() {
  const unreadCount = MESSAGES.filter((m) => m.unread).length;
  const wrap = document.createElement('div');
  wrap.className = 'panel-content';
  wrap.innerHTML = `
    <div class="panel-header">
      <span class="panel-title">Messages</span>
      ${unreadCount ? `<span class="panel-badge">${unreadCount} new</span>` : ''}
      <a href="inbox.html" class="panel-action">Open inbox</a>
    </div>
    <div class="panel-list">
      ${MESSAGES.map((m, i) => `
        <button type="button" class="panel-row${m.unread ? ' unread' : ''}" data-i="${i}">
          <span class="panel-avatar" style="background:${m.color}">${m.initials}</span>
          <span class="panel-body">
            <span class="panel-from">${m.from}</span>
            <span class="panel-text">${m.text}</span>
          </span>
          <span class="panel-time">${m.time}</span>
        </button>
      `).join('')}
    </div>
    <div class="panel-footer">
      <a href="inbox.html" class="panel-link">View all messages</a>
    </div>
  `;
  return wrap;
}

function openNotificationDetail(n) {
  showModal({
    title: n.from,
    size: 'sm',
    body: `
      <div style="display:flex;gap:12px;align-items:flex-start;margin-bottom:14px">
        <div style="width:36px;height:36px;border-radius:8px;background:var(--${n.kind === 'alert' ? 'red' : n.kind === 'task' ? 'green' : 'blue'}-lt);color:var(--${n.kind === 'alert' ? 'red' : n.kind === 'task' ? 'green' : 'blue'});display:flex;align-items:center;justify-content:center;flex-shrink:0">
          ${n.kind === 'alert' ? '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M8 1l7 13H1L8 1z"/><path d="M8 6v4"/></svg>'
    : n.kind === 'task' ? '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 8l3 3 7-7"/></svg>'
      : '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="8" cy="8" r="6"/><path d="M8 5v3M8 11h.01"/></svg>'}
        </div>
        <div style="flex:1;min-width:0">
          <div style="font-size:13.5px;color:var(--text);line-height:1.5;margin-bottom:6px">${n.text}</div>
          <div style="font-size:11.5px;color:var(--text-muted)">${n.time}</div>
        </div>
      </div>
    `,
    actions: [
      { label: t('common.close'), variant: 'ghost' },
      { label: t('common.viewAll'), variant: 'outline', action: () => { window.location.href = 'notifications.html'; } }
    ]
  });
}

function openMessageDetail(m) {
  showModal({
    title: m.from,
    size: 'md',
    body: `
      <div style="display:flex;gap:12px;align-items:center;margin-bottom:14px;padding-bottom:12px;border-bottom:1px solid var(--border-color-light)">
        <div style="width:38px;height:38px;border-radius:50%;background:${m.color};color:white;display:flex;align-items:center;justify-content:center;font-weight:600;font-size:13px">${m.initials}</div>
        <div style="flex:1">
          <div style="font-size:13.5px;font-weight:600;color:var(--text)">${m.from}</div>
          <div style="font-size:11.5px;color:var(--text-muted)">${m.time}</div>
        </div>
      </div>
      <div style="font-size:13.5px;color:var(--text);line-height:1.6;margin-bottom:16px">${m.text}</div>
      <textarea class="form-control" rows="3" placeholder="Type a reply…" style="margin-bottom:0"></textarea>
    `,
    actions: [
      { label: 'Cancel', variant: 'ghost' },
      { label: 'Open in inbox', variant: 'outline', action: () => { window.location.href = 'inbox.html'; } },
      { label: 'Send reply', variant: 'primary', action: () => showToast('Reply sent', { variant: 'success' }) }
    ]
  });
}

function bindTopbarPanels() {
  const bell = document.querySelector('.tb-notifications');
  if (bell) {
    bell.addEventListener('click', (e) => {
      e.preventDefault(); e.stopPropagation();
      const panel = buildNotificationsPanel();
      panel.addEventListener('click', (ev) => {
        const markAll = ev.target.closest('[data-action="mark-all"]');
        if (markAll) {
          ev.stopPropagation();
          // Sticky HR alerts are live compliance state — they clear when
          // resolved, not when dismissed.
          PANEL_ITEMS.forEach((n, i) => {
            if (!n.sticky) {
              n.unread = false;
              panel.querySelector(`.panel-row[data-i="${i}"]`)?.classList.remove('unread');
            }
          });
          if (!PANEL_ITEMS.some(n => n.unread)) {
            panel.querySelector('.panel-badge')?.remove();
            bell.querySelector('.dot')?.style.setProperty('display', 'none');
          }
          showToast(t('common.allMarkedRead'), { variant: 'success' });
          return;
        }
        const row = ev.target.closest('.panel-row');
        if (row) {
          ev.stopPropagation();
          const i = parseInt(row.dataset.i, 10);
          const n = PANEL_ITEMS[i];
          row.closest('.menu-popover')?.remove();
          if (n.href) {
            window.location.href = n.href;
            return;
          }
          n.unread = false;
          row.classList.remove('unread');
          // Close the panel before opening the modal so they don't fight.
          openNotificationDetail(n);
        }
      });
      openPanel(bell, panel, { className: 'panel-notifications', width: 360 });
    });
  }

  const msg = document.querySelector('.tb-messages');
  if (msg) {
    msg.addEventListener('click', (e) => {
      e.preventDefault(); e.stopPropagation();
      const panel = buildMessagesPanel();
      panel.addEventListener('click', (ev) => {
        const row = ev.target.closest('.panel-row');
        if (row) {
          ev.stopPropagation();
          const i = parseInt(row.dataset.i, 10);
          MESSAGES[i].unread = false;
          row.classList.remove('unread');
          row.closest('.menu-popover')?.remove();
          openMessageDetail(MESSAGES[i]);
        }
      });
      openPanel(msg, panel, { className: 'panel-messages', width: 360 });
    });
  }

  const avatar = document.querySelector('.tb-avatar');
  if (avatar) {
    avatar.addEventListener('click', (e) => {
      e.preventDefault(); e.stopPropagation();
      openMenu(avatar, USER_MENU);
    });
  }
}

/**
 * Mount the admin shell (sidebar + topbar + footer + interactivity).
 *
 * Reads two `<body>` data attributes:
 * - `data-shell="admin"` — opt-in. No-op if absent.
 * - `data-page="key"` — matches a {@link import('./shell-render.js').NAV} item to highlight.
 * (data-breadcrumb attributes remain on pages for SEO meta only.)
 *
 * Idempotent: if the build-time Vite plugin already injected the shell HTML
 * (the common case), this only wires up runtime behavior — mobile drawer,
 * theme toggle, notifications/messages/avatar dropdowns.
 */
export function mountShell() {
  const body = document.body;
  if (body.dataset.shell !== 'admin') {return;}

  injectShellIfMissing();
  migrateStorageKeys();
  bindLinkPrefetch();
  bindCompanySwitcher();
  bindSidebarSettings();
  bindSidebarToggle();
  bindThemeToggle();
  bindTopbarPanels();
  applyRolePreview();
}

// "View sidebar as" preview (hr_roles.html): hide HR leaves the selected
// role may not see. Display-only — the server enforces real permissions.
function applyRolePreview() {
  try {
    const role = viewedRole();
    if (role === 'admin') {
      return;
    }
    const allow = roleScopes()[role];
    if (!allow) {
      return;
    }
    const show = k => !k.startsWith('hr-') || allow.includes('*') || allow.includes(k);
    // Flat sidebar: a section link survives when any of its pages may show.
    for (const g of NAV) {
      for (const it of g.items || []) {
        const keys = it.key ? [it.key] : (it.children || []).map(c => c.key).filter(Boolean);
        const vis = keys.some(show);
        if (it.children) {
          const first = it.children[0];
          const a = first && document.querySelector(`.sidebar-nav a.nav-parent[href="${first.href}"]`);
          if (a) {a.style.display = vis ? '' : 'none';}
        } else if (it.href) {
          const a = document.querySelector(`.sidebar-nav a.nav-link[href="${it.href}"]`);
          if (a && !vis) {a.style.display = 'none';}
        }
      }
    }
    // Inline pages of the active section hide per-page; an emptied list
    // hides whole.
    document.querySelectorAll('.sidebar-nav .nav-page[data-navkey]').forEach(a => {
      if (!show(a.getAttribute('data-navkey'))) {
        a.style.display = 'none';
      }
    });
    document.querySelectorAll('.sidebar-nav .nav-pages').forEach(list => {
      const vis = [...list.querySelectorAll('.nav-page')].some(a => a.style.display !== 'none');
      list.style.display = vis ? '' : 'none';
    });
    document.querySelectorAll('.sidebar-nav .nav-group').forEach(g => {
      const vis = [...g.querySelectorAll('a.nav-link')].some(
        a => a.style.display !== 'none'
      );
      if (!vis) {
        g.style.display = 'none';
      }
    });
  } catch (_e) {
    /* preview is best-effort */
  }
}
