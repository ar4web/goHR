// HR + Operations — workforce tracker (hr_tracker.html).
// Board with 100% derived statuses (no manual status field). Idempotent.

import { t, currentLang, LANG_EVENT, applyI18n } from './i18n.js';
import { fmtDate, initialsOf } from './hr-locale.js';
import { daysUntil, ajeerCheck } from './hr-statutory.js';
import { getSeed } from './hr-api.js';
import { exportData } from './import-export.js';
import { CLIENTS, SITES, PROFESSIONS } from './hr-seed.js';

let booted = false;
let query = '';

function L(en, ar) {
  return currentLang() === 'ar' ? ar : en;
}

const COLS = [
  'deployed',
  'bench',
  'probation',
  'renewal',
  'blocked',
  'staff',
  'on-leave',
  'exited'
];

function colLabel(key) {
  if (key === 'renewal') {
    return L('Renewal due', 'مستحق التجديد');
  }
  if (key === 'staff') {
    return L('Staff', 'طاقم داخلي');
  }
  if (key === 'blocked') {
    return t('status.blocked');
  }
  return t(`status.${key}`);
}

function docsOf(code) {
  return getSeed('residencyDocs').find(x => x.emp === code) || {};
}

function assignsOf(code) {
  return getSeed('assignments').filter(a => a.emp === code && a.status === 'active');
}

// Single derivation point: every card's column comes from here.
export function deriveTrack(emp) {
  const assigns = assignsOf(emp.code);
  if (emp.st === 'exited' || emp.st === 'inactive') {
    return { col: 'exited', tone: 'blue', detail: '' };
  }
  if (emp.st === 'huroob') {
    return {
      col: 'blocked',
      tone: 'red',
      detail: L('Huroob — legal attention', 'هروب — يتطلب متابعة قانونية')
    };
  }
  if (emp.st === 'on-leave') {
    return { col: 'on-leave', tone: 'yellow', detail: '' };
  }
  if (emp.saudi) {
    return {
      col: 'staff',
      tone: 'purple',
      detail: currentLang() === 'ar' ? emp.titleAr || emp.dept : emp.titleEn || emp.dept
    };
  }
  const failing = assigns.filter(a => {
    const c = CLIENTS.find(x => x.id === a.client);
    return !ajeerCheck(a, emp, c).ok;
  });
  if (failing.length) {
    const g = ajeerCheck(
      failing[0],
      emp,
      CLIENTS.find(x => x.id === failing[0].client)
    );
    return { col: 'blocked', tone: 'red', detail: g.reasons.join(', ') };
  }
  if (!emp.iqamaExp) {
    return {
      col: 'renewal',
      tone: 'red',
      detail: L('Iqama expiry missing', 'انتهاء الإقامة مفقود')
    };
  }
  const d = daysUntil(emp.iqamaExp);
  if (d <= 30) {
    return {
      col: 'renewal',
      tone: d < 0 ? 'red' : 'yellow',
      detail: `${fmtDate(emp.iqamaExp)} · ${d}${L('d', 'ي')}`
    };
  }
  if (emp.st === 'probation') {
    return { col: 'probation', tone: 'blue', detail: `${L('Since', 'منذ')} ${fmtDate(emp.join)}` };
  }
  const ins = docsOf(emp.code).insExp;
  if (!ins || daysUntil(ins) < 0) {
    return {
      col: 'renewal',
      tone: 'yellow',
      detail: L('Insurance missing/expired', 'التأمين مفقود/منتهي')
    };
  }
  if (assigns.length) {
    const a = assigns[0];
    const c = CLIENTS.find(x => x.id === a.client);
    const s = SITES.find(x => x.id === a.site);
    const cn = c ? (currentLang() === 'ar' ? c.nameAr : c.nameEn) : a.client;
    const sn = s ? (currentLang() === 'ar' ? s.nameAr : s.nameEn) : '';
    return { col: 'deployed', tone: 'green', detail: `${cn}${sn ? ` · ${sn}` : ''}` };
  }
  return { col: 'bench', tone: 'blue', detail: '' };
}

// Avatar backgrounds — dark variants only, so white initials pass AA.
// (Bright base hues with white text fail contrast; see _tokens.scss.)
const AV = {
  primary: 'var(--avatar-teal)',
  azure: 'var(--avatar-azure)',
  purple: 'var(--avatar-purple)',
  yellow: 'var(--avatar-yellow)',
  red: 'var(--avatar-red)',
  green: 'var(--avatar-green)',
  blue: 'var(--avatar-blue)'
};

function profName(code) {
  const p = PROFESSIONS.find(x => x.code === code);
  if (!p) {
    return '';
  }
  return currentLang() === 'ar' ? p.ar : p.en;
}

function card(e, track) {
  const name = currentLang() === 'ar' ? e.nameAr || e.nameEn : e.nameEn;
  return `<a class="track-card" href="hr_employee.html?code=${e.code}">
    <div class="cell-avatar" style="width:34px;height:34px;font-size:12px;background:${AV[e.av] || 'var(--avatar-teal)'};color:#fff">${initialsOf(e.nameEn)}</div>
    <div style="flex:1;min-width:0">
      <div class="cell-strong" style="font-size:13px">${name}</div>
      <div style="font-size:11.5px;color:var(--text-muted)">${e.code} · ${profName(e.prof)}</div>
      ${track.detail ? `<div style="font-size:11.5px;margin-top:3px" dir="auto">${track.detail}</div>` : ''}
    </div>
    <span class="status status-${track.tone}">${colLabel(track.col)}</span>
  </a>`;
}

function renderBoard() {
  const el = document.getElementById('track-board');
  if (!el) {
    return;
  }
  const q = query.trim().toLowerCase();
  const cards = getSeed('employees')
    .map(e => ({ e, track: deriveTrack(e) }))
    .filter(
      ({ e }) =>
        !q ||
        e.nameEn.toLowerCase().includes(q) ||
        (e.nameAr || '').includes(query.trim()) ||
        e.code.toLowerCase().includes(q)
    );
  el.innerHTML = COLS.map(col => {
    const items = cards.filter(c => c.track.col === col);
    return `<div class="track-col">
      <div class="track-head"><span>${colLabel(col)}</span><strong>${items.length}</strong></div>
      <div class="track-list">${items.map(({ e, track }) => card(e, track)).join('') || '<div class="hr-empty">—</div>'}</div>
    </div>`;
  }).join('');
  const n = document.getElementById('track-count');
  if (n) {
    n.textContent = `${cards.length} / ${getSeed('employees').length}`;
  }
}

function renderPipeline() {
  const el = document.getElementById('track-pipe');
  if (!el) {
    return;
  }
  const list = getSeed('onboarding').filter(c => c.stage < 10);
  el.innerHTML = list.length
    ? list
      .map(
        c => `<a class="hr-dept-chip" href="hr_onboarding.html?case=${c.id}">
          ${currentLang() === 'ar' ? c.nameAr || c.nameEn : c.nameEn} · ${t('common.stage')} ${c.stage}</a>`
      )
      .join('')
    : `<span style="font-size:12.5px;color:var(--text-muted)">${t('common.noData')}</span>`;
}

function renderAll() {
  renderPipeline();
  renderBoard();
  applyI18n(document.querySelector('[data-hr-tracker]') || document);
}

export function initTracker() {
  const root = document.querySelector('[data-hr-tracker]');
  if (!root) {
    return;
  }
  renderAll();
  if (booted) {
    return;
  }
  booted = true;
  document.getElementById('track-search')?.addEventListener('input', e => {
    query = e.target.value;
    renderBoard();
  });
  document.getElementById('track-export')?.addEventListener('click', () => {
    const rows = getSeed('employees').map(e => {
      const track = deriveTrack(e);
      return {
        code: e.code,
        nameEn: e.nameEn,
        nameAr: e.nameAr || '',
        nat: e.nat,
        column: track.col,
        detail: track.detail
      };
    });
    exportData(
      'xlsx',
      'workforce-tracker',
      [
        { key: 'code', label: 'Code' },
        { key: 'nameEn', label: 'Name (EN)' },
        { key: 'nameAr', label: 'Name (AR)' },
        { key: 'nat', label: 'Nationality' },
        { key: 'column', label: 'Column' },
        { key: 'detail', label: 'Detail' }
      ],
      rows,
      'Tracker'
    );
  });
  window.addEventListener(LANG_EVENT, renderAll);
}
