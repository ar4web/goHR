// HR + Operations — employee directory (hr_employees.html).
// Bilingual table + filters + CSV/XLSX export + validated import. Idempotent.

import { openMenu } from './menus.js';
import { t, currentLang, LANG_EVENT, applyI18n } from './i18n.js';
import { fmtDate, initialsOf, L, setText} from './hr-locale.js';
import { daysUntil, nitaqatEstimate } from './hr-statutory.js';
import { getSeed, saveImportedRows } from './hr-api.js';
import { exportData } from './import-export.js';
import { openImportModal } from './import-modal.js';
import { DEPARTMENTS, PROFESSIONS, CLIENTS, SITES } from './hr-seed.js';
import { escapeHtml as esc } from './markup.js';

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

const IMPORT_SCHEMA = [
  { key: 'code', en: 'Code', ar: 'الرمز', required: true },
  { key: 'nameEn', en: 'Name (EN)', ar: 'الاسم (إنجليزي)', required: true },
  { key: 'nameAr', en: 'Name (AR)', ar: 'الاسم (عربي)' },
  { key: 'nat', en: 'Nationality', ar: 'الجنسية', required: true },
  { key: 'prof', en: 'Profession', ar: 'المهنة' },
  { key: 'dept', en: 'Department', ar: 'الإدارة' },
  { key: 'join', en: 'Join date (YYYY-MM-DD)', ar: 'تاريخ الالتحاق', type: 'date' },
  { key: 'basic', en: 'Basic salary', ar: 'الراتب الأساسي', type: 'number' },
  { key: 'housing', en: 'Housing', ar: 'السكن', type: 'number' },
  { key: 'transport', en: 'Transport', ar: 'المواصلات', type: 'number' },
  { key: 'iqama', en: 'Iqama', ar: 'الإقامة' },
  { key: 'iqamaExp', en: 'Iqama expiry (YYYY-MM-DD)', ar: 'انتهاء الإقامة', type: 'date' },
  { key: 'phone', en: 'Phone', ar: 'الجوال' }
];

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
  { key: 'iqamaExp', label: 'Iqama expiry' },
  { key: 'q', label: 'Qiwa' },
  { key: 'st', label: 'Status' }
];

let filter = { q: '', group: '', st: '', qiwa: '' };
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

function visible(list) {
  const q = filter.q.toLowerCase();
  return list.filter(
    e =>
      (!q ||
        e.nameEn.toLowerCase().includes(q) ||
        (e.nameAr || '').includes(filter.q) ||
        e.code.toLowerCase().includes(q) ||
        (e.iqama || '').includes(q)) &&
      (!filter.group || (filter.group === 'saudi' ? e.saudi : !e.saudi)) &&
      (!filter.st || e.st === filter.st) &&
      (!filter.qiwa || e.q === filter.qiwa)
  );
}

function renderStats(list) {
  const n = nitaqatEstimate(list);
  const deployed = list.filter(e => e.client && e.st === 'active').length;
  const bench = list.filter(e => !e.client && !e.saudi && e.st === 'active').length;

  setText('emp-stat-total', list.length);
  setText('emp-stat-saudi', n.saudis);
  setText('emp-stat-expat', n.expats);
  setText('emp-stat-deployed', deployed);
  setText('emp-stat-bench', bench);
  setText('emp-stat-saud', `${n.pct}%`);
}

function renderRows() {
  const tbody = document.getElementById('emp-rows');
  if (!tbody) {
    return;
  }
  const items = visible(getSeed('employees'));

  tbody.innerHTML =
    items
      .map(e => {
        const dep = deployOf(e);
        return `
    <tr data-code="${esc(e.code)}">
      <td data-label="✓"><input type="checkbox" class="row-cb" aria-label="Select row"></td>
      <td data-label="${L('Worker', 'الموظف')}">
        <div class="cell-customer">
          <div class="cell-avatar" style="background:${AV[e.av] || 'var(--avatar-teal)'};color:white">${esc(initialsOf(e.nameEn))}</div>
          <div>
            <div class="cell-strong"><a href="hr_employee.html?code=${encodeURIComponent(e.code)}">${esc(currentLang() === 'ar' ? e.nameAr || e.nameEn : e.nameEn)}</a></div>
            <div style="font-size:11.5px;color:var(--text-muted)">${esc(e.code)} · ${esc(currentLang() === 'ar' ? e.nameEn || '' : e.nameAr || '')}</div>
          </div>
        </div>
      </td>
      <td data-label="${L('Nationality', 'الجنسية')}" style="font-size:12.5px">${esc(e.nat)}</td>
      <td data-label="${L('Profession', 'المهنة')}" style="font-size:12.5px">${esc(profName(e.prof))}<div style="font-size:11.5px;color:var(--text-muted)">${esc(deptName(e.dept))}</div></td>
      <td data-label="${L('Deployment', 'التوزيع')}"><span class="status status-${esc(dep.cls)}">${esc(dep.label)}</span></td>
      <td data-label="${L('Iqama', 'الإقامة')}">${iqamaBadge(e)}</td>
      <td data-label="Qiwa"><span class="status status-${QIWA_CLS[e.q] || 'blue'}">${esc(t(`status.${e.q}`))}</span></td>
      <td data-label=""><button class="card-opt-btn" data-row-menu data-code="${esc(e.code)}" aria-label="More"><svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><circle cx="8" cy="3" r="1.2"/><circle cx="8" cy="8" r="1.2"/><circle cx="8" cy="13" r="1.2"/></svg></button></td>
    </tr>`;
      })
      .join('') ||
    `<tr><td colspan="8" style="text-align:center;color:var(--text-muted);padding:24px">${t('common.noData')}</td></tr>`;
}

function checkedCodes() {
  return [...document.querySelectorAll('#emp-rows .row-cb:checked')].map(
    cb => cb.closest('tr').dataset.code
  );
}

function exportRows(format, onlyChecked) {
  const list = getSeed('employees');
  const codes = onlyChecked ? new Set(checkedCodes()) : null;
  const rows = visible(list).filter(e => !codes || codes.has(e.code));
  exportData(format, 'employees', EXPORT_COLS, rows, 'Employees');
}

export function initEmployees() {
  const root = document.querySelector('[data-hr-employees]');
  if (!root) {
    return;
  }
  renderStats(getSeed('employees'));
  renderRows();
  if (booted) {
    applyI18n(root);
    return;
  }
  booted = true;

  document.getElementById('emp-search')?.addEventListener('input', e => {
    filter.q = e.target.value;
    renderRows();
  });
  document.getElementById('emp-group')?.addEventListener('change', e => {
    filter.group = e.target.value;
    renderRows();
  });
  document.getElementById('emp-status')?.addEventListener('change', e => {
    filter.st = e.target.value;
    renderRows();
  });
  document.getElementById('emp-qiwa')?.addEventListener('change', e => {
    filter.qiwa = e.target.value;
    renderRows();
  });
  document.getElementById('emp-select-all')?.addEventListener('change', e => {
    document.querySelectorAll('#emp-rows .row-cb').forEach(cb => {
      cb.checked = e.target.checked;
    });
  });
  document.getElementById('emp-export')?.addEventListener('click', e => {
    e.stopPropagation();
    openMenu(e.currentTarget, [
      { label: `${t('common.export')} CSV`, action: () => exportRows('csv', false) },
      { label: `${t('common.export')} Excel`, action: () => exportRows('xlsx', false) },
      '-',
      {
        label: currentLang() === 'ar' ? 'تصدير المحدد (Excel)' : 'Export selected (Excel)',
        action: () => exportRows('xlsx', true)
      }
    ]);
  });
  document.getElementById('emp-import')?.addEventListener('click', () => {
    openImportModal({
      titleEn: 'Import employees (Excel / CSV)',
      titleAr: 'استيراد موظفين (Excel / CSV)',
      filename: 'employees',
      schema: IMPORT_SCHEMA,
      example: {
        code: 'EMP-0101',
        nameEn: 'Sample Name',
        nameAr: 'اسم تجريبي',
        nat: 'India',
        prof: 'driver',
        dept: 'OPS',
        join: '2026-01-05',
        basic: 1800,
        housing: 500,
        transport: 300,
        iqama: '2000000101',
        iqamaExp: '2027-01-05',
        phone: '+966 555 010 101'
      },
      onImport: (rows) => {
        const mapped = rows.map(r => ({
          code: r.code,
          nameEn: r.nameEn,
          nameAr: r.nameAr || r.nameEn,
          nat: r.nat,
          saudi: /^saudi/i.test(r.nat || ''),
          prof: r.prof || 'construction',
          dept: r.dept || 'OPS',
          titleEn: '',
          titleAr: '',
          join: r.join || new Date().toISOString().slice(0, 10),
          basic: Number(r.basic || 0),
          housing: Number(r.housing || 0),
          transport: Number(r.transport || 0),
          iqama: r.iqama || '',
          iqamaExp: r.iqamaExp || '',
          iban: '',
          bank: '',
          q: 'draft',
          st: 'active',
          phone: r.phone || '',
          av: 'primary',
          annualUsed: 0
        }));
        saveImportedRows('employees', mapped);
        renderStats(getSeed('employees'));
        renderRows();
        return mapped.length;
      }
    });
  });
  document.getElementById('emp-rows')?.addEventListener('click', e => {
    const btn = e.target.closest('[data-row-menu]');
    if (!btn) {
      return;
    }
    e.stopPropagation();
    const code = btn.dataset.code;
    openMenu(btn, [
      {
        label: currentLang() === 'ar' ? 'فتح الملف' : 'Open file',
        action: () => {
          window.location.href = `hr_employee.html?code=${code}`;
        }
      },
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
  });
  window.addEventListener(LANG_EVENT, () => {
    renderStats(getSeed('employees'));
    renderRows();
    applyI18n(root);
  });
}
