// goHR — employee directory (employees.html). Central dataset.
// Top charts + comprehensive filters + full table (name → all). Links to every page.

import { openMenu } from './menus.js';
import { t, currentLang, LANG_EVENT, applyI18n } from './i18n.js';
import { fmtDate, fmtSAR, initialsOf, setText } from './hr-locale.js';
import { daysUntil, nitaqatEstimate } from './hr-statutory.js';
import { getSeed } from './hr-api.js';
import { exportData } from './import-export.js';
import { openImportModal } from './import-modal.js';
import { showModal } from './modal.js';
import { showToast } from './toast.js';
import { DEPARTMENTS, PROFESSIONS, CLIENTS, SITES } from './hr-seed.js';
import { escapeHtml as esc } from './markup.js';

const AV = {
  primary: 'var(--avatar-teal)',
  azure: 'var(--avatar-azure)',
  purple: 'var(--avatar-purple)',
  yellow: 'var(--avatar-yellow)',
  red: 'var(--avatar-red)',
  green: 'var(--avatar-green)',
  blue: 'var(--avatar-blue)'
};

const EXPORT_COLS = [
  { key: 'code', label: 'Code / الرمز' },
  { key: 'nameEn', label: 'Name (EN)' },
  { key: 'nameAr', label: 'Name (AR) / الاسم' },
  { key: 'nat', label: 'Nationality / الجنسية' },
  { key: 'prof', label: 'Profession' },
  { key: 'dept', label: 'Department' },
  { key: 'join', label: 'Join date' },
  { key: 'basic', label: 'Basic' },
  { key: 'housing', label: 'Housing' },
  { key: 'transport', label: 'Transport' },
  { key: 'iqama', label: 'Iqama' },
  { key: 'iqamaExp', label: 'Iqama expiry' },
  { key: 'phone', label: 'Phone' },
  { key: 'email', label: 'Email' },
  { key: 'q', label: 'Qiwa' },
  { key: 'st', label: 'Status' }
];

let filter = {
  q: '',
  group: '',
  st: '',
  dept: '',
  prof: '',
  nat: '',
  qiwa: '',
  iqama: '',
  sponsor: '',
  date: '',
  sort: 'code'
};
let booted = false;

function profName(code) {
  const p = PROFESSIONS.find(x => x.code === code);
  if (!p) {
    return code || '—';
  }
  return currentLang() === 'ar' ? p.ar : p.en;
}
function deptName(code) {
  const d = DEPARTMENTS.find(x => x.code === code);
  if (!d) {
    return code || '—';
  }
  return currentLang() === 'ar' ? d.ar : d.en;
}
function deployOf(e) {
  if (e.st === 'on-leave') {
    return { cls: 'yellow', label: t('status.on-leave') };
  }
  if (!e.client) {
    return { cls: 'blue', label: t('status.bench') };
  }
  const c = CLIENTS.find(x => x.id === e.client);
  const s = SITES.find(x => x.id === e.site);
  const cn = c ? (currentLang() === 'ar' ? c.nameAr : c.nameEn) : e.client;
  const sn = s ? (currentLang() === 'ar' ? s.nameAr : s.nameEn) : '';
  return { cls: 'green', label: `${t('status.deployed')} · ${cn}${sn ? ` / ${sn}` : ''}` };
}
function iqamaBadge(e) {
  if (e.saudi) {
    return '<span class="status status-green">SA</span>';
  }
  if (!e.iqamaExp) {
    return `<span class="status status-red">${t('status.missing')}</span>`;
  }
  const d = daysUntil(e.iqamaExp);
  if (d < 0) {
    return `<span class="status status-red">${fmtDate(e.iqamaExp)} · ${t('status.expired')}</span>`;
  }
  if (d <= 30) {
    return `<span class="status status-red">${fmtDate(e.iqamaExp)} · ${d}${t('common.days')}</span>`;
  }
  if (d <= 90) {
    return `<span class="status status-yellow">${fmtDate(e.iqamaExp)} · ${d}${t('common.days')}</span>`;
  }
  return `<span class="status status-green">${fmtDate(e.iqamaExp)}</span>`;
}
const QIWA_CLS = { authenticated: 'green', sent: 'yellow', draft: 'blue' };

function iqamaBucket(e) {
  if (e.saudi || !e.iqamaExp) {
    return 'ok';
  }
  const d = daysUntil(e.iqamaExp);
  if (d < 0) {
    return 'expired';
  }
  if (d <= 30) {
    return 'le30';
  }
  if (d <= 90) {
    return 'le90';
  }
  return 'ok';
}

function visible(list) {
  const q = filter.q.toLowerCase();
  let out = list.filter(
    e =>
      (!q ||
        e.nameEn.toLowerCase().includes(q) ||
        (e.nameAr || '').includes(filter.q) ||
        e.code.toLowerCase().includes(q) ||
        (e.iqama || '').includes(q) ||
        (e.nid || '').includes(q) ||
        (e.phone || '').includes(q)) &&
      (!filter.group || (filter.group === 'saudi' ? e.saudi : !e.saudi)) &&
      (!filter.st || e.st === filter.st) &&
      (!filter.dept || e.dept === filter.dept) &&
      (!filter.prof || e.prof === filter.prof) &&
      (!filter.nat || e.nat === filter.nat) &&
      (!filter.qiwa || e.q === filter.qiwa) &&
      (!filter.iqama || iqamaBucket(e) === filter.iqama) &&
      (!filter.sponsor || e.sponsor === filter.sponsor) &&
      (!filter.date || (e.join || '') >= filter.date)
  );
  const s = filter.sort;
  out.sort((a, b) => {
    if (s === 'name') {
      return (a.nameEn || '').localeCompare(b.nameEn || '');
    }
    if (s === 'join') {
      return (a.join || '').localeCompare(b.join || '');
    }
    if (s === 'basic') {
      return (b.basic || 0) - (a.basic || 0);
    }
    if (s === 'iqamaExp') {
      return (a.iqamaExp || '').localeCompare(b.iqamaExp || '');
    }
    if (s === 'nat') {
      return (a.nat || '').localeCompare(b.nat || '');
    }
    if (s === 'prof') {
      return (a.prof || '').localeCompare(b.prof || '');
    }
    if (s === 'nid') {
      return (a.nid || a.iqama || '').localeCompare(b.nid || b.iqama || '');
    }
    return (a.code || '').localeCompare(b.code || '');
  });
  return out;
}

function spark(el, vals, color) {
  if (!el) {
    return;
  }
  el.innerHTML = vals
    .map(v => `<div class="bar" style="height:${v}%;background:${color}"></div>`)
    .join('');
}
const fmtInt = n => Number(n || 0).toLocaleString('en-US', { maximumFractionDigits: 0 });
const fmtPct1 = n =>
  `${Number(n || 0).toLocaleString('en-US', { maximumFractionDigits: 1, minimumFractionDigits: 1 })}%`;
function renderStats(list) {
  const n = nitaqatEstimate(list);
  const deployed = list.filter(e => e.client && e.st === 'active').length;
  const bench = list.filter(e => !e.client && !e.saudi && e.st === 'active').length;
  setText('emp-stat-total', fmtInt(list.length));
  setText('emp-stat-saudi', fmtInt(n.saudis));
  setText('emp-stat-expat', fmtInt(n.expats));
  setText('emp-stat-deployed', fmtInt(deployed));
  setText('emp-stat-bench', fmtInt(bench));
  setText('emp-stat-saud', fmtPct1(n.pct));
  const total = list.length || 1;
  const pctSaudi = Math.round((n.saudis / total) * 100);
  const pctExpat = 100 - pctSaudi;
  const pctDeployed = list.filter(e => e.st === 'active').length
    ? Math.round((deployed / list.filter(e => e.st === 'active').length) * 100)
    : 0;
  setText('stat-sub-total', `${n.saudis} Saudi · ${n.expats} Expat`);
  setText('stat-sub-saudi', `${pctSaudi}% of total`);
  setText('stat-sub-expat', `${pctExpat}% of total`);
  setText('stat-sub-deployed', `${pctDeployed}% of active`);
  setText('stat-sub-saud', n.pct >= 25 ? 'Platinum' : `Need ${(25 - n.pct).toFixed(1)}% to green`);
  const bar = (id, pct, color) => {
    const b = document.getElementById(id);
    if (b) {
      b.style.width = pct + '%';
    }
    if (b) {
      b.style.background = color;
    }
  };
  bar('bar-saudi', pctSaudi, 'var(--green)');
  bar('bar-expat', pctExpat, 'var(--blue)');
  bar('bar-deployed', pctDeployed, 'var(--purple)');
  bar(
    'bar-saud',
    n.pct,
    n.pct >= 25 ? 'var(--green)' : n.pct >= 15 ? 'var(--yellow)' : 'var(--red)'
  );
  spark(
    document.getElementById('spark-total'),
    [40, 55, 45, 60, 50, 70, 65, 80, 75, 90],
    'var(--primary)'
  );
  spark(
    document.getElementById('spark-saudi'),
    [30, 35, 45, 40, 55, 50, 65, 60, 75, 70],
    'var(--green)'
  );
  spark(
    document.getElementById('spark-expat'),
    [50, 60, 55, 68, 62, 75, 72, 85, 80, 92],
    'var(--blue)'
  );
  spark(
    document.getElementById('spark-deployed'),
    [30, 35, 45, 40, 55, 50, 65, 60, 75, 70],
    'var(--purple)'
  );
  spark(
    document.getElementById('spark-bench'),
    [45, 40, 50, 38, 55, 42, 60, 48, 52, 46],
    'var(--yellow)'
  );
  spark(
    document.getElementById('spark-saud'),
    [20, 25, 30, 22, 35, 28, 40, 38, 45, 32],
    'var(--red)'
  );
  const cnt = document.getElementById('emp-count');
  if (cnt) {
    cnt.textContent = `${fmtInt(visible(getSeed('employees')).length)} / ${fmtInt(list.length)}`;
  }
  renderTicker(list);
}

// Merged alert ticker: clean text strings only — no counts, days, or tallies.
function renderTicker(list) {
  const track = document.getElementById('emp-ticker-track');
  if (!track) {
    return;
  }
  const items = [];
  list
    .filter(e => e.st === 'huroob')
    .slice(0, 5)
    .forEach(e => {
      items.push({ cls: 'red', text: `Huroob · ${e.nameEn}` });
    });
  list
    .filter(e => !e.saudi && e.iqamaExp && daysUntil(e.iqamaExp) < 0)
    .slice(0, 8)
    .forEach(e => {
      items.push({ cls: 'red', text: `Iqama expired · ${e.nameEn}` });
    });
  list
    .filter(
      e => !e.saudi && e.iqamaExp && daysUntil(e.iqamaExp) >= 0 && daysUntil(e.iqamaExp) <= 30
    )
    .slice(0, 8)
    .forEach(e => {
      items.push({ cls: '', text: `Iqama expiring · ${e.nameEn}` });
    });
  list
    .filter(e => e.q === 'draft')
    .slice(0, 4)
    .forEach(e => {
      items.push({ cls: 'green', text: `Qiwa draft · ${e.nameEn}` });
    });
  if (!items.length) {
    track.innerHTML = '<span class="ticker-band green">All clear</span>';
    return;
  }
  const half = items.map(a => `<span class="ticker-band ${a.cls}">${esc(a.text)}</span>`).join('');
  track.innerHTML = half + half; // duplicate for seamless loop
}

function populateFilters() {
  const deptSel = document.getElementById('emp-dept');
  if (deptSel && deptSel.options.length <= 1) {
    DEPARTMENTS.forEach(d => {
      const o = document.createElement('option');
      o.value = d.code;
      o.textContent = currentLang() === 'ar' ? d.ar : d.en;
      deptSel.appendChild(o);
    });
  }
  const profSel = document.getElementById('emp-prof');
  if (profSel && profSel.options.length <= 1) {
    PROFESSIONS.forEach(p => {
      const o = document.createElement('option');
      o.value = p.code;
      o.textContent = currentLang() === 'ar' ? p.ar : p.en;
      profSel.appendChild(o);
    });
  }
  const natSel = document.getElementById('emp-nat');
  if (natSel && natSel.options.length <= 1) {
    const nats = [...new Set(getSeed('employees').map(e => e.nat))].sort();
    nats.forEach(n => {
      const o = document.createElement('option');
      o.value = n;
      o.textContent = n;
      natSel.appendChild(o);
    });
  }
  const sponsorSel = document.getElementById('emp-sponsor');
  if (sponsorSel && sponsorSel.options.length <= 1) {
    const sponsors = [
      ...new Set(
        getSeed('employees')
          .map(e => e.sponsor)
          .filter(Boolean)
      )
    ].sort();
    sponsors.forEach(s => {
      const o = document.createElement('option');
      o.value = s;
      o.textContent = s;
      sponsorSel.appendChild(o);
    });
  }
}

function empType(e) {
  return e.partTime ? 'Part-time' : 'Full-time';
}
function hiredBy(e) {
  return e.dept === 'HR' ? 'HR Manager' : 'Recruitment';
}
function refOf(e) {
  return e.sponsor ? `Sponsor ${e.sponsor}` : '—';
}
function docStatus(e) {
  if (e.saudi) {
    return e.nid ? 'Complete' : 'Pending';
  }
  return e.iqama && e.iqamaExp ? 'Complete' : 'Pending';
}
function vacEligible(e) {
  if (!e.join) {
    return '—';
  }
  const join = new Date(e.join);
  const now = new Date();
  const months = (now.getFullYear() - join.getFullYear()) * 12 + (now.getMonth() - join.getMonth());
  return months >= 12 && (e.annualUsed || 0) < 21 ? 'Eligible' : 'Not eligible';
}
function expiryOf(e) {
  if (e.iqamaExp) {
    return e.iqamaExp;
  }
  if (e.nidExp) {
    return e.nidExp;
  }
  if (e.saudi && e.join) {
    const d = new Date(e.join);
    d.setFullYear(d.getFullYear() + 5);
    return d.toISOString().slice(0, 10);
  }
  return '';
}
function insStatus(e) {
  const exp = expiryOf(e);
  if (!exp) {
    return '—';
  }
  const d = daysUntil(exp);
  return d < 0 ? 'Expired' : d <= 30 ? 'Expiring' : 'Active';
}
function insCompany(e) {
  return e.ins || (e.saudi ? '—' : 'Bupa');
}
function siteCity(e) {
  const s = SITES.find(x => x.id === e.site);
  if (!s) {
    return { site: e.site || '—', city: e.city || '—' };
  }
  return { site: currentLang() === 'ar' ? s.nameAr : s.nameEn, city: s.city || '—' };
}
function renderRows() {
  const tbody = document.getElementById('emp-rows');
  if (!tbody) {
    return;
  }
  const items = visible(getSeed('employees'));
  renderStats(getSeed('employees'));
  const cnt = document.getElementById('emp-count');
  if (cnt) {
    cnt.textContent = `${fmtInt(items.length)} / ${fmtInt(getSeed('employees').length)}`;
  }
  tbody.innerHTML =
    items
      .map(e => {
        const exp = expiryOf(e);
        const b = exp ? iqamaBucket({ ...e, iqamaExp: exp }) : 'ok';
        const iqStat =
          b === 'expired'
            ? 'Expired'
            : b === 'le30'
              ? 'Expiring ≤30d'
              : b === 'le90'
                ? 'Expiring ≤90d'
                : exp
                  ? 'Valid'
                  : 'No expiry';
        const iqCls =
          iqStat === 'Expired'
            ? 'red'
            : iqStat.includes('≤')
              ? 'yellow'
              : iqStat === 'Valid'
                ? 'green'
                : 'blue';
        const sc = siteCity(e);
        const dep = deployOf(e);
        return `
    <tr data-code="${esc(e.code)}">
      <td><input type="checkbox" class="row-cb" aria-label="Select row"></td>
      <td class="cell-mono">${esc(e.code)}</td>
      <td style="min-width:160px">
        <div class="cell-customer">
          <div class="cell-avatar" style="background:${AV[e.av] || 'var(--avatar-teal)'};color:white">${esc(initialsOf(e.nameEn))}</div>
          <div>
            <div class="cell-strong"><button type="button" class="emp-name-btn" style="white-space:nowrap" data-emp-view="${esc(e.code)}">${esc(currentLang() === 'ar' ? e.nameAr || e.nameEn : e.nameEn)}</button></div>
          </div>
        </div>
      </td>
      <td style="font-size:12.5px">${esc(e.nat)}</td>
      <td style="font-size:12.5px">${esc(e.sponsor || '—')}</td>
      <td><span class="status status-${iqCls}">${esc(iqStat)}</span></td>
      <td style="font-size:12.5px">${exp ? `<span style="font-weight:600">${esc(e.saudi ? 'NID' : 'Iqama')}</span>: ${esc(fmtDate(exp))}<div style="font-size:11px;color:var(--text-muted)">${esc(iqStat)}${exp ? ` · ${daysUntil(exp)}d` : ''}</div>` : '—'}</td>
      <td style="font-size:12.5px">${esc(profName(e.prof))}</td>
      <td style="font-size:12.5px"><span class="status status-blue">${esc(empType(e))}</span></td>
      <td><span class="status status-${esc(dep.cls)}">${esc(dep.label.replace('Deployed ·', '').trim() || dep.label)}</span></td>
      <td style="font-size:12.5px">${esc(sc.site)}<div style="font-size:11px;color:var(--text-muted)">${esc(sc.city)}</div></td>
      <td style="font-size:12.5px">${esc(hiredBy(e))}</td>
      <td style="font-size:12.5px">${esc(refOf(e))}</td>
      <td><span class="status status-${docStatus(e) === 'Complete' ? 'green' : 'yellow'}">${esc(docStatus(e))}</span></td>
      <td><span class="status status-${vacEligible(e) === 'Eligible' ? 'green' : 'blue'}">${esc(vacEligible(e))}</span></td>
      <td style="font-size:12.5px"><span class="status status-${insStatus(e) === 'Active' ? 'green' : insStatus(e) === 'Expired' ? 'red' : 'yellow'}">${esc(insStatus(e))}</span><div style="font-size:11px;color:var(--text-muted)">${esc(insCompany(e))}</div></td>
      <td class="emp-actions-cell">
        <button class="card-opt-btn" data-emp-edit="${esc(e.code)}" aria-label="Edit ${esc(e.code)}" data-tooltip="Edit"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M17 3a2.8 2.8 0 014 4L7.5 20.5 2 22l1.5-5.5z"/></svg></button>
        <button class="card-opt-btn" data-emp-view="${esc(e.code)}" aria-label="View ${esc(e.code)}" data-tooltip="View"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/></svg></button>
      </td>
    </tr>`;
      })
      .join('') ||
    `<tr><td colspan="17" style="text-align:center;color:var(--text-muted);padding:24px">${t('common.noData')}</td></tr>`;
}

export function initEmployees() {
  const root = document.querySelector('[data-hr-employees]');
  if (!root) {
    return;
  }
  populateFilters();
  renderRows();
  syncFilterCount();
  cleanupToolbar(root);
  polishHeaders(root);
  bindRowHover(root);
  if (booted) {
    applyI18n(root);
    return;
  }
  booted = true;
  const empSearch = document.getElementById('emp-search');
  const bindSearch = el => {
    if (!el) {
      return;
    }
    el.addEventListener('input', e => {
      filter.q = e.target.value;
      renderRows();
    });
  };
  if (empSearch) {
    bindSearch(empSearch);
  }
  const onChange = (id, key) =>
    document.getElementById(id)?.addEventListener('change', e => {
      filter[key] = e.target.value;
      renderRows();
      syncFilterCount();
    });
  onChange('emp-group', 'group');
  onChange('emp-status', 'st');
  onChange('emp-dept', 'dept');
  onChange('emp-prof', 'prof');
  onChange('emp-nat', 'nat');
  onChange('emp-qiwa', 'qiwa');
  onChange('emp-iqama', 'iqama');
  onChange('emp-sponsor', 'sponsor');
  onChange('emp-date', 'date');
  onChange('emp-sort', 'sort');
  // Filter popover
  const pop = document.getElementById('emp-filter-pop');
  const btn = document.getElementById('emp-filter-btn');
  btn?.addEventListener('click', e => {
    e.stopPropagation();
    const hidden = pop.hasAttribute('hidden');
    if (hidden) {
      pop.removeAttribute('hidden');
    } else {
      pop.setAttribute('hidden', '');
    }
    btn.setAttribute('aria-expanded', hidden ? 'true' : 'false');
  });
  document.addEventListener('click', e => {
    if (!pop || pop.hasAttribute('hidden')) {
      return;
    }
    if (e.target.closest('#emp-filter-pop, #emp-filter-btn')) {
      return;
    }
    pop.setAttribute('hidden', '');
    btn?.setAttribute('aria-expanded', 'false');
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && pop && !pop.hasAttribute('hidden')) {
      pop.setAttribute('hidden', '');
      btn?.setAttribute('aria-expanded', 'false');
    }
  });
  document.getElementById('emp-filter-clear')?.addEventListener('click', () => {
    filter = {
      q: document.getElementById('emp-search')?.value || '',
      group: '',
      st: '',
      dept: '',
      prof: '',
      nat: '',
      qiwa: '',
      iqama: '',
      sponsor: '',
      date: '',
      sort: 'code'
    };
    [
      'emp-group',
      'emp-status',
      'emp-dept',
      'emp-prof',
      'emp-nat',
      'emp-qiwa',
      'emp-iqama',
      'emp-sponsor',
      'emp-date'
    ].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        el.value = '';
      }
    });
    const sort = document.getElementById('emp-sort');
    if (sort) {
      sort.value = 'Code';
    }
    renderRows();
    syncFilterCount();
  });
  // header click sorter
  root.querySelectorAll('th[data-sort]').forEach(th => {
    th.style.cursor = 'pointer';
    th.addEventListener('click', () => {
      filter.sort = th.dataset.sort;
      const s = document.getElementById('emp-sort');
      if (s) {
        s.value = filter.sort;
      }
      renderRows();
    });
  });
  document.getElementById('emp-select-all')?.addEventListener('change', e => {
    document.querySelectorAll('#emp-rows .row-cb').forEach(cb => {
      cb.checked = e.target.checked;
    });
  });
  // Header actions: add / export / import (single icon family, right-aligned)
  document.getElementById('emp-add')?.addEventListener('click', () => openAddModal());
  document.getElementById('emp-export')?.addEventListener('click', () => {
    exportData('csv', 'employees', EXPORT_COLS, visible(getSeed('employees')));
  });
  document.getElementById('emp-import')?.addEventListener('click', () => openEmployeeImport());
  document.getElementById('emp-rows')?.addEventListener('click', e => {
    const view = e.target.closest('[data-emp-view]');
    if (view) {
      e.stopPropagation();
      e.preventDefault();
      openProfile(view.dataset.empView);
      return;
    }
    const edit = e.target.closest('[data-emp-edit]');
    if (edit) {
      e.stopPropagation();
      const code = edit.dataset.empEdit;
      openMenu(edit, [
        {
          label: currentLang() === 'ar' ? 'عرض الملف' : 'View profile',
          action: () => openProfile(code)
        },
        { label: `${t('common.edit')} · ${code}`, action: () => openEditRecord(code) },
        {
          label: `${t('common.export')} CSV`,
          action: () =>
            exportData(
              'csv',
              code,
              EXPORT_COLS,
              getSeed('employees').filter(x => x.code === code)
            )
        }
      ]);
    }
  });
  window.addEventListener(LANG_EVENT, () => {
    populateFilters();
    renderRows();
    applyI18n(root);
  });
}

function syncFilterCount() {
  const badge = document.getElementById('emp-filter-count');
  if (!badge) {
    return;
  }
  const n = ['group', 'st', 'dept', 'prof', 'nat', 'qiwa', 'iqama', 'sponsor', 'date'].filter(
    k => filter[k]
  ).length;
  badge.hidden = n === 0;
  badge.textContent = n ? String(n) : '';
}

// Top toolbar cleanup (idempotent): drop the search node, Filter leads the
// right-side actions with import/export packed compactly next to it.
function cleanupToolbar(root) {
  document.getElementById('emp-search')?.remove();
  const bar = root.querySelector('.emp-toolbar-right');
  const imp = document.getElementById('emp-import');
  const exp = document.getElementById('emp-export');
  if (bar && imp && exp && !imp.parentElement.classList.contains('btn-group')) {
    let g = bar.querySelector('.btn-group');
    if (!g) {
      g = document.createElement('span');
      g.className = 'btn-group';
      g.setAttribute('role', 'group');
      g.setAttribute('aria-label', 'Import or export');
      bar.insertBefore(g, imp);
    }
    g.append(imp, exp);
  }
  const fbtn = document.getElementById('emp-filter-btn');
  if (fbtn && bar) {
    fbtn.classList.remove('btn-outline');
    fbtn.classList.add('btn-primary');
    bar.prepend(fbtn); // starting right-side anchor, import/export group follows
  }
}

// Cramped header cells: CSS truncates with ellipsis; full label via title
// tooltip + smooth max-width expand on hover (see _hr.scss).
function polishHeaders(root) {
  root.querySelectorAll('thead th').forEach(th => {
    if (th.dataset.polished) {
      return;
    }
    th.dataset.polished = '1';
    th.title = th.textContent.trim().replace(/\s+/g, ' ');
  });
}

// Single-active-row mouseover: soft low-contrast gradient tint follows the
// cursor. Rows stay fully visible at all times — hover only highlights.
function bindRowHover(root) {
  const tbody = root.querySelector('#emp-rows');
  if (!tbody || tbody.dataset.hoverBound) {
    return;
  }
  tbody.dataset.hoverBound = '1';
  let hot = null;
  tbody.addEventListener('mouseover', e => {
    const tr = e.target.closest('tr');
    if (!tr || tr === hot || !tbody.contains(tr)) {
      return;
    }
    if (hot) {
      hot.style.background = '';
    }
    hot = tr;
    tr.style.background = 'linear-gradient(90deg, var(--primary-lt), transparent 85%)';
  });
  tbody.addEventListener('mouseout', e => {
    if (hot && (!e.relatedTarget || !hot.contains(e.relatedTarget))) {
      hot.style.background = '';
      hot = null;
    }
  });
}

const EMP_SCHEMA = [
  { key: 'code', en: 'Code', ar: 'الرمز', required: true },
  { key: 'nameEn', en: 'Name (EN)', ar: 'Name (AR)', required: true },
  { key: 'nat', en: 'Nationality', ar: 'الجنسية' },
  { key: 'prof', en: 'Profession', ar: 'المهنة' },
  { key: 'dept', en: 'Department', ar: 'القسم' },
  { key: 'join', en: 'Join date', ar: 'تاريخ الالتحاق', type: 'date' },
  { key: 'basic', en: 'Basic', ar: 'الأساسي', type: 'number' },
  { key: 'iqama', en: 'Iqama', ar: 'الإقامة' },
  { key: 'iqamaExp', en: 'Iqama expiry', ar: 'انتهاء الإقامة', type: 'date' },
  { key: 'phone', en: 'Phone', ar: 'الجوال' }
];

function openEmployeeImport() {
  const lang = currentLang();
  openImportModal({
    titleEn: 'Import employees (Excel / CSV)',
    titleAr: 'استيراد الموظفين (Excel / CSV)',
    filename: 'employees',
    schema: EMP_SCHEMA,
    example: { code: 'EMP-0001', nameEn: 'Demo', join: '2024-01-01', basic: '5000' },
    onImport: rows => {
      // Halt is enforced by the modal when errors exist; here skip existing IDs
      // gracefully and persist only genuinely new records.
      const existing = new Set(getSeed('employees').map(e => String(e.code).toLowerCase()));
      const seen = new Set();
      const fresh = [];
      let skipped = 0;
      rows.forEach(r => {
        const key = String(r.code || '').toLowerCase();
        if (!key || existing.has(key) || seen.has(key)) {
          skipped += 1;
          return;
        }
        seen.add(key);
        fresh.push({
          code: r.code,
          nameEn: r.nameEn,
          nameAr: r.nameEn,
          nat: r.nat || '—',
          prof: r.prof || '',
          dept: r.dept || '',
          join: r.join || '',
          basic: Number(r.basic) || 0,
          housing: 0,
          transport: 0,
          iqama: r.iqama || '',
          iqamaExp: r.iqamaExp || '',
          phone: r.phone || '',
          st: 'active',
          q: 'draft',
          saudi: false,
          av: 'primary'
        });
      });
      try {
        const ov = JSON.parse(localStorage.getItem('hr:import:employees') || '[]');
        localStorage.setItem('hr:import:employees', JSON.stringify([...ov, ...fresh]));
      } catch (_e) {
        /* private mode */
      }
      renderRows();
      showToast(
        lang === 'ar'
          ? `تمت إضافة ${fresh.length} وتخطي ${skipped}`
          : `Added ${fresh.length}, skipped ${skipped} existing`,
        { variant: 'success' }
      );
      return fresh.length;
    }
  });
}

function openAddModal() {
  showModal({
    title: currentLang() === 'ar' ? 'موظف جديد' : 'New employee',
    body: `
      <div class="modal-form-row"><label>Code *</label><input type="text" id="na-code" dir="ltr" required></div>
      <div class="modal-form-row"><label>Name (EN) *</label><input type="text" id="na-name"></div>
      <div class="modal-form-row"><label>Join date</label><input type="date" id="na-join"></div>
      <div data-add-err style="font-size:12px;color:var(--red)"></div>`,
    actions: [
      { label: t('common.cancel'), variant: 'ghost' },
      {
        label: t('common.save'),
        variant: 'primary',
        action: ({ body, close }) => {
          const code = body.querySelector('#na-code').value.trim();
          const name = body.querySelector('#na-name').value.trim();
          const err = body.querySelector('[data-add-err]');
          if (!code || !name) {
            err.textContent =
              currentLang() === 'ar'
                ? 'الرمز والاسم مطلوبان'
                : 'Code and name are required — nothing saved.';
            return false;
          }
          if (getSeed('employees').some(e => String(e.code).toLowerCase() === code.toLowerCase())) {
            err.textContent = `Duplicate ID: ${code} already exists — skipped.`;
            return false;
          }
          try {
            const ov = JSON.parse(localStorage.getItem('hr:import:employees') || '[]');
            ov.push({
              code,
              nameEn: name,
              nameAr: name,
              join: body.querySelector('#na-join').value,
              basic: 0,
              housing: 0,
              transport: 0,
              st: 'active',
              q: 'draft',
              saudi: false,
              av: 'primary',
              nat: '—'
            });
            localStorage.setItem('hr:import:employees', JSON.stringify(ov));
          } catch (_e) {
            /* ignore */
          }
          renderRows();
          close();
        }
      }
    ]
  });
}

// Employee profile overlay — modal only, never navigates. Soft-depth backdrop,
// summary segments + small CSS charts render synchronously with zero refresh.
function openProfile(code) {
  const e = getSeed('employees').find(x => x.code === code);
  if (!e) {
    return;
  }
  const basic = e.basic || 0,
    housing = e.housing || 0,
    transport = e.transport || 0;
  const total = basic + housing + transport;
  const exp = expiryOf(e);
  const expDays = exp ? daysUntil(exp) : null;
  const expTone =
    expDays === null
      ? 'blue'
      : expDays < 0
        ? 'red'
        : expDays <= 30
          ? 'red'
          : expDays <= 90
            ? 'yellow'
            : 'green';
  const spark = [35, 55, 42, 68, 58, 78, 66]
    .map(v => `<span class="bar" style="height:${v}%"></span>`)
    .join('');
  const split =
    total > 0
      ? `<span style="width:${Math.round((basic / total) * 100)}%;background:var(--primary)"></span><span style="width:${Math.round((housing / total) * 100)}%;background:var(--blue)"></span><span style="width:${Math.round((transport / total) * 100)}%;background:var(--yellow)"></span>`
      : '';
  const expPct =
    expDays === null ? 0 : Math.max(0, Math.min(100, Math.round(((365 - expDays) / 365) * 100)));
  showModal({
    title: `${currentLang() === 'ar' ? e.nameAr || e.nameEn : e.nameEn} · ${esc(e.code)}`,
    size: 'lg',
    body: `
      <div class="emp-profile-head">
        <div class="cell-avatar emp-profile-avatar" style="background:${AV[e.av] || 'var(--avatar-teal)'};color:white">${esc(initialsOf(e.nameEn))}</div>
        <div class="emp-profile-head-text">
          <div class="emp-profile-name">${esc(currentLang() === 'ar' ? e.nameAr || e.nameEn : e.nameEn)}</div>
          <div class="caption-muted">${esc(e.code)} · ${esc(profName(e.prof))} · ${esc(deptName(e.dept))}</div>
        </div>
        <span class="status status-${e.st === 'active' ? 'green' : e.st === 'huroob' ? 'red' : 'yellow'}">${esc(e.st || '—')}</span>
      </div>
      <div class="emp-profile-grid">
        <div class="emp-profile-card"><div class="emp-profile-k">Status</div><div><span class="status status-${e.st === 'active' ? 'green' : 'yellow'}">${esc(e.st || '—')}</span> <span class="status status-blue">${esc(e.nat || '')}</span></div><div class="caption-muted">Qiwa ${esc(e.q || '—')} · ${esc(empType(e))}</div></div>
        <div class="emp-profile-card"><div class="emp-profile-k">Package · ${esc(fmtSAR(total))}</div><div class="emp-paysplit" aria-hidden="true">${split}</div><div class="caption-muted">Basic ${esc(fmtSAR(basic))} · Housing ${esc(fmtSAR(housing))} · Transport ${esc(fmtSAR(transport))}</div><div class="stat-spark emp-micro" aria-hidden="true">${spark}</div></div>
        <div class="emp-profile-card"><div class="emp-profile-k">Residency</div><div><span class="status status-${expTone}">${exp ? `${esc(fmtDate(exp))} · ${expDays}d` : 'No expiry'}</span></div><div class="progress-thin emp-expbar"><div class="bar" style="width:${expPct}%;background:var(--${expTone === 'blue' ? 'blue' : expTone})"></div></div><div class="caption-muted">${esc(e.saudi ? e.nid || '' : e.iqama || '')}</div></div>
        <div class="emp-profile-card"><div class="emp-profile-k">Contact</div><div style="font-size:12.5px">${esc(e.phone || '—')}<br>${esc(e.email || '')}</div><div class="caption-muted">Joined ${esc(e.join ? fmtDate(e.join) : '—')}</div></div>
      </div>`,
    actions: [
      {
        label: `${t('common.edit')}`,
        variant: 'outline',
        action: () => openEditRecord(code),
        closeOnAction: false
      },
      {
        label: `${t('common.export')} CSV`,
        variant: 'outline',
        action: () =>
          exportData(
            'csv',
            encodeURIComponent(e.code),
            EXPORT_COLS,
            getSeed('employees').filter(x => x.code === code)
          ),
        closeOnAction: false
      },
      { label: t('common.cancel'), variant: 'ghost' }
    ]
  });
  document.querySelector('.modal-backdrop:last-child')?.classList.add('emp-profile-backdrop');
}

function openEditRecord(code) {
  const list = getSeed('employees');
  const e = list.find(x => x.code === code);
  if (!e) {
    return;
  }
  showModal({
    title: `${t('common.edit')} · ${esc(code)}`,
    body: `
      <div class="modal-form-row"><label class="form-label">${currentLang() === 'ar' ? 'الجوال' : 'Phone'}</label>
        <input class="form-control" id="er-phone" value="${esc(e.phone || '')}" dir="ltr"></div>
      <div class="modal-form-row"><label class="form-label">IBAN</label>
        <input class="form-control" id="er-iban" value="${esc(e.iban || '')}" dir="ltr"></div>
      <div class="modal-form-row" style="margin-bottom:0"><label class="form-label">${currentLang() === 'ar' ? 'البنك' : 'Bank'}</label>
        <input class="form-control" id="er-bank" value="${esc(e.bank || '')}"></div>`,
    actions: [
      { label: t('common.cancel'), variant: 'ghost' },
      {
        label: t('common.save'),
        variant: 'primary',
        action: ({ body }) => {
          const patch = {
            ...e,
            phone: body.querySelector('#er-phone').value.trim(),
            iban: body.querySelector('#er-iban').value.trim(),
            bank: body.querySelector('#er-bank').value.trim()
          };
          try {
            const ov = JSON.parse(localStorage.getItem('hr:import:employees') || '[]');
            const i = ov.findIndex(x => x.code === code);
            if (i >= 0) {
              ov[i] = patch;
            } else {
              ov.push(patch);
            }
            localStorage.setItem('hr:import:employees', JSON.stringify(ov));
          } catch (_err) {
            /* private mode */
          }
          renderRows();
          showToast(currentLang() === 'ar' ? 'تم الحفظ' : 'Saved', { variant: 'success' });
        }
      }
    ]
  });
}
