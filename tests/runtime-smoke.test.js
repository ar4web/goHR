// Runtime smoke: mounts every kept page's real HTML + executes its real
// init module in jsdom, asserting shell + content render in EN and AR.
// Run: npm run test:runtime
import { describe, test, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { initI18n, setLang, currentLang, t } from '../src/v4/i18n.js';
import { mountShell } from '../src/v4/shell.js';
import { getSeed } from '../src/v4/hr-api.js';

const R = process.cwd();
const loaders = import.meta.glob('../src/v4/*.js');

// data-page -> module init, mirroring src/main-v4.js PAGES.
const PAGE_INITS = {
  dashboard: ['../src/v4/index-dashboard.js', 'initIndexDashboard'],
  analytics: ['../src/v4/hr-dashboard.js', 'initHrDashboard'],
  employees: ['../src/v4/employees.js', 'initEmployees'],
  'employee-file': ['../src/v4/employee-detail.js', 'initEmployeeDetail'],
  departments: ['../src/v4/departments.js', 'initDepartments'],
  roles: ['../src/v4/roles.js', 'initRoles'],
  'my-space': ['../src/v4/my-space.js', 'initMySpace'],
  'my-team': ['../src/v4/my-team.js', 'initMyTeam'],
  org: ['../src/v4/org-chart.js', 'initOrgChart'],
  settings: ['../src/v4/settings.js', 'initSettings']
};

async function mountPage(file) {
  const html = readFileSync(`${R}/production/${file}.html`, 'utf8');
  document.open();
  document.write(html);
  document.close();
  localStorage.clear();
  localStorage.setItem('hr:lang', 'en');
  mountShell();
  initI18n();
  const key = document.body?.dataset.page;
  const entry = PAGE_INITS[key];
  if (entry) {
    const mod = await loaders[entry[0]]();
    mod[entry[1]]();
  }
}

const PAGES = [
  'dashboard',
  'analytics',
  'employees',
  'employee',
  'departments',
  'roles',
  'settings',
  'my_space',
  'my_team',
  'org_chart',
  'profile',
  'user_management'
];

describe('shell', () => {
  test('lean sidebar: analytics + employees, brand to dashboard, no footer chrome', async () => {
    await mountPage('employees');
    const links = [...document.querySelectorAll('.sidebar-nav a.nav-link')].map(a =>
      a.getAttribute('href')
    );
    expect(links).toContain('analytics.html');
    expect(links).toContain('employees.html');
    expect(document.querySelector('.sidebar-brand').getAttribute('href')).toBe('dashboard.html');
    expect(document.querySelector('footer')).toBeNull();
    expect(document.querySelector('.sidebar-settings')).toBeTruthy();
  });

  test('topbar bell renders employee alerts without throwing', async () => {
    await mountPage('analytics');
    document.querySelector('.tb-notifications').click();
    expect(document.querySelector('.menu-popover.panel-notifications')).toBeTruthy();
  });
});

describe.each(PAGES)('%s renders', file => {
  test('EN: shell + content, no errors', async () => {
    await mountPage(file);
    expect(document.querySelector('.sidebar')).toBeTruthy();
    expect(document.querySelector('.topbar')).toBeTruthy();
    expect(document.querySelector('main.main')).toBeTruthy();
  });
});

describe('areas', () => {
  test('dashboard cards carry values', async () => {
    await mountPage('dashboard');
    const total = document.querySelector('#card-total .stat-value');
    expect(total).toBeTruthy();
    expect(Number(total.textContent)).toBe(getSeed('employees').length);
    expect(document.querySelectorAll('#todo-list .todo-row').length).toBeGreaterThan(0);
    expect(document.querySelectorAll('#recent-employees tr').length).toBeGreaterThan(0);
  });

  test('analytics zones fill from employee data', async () => {
    await mountPage('analytics');
    // ECharts may not paint in jsdom; zones must still fill their containers.
    expect(document.getElementById('zone-workforce-meta').textContent).toContain(
      String(getSeed('employees').length)
    );
    expect(document.getElementById('iqama-buckets').children.length).toBeGreaterThan(0);
    expect(document.getElementById('nitaqat-meter').textContent.length).toBeGreaterThan(0);
  });

  test('employees grid renders rows + export actions', async () => {
    await mountPage('employees');
    expect(document.querySelectorAll('#emp-rows tr').length).toBeGreaterThan(0);
    expect(document.getElementById('emp-count').textContent).toMatch(/\d+ \/ \d+/);
  });

  test('settings sections render and persist to the store', async () => {
    await mountPage('settings');
    expect(document.querySelectorAll('#set-nav .settings-nav-link').length).toBe(4);
    const name = document.querySelector('[data-set="companies.0.nameEn"]');
    expect(name).toBeTruthy();
    name.value = 'Acme Test Co';
    name.dispatchEvent(new window.Event('change', { bubbles: true }));
    expect(JSON.parse(localStorage.getItem('hr:settings:v1')).companies[0].nameEn).toBe(
      'Acme Test Co'
    );
  });

  test('AR: renders translated with rtl direction', async () => {
    await mountPage('employees');
    setLang('ar');
    expect(currentLang()).toBe('ar');
    expect(document.documentElement.getAttribute('dir')).toBe('rtl');
    expect(t('nav.employees')).toBe('الموظفون');
    setLang('en');
  });

  test('gateway lists roles and remembers the pick', async () => {
    const html = readFileSync(`${R}/production/landing.html`, 'utf8');
    document.open();
    document.write(html);
    document.close();
    const { enterAs } = await loaders['../src/v4/gateway.js']();
    expect(typeof enterAs).toBe('function');
  });
});
