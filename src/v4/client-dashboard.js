// HR + Operations — client portal dashboard v1 (hr_client_dashboard.html).
// Client switcher + KPIs + deployed roster + invoices + raise-a-request (P0 demo).

import { showToast } from './toast.js';
import { ICONS } from './shell-render.js';
import { showModal } from './modal.js';
import { t, currentLang, LANG_EVENT, applyI18n } from './i18n.js';
import { fmtSAR, fmtDate, initialsOf, L} from './hr-locale.js';
import { ajeerCheck } from './hr-statutory.js';
import { getSeed } from './hr-api.js';
import { exportData } from './import-export.js';
import { SITES } from './hr-seed.js';

let booted = false;
let clientId = null;

function cur() {
  const list = getSeed('clients');
  if (!clientId) {
    try {
      clientId = localStorage.getItem('hr:client-id') || list[0].id;
    } catch (_e) {
      clientId = list[0].id;
    }
  }
  return list.find(c => c.id === clientId) || list[0];
}

function cname(c) {
  return currentLang() === 'ar' ? c.nameAr : c.nameEn;
}

function render() {
  const root = document.querySelector('[data-hr-client]');
  if (!root) {
    return;
  }
  const c = cur();
  const clients = getSeed('clients');
  const emps = getSeed('employees');
  const assigns = getSeed('assignments').filter(a => a.client === c.id);

  const sel = document.getElementById('cl-who');
  if (sel && !sel.options.length) {
    sel.innerHTML = clients
      .map(x => `<option value="${x.id}">${x.id} · ${cname(x)}</option>`)
      .join('');
    sel.value = c.id;
  } else if (sel) {
    sel.value = c.id;
  }

  const head = document.getElementById('cl-head');
  if (head) {
    head.innerHTML = `
      <div class="cell-avatar" style="width:56px;height:56px;font-size:18px;background:var(--avatar-teal);color:#fff">${initialsOf(c.nameEn)}</div>
      <div style="flex:1;min-width:0">
        <div class="cell-strong" style="font-size:16px">${cname(c)}</div>
        <div style="font-size:12.5px;color:var(--text-muted)">${c.id} · ${c.city}</div>
      </div>
      <div><span class="status status-${c.st === 'active' ? 'green' : 'yellow'}">${t(`status.${c.st}`)}</span></div>`;
  }

  const monthly = assigns.reduce((s, a) => s + (a.rate || 0), 0);
  const blocked = assigns.filter(a => {
    const e = emps.find(x => x.code === a.emp);
    return e && !ajeerCheck(a, e, c).ok;
  }).length;
  const kpis = [
    {
      icon: 'users',
      color: 'teal',
      label: L('Deployed workers', 'العمال الموزعون'),
      value: assigns.length,
      sub: c.id
    },
    {
      icon: 'wallet',
      color: 'purple',
      label: L('Monthly billing', 'الفوترة الشهرية'),
      value: fmtSAR(monthly),
      sub: `${assigns.length} ${L('heads', 'عامل')}`
    },
    {
      icon: 'shield',
      color: blocked ? 'red' : 'green',
      label: L('Compliance holds', 'إيقافات الامتثال'),
      value: blocked || '0',
      sub: L('Ajeer gates', 'بوابات أجير')
    },
    {
      icon: 'doc',
      color: 'blue',
      label: L('Outstanding', 'المستحق'),
      value: fmtSAR(c.balance || 0),
      sub: L('SAR', 'ر.س')
    }
  ];
  const kg = document.getElementById('cl-kpis');
  if (kg) {
    kg.innerHTML = kpis
      .map(
        k => `
      <div class="card"><div class="stat">
        <div class="stat-icon ${k.color}">${ICONS[k.icon] || ''}</div>
        <div class="stat-content">
          <div class="stat-label">${k.label}</div>
          <div class="stat-value-row"><span class="stat-value">${k.value}</span></div>
          <div class="stat-subtext">${k.sub}</div>
        </div>
      </div></div>`
      )
      .join('');
  }

  const roster = document.getElementById('cl-roster');
  roster.innerHTML = assigns.length
    ? `<div class="table-responsive"><table class="table hr-table"><thead><tr>
    <th>${L('Worker', 'الموظف')}</th><th>${L('Site', 'الموقع')}</th><th>${L('Since', 'منذ')}</th><th>Ajeer</th></tr></thead><tbody>` +
      assigns
        .map(a => {
          const e = emps.find(x => x.code === a.emp);
          const s = SITES.find(x => x.id === a.site);
          return `<tr>
        <td data-label="${L('Worker', 'الموظف')}">${e ? (currentLang() === 'ar' ? e.nameAr || e.nameEn : e.nameEn) : a.emp}</td>
        <td data-label="${L('Site', 'الموقع')}" style="font-size:12.5px">${s ? (currentLang() === 'ar' ? s.nameAr : s.nameEn) : ''}</td>
        <td data-label="${L('Since', 'منذ')}" style="font-size:12.5px">${fmtDate(a.start)}</td>
        <td data-label="Ajeer">${a.ajeer ? `<span class="status status-green">${fmtDate(a.ajeerExp)}</span>` : `<span class="status status-red">${t('status.missing')}</span>`}</td>
      </tr>`;
        })
        .join('') +
      '</tbody></table></div>'
    : `<div class="hr-empty">${t('common.noData')}</div>`;

  const inv = document.getElementById('cl-invoices');
  const invoices = [
    { no: `INV-${c.id}-2026-08`, period: '2026-08', amount: monthly, st: 'paid' },
    {
      no: `INV-${c.id}-2026-09`,
      period: '2026-09',
      amount: monthly,
      st: c.balance > 0 ? 'pending' : 'paid'
    }
  ];
  inv.innerHTML =
    `<div class="table-responsive"><table class="table hr-table"><thead><tr>
    <th>${L('Invoice', 'الفاتورة')}</th><th>${L('Period', 'الفترة')}</th><th>${L('Amount', 'المبلغ')}</th><th>${t('common.status')}</th></tr></thead><tbody>` +
    invoices
      .map(
        x => `<tr><td data-label="${L('Invoice', 'الفاتورة')}" dir="ltr">${x.no}</td>
      <td data-label="${L('Period', 'الفترة')}" dir="ltr">${x.period}</td>
      <td data-label="${L('Amount', 'المبلغ')}">${fmtSAR(x.amount)}</td>
      <td data-label="${t('common.status')}"><span class="status status-${x.st === 'paid' ? 'green' : 'yellow'}">${t(`status.${x.st}`)}</span></td></tr>`
      )
      .join('') +
    '</tbody></table></div>';
  applyI18n(root);
}

function openRequestModal() {
  showModal({
    title: L('Raise a request', 'رفع طلب'),
    body: `
      <div class="form-group"><label class="form-label" for="cr-type">${L('Type', 'النوع')}</label>
        <select class="form-control" id="cr-type">
          <option>${L('New workers', 'عمال جدد')}</option>
          <option>${L('Replacement', 'استبدال')}</option>
          <option>${L('Timesheet dispute', 'اعتراض على كشف الدوام')}</option>
          <option>${L('Site change', 'تغيير الموقع')}</option>
        </select></div>
      <div class="form-group" style="margin-bottom:0"><label class="form-label" for="cr-note">${L('Details', 'التفاصيل')}</label>
        <textarea class="form-control" id="cr-note" rows="3"></textarea></div>`,
    actions: [
      { label: t('common.cancel'), variant: 'ghost' },
      {
        label: t('common.save'),
        variant: 'primary',
        action: () => {
          showToast(
            L('Request noted — ticketing opens in P3.', 'تم تسجيل الطلب — التذاكر تُفتح في P3.'),
            { variant: 'info' }
          );
        }
      }
    ]
  });
}

export function initClientDashboard() {
  const root = document.querySelector('[data-hr-client]');
  if (!root) {
    return;
  }
  render();
  if (booted) {
    return;
  }
  booted = true;
  document.getElementById('cl-who')?.addEventListener('change', e => {
    clientId = e.target.value;
    try {
      localStorage.setItem('hr:client-id', clientId);
    } catch (_err) {
      /* ignore */
    }
    render();
  });
  document.getElementById('cl-request')?.addEventListener('click', openRequestModal);
  document.getElementById('cl-export')?.addEventListener('click', () => {
    const c = cur();
    const emps = getSeed('employees');
    const rows = getSeed('assignments')
      .filter(a => a.client === c.id)
      .map(a => {
        const e = emps.find(x => x.code === a.emp) || {};
        return {
          code: e.code || a.emp,
          nameEn: e.nameEn || '',
          nameAr: e.nameAr || '',
          site: a.site,
          start: a.start,
          ajeer: a.ajeer || '',
          ajeerExp: a.ajeerExp || ''
        };
      });
    exportData(
      'xlsx',
      `roster-${c.id}`,
      [
        { key: 'code', label: 'Code' },
        { key: 'nameEn', label: 'Name (EN)' },
        { key: 'nameAr', label: 'Name (AR)' },
        { key: 'site', label: 'Site' },
        { key: 'start', label: 'Since' },
        { key: 'ajeer', label: 'Ajeer' },
        { key: 'ajeerExp', label: 'Ajeer expiry' }
      ],
      rows,
      'Roster'
    );
  });
  window.addEventListener(LANG_EVENT, render);
}
