// HR + Operations — deployments board (hr_assignments.html).
// Assignments gated by Ajeer e-contracts + licence scope + 3y cap. Idempotent.

import { showToast } from './toast.js';
import { showModal } from './modal.js';
import { t, currentLang, LANG_EVENT, applyI18n } from './i18n.js';
import { fmtSAR } from './hr-locale.js';
import {
  ajeerCheck,
  yearsBetween,
  permitStatus,
  returnDeadline,
  professionMatch,
  licenceScopeOk
} from './hr-statutory.js';
import { getSeed, patchSeedRow, saveImportedRows } from './hr-api.js';
import { exportData } from './import-export.js';
import { openImportModal } from './import-modal.js';
import { SEED_LICENCE } from './hr-seed.js';

let booted = false;
let clientFilter = '';
let gateFilter = '';

function L(en, ar) {
  return currentLang() === 'ar' ? ar : en;
}

function licenceSettings() {
  try {
    const s = JSON.parse(localStorage.getItem('hr:settings:v1') || '{}');
    return {
      scope: s.licence?.scope || SEED_LICENCE.scope,
      strictAjeer: s.licence?.strictAjeer !== false
    };
  } catch (_e) {
    return { scope: SEED_LICENCE.scope, strictAjeer: true };
  }
}

function empOf(code) {
  return getSeed('employees').find(e => e.code === code);
}

function empName(code) {
  const e = empOf(code);
  if (!e) {
    return code;
  }
  return currentLang() === 'ar' ? e.nameAr || e.nameEn : e.nameEn;
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

function permitOf(a) {
  return getSeed('ajeerPermits').find(p => p.no === a.ajeer && p.status !== 'returned');
}

// Full gate: statutory Ajeer check + permit registration + profession match.
function gateOf(a) {
  const emp = empOf(a.emp);
  const client = getSeed('clients').find(x => x.id === a.client);
  const g = ajeerCheck(a, emp, client);
  const reasons = [...g.reasons];
  if (a.status === 'active' && a.ajeer) {
    const p = permitOf(a);
    if (!p) {
      reasons.push('permit-not-registered');
    } else if (emp && !professionMatch(p.prof, emp.prof)) {
      reasons.push('profession-mismatch');
    }
  }
  return { ok: reasons.length === 0, reasons };
}

function rows() {
  return getSeed('assignments').filter(
    a =>
      (!clientFilter || a.client === clientFilter) &&
      (!gateFilter || (gateFilter === 'ok' ? gateOf(a).ok : !gateOf(a).ok))
  );
}

function renderStats() {
  const set = (id, v) => {
    const el = document.getElementById(id);
    if (el) {
      el.textContent = v;
    }
  };
  const list = getSeed('assignments');
  const active = list.filter(a => a.status === 'active');
  set('as-stat-active', active.length);
  set('as-stat-blocked', active.filter(a => !gateOf(a).ok).length);
  set('as-stat-expiring', active.filter(a => permitStatus(a.ajeerExp) === 'expiring').length);
  set('as-stat-returned', list.filter(a => a.status === 'returned').length);
}

function gateChip(a) {
  if (a.status !== 'active') {
    return `<span class="status status-blue">${t('status.returned')}</span>`;
  }
  const g = gateOf(a);
  if (g.ok) {
    return `<span class="status status-green">${L('Clear', 'سليم')}</span>`;
  }
  return `<span class="status status-red" title="${g.reasons.join(', ')}">${L('Blocked', 'محظور')} (${g.reasons.length})</span>`;
}

function renderRows() {
  const el = document.getElementById('as-rows');
  if (!el) {
    return;
  }
  el.innerHTML = rows()
    .map(a => {
      const pst = a.status === 'active' ? permitStatus(a.ajeerExp) : '—';
      const pcls = pst === 'active' ? 'green' : pst === 'expiring' ? 'yellow' : 'red';
      return `<tr>
      <td data-label="${L('Worker', 'العامل')}"><a href="hr_employee.html?code=${a.emp}">${empName(a.emp)}</a>
        <div style="font-size:11.5px;color:var(--text-muted)" dir="ltr">${a.id}</div></td>
      <td data-label="${L('Client', 'العميل')}">${clientName(a.client)}
        <div style="font-size:11.5px;color:var(--text-muted)">${siteName(a.site)}</div></td>
      <td data-label="${L('Period', 'الفترة')}" style="font-size:12px" dir="ltr">${a.start || '—'} → ${a.end || '—'}</td>
      <td data-label="${L('Rate', 'الأجر')}" dir="ltr">${fmtSAR(a.rate || 0)}</td>
      <td data-label="${L('Ajeer', 'أجير')}" dir="ltr">${a.ajeer || '—'}
        <div style="margin-top:2px"><span class="status status-${pcls}">${pst === '—' ? '—' : pst}</span></div></td>
      <td data-label="${L('Gate', 'البوابة')}">${gateChip(a)}</td>
      <td data-label=""><div style="display:flex;gap:6px">
        <button class="btn btn-outline btn-sm" data-edit="${a.id}">${t('common.edit')}</button>
        ${a.status === 'active' ? `<button class="btn btn-outline btn-sm" data-ret="${a.id}">${L('Return', 'إعادة')}</button>` : ''}
      </div></td>
    </tr>`;
    })
    .join('');
}

function renderAll() {
  const sel = document.getElementById('as-client');
  if (sel && !sel.options.length) {
    sel.innerHTML =
      `<option value="">${L('All clients', 'كل العملاء')}</option>` +
      getSeed('clients')
        .map(c => `<option value="${c.id}">${cname(c)}</option>`)
        .join('');
  }
  const gs = document.getElementById('as-gate');
  if (gs && !gs.options.length) {
    gs.innerHTML = `<option value="">${L('All gates', 'كل الحالات')}</option><option value="ok">${L('Clear', 'سليم')}</option><option value="blocked">${L('Blocked', 'محظور')}</option>`;
  }
  renderStats();
  renderRows();
  applyI18n(document.querySelector('[data-hr-assign]') || document);
}

function cname(c) {
  return currentLang() === 'ar' ? c.nameAr || c.nameEn : c.nameEn;
}

function nextAsnId() {
  const nums = getSeed('assignments').map(a => Number((a.id || '').split('-').pop()) || 0);
  return `ASN-2026-${String(Math.max(0, ...nums) + 1).padStart(3, '0')}`;
}

function bumpReq(reqId, delta) {
  if (!reqId) {
    return;
  }
  const r = getSeed('requests').find(x => x.id === reqId);
  if (r) {
    patchSeedRow('requests', r, { filled: Math.max(0, (r.filled || 0) + delta) });
  }
}

// Hard guards for a NEW deployment. Returns { ok, msg }.
function deployGuards({ emp, service, consent, ajeer, start, end }) {
  const lic = licenceSettings();
  if (!emp || emp.st === 'exited') {
    return { ok: false, msg: L('Employee is missing or exited', 'الموظف مفقود أو منتهية خدمته') };
  }
  if (!licenceScopeOk(lic.scope, service)) {
    return {
      ok: false,
      msg: L(
        `Licence scope is ${lic.scope} — ${service} blocked (D11)`,
        `نطاق الترخيص ${lic.scope} — ${service} محظور`
      )
    };
  }
  if (!start || !end || end <= start) {
    return { ok: false, msg: L('End must be after start', 'النهاية يجب أن تكون بعد البداية') };
  }
  if (yearsBetween(start, end) > 3.01) {
    return { ok: false, msg: L('Over the 3-year Ajeer cap', 'فوق سقف أجير 3 سنوات') };
  }
  if (!consent) {
    return { ok: false, msg: L('Worker consent is required', 'موافقة العامل مطلوبة') };
  }
  if (lic.strictAjeer && !ajeer) {
    return {
      ok: false,
      msg: L('Ajeer e-contract is required BEFORE work', 'عقد أجير مطلوب قبل العمل')
    };
  }
  return { ok: true, msg: '' };
}

function openDeployModal() {
  const emps = getSeed('employees').filter(e => e.st !== 'exited');
  const clients = getSeed('clients');
  const reqs = getSeed('requests').filter(r => !['fulfilled', 'cancelled'].includes(r.status));
  const lic = licenceSettings();
  showModal({
    title: L('Deploy worker', 'توزيع عامل'),
    body: `<div class="hr-form-2col">
        <div class="form-group"><label class="form-label" for="dp-emp">${L('Worker', 'العامل')}</label>
          <select class="form-control" id="dp-emp">${emps.map(e => `<option value="${e.code}">${e.code} · ${currentLang() === 'ar' ? e.nameAr || e.nameEn : e.nameEn}</option>`).join('')}</select></div>
        <div class="form-group"><label class="form-label" for="dp-req">${L('Request (optional)', 'الطلب (اختياري)')}</label>
          <select class="form-control" id="dp-req"><option value="">—</option>${reqs.map(r => `<option value="${r.id}">${r.id} · ${r.prof} · ${r.filled || 0}/${r.qty}</option>`).join('')}</select></div>
      </div>
      <div class="hr-form-2col">
        <div class="form-group"><label class="form-label" for="dp-client">${L('Client', 'العميل')}</label>
          <select class="form-control" id="dp-client">${clients.map(c => `<option value="${c.id}">${cname(c)}</option>`).join('')}</select></div>
        <div class="form-group"><label class="form-label" for="dp-site">${L('Site', 'الموقع')}</label>
          <select class="form-control" id="dp-site"></select></div>
      </div>
      <div class="hr-form-2col">
        <div class="form-group"><label class="form-label" for="dp-service">${L('Service', 'الخدمة')}</label>
          <select class="form-control" id="dp-service"><option value="labour">${L('Labour outsourcing', 'تعهيد عمالة')}</option><option value="service">${L('Service contract', 'عقد خدمة')}</option></select></div>
        <div class="form-group"><label class="form-label" for="dp-consent">${L('Consent', 'الموافقة')}</label>
          <select class="form-control" id="dp-consent"><option value="contract">${L('In contract', 'في العقد')}</option><option value="signed">${L('Signed form', 'نموذج موقع')}</option><option value="">${L('Missing', 'مفقودة')}</option></select></div>
      </div>
      <div class="hr-form-2col">
        <div class="form-group"><label class="form-label" for="dp-ajeer">${L('Ajeer ref', 'مرجع أجير')}</label>
          <input class="form-control" id="dp-ajeer" dir="ltr" placeholder="AJ-2026-…"></div>
        <div class="form-group"><label class="form-label" for="dp-ajeerExp">${L('Ajeer expiry', 'انتهاء أجير')}</label>
          <input class="form-control" id="dp-ajeerExp" type="date" dir="ltr"></div>
      </div>
      <div class="hr-form-2col">
        <div class="form-group"><label class="form-label" for="dp-start">${L('Start', 'البداية')}</label>
          <input class="form-control" id="dp-start" type="date" dir="ltr"></div>
        <div class="form-group"><label class="form-label" for="dp-end">${L('End (≤3y)', 'النهاية')}</label>
          <input class="form-control" id="dp-end" type="date" dir="ltr"></div>
      </div>
      <div class="form-group" style="margin-bottom:0"><label class="form-label" for="dp-rate">${L('Monthly rate (SAR)', 'الأجر الشهري')}</label>
        <input class="form-control" id="dp-rate" type="number" min="0" value="3000" dir="ltr"></div>
      <div style="font-size:12px;color:var(--text-muted);margin-top:8px">${L(`Licence scope: ${lic.scope} · strict Ajeer ${lic.strictAjeer ? 'ON' : 'OFF'}`, `نطاق الترخيص: ${lic.scope}`)}</div>`,
    actions: [
      { label: t('common.cancel'), variant: 'ghost' },
      {
        label: t('common.save'),
        variant: 'primary',
        action: ({ body }) => {
          const emp = empOf(body.querySelector('#dp-emp').value);
          const v = {
            emp,
            service: body.querySelector('#dp-service').value,
            consent: body.querySelector('#dp-consent').value,
            ajeer: body.querySelector('#dp-ajeer').value.trim(),
            start: body.querySelector('#dp-start').value,
            end: body.querySelector('#dp-end').value
          };
          const g = deployGuards(v);
          if (!g.ok) {
            showToast(g.msg, { variant: 'warning' });
            return false;
          }
          const row = {
            id: nextAsnId(),
            emp: emp.code,
            client: body.querySelector('#dp-client').value,
            site: body.querySelector('#dp-site').value,
            req: body.querySelector('#dp-req').value,
            start: v.start,
            end: v.end,
            rate: Number(body.querySelector('#dp-rate').value) || 0,
            service: v.service,
            consent: v.consent,
            ajeer: v.ajeer,
            ajeerExp: body.querySelector('#dp-ajeerExp').value,
            status: 'active'
          };
          saveImportedRows('assignments', [row]);
          bumpReq(row.req, 1);
          const soft = gateOf({ ...row, ...getSeed('assignments').find(a => a.id === row.id) });
          if (!soft.ok) {
            showToast(
              `${L('Deployed with gate warnings', 'تم التوزيع مع تنبيهات')}: ${soft.reasons.join(', ')}`,
              { variant: 'warning' }
            );
          } else {
            const dup =
              getSeed('assignments').filter(a => a.emp === emp.code && a.status === 'active')
                .length > 1;
            showToast(
              dup
                ? L(
                    'Deployed — worker has 2+ sites (watch hour limits)',
                    'تم التوزيع — للعامل موقعان (راقب الساعات)'
                  )
                : L('Deployed', 'تم التوزيع'),
              { variant: 'success' }
            );
          }
          renderAll();
          return true;
        }
      }
    ]
  });
  const dlg = document.querySelector('.modal-backdrop:last-child') || document;
  const fillSites = () => {
    const cid = dlg.querySelector('#dp-client')?.value;
    const siteSel = dlg.querySelector('#dp-site');
    if (siteSel) {
      siteSel.innerHTML = getSeed('sites')
        .filter(s => s.client === cid)
        .map(
          s => `<option value="${s.id}">${currentLang() === 'ar' ? s.nameAr : s.nameEn}</option>`
        )
        .join('');
    }
  };
  fillSites();
  dlg.addEventListener('change', ev => {
    if (ev.target?.id === 'dp-client') {
      fillSites();
    }
  });
}

function openEditModal(id) {
  const a = getSeed('assignments').find(x => x.id === id);
  if (!a) {
    return;
  }
  showModal({
    title: `${t('common.edit')} · ${a.id}`,
    body: `<div class="hr-form-2col">
        <div class="form-group"><label class="form-label" for="ae-rate">${L('Monthly rate (SAR)', 'الأجر الشهري')}</label>
          <input class="form-control" id="ae-rate" type="number" min="0" value="${a.rate || 0}" dir="ltr"></div>
        <div class="form-group"><label class="form-label" for="ae-end">${L('End', 'النهاية')}</label>
          <input class="form-control" id="ae-end" type="date" value="${a.end || ''}" dir="ltr"></div>
      </div>
      <div class="hr-form-2col">
        <div class="form-group"><label class="form-label" for="ae-ajeer">${L('Ajeer ref', 'مرجع أجير')}</label>
          <input class="form-control" id="ae-ajeer" value="${a.ajeer || ''}" dir="ltr"></div>
        <div class="form-group"><label class="form-label" for="ae-exp">${L('Ajeer expiry', 'انتهاء أجير')}</label>
          <input class="form-control" id="ae-exp" type="date" value="${a.ajeerExp || ''}" dir="ltr"></div>
      </div>`,
    actions: [
      { label: t('common.cancel'), variant: 'ghost' },
      {
        label: t('common.save'),
        variant: 'primary',
        action: ({ body }) => {
          const end = body.querySelector('#ae-end').value;
          if (end && (end <= a.start || yearsBetween(a.start, end) > 3.01)) {
            showToast(L('End breaks the start/3y rule', 'النهاية تخالف قاعدة البداية/3 سنوات'), {
              variant: 'warning'
            });
            return false;
          }
          patchSeedRow('assignments', a, {
            rate: Number(body.querySelector('#ae-rate').value) || 0,
            end,
            ajeer: body.querySelector('#ae-ajeer').value.trim(),
            ajeerExp: body.querySelector('#ae-exp').value
          });
          renderAll();
          showToast(L('Assignment updated', 'تم تحديث الإسناد'), { variant: 'success' });
          return true;
        }
      }
    ]
  });
}

function openReturnModal(id) {
  const a = getSeed('assignments').find(x => x.id === id);
  if (!a) {
    return;
  }
  const today = new Date().toISOString().slice(0, 10);
  showModal({
    title: `${L('Return worker', 'إعادة عامل')} · ${a.emp}`,
    body: `<div class="form-group" style="margin-bottom:8px"><label class="form-label" for="rt-date">${L('Return date', 'تاريخ الإعادة')}</label>
        <input class="form-control" id="rt-date" type="date" value="${today}" dir="ltr"></div>
      <div style="font-size:12.5px;color:var(--text-muted)">${L('Beneficiary must return the worker within 1 working day. Permit closes with the return.', 'يجب على المستفيد إعادة العامل خلال يوم عمل واحد.')}</div>`,
    actions: [
      { label: t('common.cancel'), variant: 'ghost' },
      {
        label: L('Confirm return', 'تأكيد الإعادة'),
        variant: 'primary',
        action: ({ body }) => {
          const at = body.querySelector('#rt-date').value || today;
          patchSeedRow('assignments', a, { status: 'returned', returnAt: at });
          const p = getSeed('ajeerPermits').find(x => x.no === a.ajeer && x.status !== 'returned');
          if (p) {
            patchSeedRow('ajeerPermits', p, {
              status: 'returned',
              history: [...(p.history || []), { at, event: 'returned', by: a.client }]
            });
          }
          bumpReq(a.req, -1);
          renderAll();
          showToast(`${L('Returned — deadline', 'أُعيد — الموعد')}: ${returnDeadline(at)}`, {
            variant: 'success'
          });
          return true;
        }
      }
    ]
  });
}

const AS_SCHEMA = [
  { key: 'emp', en: 'Employee code', ar: 'رقم الموظف', required: true },
  { key: 'req', en: 'Request ID', ar: 'رمز الطلب' },
  { key: 'client', en: 'Client ID', ar: 'رمز العميل', required: true },
  { key: 'site', en: 'Site ID', ar: 'رمز الموقع', required: true },
  { key: 'start', en: 'Start (YYYY-MM-DD)', ar: 'البداية', type: 'date' },
  { key: 'end', en: 'End (YYYY-MM-DD)', ar: 'النهاية', type: 'date' },
  { key: 'rate', en: 'Monthly rate (SAR)', ar: 'الأجر الشهري', type: 'number' },
  { key: 'service', en: 'Service (labour/service)', ar: 'الخدمة' },
  { key: 'consent', en: 'Consent', ar: 'الموافقة' },
  { key: 'ajeer', en: 'Ajeer ref', ar: 'مرجع أجير' },
  { key: 'ajeerExp', en: 'Ajeer expiry', ar: 'انتهاء أجير', type: 'date' }
];

export function initAssignments() {
  const root = document.querySelector('[data-hr-assign]');
  if (!root) {
    return;
  }
  renderAll();
  if (booted) {
    return;
  }
  booted = true;
  document.getElementById('as-client')?.addEventListener('change', e => {
    clientFilter = e.target.value;
    renderAll();
  });
  document.getElementById('as-gate')?.addEventListener('change', e => {
    gateFilter = e.target.value;
    renderAll();
  });
  document.getElementById('as-new')?.addEventListener('click', openDeployModal);
  document.getElementById('as-rows')?.addEventListener('click', e => {
    const edt = e.target.closest('[data-edit]');
    const ret = e.target.closest('[data-ret]');
    if (edt) {
      openEditModal(edt.dataset.edit);
    } else if (ret) {
      openReturnModal(ret.dataset.ret);
    }
  });
  document.getElementById('as-import')?.addEventListener('click', () =>
    openImportModal({
      titleEn: 'Import deployments (Excel / CSV)',
      titleAr: 'استيراد الإسناد (Excel / CSV)',
      filename: 'assignments',
      schema: AS_SCHEMA,
      example: {
        emp: 'EMP-0016',
        req: '',
        client: 'CL-001',
        site: 'ST-001',
        start: '2026-10-01',
        end: '2027-09-30',
        rate: '3200',
        service: 'labour',
        consent: 'contract',
        ajeer: 'AJ-2026-115',
        ajeerExp: '2027-09-30'
      },
      onImport: rows => {
        const clients = new Set(getSeed('clients').map(c => c.id));
        const sites = new Set(getSeed('sites').map(s => s.id));
        let n = Math.max(
          0,
          ...getSeed('assignments').map(a => Number((a.id || '').split('-').pop()) || 0)
        );
        const out = [];
        for (const r of rows) {
          const emp = empOf(r.emp);
          if (!emp) {
            showToast(`${L('Unknown employee', 'موظف غير معروف')}: ${r.emp}`, {
              variant: 'warning'
            });
            return false;
          }
          if (!clients.has(r.client) || !sites.has(r.site)) {
            showToast(`${L('Unknown client/site', 'عميل/موقع غير معروف')}: ${r.client}/${r.site}`, {
              variant: 'warning'
            });
            return false;
          }
          const g = deployGuards({
            emp,
            service: r.service || 'labour',
            consent: r.consent,
            ajeer: r.ajeer,
            start: r.start,
            end: r.end
          });
          if (!g.ok) {
            showToast(`${r.emp}: ${g.msg}`, { variant: 'warning' });
            return false;
          }
          n += 1;
          out.push({
            id: `ASN-2026-${String(n).padStart(3, '0')}`,
            emp: emp.code,
            client: r.client,
            site: r.site,
            req: r.req || '',
            start: r.start || '',
            end: r.end || '',
            rate: Number(r.rate) || 0,
            service: r.service || 'labour',
            consent: r.consent,
            ajeer: r.ajeer || '',
            ajeerExp: r.ajeerExp || '',
            status: 'active'
          });
        }
        saveImportedRows('assignments', out);
        out.forEach(a => bumpReq(a.req, 1));
        renderAll();
        return out.length;
      }
    })
  );
  document.getElementById('as-export')?.addEventListener('click', () => {
    exportData(
      'xlsx',
      'assignments',
      [
        { key: 'id', label: 'ID' },
        { key: 'emp', label: 'Employee' },
        { key: 'client', label: 'Client' },
        { key: 'site', label: 'Site' },
        { key: 'req', label: 'Request' },
        { key: 'start', label: 'Start' },
        { key: 'end', label: 'End' },
        { key: 'rate', label: 'Rate' },
        { key: 'service', label: 'Service' },
        { key: 'ajeer', label: 'Ajeer' },
        { key: 'status', label: 'Status' }
      ],
      rows(),
      'Assignments'
    );
  });
  window.addEventListener(LANG_EVENT, renderAll);
}
