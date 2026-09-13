// Runtime smoke: mounts every HR page's real HTML + executes its real
// init modules in jsdom, asserting render output in EN and AR, plus
// write-flow probes (language toggle, goal create, review advance).
// Run: npm run test:runtime
import { describe, test, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { initI18n, setLang, currentLang, t, applyBranding } from '../src/v4/i18n.js';
import { mountShell } from '../src/v4/shell.js';
import {
  leaveWindows,
  returnStats,
  expiryDeck,
  iqamaBuckets,
  contractsEnding,
  perfRanking,
  invoiceTotals,
  tickerAlerts
} from '../src/v4/hr-statutory.js';
import { getSeed } from '../src/v4/hr-api.js';
import { renderEchart } from '../src/v4/chart-helper.js';

const R = process.cwd();
const loaders = import.meta.glob('../src/v4/*.js');

const MARKERS = {
  hr_review: '#rw-flow > *',
  hr_contract: '#cd-party:text',
  hr_employee: '#emp360-head > *',
  hr_leave_calendar: '#lc-grid > *',
  hr_tracker: '#track-board > *',
  hr_org_chart: '#org-tree > *',
  hr_dashboard: '#dash-head > *',
  hr_settings: '#set-brand input',
  hr_roles: '#ro-matrix tr',
  hr_my_space: '#my-head > *',
  hr_client_dashboard: '#cl-roster > *',
  hr_payslip: '#ps-doc > *',
  hr_approvals: '#ap-body > *',
  hr_my_team: '#tm-grid > *',
  hr_pipeline: '#pl-board > *'
};
const DEFAULT_MARKER = 'tbody tr, .hr-wall > *, .hr-kpi, .hr-funnel-row';
const PARAMS = {
  hr_review: '?id=RV-2026-001',
  hr_contract: '?id=CT-2026-001',
  hr_employee: '?code=EMP-0006'
};

function markerHit(sel) {
  if (sel.endsWith(':text')) {
    const el = document.querySelector(sel.slice(0, -5));
    return !!el && el.textContent.trim().length > 0;
  }
  return !!document.querySelector(sel);
}

async function mountPage(page, paramOverride) {
  const html = readFileSync(`${R}/production/${page}.html`, 'utf8');
  document.open();
  document.write(html);
  document.close();
  window.history.replaceState({}, '', `/${paramOverride || PARAMS[page] || ''}`);
  localStorage.clear();
  localStorage.setItem('hr:lang', 'en');
  mountShell();
  initI18n();
  for (const m of html.matchAll(/from '(\/src\/v4\/[a-z0-9-]+\.js)'/g)) {
    const key = `../src/v4/${m[1].split('/').pop().replace(/\.js$/, '')}.js`;
    const mod = await loaders[key]();
    for (const [k, v] of Object.entries(mod)) {
      if (k.startsWith('init') && typeof v === 'function') {
        v();
      }
    }
  }
}

const pages = readdirSync(`${R}/production`)
  .filter(f => f.startsWith('hr_') && f.endsWith('.html'))
  .map(f => f.slice(0, -5));

describe('interactions (early: minimal cross-talk)', () => {
  // Single mount: module inits wire listeners only once (booted guard),
  // mirroring one real page load.
  test('toggle + new-goal write flow', async () => {
    await mountPage('hr_goals');
    const btn = document.getElementById('lang-toggle');
    expect(btn).toBeTruthy();
    btn.click();
    expect(document.documentElement.getAttribute('dir')).toBe('rtl');
    expect(document.title).not.toBe('Goals | Dash');
    expect(currentLang()).toBe('ar');
    btn.click();
    expect(document.documentElement.getAttribute('dir')).toBe('ltr');

    const before = document.querySelectorAll('#gl-rows tr').length;
    expect(before).toBeGreaterThan(0);
    document.getElementById('gl-new').click();
    expect(document.querySelector('.modal-backdrop')).toBeTruthy();
    document.getElementById('ng-te').value = 'E2E Probe Goal';
    document.getElementById('ng-target').value = '10';
    document.getElementById('ng-current').value = '3';
    document.querySelector('.modal-footer .btn-primary').click();
    expect(document.querySelectorAll('#gl-rows tr').length).toBe(before + 1);
    expect(localStorage.getItem('hr:import:goals') || '').toContain('E2E Probe Goal');
  });

  test('topbar bell surfaces live HR alerts', async () => {
    await mountPage('hr_goals');
    document.querySelector('.tb-notifications').click();
    const panel = document.querySelector('.menu-popover.panel-notifications');
    expect(panel).toBeTruthy();
    // CT-2026-005 (ends 2026-10-15) is a permanent compliance demo: listed
    // while upcoming and after expiry alike.
    expect(panel.textContent).toContain('CT-2026-005');
    expect(panel.querySelectorAll('.panel-row').length).toBeGreaterThan(5);
  });

  test('review advance (draft -> self) patches the seed row', async () => {
    await mountPage('hr_review', '?id=RV-2026-004');
    expect(document.querySelector('#rw-release')).toBeTruthy();
    document.querySelector('#rw-release').click();
    expect(document.getElementById('rw-flow').textContent).toMatch(/Self/);
    const raw = localStorage.getItem('hr:import:reviews') || '';
    expect(raw).toContain('RV-2026-004');
    expect(raw).toContain('"self"');
  });
});

describe('sidebar hierarchy', () => {
  test('sidebar IA: HR + Workspace in nav, Settings docked in footer', async () => {
    const { NAV, SETTINGS_NAV, ICONS } = await import('../src/v4/shell-render.js');
    // Two groups: HR operations first, daily-work modules second.
    expect(NAV.map(g => g.label)).toEqual(['HR & Operations', 'Workspace']);
    const hr = NAV[0];
    const ws = NAV[1];
    expect(hr.items.length).toBe(10);
    expect(ws.items.map(i => i.text)).toEqual(['Notifications']);
    const walk = (items, out = []) => {
      for (const it of items || []) {
        if (it.key) {out.push(it);}
        if (it.children) {walk(it.children, out);}
      }
      return out;
    };
    const mainLeaves = NAV.flatMap(g => g.items.flatMap(p => walk(p.children)));
    expect(mainLeaves.length).toBe(37);
    const footLeaves = SETTINGS_NAV.flatMap(s => walk(s.items));
    // Window configures; it never hosts daily-work modules.
    expect(SETTINGS_NAV.map(s => s.section)).toEqual(['HR Settings', 'Dashboard views', 'System']);
    expect(new Set([...mainLeaves, ...footLeaves].map(l => l.key)).size).toBe(48);
    for (const p of [...hr.items, ...ws.items]) {
      expect(p.icon in ICONS).toBe(true);
    }
    await mountPage('hr_dashboard');
    // Flat sidebar: one link per section, pointing at the section main screen.
    const parents = [...document.querySelectorAll('.sidebar-nav a.nav-parent')];
    expect(parents.length).toBe(10);
    expect(document.querySelectorAll('.sidebar-nav .nav-tree').length).toBe(0);
    expect(document.querySelectorAll('.sidebar-nav .nav-sublink').length).toBe(0);
    for (const p of [...hr.items, ...ws.items].filter(p => p.children)) {
      expect(
        parents.some(a => a.getAttribute('href') === p.children[0].href)
      ).toBe(true);
    }
    expect(parents.every(a => a.querySelector('.nav-text'))).toBe(true);
    // Expand-all: every section lists its pages inline; the current one is marked.
    expect(document.querySelector('.section-tabs')).toBe(null);
    const pages = [...document.querySelectorAll('.sidebar-nav .nav-page')];
    expect(pages.map(a => a.getAttribute('href')).sort()).toEqual(
      mainLeaves.map(l => l.href).sort()
    );
    expect(
      document.querySelector('.sidebar-nav .nav-page.active')?.getAttribute('href')
    ).toBe('hr_dashboard.html');
    // Footer owns Settings alone — no user card (avatar lives top-right).
    // Clicking it opens a centered window, not an inline flyout.
    expect(document.querySelector('.sidebar .sidebar-settings')).toBeTruthy();
    expect(document.querySelector('.sidebar .sidebar-user')).toBeNull();
    document.querySelector('.sidebar .settings-toggle').click();
    const win = document.querySelector('.modal-dialog .settings-window');
    expect(win).toBeTruthy();
    expect(
      [...win.querySelectorAll('.settings-col-title')].map(e => e.textContent.trim())
    ).toEqual(['Company', 'HR Settings', 'Dashboard views', 'System']);
    const winLinks = [...win.querySelectorAll('a.settings-cell')];
    for (const l of footLeaves) {
      expect(winLinks.some(a => a.getAttribute('href') === l.href)).toBe(true);
    }
    // First column is Company: active company marked, Manage links out.
    const companyCol = win.querySelectorAll('.settings-col')[0];
    expect(companyCol.querySelector('.settings-col-title')?.textContent.trim()).toBe('Company');
    expect(
      companyCol.querySelector('button.settings-cell[aria-current="true"]')
    ).toBeTruthy();
    expect(
      companyCol.querySelector('a.settings-cell[href="hr_settings.html"]')
    ).toBeTruthy();
    // Footer holds Settings alone now — the company switcher moved into the window.
    expect(document.querySelector('.sidebar .company-switch')).toBe(null);
    setLang('ar');
    expect(document.querySelector('.sidebar').textContent).toContain('الإعدادات');
    expect(document.querySelector('.sidebar-nav').textContent).toContain('مساحة العمل');
    document.querySelector('.sidebar .settings-toggle').click();
    // A previous window may still animate out — the newest dialog is last.
    const dialogs = [...document.querySelectorAll('.modal-dialog')];
    const latest = dialogs[dialogs.length - 1];
    expect(latest.textContent).toContain('لوحات العرض');
    expect(latest.textContent).toContain('النظام');
    expect(latest.textContent).toContain('الشركة');
    setLang('en');
  });

  test('sections open main screens with sibling tabs on top', async () => {
    await mountPage('hr_dashboard');
    const labels = [...document.querySelectorAll('.sidebar-nav .nav-label')].map(e =>
      e.textContent.trim()
    );
    expect(labels).toEqual(['HR & Operations', 'Workspace']);
    // Sidebar parents are flat links in workflow order — no dropdowns anywhere.
    const parentTexts = [...document.querySelectorAll('.sidebar-nav .nav-parent .nav-text')].map(
      e => e.textContent
    );
    expect(parentTexts).toEqual([
      'Overview',
      'People',
      'Time & Leave',
      'Hiring',
      'Growth',
      'Employee',
      'Compliance',
      'Accounts',
      'Operations',
      'Portals'
    ]);
    for (const gone of ['General', 'E-commerce', 'Projects', 'Apps']) {
      expect(parentTexts).not.toContain(gone);
    }
    expect(document.querySelectorAll('.sidebar-nav button').length).toBe(0);
    // Clicking People lands on its main screen; its pages list inline.
    expect(
      document.querySelector('.sidebar-nav a.nav-parent[href="hr_employees.html"]')
    ).toBeTruthy();
    await mountPage('hr_employees');
    expect(
      document.querySelector('.sidebar-nav a.nav-parent.active')?.getAttribute('href')
    ).toBe('hr_employees.html');
    const peoplePages = [...document.querySelectorAll('.sidebar-nav .nav-page')];
    expect(peoplePages.length).toBe(37);
    expect(
      document.querySelector('.sidebar-nav .nav-page.active')?.getAttribute('href')
    ).toBe('hr_employees.html');
    // Expand-all: every section lists its pages — 10 lists, no single rows.
    expect(document.querySelectorAll('.sidebar-nav .nav-pages').length).toBe(10);
    await mountPage('notifications');
    expect(
      document.querySelector('.sidebar-nav a.nav-link[href="notifications.html"]')
    ).toBeTruthy();
    // Window: HR setup, look & feel, company assets, system access.
    document.querySelector('.sidebar .settings-toggle').click();
    const win = document.querySelector('.modal-dialog .settings-window');
    expect(
      [...win.querySelectorAll('.settings-col-title')].map(e => e.textContent.trim())
    ).toEqual(['Company', 'HR Settings', 'Dashboard views', 'System']);
    expect(
      win.querySelector('a.settings-cell[href="index.html"] .settings-cell-label')?.textContent
    ).toBe('Operations');
    expect(win.querySelector('a.settings-cell[href="user_management.html"]')).toBeTruthy();
    expect(
      [...win.querySelectorAll('.settings-sub-title')].map(e => e.textContent.trim())
    ).toEqual([]);
    // Active settings page highlights its cell.
    // Filter narrows cells, hides empty groups, shows an empty state.
    const input = win.querySelector('.settings-search input');
    input.value = 'audit';
    input.dispatchEvent(new window.Event('input', { bubbles: true }));
    const shown = [...win.querySelectorAll('a.settings-cell')].filter(a => !a.hidden);
    expect(shown.map(a => a.getAttribute('href'))).toEqual(['hr_audit.html']);
    input.value = 'zzz-no-such-setting';
    input.dispatchEvent(new window.Event('input', { bubbles: true }));
    expect(win.querySelector('.settings-empty').hidden).toBe(false);
    input.value = '';
    input.dispatchEvent(new window.Event('input', { bubbles: true }));
    expect(win.querySelector('.settings-empty').hidden).toBe(true);
    // Escape dismisses the window.
    document.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape' }));
    await new Promise(r => setTimeout(r, 350));
    expect(document.querySelector('.modal-backdrop')).toBe(null);
    setLang('ar');
    const parents = [...document.querySelectorAll('.sidebar-nav .nav-parent .nav-text')].map(
      e => e.textContent
    );
    expect(parents).toContain('نظرة عامة');
    expect(parents).toContain('الأفراد');
    // Inline pages translate too — active page included.
    // Notifications is a flat sidebar link (no parent/children) — translated
    // via its nav key like any other leaf.
    expect(
      document.querySelector('.sidebar-nav a.nav-link[href="notifications.html"] .nav-text')?.textContent
    ).toBe('التنبيهات');
    document.querySelector('.sidebar .settings-toggle').click();
    const winAr = document.querySelector('.modal-dialog .settings-window');
    const subNames = [...winAr.querySelectorAll('.settings-sub-title')].map(e => e.textContent);
    expect(subNames).toEqual([]);
    expect(
      winAr.querySelector('a.settings-cell[href="hr_audit.html"] .settings-cell-label')
        ?.textContent
    ).toBe(t('nav.hr-audit'));
    expect(
      winAr.querySelector('a.settings-cell[href="profile.html"] .settings-cell-label')
        ?.textContent
    ).toBe(t('nav.profile'));
    setLang('en');
    await mountPage('profile');
    // Company profile lives in the window: toggle highlights, cell is active.
    expect(
      document.querySelector('.sidebar .sidebar-settings').classList.contains('has-active')
    ).toBe(true);
    document.querySelector('.sidebar .settings-toggle').click();
    expect(
      document
        .querySelector('.modal-dialog a.settings-cell[href="profile.html"]')
        ?.classList.contains('active')
    ).toBe(true);
    await mountPage('settings');
    expect(
      document.querySelector('.sidebar .sidebar-settings').classList.contains('has-active')
    ).toBe(true);
    document.querySelector('.sidebar .settings-toggle').click();
    expect(
      document
        .querySelector('.modal-dialog a.settings-cell[href="settings.html"]')
        ?.classList.contains('active')
    ).toBe(true);
  });

  test('white-label branding applies from company profile', async () => {
    await mountPage('hr_dashboard');
    applyBranding();
    expect(document.title).toContain('Manpower Supply Co.');
    expect(document.querySelector('.sidebar-brand .brand-name')?.textContent).toBe(
      'Manpower Supply Co.'
    );
    expect(document.documentElement.style.getPropertyValue('--primary')).toBe('#1ABB9C');
    setLang('ar');
    // Stale LANG_EVENT listeners from earlier mounts re-run applyI18n(document)
    // (their `|| document` fallback) after setLang's branding — a jsdom-only
    // artifact; re-apply to assert the composed end state.
    applyBranding();
    expect(document.title).toContain('شركة توريد العمالة');
    setLang('en');
  });

  test('sidebar is flat with the active section marked', async () => {
    const { renderSidebar } = await import('../src/v4/shell-render.js');
    const html = renderSidebar('hr-dashboard');
    expect(html).not.toContain('nav-toggle');
    expect(html).not.toContain('nav-tree');
    expect(html).not.toContain('nav-sublink');
    expect(html).toContain('nav-parent active');
    expect(html).toContain('aria-current="page"');
    // Active section lists its pages inline beneath it.
    expect(html).toContain('nav-pages');
    expect(html).toContain('hr_reports.html');
    expect(html).toContain('hr_dashboard.html');
  });

  test('hovering a link warms the next document, once', async () => {
    await mountPage('hr_dashboard');
    // Settings cells are never idle-warmed, so this hover must fetch.
    document.querySelector('.sidebar .settings-toggle').click();
    const link = document.querySelector(
      '.modal-dialog a.settings-cell[href="hr_audit.html"]'
    );
    expect(link).toBeTruthy();
    const seen = [];
    const realFetch = globalThis.fetch;
    globalThis.fetch = (url) => {
      seen.push(String(url));
      return Promise.resolve({ ok: true });
    };
    try {
      // Synchronous block: no timer can interleave, so every recorded
      // fetch below comes from these two hovers alone.
      link.dispatchEvent(new window.MouseEvent('mouseover', { bubbles: true }));
      // Every binding warms the same URL once (test mounts pile up
      // listeners; production mounts once, so exactly one fetch).
      expect(seen.length).toBeGreaterThan(0);
      expect(new Set(seen)).toEqual(new Set(['hr_audit.html']));
      const afterFirst = seen.length;
      link.dispatchEvent(new window.MouseEvent('mouseover', { bubbles: true }));
      // The repeat hover refetches nothing (per-link dedupe).
      expect(seen.length).toBe(afterFirst);
    } finally {
      globalThis.fetch = realFetch;
    }
  });

  test('multi-company store: migrate, switch, guard, letters', async () => {
    const st = await import('../src/v4/hr-statutory.js');
    // Legacy single-company shape migrates on read.
    localStorage.clear();
    localStorage.setItem(
      'hr:settings:v1',
      JSON.stringify({ company: { nameEn: 'Legacy Co', cr: '1010000001' } })
    );
    let s = st.getSettings();
    expect(s.companies.length).toBe(1);
    expect(s.companies[0].nameEn).toBe('Legacy Co');
    expect(s.company.nameEn).toBe('Legacy Co');
    expect(s.company.vat).toBe('');
    // Add second company (becomes active), switch back, guard last delete.
    const added = st.addCompany({ nameEn: 'Second Co', nameAr: 'الثانية', cr: '1010000002', vat: '300000000000003' });
    s = st.getSettings();
    expect(s.companies.length).toBe(2);
    expect(s.company.nameEn).toBe('Second Co');
    st.setActiveCompany(s.companies[0].id);
    expect(st.getSettings().company.nameEn).toBe('Legacy Co');
    expect(st.getSettings().company.vat).toBe('');
    st.saveCompany(s.companies[0].id, { vat: '300000000000003', phone: '0111111111', email: 'a@co.sa' });
    expect(st.getActiveCompany().vat).toBe('300000000000003');
    // Documents read the same active profile (invoice/payslip/settlement).
    expect(st.sellerProfile().vat).toBe('300000000000003');
    expect(st.sellerProfile().cr).toBe('1010000001');
    expect(st.removeCompany('nope').removed).toBe(false);
    const one = st.getCompanies();
    st.removeCompany(one[0].id);
    expect(st.removeCompany(st.getCompanies()[0].id).removed).toBe(false);
    expect(st.getCompanies().length).toBe(1);
    expect(added.id).toBeTruthy();
    // Letters: first is default, deleting it promotes the next.
    const coId = st.getCompanies()[0].id;
    st.addLetter(coId, { name: 'head.pdf', kind: 'application/pdf', size: 100, dataUrl: 'data:application/pdf;base64,AA==' });
    st.addLetter(coId, { name: 'head2.pdf', kind: 'application/pdf', size: 100, dataUrl: 'data:application/pdf;base64,BB==' });
    let letters = st.getActiveCompany().letters;
    expect(letters.length).toBe(2);
    expect(letters[0].isDefault).toBe(true);
    st.setDefaultLetter(coId, letters[1].id);
    expect(st.getActiveCompany().letters[1].isDefault).toBe(true);
    st.removeLetter(coId, letters[1].id);
    letters = st.getActiveCompany().letters;
    expect(letters.length).toBe(1);
    expect(letters[0].isDefault).toBe(true);
    localStorage.clear();
  });

  test('settings window Company column follows and switches the active company', async () => {
    const st = await import('../src/v4/hr-statutory.js');
    await mountPage('hr_dashboard');
    // Seed profile is the active company.
    const first = st.getActiveCompany();
    document.querySelector('.sidebar .settings-toggle').click();
    const win = document.querySelector('.modal-dialog .settings-window');
    const col = win.querySelectorAll('.settings-col')[0];
    expect(col.querySelector('.settings-col-title')?.textContent.trim()).toBe('Company');
    expect(
      col.querySelector('button.settings-cell[aria-current="true"]')?.textContent
    ).toContain(first.nameEn);
    // Adding a company activates it; reopening the window repaints.
    st.addCompany({ nameEn: 'Riyadh Supply', nameAr: 'تموين الرياض', cr: '1010000007', vat: '300000000000003' });
    document.querySelector('.sidebar .settings-toggle').click();
    const dialogs = [...document.querySelectorAll('.modal-dialog')];
    const win2 = dialogs[dialogs.length - 1];
    const col2 = win2.querySelectorAll('.settings-col')[0];
    expect(
      col2.querySelector('button.settings-cell[aria-current="true"]')?.textContent
    ).toContain('Riyadh Supply');
    // Switching back flips the active profile (reload is a no-op under jsdom).
    const back = [...col2.querySelectorAll('button.settings-cell')].find(b =>
      b.textContent.includes(first.nameEn)
    );
    back.click();
    expect(st.getActiveCompany().id).toBe(first.id);
    localStorage.clear();
  });

  test('settings page edits VAT/profile and lists companies + letters', async () => {
    await mountPage('hr_settings');
    // Brand form carries VAT/phone/email fields.
    expect(document.getElementById('set-vat')).toBeTruthy();
    expect(document.getElementById('set-phone')).toBeTruthy();
    expect(document.getElementById('set-email')).toBeTruthy();
    // Save writes VAT into the active company entry.
    document.getElementById('set-vat').value = '300000000000003';
    document.getElementById('set-save').click();
    const st = await import('../src/v4/hr-statutory.js');
    expect(st.getActiveCompany().vat).toBe('300000000000003');
    expect(st.getCompanies().length).toBe(1);
    // Companies card lists the profile with a CR · VAT line.
    expect(document.getElementById('set-companies')?.textContent).toContain('CR');
    // Letters card renders with import control and hint.
    expect(document.getElementById('set-letters')).toBeTruthy();
    expect(document.getElementById('set-letters')?.textContent).toContain('PDF');
    localStorage.clear();
  });

  test('tables share one language: aligned headers, numerics, selection', async () => {
    await mountPage('hr_dashboard');
    // Numeric columns right-align via .num on cells AND headers…
    const nums = [...document.querySelectorAll('table.table .num')];
    expect(nums.length).toBeGreaterThan(0);
    expect(nums.every(el => ['TD', 'TH'].includes(el.tagName))).toBe(true);
    // …but never on the table element itself (selector-bug regression guard).
    expect(
      [...document.querySelectorAll('table.table')].every(t => !t.classList.contains('num'))
    ).toBe(true);
    // Header cells exist with real column labels.
    expect(document.querySelector('table.table th')?.textContent.trim().length).toBeGreaterThan(0);
    await mountPage('hr_employees');
    const box = document.querySelector('#emp-rows .row-cb');
    expect(box).toBeTruthy();
    box.checked = true;
    box.dispatchEvent(new window.Event('change', { bubbles: true }));
    expect(box.closest('tr').querySelector('td')).toBeTruthy();
  });

  test('navigating fades the page out, ctrl-click does not', async () => {
    await mountPage('hr_dashboard');
    const link = document.querySelector('.sidebar-nav a.nav-parent[href="hr_employees.html"]');
    expect(link).toBeTruthy();
    expect(document.body.classList.contains('page-leave')).toBe(false);
    link.dispatchEvent(new window.MouseEvent('click', { bubbles: true, cancelable: true }));
    expect(document.body.classList.contains('page-leave')).toBe(true);
    document.body.classList.remove('page-leave');
    link.dispatchEvent(
      new window.MouseEvent('click', { bubbles: true, cancelable: true, ctrlKey: true })
    );
    expect(document.body.classList.contains('page-leave')).toBe(false);
    // Download links never veil (no unload follows — the strand-white bug).
    const dl = document.createElement('a');
    dl.href = 'report.xlsx';
    dl.setAttribute('download', 'report.xlsx');
    dl.textContent = 'x';
    document.body.appendChild(dl);
    dl.dispatchEvent(new window.MouseEvent('click', { bubbles: true, cancelable: true }));
    expect(document.body.classList.contains('page-leave')).toBe(false);
    dl.remove();
    document.body.classList.remove('page-leave');
  });

  test('topbar carries no breadcrumb trail', async () => {
    await mountPage('hr_dashboard');
    expect(document.querySelector('.topbar .breadcrumb')).toBe(null);
    expect(document.querySelector('.topbar .sidebar-toggle')).toBeTruthy();
    expect(document.querySelector('.topbar .search-box input')).toBeTruthy();
    await mountPage('hr_roles');
    expect(document.querySelector('.topbar .breadcrumb')).toBe(null);
  });

  test('all sections list their pages inline with the active one marked', async () => {
    await mountPage('hr_leave');
    const lists = [...document.querySelectorAll('.sidebar-nav .nav-pages')];
    expect(lists.length).toBe(10);
    const leaveList = lists.find(l =>
      [...l.querySelectorAll('.nav-page')].some(a => a.getAttribute('href') === 'hr_leave.html')
    );
    expect(leaveList).toBeTruthy();
    expect(leaveList.querySelector('.nav-page.active')?.getAttribute('href')).toBe(
      'hr_leave.html'
    );
    // Settings pages list the same nav — the window is an extra, not a replacement.
    await mountPage('hr_settings');
    expect(document.querySelectorAll('.sidebar-nav .nav-pages').length).toBe(10);
  });

  test('shell renders no footer chrome', async () => {
    const { renderShell } = await import('../src/v4/shell-render.js');
    expect(renderShell({})).not.toHaveProperty('footer');
    await mountPage('hr_dashboard');
    applyBranding();
    expect(document.querySelector('.footer')).toBe(null);
  });
});

describe('headers + buttons', () => {
  test('employee file uses the system page header', async () => {
    await mountPage('hr_employee');
    expect(document.querySelector('.page-header .page-title')?.textContent).toBe('Employee file');
    expect(document.querySelector('.crumbs')).toBe(null);
  });
});

describe('white-label', () => {
  test('no template brand leaks into shell chrome or auth pages', async () => {
    await mountPage('hr_dashboard');
    // Footer user card removed — account lives in the top-right avatar menu.
    expect(document.querySelector('.sidebar .sidebar-user')).toBe(null);
    expect(document.querySelector('.sidebar .sidebar-settings')).not.toBe(null);
    expect(document.querySelector('.tb-docs')).toBe(null);
    expect(document.getElementById('lang-toggle')).not.toBe(null);
    await mountPage('login');
    expect(document.querySelector('.brand-name')?.textContent).toContain('Dash');
  });
});

describe('security', () => {
  test('imported row values render inert (stored-XSS overlay)', async () => {
    await mountPage('hr_employees');
    localStorage.setItem(
      'hr:import:employees',
      JSON.stringify([
        {
          code: 'X"><img src=c onerror="window.__xss=1">',
          nameEn: '<img src=x onerror="window.__xss=1">',
          nameAr: '<svg onload="window.__xss=1">',
          nat: '<b>bold</b>',
          prof: '"><img src=p>',
          dept: 'HR',
          st: 'active',
          q: '"><img src=q>',
          saudi: false,
          client: ''
        }
      ])
    );
    // Re-run inits so the overlay row renders (same pattern as the AR tests).
    const html = readFileSync(`${R}/production/hr_employees.html`, 'utf8');
    for (const m of html.matchAll(/from '(\/src\/v4\/[a-z0-9-]+\.js)'/g)) {
      const key = `../src/v4/${m[1].split('/').pop().replace(/\.js$/, '')}.js`;
      const mod = await loaders[key]();
      for (const [k, v] of Object.entries(mod)) {
        if (k.startsWith('init') && typeof v === 'function') {
          v();
        }
      }
    }
    expect(document.querySelector('#emp-rows img')).toBeNull();
    expect(document.querySelector('#emp-rows b')).toBeNull();
    const body = document.querySelector('#emp-rows').textContent;
    expect(body).toContain('<img src=x');
    expect(body).toContain('<svg onload');
    expect(body).toContain('<b>bold</b>');
    const link = document.querySelector('#emp-rows a[href*="hr_employee.html?code=X"]');
    expect(link?.getAttribute('href')).toContain('X%22%3E');
    expect(window.__xss).toBeUndefined();
  });

  test('gateway lists roles and remembers the pick', async () => {
    await mountPage('landing');
    expect(document.querySelector('.sidebar-nav')).toBeNull();
    const cards = [...document.querySelectorAll('#gw-roles .gw-card')];
    expect(cards.length).toBe(9);
    document.querySelector('#gw-roles [data-role="employee"]').click();
    expect(localStorage.getItem('hr:role-view')).toBe('employee');
    document.querySelector('#gw-lang [data-lang="ar"]').click();
    expect(document.querySelector('#gw-roles [data-role="admin"] strong')?.textContent).toBe(
      'مدير النظام'
    );
    setLang('en');
  });
});

describe.each(pages)('%s renders', page => {
  test('EN: sidebar + root + content, no errors', async () => {
    await mountPage(page);
    expect(document.querySelector('.sidebar-nav')).toBeTruthy();
    const sel = MARKERS[page] || DEFAULT_MARKER;
    expect(markerHit(sel)).toBe(true);
  });

  test('AR: renders translated', async () => {
    await mountPage(page);
    localStorage.setItem('hr:lang', 'ar');
    document.documentElement.setAttribute('dir', 'rtl');
    // Re-run inits: renderAll paths re-execute (listener wiring bails via booted).
    const html = readFileSync(`${R}/production/${page}.html`, 'utf8');
    for (const m of html.matchAll(/from '(\/src\/v4\/[a-z0-9-]+\.js)'/g)) {
      const key = `../src/v4/${m[1].split('/').pop().replace(/\.js$/, '')}.js`;
      const mod = await loaders[key]();
      for (const [k, v] of Object.entries(mod)) {
        if (k.startsWith('init') && typeof v === 'function') {
          v();
        }
      }
    }
    const sel = MARKERS[page] || DEFAULT_MARKER;
    expect(markerHit(sel)).toBe(true);
    if (page !== 'hr_employee') {
      expect(document.querySelector('.page-pretitle')?.textContent).toBe(
        'الموارد البشرية والعمليات'
      );
    }
  });
});

describe('cross-talk', () => {
  test('setLang re-render storm throws nothing', async () => {
    await mountPage('hr_goals');
    expect(() => {
      setLang('ar');
      setLang('en');
    }).not.toThrow();
    expect(markerHit(DEFAULT_MARKER)).toBe(true);
  });
});

describe('command center', () => {
  test('header + Zone A money render with live values', async () => {
    await mountPage('hr_dashboard');
    const head = document.getElementById('dash-head').textContent;
    expect(head).toContain('1448');
    expect(head).toContain('2026');
    expect(head).toContain('3');
    expect(document.querySelector('#dash-head a[href="hr_settings.html"]')).toBeTruthy();
    const cards = [...document.querySelectorAll('#money-cards .stat-value')].map(
      e => e.textContent
    );
    expect(cards.length).toBe(4);
    expect(cards[0]).toContain('64,600');
    expect(cards[2]).toContain('789');
    // Index-style chrome: margin card carries a target progress bar,
    // departing card a 6-month sparkline (both always render).
    expect(document.querySelector('#money-cards .progress-thin .bar')).toBeTruthy();
    expect(document.querySelectorAll('#vac-cards .stat-spark .bar').length).toBe(6);
    expect(document.getElementById('zone-money-meta').textContent).toContain('1.22%');
    // Thin-margin insight fires (1.22% < 5%).
    expect(document.getElementById('money-net').textContent).toMatch(/5%|٥٪/);
    expect(document.getElementById('money-formula').textContent).toContain('(18)');
    const clients = [...document.querySelectorAll('#top-clients tbody tr')];
    expect(clients.length).toBe(2);
    expect(clients[0].textContent).toContain('Facility Care');
  });

  test('charts carry screen-reader summaries (canvas or fallback)', async () => {
    await mountPage('hr_dashboard');
    for (const id of ['chart-headcount', 'chart-tenure', 'chart-separation']) {
      const el = document.getElementById(id);
      expect(el.getAttribute('role')).toBe('img');
      expect(el.getAttribute('aria-label')?.length).toBeGreaterThan(20);
    }
    // jsdom has no canvas: helper must degrade gracefully, not throw.
    const deadline = Date.now() + 4000;
    while (Date.now() < deadline) {
      const states = ['chart-headcount', 'chart-tenure', 'chart-separation'].map(
        id => document.getElementById(id)
      );
      if (
        states.every(el => el.querySelector('canvas') || el.hasAttribute('data-chart-fallback'))
      ) {
        break;
      }
      await new Promise(r => setTimeout(r, 100));
    }
    for (const id of ['chart-headcount', 'chart-tenure', 'chart-separation']) {
      const el = document.getElementById(id);
      expect(el.querySelector('canvas') || el.getAttribute('data-chart-fallback')).toBeTruthy();
    }
  });

  test('§1 huroob card links the case file; zones remember collapse', async () => {
    await mountPage('hr_dashboard');
    const card = document.getElementById('huroob-card');
    expect(card.textContent).toMatch(/Huroob|هروب/);
    expect(card.querySelector('a[href*="EMP-0027"]')).toBeTruthy();
    const zones = [...document.querySelectorAll('details.zone[data-zone]')];
    expect(zones.length).toBe(7);
    expect(zones.map(z => z.dataset.zone)).toEqual([
      'money',
      'workforce',
      'leave',
      'geo',
      'compliance',
      'accounts',
      'actions'
    ]);
    expect(document.querySelectorAll('h1').length).toBe(1);
    expect(document.querySelectorAll('h2.zone-title').length).toBe(7);
    expect(document.querySelectorAll('h3.sub').length).toBe(3);
    expect(
      [...document.querySelectorAll('th')].every(th => th.getAttribute('scope') === 'col')
    ).toBe(true);
    expect(document.querySelector('#perf-top th .sr-only').textContent).toBe('Rank');
    for (const sel of [
      '#vac-list table',
      '#overdue-table table',
      '#eligible-table table',
      '#site-roster table',
      '#sponsor-matrix table',
      '#contracts-watch table'
    ]) {
      expect(document.querySelector(sel).getAttribute('aria-label').length).toBeGreaterThan(0);
    }
    const money = document.querySelector('details.zone[data-zone="money"]');
    money.open = false;
    money.dispatchEvent(new Event('toggle'));
    expect(localStorage.getItem('hr:ui:zone:money')).toBe('0');
  });

  test('zone bulk controls collapse/expand all and persist', async () => {
    await mountPage('hr_dashboard');
    const collapse = document.getElementById('zones-collapse');
    const expand = document.getElementById('zones-expand');
    expect(collapse?.textContent.trim().length).toBeGreaterThan(0);
    expect(expand?.textContent.trim().length).toBeGreaterThan(0);
    collapse.click();
    expect(
      [...document.querySelectorAll('details.zone[data-zone]')].every(z => !z.open)
    ).toBe(true);
    expect(localStorage.getItem('hr:ui:zone:geo')).toBe('0');
    expand.click();
    expect(
      [...document.querySelectorAll('details.zone[data-zone]')].every(z => z.open)
    ).toBe(true);
    expect(localStorage.getItem('hr:ui:zone:geo')).toBe('1');
    // Small multiples use the compact chart scale.
    for (const id of ['chart-nationality', 'chart-exp-iqama']) {
      expect(document.getElementById(id).classList.contains('chart-xs')).toBe(true);
    }
  });

  test('§2 leave pipeline matches the engine', async () => {
    await mountPage('hr_dashboard');
    const w = leaveWindows(getSeed('leaveRequests'));
    const cards = [...document.querySelectorAll('#vac-cards .stat-value')].map(e =>
      Number(e.textContent)
    );
    expect(cards).toEqual([w.onVacation.length, w.departing.length, w.returning.length]);
    const groups = [...document.querySelectorAll('#vac-list .vac-group')];
    expect(groups.length).toBe(3);
    expect(document.getElementById('zone-leave-meta').textContent).toContain(
      String(w.onVacation.length)
    );
    const rs = returnStats(getSeed('leaveRequests'));
    expect(document.getElementById('chart-return').getAttribute('aria-label')).toContain(
      `${rs.pct}%`
    );
    const overdueRows = document.querySelectorAll('#overdue-table tbody tr');
    expect(overdueRows.length).toBe(rs.overdue);
    expect(document.getElementById('overdue-table').textContent).toMatch(
      /Flight delay|تأخر رحلة الطيران/
    );
    expect(
      document.getElementById('chart-delayreasons').getAttribute('aria-label')?.length
    ).toBeGreaterThan(20);
    const eligRows = document.querySelectorAll('#eligible-table tbody tr');
    expect(eligRows.length).toBeGreaterThan(10);
    expect(eligRows[0].querySelector('a[href="hr_leave.html"]')).toBeTruthy();
  });

  test('§3 geo renders map data, roster and mixes', async () => {
    await mountPage('hr_dashboard');
    // Workforce map card archived — roster, chips and mixes still render.
    const roster = document.getElementById('site-roster');
    expect(roster.textContent).toContain('KAFD');
    expect(roster.querySelectorAll('tbody tr').length).toBe(6);
    expect(document.getElementById('city-chips').textContent).toContain('Riyadh');
    expect(document.getElementById('zone-geo-meta').textContent).toContain('6');
    for (const id of ['chart-nationality', 'chart-saudiexp', 'chart-gender', 'chart-profession']) {
      const el = document.getElementById(id);
      expect(el.getAttribute('role')).toBe('img');
      expect(el.getAttribute('aria-label')?.length).toBeGreaterThan(10);
    }
    expect(document.getElementById('chart-nationality').getAttribute('aria-label')).toContain(
      '(24)'
    );
    const mx = [...document.querySelectorAll('#sponsor-matrix tbody tr')];
    expect(mx.length).toBe(2);
    expect(mx[0].textContent).toContain('22');
    expect(mx[1].textContent).toContain('2');
    expect(document.querySelectorAll('#skills-cloud .skill-tag').length).toBeGreaterThan(10);
  });

  test('§4 compliance shield matches the engine', async () => {
    await mountPage('hr_dashboard');
    const chips = document.getElementById('compliance-chips').textContent;
    expect(chips).toContain('Qiwa');
    expect(chips).toContain('WPS');
    expect(chips).toContain('GOSI');
    expect(document.getElementById('nitaqat-meter').textContent).toContain('18.1%');
    const ajNums = [...document.querySelectorAll('#ajeer-validity strong')].map(e =>
      Number(e.textContent)
    );
    expect(ajNums.length).toBe(4);
    expect(ajNums.reduce((x, y) => x + y, 0)).toBe(18);
    expect(document.getElementById('levy-card').textContent).toContain('15,200');
    const bk = iqamaBuckets(getSeed('employees'));
    expect(document.getElementById('iqama-buckets').textContent).toContain(`≤30: ${bk.le30}`);
    const deck = expiryDeck(getSeed('employees'), getSeed('residencyDocs'));
    for (const [id, bands] of [
      ['chart-exp-iqama', deck.iqama],
      ['chart-exp-passport', deck.passport],
      ['chart-exp-insurance', deck.insurance]
    ]) {
      const label = document.getElementById(id).getAttribute('aria-label');
      expect(label).toContain(`Valid ${bands.valid}`);
    }
    const cols = [...document.querySelectorAll('#transfer-kanban .kanban-col')];
    expect(cols.length).toBe(4);
    expect(cols.every(c => c.querySelectorAll('.kanban-card').length === 1)).toBe(true);
    expect(document.getElementById('transfer-kanban').textContent).toContain('QX-2026-022');
    const watch = contractsEnding(getSeed('contracts'), 90);
    const watchRows = document.querySelectorAll('#contracts-watch tbody tr');
    expect(watchRows.length).toBe(watch.length);
    if (watch.length) {
      expect(watchRows[0].textContent).toContain(watch[0].id);
    }
    expect(document.getElementById('zone-compliance-meta').textContent.length).toBeGreaterThan(0);
  });

  test('§5 money + performance matrix match the engine', async () => {
    await mountPage('hr_dashboard');
    const cats = getSeed('expenseCategories');
    expect(document.getElementById('chart-expense').className).toContain('chart-box');
    expect(document.getElementById('chart-perf-trend').className).toContain('chart-box');
    const exLabel = document.getElementById('chart-expense').getAttribute('aria-label');
    expect(exLabel).toContain(cats[0].en);
    const inv = getSeed('invoices');
    const billRows = document.querySelectorAll('#billing-history tbody tr');
    expect(billRows.length).toBe(inv.length);
    expect(billRows[0].textContent).toContain(inv[0].month);
    expect(billRows[0].textContent).toContain('Al-Bina');
    expect(billRows[0].textContent).not.toContain('CL-001');
    expect(billRows[0].querySelector('.status').className).toContain('status-yellow');
    expect(billRows[1].querySelector('.status').className).toContain('status-green');
    expect(billRows[0].textContent).toContain(
      Math.round(invoiceTotals(inv[0].lines).total).toLocaleString('en-US')
    );
    const rank = perfRanking({
      attendance: getSeed('attendance'),
      goals: getSeed('goals'),
      feedback: getSeed('feedback'),
      timesheets: getSeed('timesheets')
    });
    const topRows = document.querySelectorAll('#perf-top tbody tr');
    const botRows = document.querySelectorAll('#perf-bottom tbody tr');
    expect(topRows.length).toBe(5);
    expect(botRows.length).toBe(5);
    expect(topRows[0].textContent).toContain(String(rank[0].index));
    expect(topRows[0].querySelectorAll('td')[1].textContent).not.toMatch(/^EMP-/);
    const trendLabel = document.getElementById('chart-perf-trend').getAttribute('aria-label');
    expect(trendLabel).toContain('Top 5');
    expect(trendLabel).toContain(String(rank[rank.length - 1].index));
    expect(document.querySelector('[data-i18n="hr.dashboard.perfFormula"]').textContent).toContain(
      '40%'
    );
  });

  test('§6 action center ticker, TASKS and checklist', async () => {
    await mountPage('hr_dashboard');
    const al = tickerAlerts({
      ajeerPermits: getSeed('ajeerPermits'),
      assignments: getSeed('assignments'),
      employees: getSeed('employees'),
      tasks: getSeed('tasks')
    });
    const track = document.getElementById('ticker-track').textContent;
    if (al.staleReturns.length) {
      expect(track).toContain(al.staleReturns[0].no);
    }
    expect(document.querySelectorAll('#ticker-track .ticker-band').length).toBeGreaterThan(1);
    const tasks = getSeed('tasks');
    expect(document.querySelectorAll('#tasks-table tbody tr').length).toBe(5);
    expect(document.getElementById('tasks-formula').textContent).toContain(`/ ${tasks.length}`);
    expect(document.querySelectorAll('#setup-checklist .check-item').length).toBe(3);
    expect(document.getElementById('setup-progress').getAttribute('aria-valuenow')).toBe('0');
    expect(document.getElementById('zone-actions-meta').textContent.length).toBeGreaterThan(0);
  });

  test('Arabic re-render flips chart summaries', async () => {
    await mountPage('hr_dashboard');
    setLang('ar');
    applyBranding();
    expect(document.getElementById('chart-tenure').getAttribute('aria-label')).toContain(
      'مدد الخدمة'
    );
    expect(document.getElementById('dash-head').textContent).toContain('نطاقات');
    setLang('en');
  });

  test('a11y primitives: reduced-motion charts, visible focus ring', async () => {
    await mountPage('hr_dashboard');
    const real = window.matchMedia;
    window.matchMedia = q => ({
      matches: String(q).includes('reduce'),
      media: q,
      addEventListener() {},
      removeEventListener() {}
    });
    const el = document.createElement('div');
    document.body.appendChild(el);
    const entry = renderEchart(el, () => ({}), 'probe');
    expect(entry.option.animation).toBe(false);
    window.matchMedia = real;
    const css = readFileSync(`${R}/src/scss/v4/_components.scss`, 'utf8');
    expect(css).toContain(':focus-visible {');
  });
});
