// HR + Operations — leave (hr_leave.html).
// Balances + request modal with KSA guards + my-requests. Idempotent.

import { showToast } from './toast.js';
import { L } from './hr-locale.js';
import { showModal } from './modal.js';
import { t, currentLang, LANG_EVENT, applyI18n } from './i18n.js';
import { leaveDays, annualBalance, sickTier, hajjEligible, yearsBetween } from './hr-statutory.js';
import { getSeed, patchSeedRow, saveImportedRows } from './hr-api.js';
import { exportData } from './import-export.js';
import { openImportModal } from './import-modal.js';
import { LEAVE_TYPES, HOLIDAYS } from './hr-seed.js';

let booted = false;
let who = '';

function current() {
  const list = getSeed('employees');
  if (!who) {
    who = list[0].code;
  }
  return list.find(e => e.code === who) || list[0];
}

function typeName(code) {
  const x = LEAVE_TYPES.find(l => l.code === code);
  if (!x) {
    return code;
  }
  return currentLang() === 'ar' ? x.ar : x.en;
}

function myRequests(e) {
  return getSeed('leaveRequests').filter(r => r.emp === e.code);
}

function pendingAnnual(e) {
  return myRequests(e)
    .filter(r => r.type === 'annual' && r.status === 'pending')
    .reduce((s, r) => s + (r.days || 0), 0);
}

function pastHajj(e) {
  return myRequests(e).filter(r => r.type === 'hajj' && r.status === 'approved').length;
}

function renderBalances() {
  const el = document.getElementById('lv-balances');
  if (!el) {
    return;
  }
  const e = current();
  const bal = annualBalance(e.join, e.annualUsed || 0, pendingAnnual(e));
  const sickUsed = e.sickUsed || 0;
  const tier = sickTier(sickUsed + 1);
  const hajj = hajjEligible(e.join, pastHajj(e));
  el.innerHTML = `
    <div class="my-leave-ring" style="border-color:var(--primary)"><strong>${bal.left}</strong><span>${L('annual left', 'سنوية متبقية')}</span></div>
    <div class="hr-kv-grid" style="margin-top:12px;text-align:start">
      <div class="hr-kv"><span>${L('Annual entitlement', 'رصيد السنوية')}</span><strong>${bal.entitlement}</strong></div>
      <div class="hr-kv"><span>${L('Annual used', 'المستخدم')}</span><strong>${e.annualUsed || 0}</strong></div>
      <div class="hr-kv"><span>${L('Annual pending', 'قيد الانتظار')}</span><strong>${pendingAnnual(e)}</strong></div>
      <div class="hr-kv"><span>${L('Sick used (year)', 'المرضية المستخدمة')}</span><strong>${sickUsed} · ${tier.rate * 100}%</strong></div>
      <div class="hr-kv"><span>${L('Hajj', 'الحج')}</span><strong>${hajj.ok ? `<span class="status status-green">${L('Eligible', 'مستحق')}</span>` : `<span class="status status-yellow">${hajj.reason}</span>`}</strong></div>
      <div class="hr-kv"><span>${L('Tenure', 'الخدمة')}</span><strong>${yearsBetween(e.join).toFixed(1)} ${L('yrs', 'سنة')}</strong></div>
    </div>`;
}

function renderTypes() {
  const el = document.getElementById('lv-types');
  if (!el) {
    return;
  }
  el.innerHTML =
    `<div class="table-responsive"><table class="table"><thead><tr>
    <th>${L('Type', 'النوع')}</th><th>${L('Allowance', 'المقدار')}</th></tr></thead><tbody>` +
    LEAVE_TYPES.map(x => {
      let allow = '';
      if (x.code === 'annual') {
        allow = `21 → 30 ${L('days (5y step-up)', 'يوم (ترقية 5 سنوات)')}`;
      } else if (x.code === 'sick') {
        allow = L('30 full + 60 at ¾ + 30 unpaid', '30 كاملة + 60 بثلاثة أرباع + 30 بدون أجر');
      } else if (x.code === 'maternity') {
        allow = L('10 weeks', '10 أسابيع');
      } else if (x.code === 'iddah') {
        allow = L('4 months + 10 days', '4 أشهر + 10 أيام');
      } else if (x.code === 'hajj') {
        allow = L('10–15 days, once after 2y', '10–15 يومًا، مرة بعد سنتين');
      } else if (x.code === 'unpaid') {
        allow = L('up to 10 days', 'حتى 10 أيام');
      } else if (x.days) {
        allow = `${x.days} ${L('days', 'أيام')}`;
      }
      return `<tr><td data-label="${L('Type', 'النوع')}">${typeName(x.code)}</td><td data-label="${L('Allowance', 'المقدار')}" style="font-size:12.5px">${allow}</td></tr>`;
    }).join('') +
    '</tbody></table></div>';
}

const RQ_CLS = { pending: 'yellow', approved: 'green', rejected: 'red', cancelled: 'blue' };

function renderMine() {
  const el = document.getElementById('lv-mine');
  if (!el) {
    return;
  }
  const rows = myRequests(current());
  el.innerHTML = rows.length
    ? `<div class="table-responsive"><table class="table"><thead><tr>
      <th>#</th><th>${L('Type', 'النوع')}</th><th>${L('Dates', 'التواريخ')}</th><th>${L('Days', 'الأيام')}</th><th>${t('common.status')}</th><th></th>
    </tr></thead><tbody>` +
      rows
        .map(
          r => `<tr>
      <td data-label="#" dir="ltr">${r.id}</td>
      <td data-label="${L('Type', 'النوع')}">${typeName(r.type)}</td>
      <td data-label="${L('Dates', 'التواريخ')}" style="font-size:12.5px" dir="ltr">${r.from} → ${r.to}</td>
      <td data-label="${L('Days', 'الأيام')}" dir="ltr">${r.days}</td>
      <td data-label="${t('common.status')}"><span class="status status-${RQ_CLS[r.status] || 'blue'}">${t(`status.${r.status}`)}</span></td>
      <td data-label="">${r.status === 'pending' ? `<button class="btn btn-outline btn-sm" data-cancel="${r.id}">${t('common.cancel')}</button>` : ''}</td>
    </tr>`
        )
        .join('') +
      '</tbody></table></div>'
    : `<div class="hr-empty">${t('common.noData')}</div>`;
}

function renderAll() {
  const e = current();
  const sel = document.getElementById('lv-who');
  if (sel && !sel.options.length) {
    sel.innerHTML = getSeed('employees')
      .map(
        x =>
          `<option value="${x.code}">${x.code} · ${currentLang() === 'ar' ? x.nameAr || x.nameEn : x.nameEn}</option>`
      )
      .join('');
  }
  if (sel) {
    sel.value = e.code;
  }
  renderBalances();
  renderTypes();
  renderMine();
  applyI18n(document.querySelector('[data-hr-leave]') || document);
}

function openRequestModal() {
  const e = current();
  showModal({
    title: L('Request leave', 'طلب إجازة'),
    body: `<div class="form-group"><label class="form-label" for="lr-type">${L('Type', 'النوع')}</label>
        <select class="form-control" id="lr-type">${LEAVE_TYPES.map(x => `<option value="${x.code}">${typeName(x.code)}</option>`).join('')}</select></div>
      <div class="hr-form-2col">
        <div class="form-group"><label class="form-label" for="lr-from">${L('From', 'من')}</label>
          <input class="form-control" id="lr-from" type="date" dir="ltr"></div>
        <div class="form-group"><label class="form-label" for="lr-to">${L('To', 'إلى')}</label>
          <input class="form-control" id="lr-to" type="date" dir="ltr"></div>
      </div>
      <div style="font-size:12.5px;margin-bottom:10px" id="lr-days"></div>
      <div class="form-group"><label class="form-label" for="lr-note">${L('Note', 'ملاحظة')}</label>
        <input class="form-control" id="lr-note"></div>
      <label class="ob-check" id="lr-cert-wrap" style="display:none"><input type="checkbox" id="lr-cert"> ${L('Medical certificate attached', 'مرفق تقرير طبي')}</label>
      <div class="text-danger" style="font-size:12.5px" id="lr-guard"></div>`,
    actions: [
      { label: t('common.cancel'), variant: 'ghost' },
      {
        label: t('common.save'),
        variant: 'primary',
        action: ({ body }) => {
          const type = body.querySelector('#lr-type').value;
          const from = body.querySelector('#lr-from').value;
          const to = body.querySelector('#lr-to').value;
          const days = leaveDays(from, to, HOLIDAYS);
          const verdict = guard(type, from, to, days, body.querySelector('#lr-cert').checked);
          if (!verdict.ok) {
            showToast(verdict.msg, { variant: 'warning' });
            return false;
          }
          const n = getSeed('leaveRequests').length + 32;
          saveImportedRows('leaveRequests', [
            {
              id: `LV-2026-0${n}`,
              emp: e.code,
              type,
              from,
              to,
              days,
              cert: body.querySelector('#lr-cert').checked,
              status: 'pending',
              step: 0,
              note: body.querySelector('#lr-note').value.trim(),
              history: []
            }
          ]);
          renderAll();
          showToast(L('Request sent to approvals', 'أُرسل الطلب للموافقات'), {
            variant: 'success'
          });
          return true;
        }
      }
    ]
  });
  const dlg = document.querySelector('.modal-backdrop:last-child') || document;
  const refresh = () => {
    const type = dlg.querySelector('#lr-type').value;
    const from = dlg.querySelector('#lr-from').value;
    const to = dlg.querySelector('#lr-to').value;
    const days = from && to ? leaveDays(from, to, HOLIDAYS) : 0;
    dlg.querySelector('#lr-days').innerHTML = days
      ? L(
          `Working days (excl. Fri/Sat + holidays): <b>${days}</b>`,
          `أيام العمل (بدون جمعة/سبت + العطل): <b>${days}</b>`
        )
      : '';
    dlg.querySelector('#lr-cert-wrap').style.display = type === 'sick' ? '' : 'none';
    const verdict =
      from && to
        ? guard(type, from, to, days, dlg.querySelector('#lr-cert').checked)
        : { ok: true, msg: '' };
    dlg.querySelector('#lr-guard').textContent = verdict.ok ? '' : verdict.msg;
  };
  dlg.addEventListener('change', refresh);
}

function guard(type, from, to, days, cert, empRow) {
  const e = empRow || current();
  const bad = msg => ({ ok: false, msg });
  if (!from || !to) {
    return bad(L('Dates are required', 'التواريخ مطلوبة'));
  }
  if (to < from) {
    return bad(L('End is before start', 'النهاية قبل البداية'));
  }
  if (!days) {
    return bad(L('No working days in range', 'لا توجد أيام عمل في النطاق'));
  }
  if (type === 'annual') {
    const bal = annualBalance(e.join, e.annualUsed || 0, pendingAnnual(e));
    if (days > bal.left) {
      return bad(L(`Only ${bal.left} annual days left`, `المتبقي من السنوية ${bal.left} فقط`));
    }
  }
  if (type === 'sick' && !cert) {
    return bad(L('Sick leave needs a medical certificate', 'المرضية تحتاج تقريرًا طبيًا'));
  }
  if (type === 'hajj') {
    const h = hajjEligible(e.join, pastHajj(e));
    if (!h.ok) {
      return bad(
        h.reason === 'already-taken'
          ? L('Hajj taken before (once only)', 'سبق أخذ الحج (مرة واحدة)')
          : L('Hajj needs 2 years of service', 'الحج يحتاج سنتين خدمة')
      );
    }
  }
  if (type === 'unpaid' && days > 10) {
    return bad(L('Unpaid cap is 10 days', 'حد بدون الأجر 10 أيام'));
  }
  const x = LEAVE_TYPES.find(l => l.code === type);
  if (x && x.days && days > x.days) {
    return bad(L(`Allowance is ${x.days} days`, `المقدار ${x.days} أيام`));
  }
  return { ok: true, msg: '' };
}

export function initLeave() {
  const root = document.querySelector('[data-hr-leave]');
  if (!root) {
    return;
  }
  if (!who) {
    try {
      who = localStorage.getItem('hr:my-code') || getSeed('employees')[0].code;
    } catch (_e) {
      who = getSeed('employees')[0].code;
    }
  }
  renderAll();
  if (booted) {
    return;
  }
  booted = true;
  document.getElementById('lv-who')?.addEventListener('change', e => {
    who = e.target.value;
    renderAll();
  });
  document.getElementById('lv-new')?.addEventListener('click', openRequestModal);
  const lvSchema = [
    { key: 'emp', en: 'Employee code', ar: 'رقم الموظف', required: true },
    { key: 'type', en: 'Type code', ar: 'رمز النوع', required: true },
    { key: 'from', en: 'From (YYYY-MM-DD)', ar: 'من', required: true, type: 'date' },
    { key: 'to', en: 'To (YYYY-MM-DD)', ar: 'إلى', required: true, type: 'date' },
    { key: 'note', en: 'Note', ar: 'ملاحظة' },
    { key: 'cert', en: 'Certificate (yes/no)', ar: 'التقرير الطبي' }
  ];
  document.getElementById('lv-import')?.addEventListener('click', () =>
    openImportModal({
      titleEn: 'Import leave requests (Excel / CSV)',
      titleAr: 'استيراد طلبات الإجازات (Excel / CSV)',
      filename: 'leave-requests',
      schema: lvSchema,
      example: {
        emp: 'EMP-0009',
        type: 'annual',
        from: '2026-10-05',
        to: '2026-10-09',
        note: '',
        cert: ''
      },
      onImport: rows => {
        const list = getSeed('employees');
        let n = getSeed('leaveRequests').length + 32;
        const out = [];
        for (const r of rows) {
          const e = list.find(x => x.code === r.emp);
          if (!e) {
            showToast(`${L('Unknown employee', 'موظف غير معروف')}: ${r.emp}`, {
              variant: 'warning'
            });
            return false;
          }
          const cert = /^(1|y|yes|true)$/i.test((r.cert || '').trim());
          const days = leaveDays(r.from, r.to, HOLIDAYS);
          const v = guard(r.type, r.from, r.to, days, cert, e);
          if (!v.ok) {
            showToast(`${r.emp}: ${v.msg}`, { variant: 'warning' });
            return false;
          }
          n += 1;
          out.push({
            id: `LV-2026-0${n}`,
            emp: e.code,
            type: r.type,
            from: r.from,
            to: r.to,
            days,
            cert,
            status: 'pending',
            step: 0,
            note: r.note || '',
            history: []
          });
        }
        saveImportedRows('leaveRequests', out);
        renderAll();
        return out.length;
      }
    })
  );
  document.getElementById('lv-export')?.addEventListener('click', () => {
    exportData(
      'xlsx',
      `leave-${who}`,
      [
        { key: 'id', label: 'ID' },
        { key: 'type', label: 'Type' },
        { key: 'from', label: 'From' },
        { key: 'to', label: 'To' },
        { key: 'days', label: 'Days' },
        { key: 'status', label: 'Status' }
      ],
      myRequests(current()),
      'Leave'
    );
  });
  document.getElementById('lv-mine')?.addEventListener('click', e => {
    const btn = e.target.closest('[data-cancel]');
    if (!btn) {
      return;
    }
    const r = getSeed('leaveRequests').find(x => x.id === btn.dataset.cancel);
    if (r && r.status === 'pending') {
      patchSeedRow('leaveRequests', r, { status: 'cancelled' });
      renderAll();
      showToast(L('Request cancelled', 'أُلغي الطلب'), { variant: 'success' });
    }
  });
  window.addEventListener(LANG_EVENT, renderAll);
}
