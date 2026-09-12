// HR + Operations — employee directory (hr_employees.html).
// Bilingual table + filters + CSV/XLSX export + validated import. Idempotent.

import { showToast } from './toast.js';
import { showModal } from './modal.js';
import { openMenu } from './menus.js';
import { t, currentLang, LANG_EVENT, applyI18n } from './i18n.js';
import { fmtDate, initialsOf } from './hr-locale.js';
import { daysUntil, nitaqatEstimate } from './hr-statutory.js';
import { getSeed, saveImportedRows } from './hr-api.js';
import { exportData, templateCSV, templateXLSX, importFile } from './import-export.js';
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
  const set = (id, v) => {
    const el = document.getElementById(id);
    if (el) {
      el.textContent = v;
    }
  };
  set('emp-stat-total', list.length);
  set('emp-stat-saudi', n.saudis);
  set('emp-stat-expat', n.expats);
  set('emp-stat-deployed', deployed);
  set('emp-stat-bench', bench);
  set('emp-stat-saud', `${n.pct}%`);
}

function renderRows() {
  const tbody = document.getElementById('emp-rows');
  if (!tbody) {
    return;
  }
  const items = visible(getSeed('employees'));
  const L = (en, ar) => (currentLang() === 'ar' ? ar : en);
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

function openImportModal() {
  const lang = currentLang();
  const schemaHint = IMPORT_SCHEMA.map(
    f => `${lang === 'ar' ? f.ar : f.en}${f.required ? ' *' : ''}`
  ).join(', ');
  showModal({
    title: lang === 'ar' ? 'استيراد موظفين (Excel / CSV)' : 'Import employees (Excel / CSV)',
    size: 'lg',
    body: `
      <p style="color:var(--text-muted);font-size:12.5px;margin-bottom:12px">${schemaHint}</p>
      <div style="display:flex;gap:8px;margin-bottom:12px;flex-wrap:wrap">
        <button type="button" class="btn btn-outline btn-sm" data-tpl="csv">${t('common.template')} CSV</button>
        <button type="button" class="btn btn-outline btn-sm" data-tpl="xlsx">${t('common.template')} Excel</button>
      </div>
      <label class="btn btn-outline" style="cursor:pointer">${t('common.chooseFile')} (.xlsx, .csv)
        <input type="file" data-imp-file accept=".xlsx,.xls,.csv" hidden>
      </label>
      <div data-imp-result style="margin-top:12px;font-size:12.5px"></div>
    `,
    actions: [
      { label: t('common.cancel'), variant: 'ghost' },
      {
        label: t('common.import'),
        variant: 'primary',
        action: ({ body, close }) => {
          const pending = body._pending;
          if (!pending || !pending.rows.length) {
            showToast(lang === 'ar' ? 'اختر ملفًا صالحًا أولًا' : 'Choose a valid file first', {
              variant: 'warning'
            });
            return false;
          }
          if (pending.errors.length) {
            showToast(lang === 'ar' ? 'أصلح الأخطاء أولًا' : 'Fix validation errors first', {
              variant: 'warning'
            });
            return false;
          }
          const rows = pending.rows.map(r => ({
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
          saveImportedRows('employees', rows);
          renderStats(getSeed('employees'));
          renderRows();
          showToast(
            lang === 'ar'
              ? `تم استيراد ${rows.length} موظفًا`
              : `Imported ${rows.length} employees`,
            { variant: 'success' }
          );
          close();
          return true;
        }
      }
    ]
  });
  const dlg = document.querySelector('.modal-backdrop:last-child') || document;
  dlg.addEventListener('click', ev => {
    const tpl = ev.target.closest('[data-tpl]');
    if (!tpl) {
      return;
    }
    const cols = IMPORT_SCHEMA.map(f => ({ key: f.key, label: lang === 'ar' ? f.ar : f.en }));
    const ex = {
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
    };
    if (tpl.dataset.tpl === 'xlsx') {
      templateXLSX('employees', cols, ex);
    } else {
      templateCSV('employees', cols, ex);
    }
  });
  dlg.addEventListener('change', async ev => {
    const input = ev.target.closest('[data-imp-file]');
    if (!input || !input.files[0]) {
      return;
    }
    const box = dlg.querySelector('[data-imp-result]');
    box.textContent = '…';
    try {
      const res = await importFile(input.files[0], IMPORT_SCHEMA);
      const modalBody = dlg.querySelector('.modal-body');
      if (modalBody) {
        modalBody._pending = res;
      }
      // showModal passes .modal-body as `body` — stash there too via closest dialog lookup at confirm time.
      dlg._pending = res;
      if (!res.rows.length) {
        box.innerHTML = '<span class="status status-red">0 rows</span>';
        return;
      }
      const errHtml = res.errors
        .slice(0, 10)
        .map(e => `<div>row ${esc(e.row)} · ${esc(e.field)} · ${esc(e.message)}</div>`)
        .join('');
      box.innerHTML = `<span class="status status-${res.errors.length ? 'red' : 'green'}">${res.rows.length} rows · ${res.errors.length} errors</span><div style="margin-top:8px;color:var(--text-muted)">${errHtml}</div>`;
      // stash pending where the confirm action can reach it
      const bodyEl = dlg.querySelector('.modal-body');
      if (bodyEl) {
        bodyEl._pending = res;
      }
    } catch (_err) {
      box.innerHTML = '<span class="status status-red">parse-error</span>';
    }
  });
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
  document.getElementById('emp-import')?.addEventListener('click', openImportModal);
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
