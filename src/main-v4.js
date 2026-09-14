// HRGO — entry
// Self-contained dashboard skin. Loads only the v4 design system.

import './scss/v4/main.scss';
import { mountShell } from './v4/shell.js';
import { initCharts } from './v4/charts.js';
import { initTables } from './v4/tables.js';
import { openMenu, DEFAULT_CARD_MENU } from './v4/menus.js';
import { initCommandPalette } from './v4/command-palette.js';
import { initPageActions } from './v4/page-actions.js';
import { initI18n } from './v4/i18n.js';

mountShell();
initI18n();
// Heavy last: charts (echarts) + grids (datatables) mount after first paint
// so shell, text and LCP settle first. Skeletons cover the wait; idle fires
// ASAP when the main thread is free, setTimeout covers jsdom/no-idle.
const whenIdle = (fn) => {
  if (typeof window !== 'undefined' && typeof window.requestIdleCallback === 'function') {
    window.requestIdleCallback(fn, { timeout: 1500 });
  } else {
    setTimeout(fn, 0);
  }
};
whenIdle(initCharts);
whenIdle(initTables);
initCommandPalette();
initPageActions();

// Service worker — only in production builds (skip on dev so HMR isn't fought
// by the cache). Path uses Vite's BASE_URL so subpath deploys (e.g.
// example.com/dash/) register the SW at the right scope.
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    const swPath = `${import.meta.env.BASE_URL}sw.js`;
    navigator.serviceWorker.register(swPath).catch(() => { /* ignore */ });
  });
}

// HRGO main dashboard (index.html)
if (document.querySelector('[data-page="dashboard"]')) {
  import('./v4/index-dashboard.js').then(m => m.initIndexDashboard());
}

// Lazy-load page-specific modules only when their host element is on the page.
if (document.getElementById('inbox-root')) {
  import('./v4/inbox.js').then((m) => m.initInbox());
}
if (document.querySelector('.calendar-grid')) {
  import('./v4/calendar.js').then((m) => m.initCalendar());
}
if (document.querySelector('[data-hr-settings]')) {
  import('./v4/settings.js').then((m) => m.initHrSettings());
}

// Lazy-load generic data table views for extended data modules
if (document.querySelector('[data-hr-bank-accounts], [data-hr-dependents], [data-hr-qualifications], [data-hr-warnings], [data-hr-achievements], [data-hr-promotions], [data-hr-attendance-policies], [data-hr-attendance-locations], [data-hr-approval-workflows], [data-hr-system-notifications], [data-hr-system-alerts], [data-hr-countries], [data-hr-currencies], [data-hr-work-permits], [data-hr-leaves-balances], [data-hr-job-requisitions], [data-hr-training-programs], [data-hr-custom-reports], [data-hr-payroll-components]')) {
  import('./v4/hr-data-table.js').then((m) => {
    const keys = ['hr-bank-accounts','hr-dependents','hr-qualifications','hr-warnings','hr-achievements','hr-promotions','hr-attendance-policies','hr-attendance-locations','hr-approval-workflows','hr-system-notifications','hr-system-alerts','hr-countries','hr-currencies','hr-work-permits','hr-leaves-balances','hr-job-requisitions','hr-training-programs','hr-custom-reports','hr-payroll-components'];
    const active = document.querySelector('[data-page]')?.dataset.page;
    if (active && keys.includes(active)) { m.initDataTable(active); }
  });
}

// ────────────────────────
//  Delegated interactions
// ────────────────────────

// Toggle switches
document.addEventListener('click', (e) => {
  const toggle = e.target.closest('.toggle');
  if (toggle) {toggle.classList.toggle('on');}
});

// Todo checkboxes — toggle .done on the cb + row, then refresh any
// `[data-todo-counter]` element inside the parent card so the "X of Y
// remaining" subtitle stays in sync with the actual checkboxes.
document.addEventListener('click', (e) => {
  const cb = e.target.closest('.todo-cb');
  if (!cb) {return;}
  cb.classList.toggle('done');
  const row = cb.closest('.todo-row');
  if (row) {row.classList.toggle('done');}
  // Update counter text within the same card.
  const card = cb.closest('.card');
  if (!card) {return;}
  const counter = card.querySelector('[data-todo-counter]');
  if (!counter) {return;}
  const all = card.querySelectorAll('.todo-row');
  const done = card.querySelectorAll('.todo-row.done');
  const remaining = all.length - done.length;
  // Format: "<remaining> of <total> remaining" — matches existing copy.
  counter.textContent = `${remaining} of ${all.length} remaining`;
});

// Tab groups: works for any container of .chart-tab buttons (chart cards,
// calendar view switcher, generic tab strips). Adds .active to the clicked
// tab and removes it from siblings in the same parent.
document.addEventListener('click', (e) => {
  const tab = e.target.closest('.chart-tab');
  if (!tab) {return;}
  tab.parentElement.querySelectorAll('.chart-tab').forEach((t) => t.classList.remove('active'));
  tab.classList.add('active');
});

// Button groups with [data-group]: radio-style single-select. Click sets
// .active on the clicked button and clears its siblings in the same group.
// Opt-in via data-group so plain action button groups are unaffected.
document.addEventListener('click', (e) => {
  const btn = e.target.closest('.btn-group[data-group] > .btn');
  if (!btn) {return;}
  btn.parentElement.querySelectorAll('.btn').forEach((b) => {
    b.classList.remove('active');
    b.setAttribute('aria-pressed', 'false');
  });
  btn.classList.add('active');
  btn.setAttribute('aria-pressed', 'true');
});

// Card option buttons → popover menu.
// Calendar nav buttons (prev/next month) are also .card-opt-btn but live
// inside .calendar-toolbar; calendar.js stops propagation on those clicks
// so they never reach this handler.
document.addEventListener('click', (e) => {
  const btn = e.target.closest('.card-opt-btn');
  if (!btn) {return;}
  // Skip if the click was already handled (e.g. calendar prev/next).
  if (e.defaultPrevented) {return;}
  e.preventDefault();
  openMenu(btn, DEFAULT_CARD_MENU);
});

// Chip dismiss (× icon) and chip toggle.
document.addEventListener('click', (e) => {
  const closer = e.target.closest('.chip-close');
  if (closer) {
    const chip = closer.closest('.chip');
    if (chip) {
      chip.style.transition = 'opacity 150ms, transform 150ms';
      chip.style.opacity = '0';
      chip.style.transform = 'scale(0.85)';
      setTimeout(() => chip.remove(), 160);
    }
    return;
  }
  const chip = e.target.closest('.chip');
  if (chip) {chip.classList.toggle('active');}
});

// Form submit — let HTML5 validation run, then fake-submit on valid forms.
// Lazy-imports the toast helper so the dependency stays out of the entry chunk.
document.addEventListener('submit', (e) => {
  const form = e.target;
  if (!(form instanceof HTMLFormElement)) {return;}
  // Native :invalid forms still get the browser's validation UI before we
  // see the submit event, so reaching here means the form is already valid.
  e.preventDefault();
  const submitBtn = form.querySelector('button[type="submit"], input[type="submit"]');
  const label = (submitBtn?.textContent || submitBtn?.value || 'Saved').trim();
  import('./v4/toast.js').then(({ showToast }) => showToast(`${label} ✓`, { variant: 'success' }));
  if (form.dataset.resetOnSubmit !== 'false') {form.reset();}
});

// Topbar search box opens the command palette — wired by initCommandPalette.
// Page-actions (Print / Export / Compose / Add / etc.) wired via initPageActions.
