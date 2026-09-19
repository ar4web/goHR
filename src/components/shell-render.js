// goHR — shell render (pure)
// String-only renderers. No DOM, no window/document access.
// Imported by:
//   1. The Vite plugin (vite.config.js) to inject shell HTML at build/dev time.
//   2. src/components/shell.js as a runtime fallback for pages that bypass the plugin.

// Shell chrome is sidebar + slim topbar (mobile menu + theme toggle) —
// no footer element, no search/lang/notifications/messages/avatar controls.

// NAV items are either flat — { key, href, text, icon, badge? } —
// or a section parent with `children: [{ key, href, text, badge? }]`. The
// sidebar renders one flat link per parent (to its first child — the
// section's main screen) plus every section's pages as plain inline links
// (expand-all by default). No dropdowns anywhere. The parent reads active
// when any child matches.
// HR parents carry `i18n: 'hr.navgroup.x'` so applyShellI18n translates them.
export const NAV = [
  {
    label: '',
    items: [
      { key: 'dashboard', href: 'dashboard.html', text: 'Dashboard', icon: 'dashboard' },
      { key: 'analytics', href: 'analytics.html', text: 'Analytics', icon: 'barChart' }
    ]
  },
  {
    items: [
      { key: 'employees', href: 'employees.html', text: 'Employees', icon: 'users' },
      { key: 'recruitment', href: 'recruitment.html', text: 'Recruitment', icon: 'userPlus' },
      { key: 'attendance', href: 'attendance.html', text: 'Attendance', icon: 'clock' },
      { key: 'leave', href: 'leave.html', text: 'Leave', icon: 'palm' }
    ]
  },
  {
    items: [
      { key: 'payroll', href: 'payroll.html', text: 'Payroll', icon: 'wallet' },
      { key: 'invoices', href: 'invoices.html', text: 'Invoicing', icon: 'receipt' },
      { key: 'expenses', href: 'expenses.html', text: 'Expenses', icon: 'creditCard' },
      { key: 'profitability', href: 'profitability.html', text: 'Profitability', icon: 'trendingUp' },
      { key: 'eosb', href: 'eosb.html', text: 'End of Service', icon: 'award' },
      { key: 'renewals', href: 'renewals.html', text: 'Renewals', icon: 'refresh' }
    ]
  },
  {
    items: [
      { key: 'documents', href: 'documents.html', text: 'Documents', icon: 'fileText' },
      { key: 'files', href: 'files.html', text: 'Files', icon: 'folder' }
    ]
  }
];

// Sidebar holds the only surviving navigation: brand → Dashboard plus the
// Analytics and Employees links. No footer, no Settings entry.

export const ICONS = {
  stethoscope:
    '<svg class="icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6 6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3"/><path d="M8 15v1a6 6 0 0 0 6 6 6 6 0 0 0 6-6v-4"/><circle cx="20" cy="10" r="2"/></svg>',
  bell:
    '<svg class="icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 8 3 8H3s3-1 3-8"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>',
  moon:
    '<svg class="icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z"/></svg>',
  sun:
    '<svg class="icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2.2M12 19.3v2.2M4.6 4.6l1.6 1.6M17.8 17.8l1.6 1.6M2.5 12h2.2M19.3 12h2.2M4.6 19.4l1.6-1.6M17.8 6.2l1.6-1.6"/></svg>',
  dashboard:
    '<svg class="icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="4" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="10" width="7" height="11" rx="1.5"/></svg>',
  grid:
    '<svg class="icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>',
  barChart:
    '<svg class="icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 20v-6M6 20V10M18 20V4"/></svg>',
  users:
    '<svg class="icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="8" r="4"/><path d="M5 20c0-3.9 3.1-7 7-7s7 3.1 7 7"/></svg>',
  clock:
    '<svg class="icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
  palm: '<svg class="icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 21v-9"/><path d="M12 12C8 12 5 10 4 6c4 0 7 2 8 4 1-2 4-4 8-4-1 4-4 6-8 6z"/><path d="M12 12c0-3 1-5 4-6"/></svg>',
  wallet:
    '<svg class="icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="1" y="4" width="22" height="16" rx="2"/><path d="M1 10h22"/></svg>',
  receipt:
    '<svg class="icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1z"/><path d="M8 7h8M8 11h8M8 15h5"/></svg>',
  creditCard:
    '<svg class="icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/></svg>',
  trendingUp:
    '<svg class="icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M23 6l-9.5 9.5-5-5L1 18"/><path d="M17 6h6v6"/></svg>',
  userPlus:
    '<svg class="icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M19 8v6M22 11h-6"/></svg>',
  folder:
    '<svg class="icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg>',
  fileText:
    '<svg class="icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/></svg>',
  refresh:
    '<svg class="icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 12a9 9 0 109-9 9.75 9.75 0 00-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>',
  award:
    '<svg class="icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="8" r="5.5"/><path d="M8.5 12.5L7 21l5-2.5L17 21l-1.5-8.5"/></svg>',
  settings:
    '<svg class="icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/></svg>'
};

// Flat sidebar, zero dropdowns: every parent links to its section's main
// screen (its first child). Every section lists its pages inline beneath
// it — plain links, always visible, no toggles. A parent reads active
// whenever any of its pages is current.
function sectionKeys(item) {
  return (item.children || []).map(c => c.key).filter(Boolean);
}

function renderNavItem(item, activeKey) {
  if (item.children) {
    const first = item.children[0];
    const active = item.key === activeKey || sectionKeys(item).includes(activeKey);
    // Expand-all: every section lists its pages inline by default. The
    // rail toggle still collapses the whole sidebar; active highlighting
    // marks the current section + page.
    const pages = `<div class="nav-pages">${item.children
      .map(c => {
        const a = c.key === activeKey;
        return `<a class="nav-page${a ? ' active' : ''}" href="${c.href}"${c.key ? ` data-navkey="${c.key}"` : ''}${a ? ' aria-current="page"' : ''}><span class="nav-text">${c.text}</span>${c.badge ? `<span class="badge ${c.badge.cls}">${c.badge.text}</span>` : ''}</a>`;
      })
      .join('')}</div>`;
    return `
    <a class="nav-link nav-parent${active ? ' active' : ''}" href="${first.href}"${active ? ' aria-current="page"' : ''}>
      ${ICONS[item.icon] || ''}
      <span class="nav-text">${item.text}</span>
    </a>${pages}
  `;
  }
  const a = item.key === activeKey;
  return `
    <a class="nav-link${a ? ' active' : ''}" href="${item.href}"${a ? ' aria-current="page"' : ''}>
      ${ICONS[item.icon] || ''}
      <span class="nav-text">${item.text}</span>
      ${item.badge ? `<span class="badge ${item.badge.cls}">${item.badge.text}</span>` : ''}
    </a>
  `;
}

// Detail pages carry their own data-page key but highlight their section
// parent in the sidebar (they share the parent's screen, not its key).
const DETAIL_PARENT = {
  'employee-file': 'employees'
};

const TOGGLE_ICONS = `
  <span class="toggle-icon toggle-icon-expanded" aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="22px" height="22px"><path d="M8.13,16.62q-0.32,0-0.53-0.22T7.38,15.87V8.13q0-0.31 0.22-0.53T8.13,7.38q0.31,0 0.53,0.22T8.87,8.13v7.75q0,0.32-0.22,0.53T8.13,16.62Zm2.32,3.87q-1.78,0-2.77-0.07T6,20.01q-0.65-0.33-1.17-0.85T3.99,18q-0.36-0.69-0.42-1.68T3.5,13.55V10.46q0-1.78 0.07-2.76T3.99,6.02Q4.32,5.37 4.83,4.85T6,4.01Q6.68,3.66 7.68,3.58T10.45,3.5h3.09q1.78,0 2.76,0.08t1.68,0.43q0.65,0.32 1.17,0.84t0.84,1.17q0.36,0.7 0.43,1.68t0.08,2.76v3.09q0,1.78-0.08,2.77T19.99,18q-0.32,0.65-0.84,1.17t-1.17,0.85q-0.69,0.36-1.67,0.42T13.54,20.5H10.45Zm0-1.5h3.09q1.5,0 2.33-0.01t1.41-0.3q0.44-0.22 0.8-0.57t0.57-0.8q0.3-0.58 0.32-1.42T19,13.55V10.46q0-1.5-0.02-2.33T18.66,6.72q-0.22-0.44-0.57-0.8t-0.8-0.57q-0.57-0.3-1.41-0.32T13.54,5H10.45Q8.95,5 8.11,5.02T6.69,5.34Q6.25,5.56 5.89,5.92T5.32,6.72Q5.03,7.29 5.01,8.13T5,10.46v3.09q0,1.5 0.01,2.34t0.3,1.42q0.22,0.45 0.57,0.8t0.8,0.57q0.58,0.29 1.42,0.3T10.45,19Z"></path></svg></span>
  <span class="toggle-icon toggle-icon-collapsed" aria-hidden="true" hidden><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" fill="currentColor" width="22px" height="22px"><path d="M325-295q-12.77,0-21.38-8.62T295-325V-635q0-12.38 8.62-21.19T325-665q12.38,0 21.19,8.81T355-635v310q0,12.77-8.81,21.38T325-295Zm92.92,155q-71.15,0-110.85-2.62t-67.15-16.85q-26.08-13.23-46.65-33.81t-33.81-46.65q-14.23-27.46-16.85-67.15T140-417.92V-541.69q0-71.15 2.62-110.54t16.85-66.85q13.23-26.08 33.81-46.85t46.65-33.62q27.46-14.23 67.15-17.35T417.92-820H541.69q71.15,0 110.35,3.12t67.04,17.35q26.08,12.85 46.85,33.62t33.62,46.85q14.23,27.85 17.35,67.04T820-541.69v123.77q0,71.15-3.12,110.85t-17.35,67.15q-12.85,26.08-33.62,46.65t-46.85,33.81q-27.46,14.23-66.85,16.85T541.69-140H417.92Zm162-236.15L463.39-453.85q-6.69-4.46-10.23-11.46T449.62-480t3.35-14.38t10.42-11.15l116.54-77.31q10.54-6.69 23.11-3.85t18.65,13.38q6.69,10.54 3.65,23t-13.58,19.15L533.54-479l78.23,51.15q10.54,6.69 13.58,18.96t-3.65,22.81q-6.46,10.54-18.85,13.58t-22.92-3.65ZM417.92-200H541.69q60,0 93.31-0.58t56.31-12.19q17.77-8.77 31.96-22.96t22.96-31.96q12-23 12.88-56.62T760-417.92V-541.69q0-60-0.88-93.31t-12.88-56.31q-8.77-17.77-22.96-31.96t-31.96-22.96q-23-12-56.31-12.88T541.69-760H417.92q-60,0-93.62,0.88t-56.62,12.88q-17.77,8.77-31.96,22.96t-22.96,31.96q-11.62,23-12.19,56.31T200-541.69v123.77q0,60 0.58,93.62t12.19,56.62q8.77,18.15 22.77,32.15t32.15,22.77q23,11.62 56.62,12.19T417.92-200Z"></path></svg></span>
`;

function renderSidebar(activeKey) {
  const key = DETAIL_PARENT[activeKey] || activeKey;
  const settingsActive = key === 'settings' || key === 'users' || key === 'go-dr';
  const groups = NAV.map(
    group => `
    <div class="nav-group">
      ${''}
      ${group.items.map(item => renderNavItem(item, key)).join('')}
    </div>
  `
  ).join('');

  return `
    <aside class="sidebar" aria-label="Primary navigation">
      <div class="sidebar-brand-row">
        <a class="sidebar-brand" href="dashboard.html" aria-label="Go to Dashboard">
          <div class="brand-icon">H</div>
          <div class="brand-name">goHR</div>
        </a>
        <button class="sidebar-toggle" type="button" aria-label="Collapse sidebar" aria-controls="sidebar" aria-expanded="false" aria-pressed="false">${TOGGLE_ICONS}</button>
      </div>
      <div class="sidebar-search">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
        <input id="sidebar-search" type="search" autocomplete="off" data-i18n-placeholder="nav.search" placeholder="Search sections…" aria-label="Filter sections">
      </div>
      <nav class="sidebar-nav" aria-label="HR sections">${groups}</nav>
      <div class="sidebar-footer">
        <button class="nav-link settings-toggle${settingsActive ? ' active' : ''}" id="sidebar-settings" type="button" aria-haspopup="menu" aria-expanded="false"${settingsActive ? ' aria-current="page"' : ''}>
          ${ICONS.settings}
          <span class="nav-text">Settings</span>
        </button>
        <button class="nav-link sidebar-logout" id="sidebar-logout" type="button" aria-label="Sign out" data-i18n-aria="common.signOut" title="Sign out">
          <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/></svg>
        </button>
      </div>
    </aside>
  `;
}

// Topbar glyphs come from the sidebar ICONS family (single source). The
// theme icons additionally carry their show/hide classes — injected here so
// the ICONS map stays clean for sidebar use.
function famIcon(svg, cls) {
  return svg.replace('class="icon"', `class="icon ${cls}"`);
}

function renderTopbar(activeKey = '') {
  return `
    <header class="topbar">
      <div class="topbar-left">
        <button class="topbar-menu" type="button" aria-label="Open menu" aria-controls="sidebar" aria-expanded="false"><svg width="24px" height="24px" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16"/></svg></button>
      </div>
      <div class="topbar-right">
        <button class="topbar-icon-btn topbar-alert-btn" id="topbar-notifications" type="button" aria-haspopup="dialog" aria-expanded="false" aria-label="Notifications">
          ${ICONS.bell}
          <span class="topbar-btn-dot" id="topbar-notif-badge" hidden><span id="topbar-notif-count"></span></span>
        </button>
        <button class="topbar-icon-btn" id="theme-toggle" type="button" data-theme-toggle aria-label="Switch to dark theme" title="Switch to dark theme">
          ${famIcon(ICONS.moon, 'theme-icon-moon')}
          ${famIcon(ICONS.sun, 'theme-icon-sun')}
        </button>
        <button class="topbar-icon-btn${activeKey === 'apps' ? ' active' : ''}" id="topbar-apps" type="button" aria-label="Apps" title="Apps">
          ${ICONS.grid}
        </button>
        <button class="topbar-user" id="topbar-user" type="button" aria-haspopup="dialog" aria-expanded="false" aria-label="Your profile">
          <span class="topbar-user-avatar">HA</span>
        </button>
      </div>
    </header>
  `;
}

export function renderShell({ activeKey = '' } = {}) {
  return {
    sidebar: renderSidebar(activeKey),
    topbar: renderTopbar(activeKey)
  };
}

export function parseShellAttrs(attrs) {
  const shell = /data-shell\s*=\s*["']([^"']*)["']/.exec(attrs);
  if (!shell || shell[1] !== 'admin') {
    return null;
  }
  const page = /data-page\s*=\s*["']([^"']*)["']/.exec(attrs);
  return {
    activeKey: page ? page[1] : ''
  };
}
