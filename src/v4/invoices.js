// HR + Operations — client invoices (hr_invoices.html).
// Monthly billing from approved timesheets + 15% VAT. Idempotent.

import { showToast } from './toast.js';
import { showModal } from './modal.js';
import { t, currentLang, LANG_EVENT, applyI18n } from './i18n.js';
import { fmtSAR, L, setText} from './hr-locale.js';
import { invoiceLine, invoiceTotals, invoiceDue, VAT_RATE, sellerProfile } from './hr-statutory.js';
import { getSeed, patchSeedRow, saveImportedRows } from './hr-api.js';
import { exportData } from './import-export.js';

let booted = false;



function clientName(id) {
  const c = getSeed('clients').find(x => x.id === id);
  if (!c) {
    return id;
  }
  return currentLang() === 'ar' ? c.nameAr || c.nameEn : c.nameEn;
}

function empName(code) {
  const e = getSeed('employees').find(x => x.code === code);
  if (!e) {
    return code;
  }
  return currentLang() === 'ar' ? e.nameAr || e.nameEn : e.nameEn;
}

function siteName(id) {
  const s = getSeed('sites').find(x => x.id === id);
  if (!s) {
    return id;
  }
  return currentLang() === 'ar' ? s.nameAr : s.nameEn;
}

function seller() {
  return sellerProfile();
}

function rateOf(emp, site) {
  const a =
    getSeed('assignments').find(
      x => x.emp === emp && (!site || x.site === site) && x.status === 'active'
    ) || getSeed('assignments').find(x => x.emp === emp);
  return a?.rate || 0;
}

// Display status: overdue is derived (issued + past due + unpaid).
function dispStatus(inv) {
  if (inv.status === 'paid') {
    return 'paid';
  }
  if (inv.status === 'draft') {
    return 'draft';
  }
  const today = new Date().toISOString().slice(0, 10);
  return inv.dueAt && inv.dueAt < today ? 'overdue' : 'issued';
}

const ST_CLS = { draft: 'blue', issued: 'yellow', overdue: 'red', paid: 'green' };

function statusChip(inv) {
  const st = dispStatus(inv);
  const lbl =
    st === 'issued'
      ? t('status.issued')
      : st === 'overdue'
        ? t('status.overdue')
        : t(`status.${st}`);
  return `<span class="status status-${ST_CLS[st]}">${lbl}</span>`;
}

function renderStats() {

  const list = getSeed('invoices');
  const month = new Date().toISOString().slice(0, 7);
  const tot = inv => invoiceTotals(inv.lines).total;
  setText('in-stat-draft', list.filter(i => i.status === 'draft').length);
  setText(
    'in-stat-out',
    fmtSAR(
      list
        .filter(i => ['issued', 'overdue'].includes(dispStatus(i)))
        .reduce((s, i) => s + tot(i), 0)
    )
  );
  setText(
    'in-stat-over',
    fmtSAR(list.filter(i => dispStatus(i) === 'overdue').reduce((s, i) => s + tot(i), 0))
  );
  setText(
    'in-stat-paidm',
    fmtSAR(
      list
        .filter(i => i.status === 'paid' && (i.paidAt || '').startsWith(month))
        .reduce((s, i) => s + tot(i), 0)
    )
  );
}

function renderRows() {
  const el = document.getElementById('in-rows');
  if (!el) {
    return;
  }
  el.innerHTML = getSeed('invoices')
    .map(inv => {
      const tt = invoiceTotals(inv.lines);
      const st = dispStatus(inv);
      return `<tr>
      <td data-label="#"><span dir="ltr"><strong>${inv.id}</strong></span>
        <div style="font-size:11.5px;color:var(--text-muted)" dir="ltr">${inv.month}</div></td>
      <td data-label="${L('Client', 'العميل')}">${clientName(inv.client)}</td>
      <td data-label="${L('Lines', 'البنود')}" dir="ltr">${(inv.lines || []).length}</td>
      <td data-label="${L('Total', 'الإجمالي')}" dir="ltr"><strong>${fmtSAR(tt.total)}</strong>
        <div style="font-size:11.5px;color:var(--text-muted)" dir="ltr">+${L('VAT', 'ضريبة')} ${fmtSAR(tt.vat)}</div></td>
      <td data-label="${L('Due', 'الاستحقاق')}" dir="ltr">${inv.dueAt || '—'}</td>
      <td data-label="${t('common.status')}">${statusChip(inv)}</td>
      <td data-label=""><div style="display:flex;gap:6px;flex-wrap:wrap">
        <button class="btn btn-outline btn-sm" data-view="${inv.id}">${t('common.view')}</button>
        ${inv.status === 'draft' ? `<button class="btn btn-outline btn-sm" data-issue="${inv.id}">${L('Issue', 'إصدار')}</button>` : ''}
        ${st === 'issued' || st === 'overdue' ? `<button class="btn btn-outline btn-sm" data-pay="${inv.id}">${L('Mark paid', 'تحصيل')}</button>` : ''}
      </div></td>
    </tr>`;
    })
    .join('');
}

function renderAll() {
  renderStats();
  renderRows();
  applyI18n(document.querySelector('[data-hr-invoices]') || document);
}

// Approved timesheets for a client's sites in a service month.
function billableSheets(clientId, month) {
  const siteIds = new Set(
    getSeed('sites')
      .filter(s => s.client === clientId)
      .map(s => s.id)
  );
  return getSeed('timesheets').filter(
    x => x.status === 'approved' && siteIds.has(x.site) && (x.weekStart || '').startsWith(month)
  );
}

function previewLines(clientId, month) {
  const lines = [];
  for (const x of billableSheets(clientId, month)) {
    for (const l of x.lines || []) {
      lines.push({
        emp: l.emp,
        site: x.site,
        days: l.days || 0,
        regH: l.regH || 0,
        otH: l.otH || 0,
        rate: rateOf(l.emp, x.site),
        sheet: x.id
      });
    }
  }
  return lines;
}

function nextInvoiceId(clientId, month) {
  const base = `INV-${month}-${clientId}`;
  if (!getSeed('invoices').some(i => i.id === base)) {
    return base;
  }
  let n = 2;
  while (getSeed('invoices').some(i => i.id === `${base}-${n}`)) {
    n += 1;
  }
  return `${base}-${n}`;
}

function openWizardModal() {
  const clients = getSeed('clients');
  const month = new Date().toISOString().slice(0, 7);
  showModal({
    title: L('Generate invoice', 'إنشاء فاتورة'),
    size: 'lg',
    body: `<div class="hr-form-2col">
        <div class="form-group"><label class="form-label" for="gw-client">${L('Client', 'العميل')}</label>
          <select class="form-control" id="gw-client">${clients.map(c => `<option value="${c.id}">${clientName(c.id)}</option>`).join('')}</select></div>
        <div class="form-group"><label class="form-label" for="gw-month">${L('Service month', 'شهر الخدمة')}</label>
          <input class="form-control" id="gw-month" type="month" value="${month}" dir="ltr"></div>
      </div>
      <div id="gw-preview"></div>`,
    actions: [
      { label: t('common.cancel'), variant: 'ghost' },
      {
        label: L('Create draft', 'إنشاء مسودة'),
        variant: 'primary',
        action: ({ body }) => {
          const cid = body.querySelector('#gw-client').value;
          const mm = body.querySelector('#gw-month').value;
          const lines = previewLines(cid, mm);
          if (!lines.length) {
            showToast(L('No approved timesheets in that month', 'لا كشوف معتمدة في هذا الشهر'), {
              variant: 'warning'
            });
            return false;
          }
          saveImportedRows('invoices', [
            {
              id: nextInvoiceId(cid, mm),
              client: cid,
              month: mm,
              status: 'draft',
              issuedAt: '',
              dueAt: '',
              paidAt: '',
              lines
            }
          ]);
          renderAll();
          showToast(L('Draft invoice created', 'أُنشئت مسودة الفاتورة'), { variant: 'success' });
          return true;
        }
      }
    ]
  });
  const dlg = document.querySelector('.modal-backdrop:last-child') || document;
  const refresh = () => {
    const cid = dlg.querySelector('#gw-client')?.value;
    const mm = dlg.querySelector('#gw-month')?.value;
    const box = dlg.querySelector('#gw-preview');
    if (!box || !cid || !mm) {
      return;
    }
    const lines = previewLines(cid, mm);
    const tt = invoiceTotals(lines);
    box.innerHTML = lines.length
      ? `<div class="table-responsive"><table class="table"><thead><tr><th>${L('Worker', 'العامل')}</th><th>${L('Days', 'الأيام')}</th><th>OT</th><th>${L('Amount', 'المبلغ')}</th></tr></thead><tbody>
        ${lines.map(l => `<tr><td>${empName(l.emp)}</td><td dir="ltr">${l.days}</td><td dir="ltr">${l.otH}h</td><td dir="ltr">${fmtSAR(invoiceLine(l.rate, l.days, l.otH).total)}${l.rate ? '' : ` <span class="status status-red">${L('no rate', 'بدون أجر')}</span>`}</td></tr>`).join('')}
        </tbody></table></div>
        <div class="hr-kv"><span>${L('Subtotal', 'الإجمالي الفرعي')}</span><strong dir="ltr">${fmtSAR(tt.sub)}</strong></div>
        <div class="hr-kv"><span>${L('VAT', 'ضريبة')} 15%</span><strong dir="ltr">${fmtSAR(tt.vat)}</strong></div>
        <div class="hr-kv"><span>${L('Total', 'الإجمالي')}</span><strong dir="ltr">${fmtSAR(tt.total)}</strong></div>`
      : `<div class="hr-empty">${L('No approved timesheets in that month.', 'لا كشوف معتمدة في هذا الشهر.')}</div>`;
  };
  refresh();
  dlg.addEventListener('change', refresh);
}

function invoiceDoc(inv) {
  const s = seller();
  const c = getSeed('clients').find(x => x.id === inv.client) || {};
  const tt = invoiceTotals(inv.lines);
  return `<div class="inv-doc">
    <div class="inv-head">
      <div><div class="inv-title">${currentLang() === 'ar' ? s.nameAr || s.nameEn : s.nameEn}</div>
        <div style="font-size:12px;color:var(--text-muted)" dir="auto">CR ${s.cr || '—'} · VAT ${s.vat || '—'} · ${s.address || ''}</div></div>
      <div style="text-align:end"><div class="inv-title">${L('TAX INVOICE', 'فاتورة ضريبية')}</div>
        <div style="font-size:12px" dir="ltr">${inv.id}</div></div>
    </div>
    <div class="hr-form-2col" style="margin:12px 0">
      <div style="font-size:12.5px"><strong>${L('Bill to', 'إلى')}:</strong> ${clientName(inv.client)}<br><span dir="ltr">CR ${c.cr || '—'}</span></div>
      <div style="font-size:12.5px" dir="ltr"><strong>${L('Month', 'الشهر')}:</strong> ${inv.month}<br><strong>${L('Due', 'الاستحقاق')}:</strong> ${inv.dueAt || '—'}</div>
    </div>
    <div class="table-responsive"><table class="table"><thead><tr>
      <th>${L('Worker', 'العامل')}</th><th>${L('Site', 'الموقع')}</th><th>${L('Days', 'الأيام')}</th><th>OT h</th><th>${L('Rate', 'الأجر')}</th><th>${L('Amount', 'المبلغ')}</th>
    </tr></thead><tbody>
    ${(inv.lines || [])
      .map(
        l => `<tr><td>${empName(l.emp)}</td><td>${siteName(l.site)}</td>
      <td dir="ltr">${l.days}</td><td dir="ltr">${l.otH}</td><td dir="ltr">${fmtSAR(l.rate)}</td>
      <td dir="ltr">${fmtSAR(invoiceLine(l.rate, l.days, l.otH).total)}</td></tr>`
      )
      .join('')}
    </tbody></table></div>
    <div style="max-width:320px;margin-inline-start:auto;margin-top:8px">
      <div class="hr-kv"><span>${L('Subtotal', 'الإجمالي الفرعي')}</span><strong dir="ltr">${fmtSAR(tt.sub)}</strong></div>
      <div class="hr-kv"><span>${L('VAT', 'الضريبة')} ${(VAT_RATE * 100).toFixed(0)}%</span><strong dir="ltr">${fmtSAR(tt.vat)}</strong></div>
      <div class="hr-kv"><span><strong>${L('Total', 'الإجمالي')}</strong></span><strong dir="ltr">${fmtSAR(tt.total)}</strong></div>
    </div>
    <div style="margin-top:10px">${statusChip(inv)}</div>
  </div>`;
}

function openViewModal(id) {
  const inv = getSeed('invoices').find(x => x.id === id);
  if (!inv) {
    return;
  }
  showModal({
    title: inv.id,
    size: 'lg',
    body: invoiceDoc(inv),
    actions: [
      { label: t('common.close'), variant: 'ghost' },
      {
        label: t('common.print'),
        variant: 'outline',
        action: () => {
          document.body.classList.add('inv-print');
          window.print();
          setTimeout(() => document.body.classList.remove('inv-print'), 500);
          return true;
        }
      }
    ]
  });
}

export function initInvoices() {
  const root = document.querySelector('[data-hr-invoices]');
  if (!root) {
    return;
  }
  renderAll();
  if (booted) {
    return;
  }
  booted = true;
  document.getElementById('in-new')?.addEventListener('click', openWizardModal);
  document.getElementById('in-rows')?.addEventListener('click', e => {
    const vw = e.target.closest('[data-view]');
    const is = e.target.closest('[data-issue]');
    const py = e.target.closest('[data-pay]');
    if (vw) {
      openViewModal(vw.dataset.view);
    } else if (is) {
      const inv = getSeed('invoices').find(x => x.id === is.dataset.issue);
      if (!inv) {
        return;
      }
      const c = getSeed('clients').find(x => x.id === inv.client);
      patchSeedRow('invoices', inv, {
        status: 'issued',
        issuedAt: new Date().toISOString().slice(0, 10),
        dueAt: invoiceDue(inv.month, c?.billingDay || 5)
      });
      renderAll();
      showToast(L('Invoice issued', 'أُصدرت الفاتورة'), { variant: 'success' });
    } else if (py) {
      const inv = getSeed('invoices').find(x => x.id === py.dataset.pay);
      if (!inv) {
        return;
      }
      patchSeedRow('invoices', inv, {
        status: 'paid',
        paidAt: new Date().toISOString().slice(0, 10)
      });
      renderAll();
      showToast(L('Marked paid', 'تم التحصيل'), { variant: 'success' });
    }
  });
  document.getElementById('in-export')?.addEventListener('click', () => {
    exportData(
      'xlsx',
      'invoices',
      [
        { key: 'id', label: 'Invoice' },
        { key: 'client', label: 'Client' },
        { key: 'month', label: 'Month' },
        { key: 'status', label: 'Status' },
        { key: 'dueAt', label: 'Due' },
        { key: 'total', label: 'Total (SAR)' }
      ],
      getSeed('invoices').map(i => ({ ...i, total: invoiceTotals(i.lines).total })),
      'Invoices'
    );
  });
  window.addEventListener(LANG_EVENT, renderAll);
}
