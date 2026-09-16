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
      { key: 'analytics', href: 'analytics.html', text: 'Analytics', icon: 'barChart' },
      { key: 'employees', href: 'employees.html', text: 'Employees', icon: 'users' }
    ]
  }
];

// Sidebar holds the only surviving navigation: brand → Dashboard plus the
// Analytics and Employees links. No footer, no Settings entry.

export const ICONS = {
  dashboard:
    '<svg class="icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="4" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="10" width="7" height="11" rx="1.5"/></svg>',
  forms:
    '<svg class="icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="4" y="4" width="16" height="16" rx="2"/><path d="M9 9h6M9 13h4"/></svg>',
  tables:
    '<svg class="icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18M9 10v9M15 10v9"/></svg>',
  charts:
    '<svg class="icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 19V5M8 19v-8M12 19V9M16 19v-5M20 19v-9"/></svg>',
  calendar:
    '<svg class="icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18M8 4v6M16 4v6"/></svg>',
  ui: '<svg class="icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 6h16M4 12h16M4 18h10"/></svg>',
  pages:
    '<svg class="icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="3" width="20" height="18" rx="2"/><path d="M2 8h20"/></svg>',
  media:
    '<svg class="icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>',
  users:
    '<svg class="icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="8" r="4"/><path d="M5 20c0-3.9 3.1-7 7-7s7 3.1 7 7"/></svg>',
  profile:
    '<svg class="icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
  settings:
    '<svg class="icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/></svg>',
  chat: '<svg class="icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/></svg>',
  bell: '<svg class="icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 3a6 6 0 00-6 6c0 6-3 7-3 7h18s-3-1-3-7a6 6 0 00-6-6z"/><path d="M10.5 21a1.5 1.5 0 003 0"/></svg>',
  kanban:
    '<svg class="icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="6" height="14" rx="1.5"/><rect x="11" y="3" width="6" height="9" rx="1.5"/><rect x="19" y="3" width="2" height="6" rx="0.5"/></svg>',
  files:
    '<svg class="icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 7a2 2 0 012-2h4l2 2h7a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"/></svg>',
  shop: '<svg class="icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 9l1-5h16l1 5M3 9v10a2 2 0 002 2h14a2 2 0 002-2V9M3 9h18"/><path d="M9 13a3 3 0 006 0"/></svg>',
  tag: '<svg class="icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20 13l-7 7a2 2 0 01-2.83 0L3 12.83V4h8.83L20 12.17a2 2 0 010 2.83z"/><circle cx="7.5" cy="7.5" r="1.5"/></svg>',
  cart: '<svg class="icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="9" cy="21" r="1.5"/><circle cx="20" cy="21" r="1.5"/><path d="M1 1h4l2.7 13.4a2 2 0 002 1.6h9.7a2 2 0 002-1.6L23 6H6"/></svg>',
  help: '<svg class="icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M9.1 9a3 3 0 015.8 1c0 2-3 3-3 3"/><circle cx="12" cy="17" r="0.5" fill="currentColor"/></svg>',
  mail: '<svg class="icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="4" width="20" height="16" rx="3"/><path d="M2 7l10 6 10-6"/></svg>',
  map: '<svg class="icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>',
  receipt:
    '<svg class="icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M5 21V3h14v18l-3-2-3 2-3-2-3 2-2-2z"/><path d="M9 8h6M9 12h6M9 16h4"/></svg>',
  price:
    '<svg class="icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="12" y1="2" x2="12" y2="22"/><path d="M16 6H9.5a3.5 3.5 0 100 7h5a3.5 3.5 0 010 7H7"/></svg>',
  projects:
    '<svg class="icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>',
  type: '<svg class="icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>',
  icons:
    '<svg class="icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01"/></svg>',
  layout:
    '<svg class="icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 9v12"/></svg>',
  code: '<svg class="icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M16 18l6-6-6-6M8 6l-6 6 6 6"/></svg>',
  paint:
    '<svg class="icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M19 11H5a2 2 0 00-2 2v2a2 2 0 002 2h2v3a1 1 0 001 1h3a1 1 0 001-1v-3h7a2 2 0 002-2v-2a2 2 0 00-2-2z"/><path d="M19 11V5a2 2 0 00-2-2h-2a2 2 0 00-2 2v6"/></svg>',
  creditCard:
    '<svg class="icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="1" y="4" width="22" height="16" rx="2"/><path d="M1 10h22"/></svg>',
  fileText:
    '<svg class="icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8"/></svg>',
  checkCircle:
    '<svg class="icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
  barChart:
    '<svg class="icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 20v-6M6 20V10M18 20V4"/></svg>',
  globe:
    '<svg class="icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>',
  target:
    '<svg class="icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1" fill="currentColor"/></svg>',
  shield:
    '<svg class="icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2l8 3v6c0 5-3.5 9.5-8 11-4.5-1.5-8-6-8-11V5l8-3z"/><path d="M9 12l2 2 4-4"/></svg>',
  briefcase:
    '<svg class="icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v16"/></svg>',
  wallet:
    '<svg class="icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="1" y="4" width="22" height="16" rx="2"/><path d="M1 10h22"/></svg>',
  doc: '<svg class="icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8"/></svg>',
  flag: '<svg class="icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><path d="M4 22v-7"/></svg>',
  org: '<svg class="icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="9" y="2" width="6" height="6" rx="1"/><rect x="2" y="16" width="6" height="6" rx="1"/><rect x="16" y="16" width="6" height="6" rx="1"/><path d="M12 8v4M5 16v-2a3 3 0 013-3h8a3 3 0 013 3v2"/></svg>',
  id: '<svg class="icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="4" width="20" height="16" rx="2"/><circle cx="8" cy="11" r="2"/><path d="M5 17c0-1.7 1.3-3 3-3s3 1.3 3 3M14 9h5M14 13h5"/></svg>',
  clock:
    '<svg class="icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
  clipboard:
    '<svg class="icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="5" y="4" width="14" height="17" rx="2"/><rect x="9" y="2" width="6" height="4" rx="1"/><path d="M9 11h6M9 15h4"/></svg>',
  palm: '<svg class="icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 21v-9"/><path d="M12 12C8 12 5 10 4 6c4 0 7 2 8 4 1-2 4-4 8-4-1 4-4 6-8 6z"/><path d="M12 12c0-3 1-5 4-6"/></svg>',
  bank: '<svg class="icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2 9l10-6 10 6"/><path d="M4 9v10M20 9v10M8 12v5M12 12v5M16 12v5M2 21h20"/></svg>',
  percent:
    '<svg class="icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="19" y1="5" x2="5" y2="19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg>',
  contract:
    '<svg class="icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6"/><path d="M9 15l2 2 4-4"/></svg>'
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

export function renderSidebar(activeKey) {
  const key = DETAIL_PARENT[activeKey] || activeKey;
  const groups = NAV.map(
    group => `
    <div class="nav-group">
      ${group.label ? `<div class="nav-label">${group.label}</div>` : ''}
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
      <nav class="sidebar-nav" aria-label="HR sections">${groups}</nav>
      <div class="sidebar-footer">
        <button class="nav-link settings-toggle" id="sidebar-settings" type="button" aria-haspopup="menu" aria-expanded="false">
          ${ICONS.settings}
          <span class="nav-text">Settings</span>
        </button>
      </div>
    </aside>
  `;
}

export function renderTopbar() {
  return `
    <header class="topbar">
      <div class="topbar-left">
        <button class="topbar-menu" type="button" aria-label="Open menu" aria-controls="sidebar" aria-expanded="false"><svg width="22px" height="22px" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16"/></svg></button>
      </div>
      <div class="topbar-right">
        <button class="topbar-icon-btn" id="topbar-search" type="button" aria-label="Search" aria-keyshortcuts="Control+K">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>
        </button>
        <button class="topbar-icon-btn topbar-alert-btn" id="topbar-notifications" type="button" aria-haspopup="dialog" aria-expanded="false" aria-label="Notifications">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3a6 6 0 0 0-6 6c0 6-3 7-3 7h18s-3-1-3-7a6 6 0 0 0-6-6z"/><path d="M10.5 21a1.5 1.5 0 0 0 3 0"/></svg>
          <span class="topbar-btn-dot" id="topbar-notif-badge" hidden><span id="topbar-notif-count"></span></span>
        </button>
        <button class="topbar-icon-btn" id="theme-toggle" type="button" data-theme-toggle aria-label="Switch to dark theme" title="Switch to dark theme">
          <svg class="theme-icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z"/></svg>
          <svg class="theme-icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2.2M12 19.3v2.2M4.6 4.6l1.6 1.6M17.8 17.8l1.6 1.6M2.5 12h2.2M19.3 12h2.2M4.6 19.4l1.6-1.6M17.8 6.2l1.6-1.6"/></svg>
        </button>
        <button class="topbar-icon-btn" id="lang-toggle" type="button" aria-label="Language" title="Language">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 8 6 6"/><path d="m4 14 6-6 2-3"/><path d="M2 5h12"/><path d="M7 2h1"/><path d="m22 22-5-10-5 10"/><path d="M14 18h6"/></svg>
        </button>
        <button class="topbar-icon-btn topbar-alert-btn" id="topbar-messages" type="button" aria-haspopup="dialog" aria-expanded="false" aria-label="Messages">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="4" width="20" height="16" rx="2.5"/><path d="M3 7l9 7 9-7"/></svg>
          <span class="topbar-btn-dot topbar-btn-dot-blue" id="topbar-msg-badge" hidden><span id="topbar-msg-count"></span></span>
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
    topbar: renderTopbar()
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
