// HR + Operations — audit log (hr_audit.html).
// Seed history plus live entries appended by P6 mutations; newest first,
// read-only feed. Exportable for auditors.

import { currentLang, LANG_EVENT, applyI18n } from './i18n.js';
import { getAudit } from './hr-audit.js';
import { exportData, exportCSV } from './import-export.js';

let booted = false;
let q = '';
let from = '';

function L(en, ar) {
  return currentLang() === 'ar' ? ar : en;
}

function renderAll() {
  const set = (id, v) => {
    const el = document.getElementById(id);
    if (el) {
      el.textContent = v;
    }
  };
  const list = getAudit();
  const today = new Date().toISOString().slice(0, 10);
  set('au-stat-total', String(list.length));
  set('au-stat-today', String(list.filter(a => String(a.at).slice(0, 10) === today).length));
  set('au-stat-actors', String(new Set(list.map(a => a.actor)).size));
  const el = document.getElementById('au-rows');
  if (el) {
    const needle = q.trim().toLowerCase();
    const rows = list.filter(
      a =>
        (!needle ||
          `${a.actor} ${a.action} ${a.entity} ${a.detail}`.toLowerCase().includes(needle)) &&
        (!from || String(a.at).slice(0, 10) >= from)
    );
    el.innerHTML = rows.length
      ? rows
          .map(
            a => `<tr>
      <td data-label="#"><span dir="ltr">${a.id}</span></td>
      <td data-label="${L('At', 'الوقت')}" dir="ltr">${a.at}</td>
      <td data-label="${L('Actor', 'الفاعل')}">${a.actor}</td>
      <td data-label="${L('Action', 'الإجراء')}"><code dir="ltr">${a.action}</code></td>
      <td data-label="${L('Entity', 'الكيان')}"><span dir="ltr">${a.entity || '—'}</span></td>
      <td data-label="${L('Detail', 'التفاصيل')}">${a.detail || '—'}</td>
    </tr>`
          )
          .join('')
      : `<tr><td colspan="6" class="hr-empty">${L('No entries match', 'لا توجد قيود مطابقة')}</td></tr>`;
  }
  applyI18n(document.querySelector('[data-hr-audit]') || document);
}

export function initAudit() {
  const root = document.querySelector('[data-hr-audit]');
  if (!root) {
    return;
  }
  renderAll();
  if (booted) {
    return;
  }
  booted = true;
  document.getElementById('au-q')?.addEventListener('input', e => {
    q = e.target.value;
    renderAll();
  });
  document.getElementById('au-from')?.addEventListener('change', e => {
    from = e.target.value;
    renderAll();
  });
  const cols = [
    { key: 'id', label: 'Entry' },
    { key: 'at', label: 'At' },
    { key: 'actor', label: 'Actor' },
    { key: 'action', label: 'Action' },
    { key: 'entity', label: 'Entity' },
    { key: 'detail', label: 'Detail' }
  ];
  document.getElementById('au-export-xlsx')?.addEventListener('click', () => {
    exportData('xlsx', 'audit', cols, getAudit(), 'Audit');
  });
  document.getElementById('au-export-csv')?.addEventListener('click', () => {
    exportCSV('audit.csv', cols, getAudit());
  });
  window.addEventListener(LANG_EVENT, renderAll);
}
