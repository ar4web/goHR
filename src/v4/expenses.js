// HR + Operations — expenses + advances (hr_expenses.html).
// Claim flow: draft → submitted → approved → paid (or rejected). Category
// limits flag over-limit claims for the approver; receipt-required categories
// block submission without a receipt; billable claims carry a client for the
// billing export. Advances settle through the current draft pay run.

import { showToast } from './toast.js';
import { showModal } from './modal.js';
import { t, currentLang, LANG_EVENT, applyI18n } from './i18n.js';
import { fmtSAR } from './hr-locale.js';
import { VAT_RATE } from './hr-statutory.js';
import { getSeed, patchSeedRow, saveImportedRows } from './hr-api.js';
import { exportData, exportCSV } from './import-export.js';
import { openImportModal } from './import-modal.js';

let booted = false;
let statusFilter = 'all';

const ST_CLS = {
  draft: 'blue',
  submitted: 'yellow',
  approved: 'purple',
  paid: 'green',
  rejected: 'red'
};

// Demo convention: the HR manager approves, the accountant pays.
const APPROVER = 'EMP-0001';
const PAYER = 'EMP-0002';

function L(en, ar) {
  return currentLang() === 'ar' ? ar : en;
}

function empName(code) {
  const e = getSeed('employees').find(x => x.code === code);
  if (!e) {
    return code;
  }
  return currentLang() === 'ar' ? e.nameAr || e.nameEn : e.nameEn;
}

export function expenseCats() {
  try {
    const o = JSON.parse(localStorage.getItem('hr:custom-lists') || '{}');
    if (Array.isArray(o.expenseCats) && o.expenseCats.length) {
      return o.expenseCats;
    }
  } catch (_e) {
    /* ignore */
  }
  return getSeed('expenseCategories');
}

function catOf(code) {
  return expenseCats().find(c => c.code === code);
}

function catLabel(code) {
  const c = catOf(code);
  if (!c) {
    return code;
  }
  return currentLang() === 'ar' ? c.ar : c.en;
}

function clientName(id) {
  const c = getSeed('clients').find(x => x.id === id);
  if (!c) {
    return id || '—';
  }
  return currentLang() === 'ar' ? c.nameAr || c.nameEn : c.nameEn;
}

function overLimit(x) {
  const c = catOf(x.cat);
  return !!c && Number(x.amount) > c.limit;
}

function missingReceipt(x) {
  const c = catOf(x.cat);
  return !!c && c.receipt && !x.receipt;
}

function statusChip(st) {
  return `<span class="status status-${ST_CLS[st] || 'blue'}">${t(`status.${st}`)}</span>`;
}

function claims() {
  const list = getSeed('expenses');
  return statusFilter === 'all' ? list : list.filter(x => x.status === statusFilter);
}

function nextId(prefix, year, list, getId) {
  let n = 0;
  for (const row of list) {
    const m = String(getId(row)).match(new RegExp(`^${prefix}-${year}-(\\d+)$`));
    if (m) {
      n = Math.max(n, Number(m[1]));
    }
  }
  return `${prefix}-${year}-${String(n + 1).padStart(3, '0')}`;
}

function pushHistory(x, action, by, note) {
  const h = [...(x.history || []), { at: new Date().toISOString().slice(0, 10), by, action }];
  if (note) {
    h[h.length - 1].note = note;
  }
  return h;
}

function renderStats() {
  const set = (id, v) => {
    const el = document.getElementById(id);
    if (el) {
      el.textContent = v;
    }
  };
  const list = getSeed('expenses');
  const open = list.filter(x => !['paid', 'rejected'].includes(x.status));
  const vat = list
    .filter(x => x.status !== 'rejected')
    .reduce((s, x) => s + (Number(x.vat) || 0), 0);
  const bill = open
    .filter(x => x.billable)
    .reduce((s, x) => s + Number(x.amount || 0) + (Number(x.vat) || 0), 0);
  set('ex-stat-open', String(open.length));
  set(
    'ex-stat-amt',
    fmtSAR(open.reduce((s, x) => s + Number(x.amount || 0) + (Number(x.vat) || 0), 0))
  );
  set('ex-stat-vat', fmtSAR(vat));
  set('ex-stat-bill', fmtSAR(bill));
}

function renderRows() {
  const el = document.getElementById('ex-rows');
  if (!el) {
    return;
  }
  el.innerHTML = claims()
    .map(x => {
      const flags = [
        overLimit(x)
          ? `<span class="status status-yellow">${L('Over limit', 'فوق الحد')}</span>`
          : '',
        missingReceipt(x)
          ? `<span class="status status-red">${L('No receipt', 'بدون إيصال')}</span>`
          : '',
        x.billable
          ? `<span class="status status-purple">${L('Billable', 'قابل للفوترة')} · ${clientName(x.client)}</span>`
          : ''
      ].join(' ');
      const acts = [];
      if (x.status === 'draft') {
        acts.push(
          `<button class="btn btn-outline btn-sm" data-submit="${x.id}">${t('status.submitted')}</button>`
        );
      }
      if (x.status === 'submitted') {
        acts.push(
          `<button class="btn btn-outline btn-sm" data-approve="${x.id}">${t('status.approved')}</button>`
        );
        acts.push(
          `<button class="btn btn-outline btn-sm" data-reject="${x.id}">${t('status.rejected')}</button>`
        );
      }
      if (x.status === 'approved') {
        acts.push(
          `<button class="btn btn-outline btn-sm" data-pay="${x.id}">${t('status.paid')}</button>`
        );
      }
      return `<tr>
      <td data-label="#"><strong dir="ltr">${x.id}</strong>
        <div style="font-size:11.5px;color:var(--text-muted)" dir="ltr">${x.date}</div></td>
      <td data-label="${L('Employee', 'الموظف')}">${empName(x.emp)}</td>
      <td data-label="${L('Category', 'الفئة')}">${catLabel(x.cat)}</td>
      <td data-label="${L('Amount', 'المبلغ')}" dir="ltr"><strong>${fmtSAR(Number(x.amount || 0) + (Number(x.vat) || 0))}</strong>
        <div style="font-size:11.5px;color:var(--text-muted)" dir="ltr">${L('VAT', 'الضريبة')}: ${fmtSAR(x.vat || 0)}</div></td>
      <td data-label="${L('Receipt', 'الإيصال')}">${x.receipt ? '🧾 ✓' : '—'}</td>
      <td data-label="${L('Flags', 'ملاحظات')}">${flags || '—'}</td>
      <td data-label="${t('common.status')}">${statusChip(x.status)}</td>
      <td data-label=""><div style="display:flex;gap:6px;flex-wrap:wrap">${acts.join('')}</div></td>
    </tr>`;
    })
    .join('');
}

function advBalance(a) {
  const settled = (a.settled || []).reduce((s, r) => s + (Number(r.amount) || 0), 0);
  return Math.round((Number(a.amount || 0) - settled) * 100) / 100;
}

function renderAdvances() {
  const el = document.getElementById('ad-rows');
  if (!el) {
    return;
  }
  el.innerHTML = getSeed('advances')
    .map(a => {
      const bal = advBalance(a);
      return `<tr>
      <td data-label="#"><strong dir="ltr">${a.id}</strong>
        <div style="font-size:11.5px;color:var(--text-muted)" dir="ltr">${a.date}</div></td>
      <td data-label="${L('Employee', 'الموظف')}">${empName(a.emp)}</td>
      <td data-label="${L('Purpose', 'الغرض')}" dir="auto">${currentLang() === 'ar' ? a.purposeAr || a.purpose : a.purpose}</td>
      <td data-label="${L('Amount', 'المبلغ')}" dir="ltr">${fmtSAR(a.amount)}</td>
      <td data-label="${L('Balance', 'المتبقي')}" dir="ltr"><strong>${fmtSAR(bal)}</strong></td>
      <td data-label="${t('common.status')}">${
        a.status === 'settled'
          ? `<span class="status status-green">${L('Settled', 'مسددة')}</span>`
          : `<span class="status status-yellow">${L('Open', 'مفتوحة')}</span>`
      }</td>
      <td data-label="">${
        a.status === 'open' && bal > 0
          ? `<button class="btn btn-outline btn-sm" data-settle="${a.id}">${L('Settle via payroll', 'تسوية عبر المسيرة')}</button>`
          : ''
      }</td>
    </tr>`;
    })
    .join('');
}

function renderAll() {
  renderStats();
  renderRows();
  renderAdvances();
  applyI18n(document.querySelector('[data-hr-expenses]') || document);
}

function openClaimModal() {
  const cats = expenseCats();
  const emps = getSeed('employees');
  const clients = getSeed('clients');
  const today = new Date().toISOString().slice(0, 10);
  showModal({
    title: L('New expense claim', 'مطالبة مصروف جديدة'),
    size: 'lg',
    body: `<div class="hr-form-2col">
        <div class="form-group"><label class="form-label" for="nc-emp">${L('Employee', 'الموظف')}</label>
          <select class="form-control" id="nc-emp">${emps.map(e => `<option value="${e.code}">${e.code} — ${empName(e.code)}</option>`).join('')}</select></div>
        <div class="form-group"><label class="form-label" for="nc-date">${L('Date', 'التاريخ')}</label>
          <input class="form-control" id="nc-date" type="date" value="${today}" dir="ltr"></div>
        <div class="form-group"><label class="form-label" for="nc-cat">${L('Category', 'الفئة')}</label>
          <select class="form-control" id="nc-cat">${cats.map(c => `<option value="${c.code}">${currentLang() === 'ar' ? c.ar : c.en} · ≤ ${fmtSAR(c.limit)}</option>`).join('')}</select></div>
        <div class="form-group"><label class="form-label" for="nc-amt">${L('Amount excl. VAT (SAR)', 'المبلغ بدون ضريبة (ر.س)')}</label>
          <input class="form-control" id="nc-amt" type="number" min="0" step="0.01" dir="ltr"></div>
        <div class="form-group"><label class="form-label" for="nc-vat">${L('VAT (SAR)', 'الضريبة (ر.س)')}</label>
          <input class="form-control" id="nc-vat" type="number" min="0" step="0.01" dir="ltr"></div>
        <div class="form-group"><label class="form-label" for="nc-file">${L('Receipt', 'الإيصال')}</label>
          <input class="form-control" id="nc-file" type="file" accept="image/*,.pdf"></div>
      </div>
      <div class="form-group"><label class="form-label" for="nc-desc">${L('Description', 'الوصف')}</label>
        <input class="form-control" id="nc-desc"></div>
      <div class="hr-form-2col">
        <div class="form-group"><label class="form-label" style="display:flex;gap:8px;align-items:center">
          <input type="checkbox" id="nc-bill"> ${L('Billable to client', 'قابل للفوترة على عميل')}</label></div>
        <div class="form-group"><label class="form-label" for="nc-client">${L('Client', 'العميل')}</label>
          <select class="form-control" id="nc-client"><option value="">—</option>${clients.map(c => `<option value="${c.id}">${clientName(c.id)}</option>`).join('')}</select></div>
      </div>
      <div id="nc-hint"></div>`,
    actions: [
      { label: t('common.cancel'), variant: 'ghost' },
      {
        label: t('common.save'),
        variant: 'primary',
        action: ({ body }) => {
          const v = id => body.querySelector(id).value;
          const amount = Number(v('#nc-amt')) || 0;
          if (!(amount > 0)) {
            showToast(L('Enter a positive amount', 'أدخل مبلغًا موجبًا'), { variant: 'warning' });
            return false;
          }
          const date = v('#nc-date') || today;
          const row = {
            id: nextId('EXP', date.slice(0, 4), getSeed('expenses'), x => x.id),
            emp: v('#nc-emp'),
            date,
            cat: v('#nc-cat'),
            amount,
            vat: Number(v('#nc-vat')) || 0,
            receipt: !!body.querySelector('#nc-file').files.length,
            desc: v('#nc-desc').trim(),
            status: 'draft',
            billable: body.querySelector('#nc-bill').checked,
            client: body.querySelector('#nc-bill').checked ? v('#nc-client') || null : null,
            history: []
          };
          saveImportedRows('expenses', [row]);
          renderAll();
          showToast(
            overLimit(row)
              ? L('Saved as draft — over the category limit', 'حُفظت كمسودة — فوق حد الفئة')
              : L('Draft claim saved', 'حُفظت المسودة'),
            { variant: overLimit(row) ? 'warning' : 'success' }
          );
          return true;
        }
      }
    ]
  });
  const dlg = document.querySelector('.modal-backdrop:last-child') || document;
  const hint = () => {
    const c = catOf(dlg.querySelector('#nc-cat')?.value);
    const box = dlg.querySelector('#nc-hint');
    if (!box || !c) {
      return;
    }
    box.innerHTML = `<div class="hr-note">ℹ️ ${L('Limit', 'الحد')}: <span dir="ltr">${fmtSAR(c.limit)}</span> · ${
      c.receipt ? L('receipt required', 'الإيصال مطلوب') : L('no receipt needed', 'لا حاجة لإيصال')
    } · ${c.vat ? L('VAT applies', 'تطبق الضريبة') : L('no VAT', 'بدون ضريبة')}</div>`;
  };
  dlg.querySelector('#nc-cat')?.addEventListener('change', () => {
    hint();
    const c = catOf(dlg.querySelector('#nc-cat').value);
    const amt = Number(dlg.querySelector('#nc-amt').value) || 0;
    if (c && amt > 0) {
      dlg.querySelector('#nc-vat').value = c.vat ? Math.round(amt * VAT_RATE * 100) / 100 : 0;
    }
  });
  dlg.querySelector('#nc-amt')?.addEventListener('change', () => {
    const c = catOf(dlg.querySelector('#nc-cat').value);
    const amt = Number(dlg.querySelector('#nc-amt').value) || 0;
    if (c?.vat && amt > 0 && !(Number(dlg.querySelector('#nc-vat').value) > 0)) {
      dlg.querySelector('#nc-vat').value = Math.round(amt * VAT_RATE * 100) / 100;
    }
  });
  hint();
}

function openRejectModal(id) {
  const x = getSeed('expenses').find(r => r.id === id);
  if (!x) {
    return;
  }
  showModal({
    title: `${L('Reject', 'رفض')} ${id}`,
    body: `<div class="form-group"><label class="form-label" for="rj-note">${L('Reason', 'السبب')}</label>
      <input class="form-control" id="rj-note" placeholder="${L('e.g. Personal expense — not reimbursable', 'مثال: مصروف شخصي — غير قابل للتعويض')}"></div>`,
    actions: [
      { label: t('common.cancel'), variant: 'ghost' },
      {
        label: t('status.rejected'),
        variant: 'primary',
        action: ({ body }) => {
          const note = body.querySelector('#rj-note').value.trim();
          if (!note) {
            showToast(L('Enter a reason', 'أدخل السبب'), { variant: 'warning' });
            return false;
          }
          patchSeedRow('expenses', x, {
            status: 'rejected',
            history: pushHistory(x, 'rejected', APPROVER, note)
          });
          renderAll();
          return true;
        }
      }
    ]
  });
}

function openAdvanceModal() {
  const emps = getSeed('employees');
  const today = new Date().toISOString().slice(0, 10);
  showModal({
    title: L('New salary advance', 'سلفة راتب جديدة'),
    body: `<div class="hr-form-2col">
        <div class="form-group"><label class="form-label" for="na-emp">${L('Employee', 'الموظف')}</label>
          <select class="form-control" id="na-emp">${emps.map(e => `<option value="${e.code}">${e.code} — ${empName(e.code)}</option>`).join('')}</select></div>
        <div class="form-group"><label class="form-label" for="na-date">${L('Date', 'التاريخ')}</label>
          <input class="form-control" id="na-date" type="date" value="${today}" dir="ltr"></div>
      </div>
      <div class="form-group"><label class="form-label" for="na-amt">${L('Amount (SAR)', 'المبلغ (ر.س)')}</label>
        <input class="form-control" id="na-amt" type="number" min="0" step="1" dir="ltr"></div>
      <div class="form-group"><label class="form-label" for="na-pur">${L('Purpose', 'الغرض')}</label>
        <input class="form-control" id="na-pur"></div>`,
    actions: [
      { label: t('common.cancel'), variant: 'ghost' },
      {
        label: t('common.save'),
        variant: 'primary',
        action: ({ body }) => {
          const amount = Number(body.querySelector('#na-amt').value) || 0;
          if (!(amount > 0)) {
            showToast(L('Enter a positive amount', 'أدخل مبلغًا موجبًا'), { variant: 'warning' });
            return false;
          }
          const date = body.querySelector('#na-date').value || today;
          saveImportedRows('advances', [
            {
              id: nextId('ADV', date.slice(0, 4), getSeed('advances'), a => a.id),
              emp: body.querySelector('#na-emp').value,
              date,
              amount,
              purpose: body.querySelector('#na-pur').value.trim(),
              status: 'open',
              settled: []
            }
          ]);
          renderAll();
          showToast(L('Advance issued', 'أُصدرت السلفة'), { variant: 'success' });
          return true;
        }
      }
    ]
  });
}

function settleAdvance(id) {
  const a = getSeed('advances').find(r => r.id === id);
  if (!a || a.status !== 'open') {
    return;
  }
  const run = [...getSeed('payRuns')].reverse().find(r => r.status === 'draft');
  if (!run) {
    showToast(L('No draft pay run to settle into', 'لا توجد مسيرة مسودة للتسوية فيها'), {
      variant: 'warning'
    });
    return;
  }
  const bal = advBalance(a);
  const adj = { ...((run.adjustments || {})[a.emp] || {}) };
  adj.deductions = [
    ...(adj.deductions || []),
    { label: `${L('Advance', 'سلفة')} ${a.id}`, cat: 'advance', amount: bal }
  ];
  patchSeedRow('payRuns', run, { adjustments: { ...(run.adjustments || {}), [a.emp]: adj } });
  patchSeedRow('advances', a, {
    status: 'settled',
    settled: [
      ...(a.settled || []),
      { ref: run.id, at: new Date().toISOString().slice(0, 10), amount: bal }
    ]
  });
  renderAll();
  showToast(L(`Settled via ${run.id}`, `سُويت عبر ${run.id}`), { variant: 'success' });
}

const IMPORT_SCHEMA = [
  { key: 'emp', en: 'Employee', ar: 'الموظف', required: true },
  { key: 'date', en: 'Date', ar: 'التاريخ', required: true, type: 'date' },
  { key: 'cat', en: 'Category', ar: 'الفئة', required: true },
  { key: 'amount', en: 'Amount', ar: 'المبلغ', required: true, type: 'number' },
  { key: 'vat', en: 'VAT', ar: 'الضريبة', type: 'number' },
  { key: 'receipt', en: 'Receipt (yes/no)', ar: 'إيصال (نعم/لا)' },
  { key: 'desc', en: 'Description', ar: 'الوصف' },
  { key: 'billable', en: 'Billable (yes/no)', ar: 'قابل للفوترة (نعم/لا)' },
  { key: 'client', en: 'Client', ar: 'العميل' }
];

function openImport() {
  openImportModal({
    titleEn: 'Import expense claims',
    titleAr: 'استيراد مطالبات المصروفات',
    filename: 'expenses',
    schema: IMPORT_SCHEMA,
    example: {
      emp: 'EMP-0006',
      date: '2026-09-03',
      cat: 'fuel',
      amount: '420',
      vat: '63',
      receipt: 'yes',
      desc: 'Diesel',
      billable: 'no',
      client: ''
    },
    onImport: rows => {
      const list = getSeed('expenses');
      const out = [];
      let n = 0;
      for (const r of list) {
        const m = String(r.id).match(/^EXP-\d{4}-(\d+)$/);
        if (m) {
          n = Math.max(n, Number(m[1]));
        }
      }
      for (const r of rows) {
        if (!getSeed('employees').some(e => e.code === r.emp)) {
          showToast(
            L(`Unknown employee ${r.emp} — skipped`, `موظف غير معروف ${r.emp} — تم تجاهله`),
            { variant: 'warning' }
          );
          continue;
        }
        if (!catOf(r.cat)) {
          showToast(L(`Unknown category ${r.cat} — skipped`, `فئة غير معروفة ${r.cat} — تُجوهلت`), {
            variant: 'warning'
          });
          continue;
        }
        n += 1;
        const yes = v =>
          ['yes', 'y', '1', 'نعم', 'true'].includes(
            String(v || '')
              .trim()
              .toLowerCase()
          );
        out.push({
          id: `EXP-${String(r.date).slice(0, 4)}-${String(n).padStart(3, '0')}`,
          emp: r.emp,
          date: r.date,
          cat: r.cat,
          amount: Number(r.amount) || 0,
          vat: Number(r.vat) || 0,
          receipt: yes(r.receipt),
          desc: r.desc || '',
          status: 'draft',
          billable: yes(r.billable),
          client: yes(r.billable) ? r.client || null : null,
          history: []
        });
      }
      if (out.length) {
        saveImportedRows('expenses', out);
        renderAll();
      }
      return out.length;
    }
  });
}

function exportCols() {
  return [
    { key: 'id', label: 'Claim' },
    { key: 'emp', label: 'Employee' },
    { key: 'date', label: 'Date' },
    { key: 'cat', label: 'Category' },
    { key: 'amount', label: 'Amount (SAR)' },
    { key: 'vat', label: 'VAT (SAR)' },
    { key: 'receipt', label: 'Receipt' },
    { key: 'status', label: 'Status' },
    { key: 'billable', label: 'Billable' },
    { key: 'client', label: 'Client' }
  ];
}

export function initExpenses() {
  const root = document.querySelector('[data-hr-expenses]');
  if (!root) {
    return;
  }
  renderAll();
  if (booted) {
    return;
  }
  booted = true;
  document.getElementById('ex-status')?.addEventListener('change', e => {
    statusFilter = e.target.value;
    renderRows();
  });
  document.getElementById('ex-new')?.addEventListener('click', openClaimModal);
  document.getElementById('ex-import')?.addEventListener('click', openImport);
  document.getElementById('ad-new')?.addEventListener('click', openAdvanceModal);
  document.getElementById('ex-rows')?.addEventListener('click', e => {
    const q = sel => e.target.closest(sel);
    const sb = q('[data-submit]');
    const ap = q('[data-approve]');
    const rj = q('[data-reject]');
    const py = q('[data-pay]');
    if (sb) {
      const x = getSeed('expenses').find(r => r.id === sb.dataset.submit);
      if (!x) {
        return;
      }
      if (missingReceipt(x)) {
        showToast(L('Receipt required for this category', 'الإيصال مطلوب لهذه الفئة'), {
          variant: 'error'
        });
        return;
      }
      patchSeedRow('expenses', x, {
        status: 'submitted',
        history: pushHistory(x, 'submitted', x.emp)
      });
      renderAll();
      showToast(L('Claim submitted', 'أُرسلت المطالبة'), { variant: 'success' });
    } else if (ap) {
      const x = getSeed('expenses').find(r => r.id === ap.dataset.approve);
      if (!x) {
        return;
      }
      patchSeedRow('expenses', x, {
        status: 'approved',
        history: pushHistory(x, 'approved', APPROVER)
      });
      renderAll();
      showToast(
        overLimit(x)
          ? L('Approved — over the category limit', 'اعتُمدت — فوق حد الفئة')
          : L('Claim approved', 'اعتُمدت المطالبة'),
        { variant: overLimit(x) ? 'warning' : 'success' }
      );
    } else if (rj) {
      openRejectModal(rj.dataset.reject);
    } else if (py) {
      const x = getSeed('expenses').find(r => r.id === py.dataset.pay);
      if (!x) {
        return;
      }
      patchSeedRow('expenses', x, {
        status: 'paid',
        paidAt: new Date().toISOString().slice(0, 10),
        history: pushHistory(x, 'paid', PAYER)
      });
      renderAll();
      showToast(L('Claim paid', 'دُفعت المطالبة'), { variant: 'success' });
    }
  });
  document.getElementById('ad-rows')?.addEventListener('click', e => {
    const b = e.target.closest('[data-settle]');
    if (b) {
      settleAdvance(b.dataset.settle);
    }
  });
  const payload = () => getSeed('expenses');
  document.getElementById('ex-export-xlsx')?.addEventListener('click', () => {
    exportData('xlsx', 'expenses', exportCols(), payload(), 'Expenses');
  });
  document.getElementById('ex-export-csv')?.addEventListener('click', () => {
    exportCSV('expenses.csv', exportCols(), payload());
  });
  document.getElementById('ex-export-vat')?.addEventListener('click', () => {
    const rows = getSeed('expenses').filter(x => x.status !== 'rejected' && Number(x.vat) > 0);
    exportCSV(
      'expense-vat-reclaim.csv',
      [
        { key: 'id', label: 'Claim' },
        { key: 'date', label: 'Date' },
        { key: 'cat', label: 'Category' },
        { key: 'amount', label: 'Amount (SAR)' },
        { key: 'vat', label: 'VAT (SAR)' },
        { key: 'status', label: 'Status' }
      ],
      rows
    );
  });
  window.addEventListener(LANG_EVENT, renderAll);
}
