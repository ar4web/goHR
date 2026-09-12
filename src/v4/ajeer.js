// HR + Operations — Ajeer permits register (hr_ajeer.html).
// E-contracts per deployment: issue / renew / return + profession match. Idempotent.

import { showToast } from './toast.js';
import { showModal } from './modal.js';
import { t, currentLang, LANG_EVENT, applyI18n } from './i18n.js';
import { daysUntil, permitStatus, professionMatch } from './hr-statutory.js';
import { getSeed, patchSeedRow, saveImportedRows } from './hr-api.js';
import { exportData } from './import-export.js';
import { openImportModal } from './import-modal.js';
import { PROFESSIONS } from './hr-seed.js';

let booted = false;
let statusFilter = '';

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

function empProf(code) {
  return getSeed('employees').find(x => x.code === code)?.prof || '';
}

function profName(code) {
  const p = PROFESSIONS.find(x => x.code === code);
  if (!p) {
    return code || '—';
  }
  return currentLang() === 'ar' ? p.ar : p.en;
}

function clientName(id) {
  const c = getSeed('clients').find(x => x.id === id);
  if (!c) {
    return id;
  }
  return currentLang() === 'ar' ? c.nameAr || c.nameEn : c.nameEn;
}

function siteName(id) {
  const s = getSeed('sites').find(x => x.id === id);
  if (!s) {
    return id;
  }
  return currentLang() === 'ar' ? s.nameAr : s.nameEn;
}

function dispStatus(p) {
  if (p.status === 'returned') {
    return 'returned';
  }
  return permitStatus(p.exp);
}

function rows() {
  const list = getSeed('ajeerPermits');
  return statusFilter ? list.filter(p => dispStatus(p) === statusFilter) : list;
}

function renderStats() {
  const set = (id, v) => {
    const el = document.getElementById(id);
    if (el) {
      el.textContent = v;
    }
  };
  const list = getSeed('ajeerPermits');
  set('aj-stat-active', list.filter(p => dispStatus(p) === 'active').length);
  set('aj-stat-expiring', list.filter(p => dispStatus(p) === 'expiring').length);
  set('aj-stat-expired', list.filter(p => ['expired', 'missing'].includes(dispStatus(p))).length);
  set('aj-stat-returned', list.filter(p => p.status === 'returned').length);
}

const ST_CLS = {
  active: 'green',
  expiring: 'yellow',
  expired: 'red',
  missing: 'red',
  returned: 'blue'
};

function renderRows() {
  const el = document.getElementById('aj-rows');
  if (!el) {
    return;
  }
  const today = new Date().toISOString().slice(0, 10);
  el.innerHTML = rows()
    .map(p => {
      const st = dispStatus(p);
      const match = professionMatch(p.prof, empProf(p.emp));
      const left = p.exp ? daysUntil(p.exp, today) : null;
      return `<tr>
      <td data-label="${L('Permit', 'التصريح')}"><span dir="ltr"><strong>${p.no}</strong></span>
        <div style="font-size:11.5px;color:var(--text-muted)" dir="ltr">${p.asn || '—'}</div></td>
      <td data-label="${L('Worker', 'العامل')}"><a href="hr_employee.html?code=${p.emp}">${empName(p.emp)}</a>
        <div style="font-size:11.5px;color:var(--text-muted)">${clientName(p.client)} · ${siteName(p.site)}</div></td>
      <td data-label="${L('Profession', 'المهنة')}">${profName(p.prof)}
        <div style="margin-top:2px"><span class="status status-${match ? 'green' : 'red'}">${match ? L('Match', 'مطابق') : L('Mismatch', 'غير مطابق')}</span></div></td>
      <td data-label="${L('Expiry', 'الانتهاء')}" dir="ltr">${p.exp || '—'}
        <div style="font-size:11.5px;color:var(--text-muted)" dir="ltr">${left === null ? '' : left < 0 ? `${-left}d ${L('overdue', 'متأخر')}` : `${left}d ${L('left', 'متبق')}`}</div></td>
      <td data-label="${t('common.status')}"><span class="status status-${ST_CLS[st] || 'blue'}">${st === 'returned' ? t('status.returned') : st}</span></td>
      <td data-label=""><div style="display:flex;gap:6px">
        ${p.status !== 'returned' ? `<button class="btn btn-outline btn-sm" data-renew="${p.no}">${t('common.renew')}</button>` : ''}
        <button class="btn btn-outline btn-sm" data-hist="${p.no}">${L('History', 'السجل')}</button>
      </div></td>
    </tr>`;
    })
    .join('');
}

function renderAll() {
  const sel = document.getElementById('aj-status');
  if (sel && !sel.options.length) {
    sel.innerHTML = `<option value="">${L('All statuses', 'كل الحالات')}</option>
      <option value="active">active</option><option value="expiring">expiring</option>
      <option value="expired">expired</option><option value="returned">${L('Returned', 'مُعاد')}</option>`;
  }
  renderStats();
  renderRows();
  applyI18n(document.querySelector('[data-hr-ajeer]') || document);
}

function nextPermitNo() {
  const nums = getSeed('ajeerPermits').map(p => Number((p.no || '').split('-').pop()) || 0);
  return `AJ-2026-${Math.max(114, ...nums) + 1}`;
}

function openIssueModal() {
  const asns = getSeed('assignments').filter(a => a.status === 'active');
  const registered = new Set(
    getSeed('ajeerPermits')
      .filter(p => p.status !== 'returned')
      .map(p => p.no)
  );
  const today = new Date().toISOString().slice(0, 10);
  showModal({
    title: L('Issue permit', 'إصدار تصريح'),
    body: `<div class="form-group"><label class="form-label" for="is-asn">${L('Assignment', 'الإسناد')}</label>
        <select class="form-control" id="is-asn">${asns.map(a => `<option value="${a.id}">${a.id} · ${a.emp} · ${a.ajeer || L('no ref yet', 'بدون مرجع')}${a.ajeer && !registered.has(a.ajeer) ? ` · ${L('register it', 'سجّله')}` : ''}</option>`).join('')}</select></div>
      <div class="hr-form-2col">
        <div class="form-group"><label class="form-label" for="is-no">${L('Permit no.', 'رقم التصريح')}</label>
          <input class="form-control" id="is-no" dir="ltr" placeholder="${nextPermitNo()}"></div>
        <div class="form-group"><label class="form-label" for="is-prof">${L('Profession', 'المهنة')}</label>
          <select class="form-control" id="is-prof">${PROFESSIONS.map(p => `<option value="${p.code}">${L(p.en, p.ar)}</option>`).join('')}</select></div>
      </div>
      <div class="hr-form-2col">
        <div class="form-group"><label class="form-label" for="is-issued">${L('Issued', 'الإصدار')}</label>
          <input class="form-control" id="is-issued" type="date" value="${today}" dir="ltr"></div>
        <div class="form-group"><label class="form-label" for="is-exp">${L('Expiry', 'الانتهاء')}</label>
          <input class="form-control" id="is-exp" type="date" dir="ltr"></div>
      </div>`,
    actions: [
      { label: t('common.cancel'), variant: 'ghost' },
      {
        label: t('common.save'),
        variant: 'primary',
        action: ({ body }) => {
          const a = getSeed('assignments').find(x => x.id === body.querySelector('#is-asn').value);
          const exp = body.querySelector('#is-exp').value;
          if (!a || !exp) {
            showToast(L('Assignment and expiry are required', 'الإسناد والانتهاء مطلوبان'), {
              variant: 'warning'
            });
            return false;
          }
          const no = body.querySelector('#is-no').value.trim() || a.ajeer || nextPermitNo();
          if (getSeed('ajeerPermits').some(p => p.no === no && p.status !== 'returned')) {
            showToast(L('Permit already registered', 'التصريح مسجل مسبقًا'), {
              variant: 'warning'
            });
            return false;
          }
          saveImportedRows('ajeerPermits', [
            {
              no,
              asn: a.id,
              emp: a.emp,
              client: a.client,
              site: a.site,
              prof: body.querySelector('#is-prof').value,
              service: a.service,
              issued: body.querySelector('#is-issued').value || today,
              exp,
              status: 'active',
              history: [{ at: today, event: 'issued', by: 'PRO' }]
            }
          ]);
          patchSeedRow('assignments', a, { ajeer: no, ajeerExp: exp });
          renderAll();
          showToast(L('Permit issued & linked', 'أُصدر التصريح ورُبط'), { variant: 'success' });
          return true;
        }
      }
    ]
  });
}

function openRenewModal(no) {
  const p = getSeed('ajeerPermits').find(x => x.no === no);
  if (!p) {
    return;
  }
  const today = new Date().toISOString().slice(0, 10);
  showModal({
    title: `${t('common.renew')} · ${p.no}`,
    body: `<div class="form-group" style="margin-bottom:0"><label class="form-label" for="rw-exp">${L('New expiry', 'الانتهاء الجديد')}</label>
      <input class="form-control" id="rw-exp" type="date" value="${p.exp}" dir="ltr"></div>`,
    actions: [
      { label: t('common.cancel'), variant: 'ghost' },
      {
        label: t('common.save'),
        variant: 'primary',
        action: ({ body }) => {
          const exp = body.querySelector('#rw-exp').value;
          if (!exp || exp <= today) {
            showToast(L('Expiry must be in the future', 'الانتهاء يجب أن يكون مستقبليًا'), {
              variant: 'warning'
            });
            return false;
          }
          patchSeedRow('ajeerPermits', p, {
            exp,
            status: 'active',
            history: [...(p.history || []), { at: today, event: 'renewed', by: 'PRO' }]
          });
          const a = getSeed('assignments').find(x => x.id === p.asn);
          if (a) {
            patchSeedRow('assignments', a, { ajeerExp: exp });
          }
          renderAll();
          showToast(L('Permit renewed', 'تم تجديد التصريح'), { variant: 'success' });
          return true;
        }
      }
    ]
  });
}

function openHistoryModal(no) {
  const p = getSeed('ajeerPermits').find(x => x.no === no);
  if (!p) {
    return;
  }
  showModal({
    title: `${L('History', 'السجل')} · ${p.no}`,
    body:
      (p.history || [])
        .map(
          h =>
            `<div class="hr-kv"><span dir="ltr">${h.at} · ${h.event}</span><strong>${h.by || ''}</strong></div>`
        )
        .join('') || `<div class="hr-empty">${t('common.noData')}</div>`,
    actions: [{ label: t('common.close'), variant: 'ghost' }]
  });
}

const AJ_SCHEMA = [
  { key: 'no', en: 'Permit no.', ar: 'رقم التصريح', required: true },
  { key: 'asn', en: 'Assignment ID', ar: 'رمز الإسناد' },
  { key: 'emp', en: 'Employee code', ar: 'رقم الموظف', required: true },
  { key: 'prof', en: 'Profession code', ar: 'رمز المهنة' },
  { key: 'service', en: 'Service (labour/service)', ar: 'الخدمة' },
  { key: 'issued', en: 'Issued (YYYY-MM-DD)', ar: 'الإصدار', type: 'date' },
  { key: 'exp', en: 'Expiry (YYYY-MM-DD)', ar: 'الانتهاء', required: true, type: 'date' }
];

export function initAjeer() {
  const root = document.querySelector('[data-hr-ajeer]');
  if (!root) {
    return;
  }
  renderAll();
  if (booted) {
    return;
  }
  booted = true;
  document.getElementById('aj-status')?.addEventListener('change', e => {
    statusFilter = e.target.value;
    renderAll();
  });
  document.getElementById('aj-issue')?.addEventListener('click', openIssueModal);
  document.getElementById('aj-rows')?.addEventListener('click', e => {
    const rn = e.target.closest('[data-renew]');
    const hs = e.target.closest('[data-hist]');
    if (rn) {
      openRenewModal(rn.dataset.renew);
    } else if (hs) {
      openHistoryModal(hs.dataset.hist);
    }
  });
  document.getElementById('aj-import')?.addEventListener('click', () =>
    openImportModal({
      titleEn: 'Import permits (Excel / CSV)',
      titleAr: 'استيراد التصاريح (Excel / CSV)',
      filename: 'ajeer-permits',
      schema: AJ_SCHEMA,
      example: {
        no: 'AJ-2026-115',
        asn: '',
        emp: 'EMP-0016',
        prof: 'construction',
        service: 'labour',
        issued: '2026-10-01',
        exp: '2027-09-30'
      },
      onImport: rows => {
        const emps = getSeed('employees');
        const asns = new Set(getSeed('assignments').map(a => a.id));
        const out = [];
        for (const r of rows) {
          const e = emps.find(x => x.code === r.emp);
          if (!e) {
            showToast(`${L('Unknown employee', 'موظف غير معروف')}: ${r.emp}`, {
              variant: 'warning'
            });
            return false;
          }
          if (r.asn && !asns.has(r.asn)) {
            showToast(`${L('Unknown assignment', 'إسناد غير معروف')}: ${r.asn}`, {
              variant: 'warning'
            });
            return false;
          }
          const a = r.asn ? getSeed('assignments').find(x => x.id === r.asn) : null;
          out.push({
            no: r.no,
            asn: r.asn || '',
            emp: e.code,
            client: a?.client || '',
            site: a?.site || '',
            prof: r.prof || e.prof,
            service: r.service || a?.service || 'labour',
            issued: r.issued || '',
            exp: r.exp,
            status: 'active',
            history: [
              { at: r.issued || new Date().toISOString().slice(0, 10), event: 'issued', by: 'PRO' }
            ]
          });
        }
        saveImportedRows('ajeerPermits', out);
        renderAll();
        return out.length;
      }
    })
  );
  document.getElementById('aj-export')?.addEventListener('click', () => {
    exportData(
      'xlsx',
      'ajeer-permits',
      [
        { key: 'no', label: 'Permit' },
        { key: 'asn', label: 'Assignment' },
        { key: 'emp', label: 'Employee' },
        { key: 'client', label: 'Client' },
        { key: 'prof', label: 'Profession' },
        { key: 'issued', label: 'Issued' },
        { key: 'exp', label: 'Expiry' },
        { key: 'status', label: 'Status' }
      ],
      rows(),
      'Ajeer'
    );
  });
  window.addEventListener(LANG_EVENT, renderAll);
}
