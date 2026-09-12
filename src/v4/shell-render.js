// Dash — shell render (pure)
// String-only renderers. No DOM, no window/document access.
// Imported by:
//   1. The Vite plugin (vite.config.js) to inject shell HTML at build/dev time.
//   2. src/v4/shell.js as a runtime fallback for pages that bypass the plugin.

// Shell chrome is sidebar + topbar only — no footer element is rendered.

// NAV items are either flat — { key, href, text, icon, badge? } —
// or a section parent with `children: [{ key, href, text, badge? }]`. The
// sidebar renders one flat link per parent (to its first child — the
// section's main screen) plus, for the active section only, its pages as
// plain inline links. No dropdowns anywhere. The parent reads active when
// any child matches.
// HR parents carry `i18n: 'hr.navgroup.x'` so applyShellI18n translates them.
export const NAV = [
  {
    label: 'HR & Operations',
    items: [
      {
        text: 'Overview',
        icon: 'dashboard',
        i18n: 'hr.navgroup.overview',
        children: [
          { key: 'hr-dashboard', href: 'hr_dashboard.html', text: 'HR Dashboard' },
          { key: 'hr-reports', href: 'hr_reports.html', text: 'Reports' }
        ]
      },
      {
        text: 'People',
        icon: 'users',
        i18n: 'hr.navgroup.people',
        children: [
          { key: 'hr-employees', href: 'hr_employees.html', text: 'Employees' },
          { key: 'hr-onboarding', href: 'hr_onboarding.html', text: 'Onboarding' },
          { key: 'hr-org', href: 'hr_org_chart.html', text: 'Org chart' },
          { key: 'hr-tracker', href: 'hr_tracker.html', text: 'Workforce tracker' },
          { key: 'hr-documents', href: 'hr_documents.html', text: 'Vault' },
          { key: 'hr-my-team', href: 'hr_my_team.html', text: 'My team' }
        ]
      },
      {
        text: 'Compliance',
        icon: 'shield',
        i18n: 'hr.navgroup.compliance',
        children: [
          { key: 'hr-sa-compliance', href: 'hr_sa_compliance.html', text: 'SA Compliance' },
          { key: 'hr-visas', href: 'hr_visas.html', text: 'Visas' },
          { key: 'hr-residency', href: 'hr_residency.html', text: 'Residency & renewals' },
          { key: 'hr-contracts', href: 'hr_contracts.html', text: 'Contract maker' }
        ]
      },
      {
        text: 'Time & Leave',
        icon: 'clock',
        i18n: 'hr.navgroup.time',
        children: [
          { key: 'hr-attendance', href: 'hr_attendance.html', text: 'Attendance' },
          { key: 'hr-timesheets', href: 'hr_timesheets.html', text: 'Timesheets' },
          { key: 'hr-leave', href: 'hr_leave.html', text: 'Leave' },
          { key: 'hr-leave-calendar', href: 'hr_leave_calendar.html', text: 'Leave calendar' },
          { key: 'hr-approvals', href: 'hr_approvals.html', text: 'Approvals' }
        ]
      },
      {
        text: 'Operations',
        icon: 'shop',
        i18n: 'hr.navgroup.operations',
        children: [
          { key: 'hr-clients', href: 'hr_clients.html', text: 'Clients' },
          { key: 'hr-requests', href: 'hr_requests.html', text: 'Manpower requests' },
          { key: 'hr-assignments', href: 'hr_assignments.html', text: 'Assignments' },
          { key: 'hr-ajeer', href: 'hr_ajeer.html', text: 'Ajeer permits' }
        ]
      },
      {
        text: 'Employee',
        icon: 'id',
        i18n: 'hr.navgroup.employee',
        children: [
          { key: 'hr-payroll', href: 'hr_payroll.html', text: 'Pay runs' },
          { key: 'hr-gosi', href: 'hr_gosi.html', text: 'GOSI' },
          { key: 'hr-wps', href: 'hr_wps.html', text: 'WPS & Mudad' },
          { key: 'hr-eosb', href: 'hr_eosb.html', text: 'EOSB & settlement' }
        ]
      },
      {
        text: 'Accounts',
        icon: 'wallet',
        i18n: 'hr.navgroup.accounts',
        children: [
          { key: 'hr-invoices', href: 'hr_invoices.html', text: 'Invoices' },
          { key: 'hr-expenses', href: 'hr_expenses.html', text: 'Expenses' }
        ]
      },
      {
        text: 'Hiring',
        icon: 'briefcase',
        i18n: 'hr.navgroup.hiring',
        children: [
          { key: 'hr-jobs', href: 'hr_jobs.html', text: 'Jobs' },
          { key: 'hr-candidates', href: 'hr_candidates.html', text: 'Candidates' },
          { key: 'hr-pipeline', href: 'hr_pipeline.html', text: 'Pipeline' },
          { key: 'hr-interviews', href: 'hr_interviews.html', text: 'Interviews' },
          { key: 'hr-offers', href: 'hr_offers.html', text: 'Offers' }
        ]
      },
      {
        text: 'Growth',
        icon: 'target',
        i18n: 'hr.navgroup.growth',
        children: [
          { key: 'hr-goals', href: 'hr_goals.html', text: 'Goals' },
          { key: 'hr-reviews', href: 'hr_reviews.html', text: 'Reviews' },
          { key: 'hr-feedback', href: 'hr_feedback.html', text: 'Feedback' },
          { key: 'hr-trainings', href: 'hr_trainings.html', text: 'Trainings' },
          { key: 'hr-announcements', href: 'hr_announcements.html', text: 'Announcements' }
        ]
      },
      {
        text: 'Portals',
        icon: 'profile',
        i18n: 'hr.navgroup.portals',
        children: [
          { key: 'hr-my-space', href: 'hr_my_space.html', text: 'My space' },
          { key: 'hr-client', href: 'hr_client_dashboard.html', text: 'Client dashboard' }
        ]
      }
    ]
  },
  {
    // Daily-work modules: communication, planning, and business tools.
    // Collapsible parents — one row each — so the sidebar stays scannable.
    // (The old General group is dissolved: its galleries live in Settings →
    // Customization, its demo dashboards in Settings → Dashboard views, and
    // its two working tools — Calendar, Map — joined Apps.)
    label: 'Workspace',
    items: [
      {
        text: 'Apps',
        icon: 'pages',
        i18n: 'navgroup.apps',
        children: [
          {
            key: 'chat',
            href: 'chat.html',
            text: 'Chat',
            badge: { text: '3', cls: 'badge-teal' }
          },
          { key: 'inbox', href: 'inbox.html', text: 'Inbox' },
          { key: 'kanban', href: 'kanban.html', text: 'Kanban' },
          { key: 'calendar', href: 'calendar.html', text: 'Calendar' },
          { key: 'map', href: 'map.html', text: 'Map' },
          { key: 'files', href: 'file_manager.html', text: 'Files' },
          { key: 'notifications', href: 'notifications.html', text: 'Notifications' }
        ]
      },
      {
        text: 'Projects',
        icon: 'projects',
        i18n: 'navgroup.projects',
        children: [
          { key: 'projects', href: 'projects.html', text: 'All projects' },
          { key: 'project-detail', href: 'project_detail.html', text: 'Project detail' }
        ]
      }
    ]
  }
];

// Bottom-docked Settings — rendered in .sidebar-footer, NOT in the scrollable
// .sidebar-nav. Rule of thumb: the sidebar holds what you DO daily (HR ops +
// Workspace modules); the window holds what you CONFIGURE rarely:
//   HR Settings   → the 7 HR admin pages
//   Customization → Theme builder + UI library + Layouts
//   Company Assets → brand & stationery library (logo, colors, paper, uniforms)
//   System        → access & account pages (profile/settings/help also live
//                   in the top-right avatar menu)
export const SETTINGS_NAV = [
  {
    section: 'HR Settings',
    i18n: 'hr.navgroup.settings',
    items: [
      { key: 'hr-settings', href: 'hr_settings.html', text: 'HR Settings' },
      { key: 'hr-departments', href: 'hr_departments.html', text: 'Departments' },
      { key: 'hr-roles', href: 'hr_roles.html', text: 'Roles & access' },
      { key: 'hr-templates', href: 'hr_templates.html', text: 'Templates' },
      { key: 'hr-holidays', href: 'hr_holidays.html', text: 'Holidays' },
      { key: 'hr-shifts', href: 'hr_shifts.html', text: 'Shifts' },
      { key: 'hr-audit', href: 'hr_audit.html', text: 'Audit log' }
    ]
  },
  {
    section: 'Customization',
    i18n: 'hr.navgroup.customization',
    items: [
      {
        key: 'theme',
        href: 'theme.html',
        text: 'Theme builder',
        badge: { text: 'New', cls: 'badge-teal' }
      },
      {
        text: 'UI library',
        i18n: 'navgroup.ui-library',
        children: [
          { key: 'ui', href: 'general_elements.html', text: 'Elements' },
          {
            key: 'widgets',
            href: 'widgets.html',
            text: 'Widgets',
            badge: { text: '5', cls: 'badge-blue' }
          },
          {
            key: 'playground',
            href: 'playground.html',
            text: 'Playground',
            badge: { text: 'New', cls: 'badge-teal' }
          },
          { key: 'typography', href: 'typography.html', text: 'Typography' },
          { key: 'icons', href: 'icons.html', text: 'Icons' },
          { key: 'media', href: 'media_gallery.html', text: 'Media' }
        ]
      },
      {
        text: 'Layouts',
        i18n: 'navgroup.layouts',
        children: [
          { key: 'fixed-sidebar', href: 'fixed_sidebar.html', text: 'Fixed sidebar' },
          { key: 'fixed-footer', href: 'fixed_footer.html', text: 'Fixed footer' },
          { key: 'level2', href: 'level2.html', text: 'Nested page' },
          { key: 'plain', href: 'plain_page.html', text: 'Blank' }
        ]
      },
      {
        text: 'Forms',
        i18n: 'navgroup.forms',
        children: [
          { key: 'forms', href: 'form.html', text: 'General' },
          { key: 'form-advanced', href: 'form_advanced.html', text: 'Advanced controls' },
          { key: 'form-buttons', href: 'form_buttons.html', text: 'Buttons' },
          { key: 'form-upload', href: 'form_upload.html', text: 'Upload' },
          { key: 'form-validation', href: 'form_validation.html', text: 'Validation' },
          { key: 'form-wizards', href: 'form_wizards.html', text: 'Wizard' }
        ]
      },
      {
        text: 'Tables',
        i18n: 'navgroup.tables',
        children: [
          { key: 'tables', href: 'tables.html', text: 'Static' },
          { key: 'tables-dynamic', href: 'tables_dynamic.html', text: 'Dynamic' }
        ]
      },
      {
        text: 'Charts',
        i18n: 'navgroup.charts',
        children: [
          { key: 'charts', href: 'chartjs.html', text: 'Chart cards' },
          { key: 'echarts', href: 'echarts.html', text: 'ECharts gallery' },
          { key: 'other-charts', href: 'other_charts.html', text: 'SVG charts' }
        ]
      }
    ]
  },
  {
    // Former store-demo pages, rehomed as the company asset library
    // (brand colors, paper/stationery designs, logo, uniforms). Kept on
    // disk and linked here until the asset content rebuild lands.
    section: 'Company Assets',
    i18n: 'hr.navgroup.assets',
    items: [
      { key: 'storefront', href: 'e_commerce.html', text: 'Storefront' },
      { key: 'product', href: 'product_detail.html', text: 'Product' },
      { key: 'orders', href: 'orders.html', text: 'All orders' },
      { key: 'order-detail', href: 'order_detail.html', text: 'Order detail' },
      { key: 'invoice', href: 'invoice.html', text: 'Invoice' },
      { key: 'pricing', href: 'pricing_tables.html', text: 'Pricing' }
    ]
  },
  {
    // Template demo dashboards — kept on disk, linked here, out of the way.
    section: 'Dashboard views',
    i18n: 'hr.navgroup.views',
    items: [
      { key: 'dashboard', href: 'index.html', text: 'Operations' },
      { key: 'dashboard-2', href: 'index2.html', text: 'Analytics' },
      { key: 'dashboard-3', href: 'index3.html', text: 'Sales' },
      { key: 'dashboard-4', href: 'index4.html', text: 'System health' }
    ]
  },
  {
    section: 'System',
    i18n: 'hr.navgroup.system',
    items: [
      { key: 'users', href: 'contacts.html', text: 'Contacts' },
      { key: 'user_management', href: 'user_management.html', text: 'User management' },
      { key: 'profile', href: 'profile.html', text: 'Your profile' },
      { key: 'settings', href: 'settings.html', text: 'Settings' },
      { key: 'faq', href: 'faq.html', text: 'Help center' }
    ]
  }
];

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
    '<svg class="icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6"/><path d="M9 15l2 2 4-4"/></svg>',
  target:
    '<svg class="icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1" fill="currentColor"/></svg>'
};

// Flat sidebar, zero dropdowns: every parent links to its section's main
// screen (its first child). The active section additionally lists its pages
// inline beneath it — plain links, always visible, no toggles. A parent reads
// active whenever any of its pages is current.
function sectionKeys(item) {
  return (item.children || []).map(c => c.key).filter(Boolean);
}

function renderNavItem(item, activeKey) {
  if (item.children) {
    const first = item.children[0];
    const active = item.key === activeKey || sectionKeys(item).includes(activeKey);
    const pages = active
      ? `<div class="nav-pages">${item.children
        .map(c => {
          const a = c.key === activeKey;
          return `<a class="nav-page${a ? ' active' : ''}" href="${c.href}"${c.key ? ` data-navkey="${c.key}"` : ''}${a ? ' aria-current="page"' : ''}><span class="nav-text">${c.text}</span>${c.badge ? `<span class="badge ${c.badge.cls}">${c.badge.text}</span>` : ''}</a>`;
        })
        .join('')}</div>`
      : '';
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

function settingsKeys(items) {
  const out = [];
  for (const it of items || []) {
    if (it.key) {out.push(it.key);}
    if (it.children) {out.push(...settingsKeys(it.children));}
  }
  return out;
}

const SETTINGS_KEYS = new Set(SETTINGS_NAV.flatMap(s => settingsKeys(s.items)));

export function renderSidebar(activeKey) {
  const groups = NAV.map(
    group => `
    <div class="nav-group">
      <div class="nav-label">${group.label}</div>
      ${group.items.map(item => renderNavItem(item, activeKey)).join('')}
    </div>
  `
  ).join('');

  const settingsActive = SETTINGS_KEYS.has(activeKey);

  return `
    <aside class="sidebar" aria-label="Primary navigation">
      <div class="sidebar-brand">
        <div class="brand-icon">D</div>
        <div class="brand-name">Dash</div>
      </div>
      <nav class="sidebar-nav" aria-label="HR sections">${groups}</nav>
      <div class="sidebar-footer">
        <button type="button" class="company-switch" aria-haspopup="menu" aria-label="Switch company">
          <span class="company-mark">D</span>
          <span class="company-name">Dash</span>
          <svg class="company-chev" width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M4 6l4-4 4 4M4 10l4 4 4-4"/></svg>
        </button>
        <div class="sidebar-settings${settingsActive ? ' has-active' : ''}">
          <button type="button" class="settings-toggle nav-link${settingsActive ? ' active' : ''}" aria-haspopup="dialog" aria-label="Open settings">
            ${ICONS.settings || ''}
            <span class="nav-text">Settings</span>
          </button>
        </div>
      </div>
    </aside>
  `;
}

export function renderTopbar() {
  return `
    <header class="topbar">
      <div class="topbar-left">
        <button class="sidebar-toggle" type="button" aria-label="Open menu" aria-controls="sidebar" aria-expanded="false">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
        </button>
      </div>
      <div class="search-box">
        <svg class="s-icon" width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="7" cy="7" r="5"/><path d="M11 11l3.5 3.5"/></svg>
        <input type="text" placeholder="Search pages or run a command…" aria-label="Open command palette">
        <kbd>⌘K</kbd>
      </div>
      <div class="topbar-right">
        <button id="lang-toggle" class="tb-btn tb-lang" type="button" title="Language / اللغة" aria-label="Switch language">عربي</button>
        <button class="tb-btn theme-toggle" type="button" title="Toggle theme" aria-label="Toggle theme" aria-pressed="false">
          <svg class="theme-icon-light" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>
          <svg class="theme-icon-dark" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
        </button>
        <button class="tb-btn tb-notifications" type="button" title="Notifications" aria-label="Notifications" aria-haspopup="dialog" aria-expanded="false">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M12 3a6 6 0 00-6 6c0 6-3 7-3 7h18s-3-1-3-7a6 6 0 00-6-6z"/><path d="M10.5 21a1.5 1.5 0 003 0"/></svg>
          <span class="dot"></span>
        </button>
        <button class="tb-btn tb-messages" type="button" title="Messages" aria-label="Messages" aria-haspopup="dialog" aria-expanded="false">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="2" y="4" width="20" height="16" rx="3"/><path d="M2 7l10 6 10-6"/></svg>
        </button>
        <button class="tb-avatar" type="button" aria-label="Account menu" aria-haspopup="menu" aria-expanded="false">A</button>
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
