// HR + Operations — contract maker + registers (hr_contracts.html).
// Maker wizard: pick type → pick party (auto-fills) → fill highlighted fields
// → bilingual preview → draft/issue. Sign-track + file + expiry clock live in
// the registers. Probation >180 days is blocked at issue (§0.4).

import { showToast } from './toast.js';
import { showModal } from './modal.js';
import { t, currentLang, LANG_EVENT, applyI18n } from './i18n.js';
import { renderTemplate, probationOk, contractEnd, daysUntil, expiryBand } from './hr-statutory.js';
import { getSeed, patchSeedRow, saveImportedRows } from './hr-api.js';
import { buildValues, partyContext, resolveSource, partyLabel } from './contract-values.js';
import { exportData, exportCSV } from './import-export.js';

let booted = false;
let catFilter = 'all';

const ST_CLS = {
  draft: 'blue',
  review: 'yellow',
  issued: 'purple',
  signed: 'green',
  active: 'green',
  renewed: 'blue',
  closed: 'red'
};
const ST_NEXT = { draft: 'review', review: 'issued', issued: 'signed', signed: 'active' };
const SIGN_NEXT = { unsigned: 'acknowledged', acknowledged: 'signed' };
const BAND_CLS = {
  expired: 'red',
  critical: 'red',
  urgent: 'yellow',
  soon: 'blue',
  ok: 'green',
  missing: 'blue'
};

function L(en, ar) {
  return currentLang() === 'ar' ? ar : en;
}

function tpl(code) {
  return getSeed('templates').find(x => x.code === code);
}

function tplName(x) {
  return currentLang() === 'ar' ? `${x.code} — ${x.ar}` : `${x.code} — ${x.en}`;
}

function stLabel(st) {
  const map = {
    draft: t('status.draft'),
    review: L('In review', 'قيد المراجعة'),
    issued: t('status.issued'),
    signed: L('Signed', 'موقّع'),
    active: t('status.active'),
    renewed: L('Renewed', 'مجدّد'),
    closed: L('Closed', 'مغلق')
  };
  return map[st] || st;
}

function signLabel(s) {
  return s === 'signed'
    ? L('Signed', 'موقّع')
    : s === 'acknowledged'
      ? L('Acknowledged', 'مُقرّ بالاستلام')
      : L('Unsigned', 'غير موقّع');
}

function bandChip(end) {
  if (!end) {
    return '<span style="color:var(--text-muted)">—</span>';
  }
  const days = daysUntil(end, new Date().toISOString().slice(0, 10));
  const band = expiryBand(days);
  const lbl =
    band === 'expired'
      ? L('Expired', 'منتهٍ')
      : band === 'ok'
        ? `${days}d`
        : `${days}d ${L('left', 'متبقٍ')}`;
  return `<span dir="ltr">${end}</span> <span class="status status-${BAND_CLS[band]}">${lbl}</span>`;
}

function contracts() {
  const list = getSeed('contracts');
  return catFilter === 'all' ? list : list.filter(c => (tpl(c.type)?.cat || '') === catFilter);
}

function nextId() {
  const year = new Date().getFullYear();
  let n = 0;
  for (const c of getSeed('contracts')) {
    const m = String(c.id).match(new RegExp(`^CT-${year}-(\\d+)$`));
    if (m) {
      n = Math.max(n, Number(m[1]));
    }
  }
  return `CT-${year}-${String(n + 1).padStart(3, '0')}`;
}

function renderStats() {
  const set = (id, v) => {
    const el = document.getElementById(id);
    if (el) {
      el.textContent = v;
    }
  };
  const list = getSeed('contracts');
  const today = new Date().toISOString().slice(0, 10);
  const exp = list.filter(c => {
    if (!c.end || !['active', 'signed', 'issued'].includes(c.status)) {
      return false;
    }
    return daysUntil(c.end, today) <= 90;
  }).length;
  set('ct-stat-active', String(list.filter(c => c.status === 'active').length));
  set('ct-stat-exp', String(exp));
  set('ct-stat-sign', String(list.filter(c => c.sign !== 'signed').length));
  set('ct-stat-draft', String(list.filter(c => c.status === 'draft').length));
}

function renderRows() {
  const el = document.getElementById('ct-rows');
  if (!el) {
    return;
  }
  el.innerHTML = contracts()
    .map(c => {
      const x = tpl(c.type);
      const acts = [
        `<a class="btn btn-outline btn-sm" href="hr_contract.html?id=${c.id}">${t('common.view')}</a>`
      ];
      if (SIGN_NEXT[c.sign]) {
        acts.push(
          `<button class="btn btn-outline btn-sm" data-sign="${c.id}">${L('Sign ✓', 'وقّع ✓')}</button>`
        );
      }
      if (c.sign === 'signed' && !c.filed) {
        acts.push(
          `<button class="btn btn-outline btn-sm" data-file="${c.id}">${L('File', 'أرشفة')}</button>`
        );
      }
      if (ST_NEXT[c.status]) {
        acts.push(
          `<button class="btn btn-outline btn-sm" data-adv="${c.id}">→ ${stLabel(ST_NEXT[c.status])}</button>`
        );
      }
      if (c.status === 'active') {
        acts.push(
          `<button class="btn btn-outline btn-sm" data-renew="${c.id}">${L('Renew', 'تجديد')}</button>`
        );
        acts.push(
          `<button class="btn btn-outline btn-sm" data-close="${c.id}">${L('Close', 'إغلاق')}</button>`
        );
      }
      return `<tr>
      <td data-label="#"><strong dir="ltr">${c.id}</strong>
        <div style="font-size:11.5px;color:var(--text-muted)">v${c.templateVer}</div></td>
      <td data-label="${L('Type', 'النوع')}">${x ? tplName(x) : c.type}</td>
      <td data-label="${L('Party', 'الطرف')}">${x ? partyLabel(x, c.party) : c.party}</td>
      <td data-label="${L('Period', 'الفترة')}" dir="ltr">${c.start || '—'} → ${c.end || '∞'}</td>
      <td data-label="${L('Expiry', 'الانتهاء')}">${bandChip(c.end)}</td>
      <td data-label="${t('common.status')}"><span class="status status-${ST_CLS[c.status] || 'blue'}">${stLabel(c.status)}</span></td>
      <td data-label="${L('Sign', 'التوقيع')}">${signLabel(c.sign)}${c.filed ? ` · 🗄️ ${L('Filed', 'مؤرشف')}` : ''}</td>
      <td data-label=""><div style="display:flex;gap:6px;flex-wrap:wrap">${acts.join('')}</div></td>
    </tr>`;
    })
    .join('');
}

function renderAll() {
  renderStats();
  renderRows();
  applyI18n(document.querySelector('[data-hr-contracts]') || document);
}

// ── Maker wizard ────────────────────────────────────────────────────────

function partyOptions(kind) {
  if (kind === 'employee') {
    return getSeed('employees').map(e => ({
      v: e.code,
      l: `${e.code} — ${currentLang() === 'ar' ? e.nameAr || e.nameEn : e.nameEn}`
    }));
  }
  if (kind === 'candidate') {
    return getSeed('candidates').map(c => ({ v: c.id, l: `${c.id} — ${c.nameEn}` }));
  }
  if (kind === 'client') {
    return getSeed('clients').map(c => ({
      v: c.id,
      l: `${c.id} — ${currentLang() === 'ar' ? c.nameAr || c.nameEn : c.nameEn}`
    }));
  }
  if (kind === 'assignment') {
    return getSeed('assignments').map(a => ({ v: a.id, l: a.id }));
  }
  return [];
}

function openWizard() {
  const tpls = getSeed('templates');
  const cats = {
    E: L('Employee contracts', 'عقود العمل'),
    A: L('Assignment docs', 'مستندات الإعارة'),
    C: L('Client agreements', 'اتفاقيات العملاء'),
    L: L('HR letters', 'خطابات الموارد')
  };
  showModal({
    title: L('Contract maker', 'منشئ العقود'),
    size: 'lg',
    body: `<div class="hr-form-2col">
        <div class="form-group"><label class="form-label" for="mz-type">${L('1 · Document type', '1 · نوع المستند')}</label>
          <select class="form-control" id="mz-type">${['E', 'A', 'C', 'L']
            .map(
              k =>
                `<optgroup label="${cats[k]}">${tpls
                  .filter(x => x.cat === k)
                  .map(x => `<option value="${x.code}">${tplName(x)}</option>`)
                  .join('')}</optgroup>`
            )
            .join('')}</select></div>
        <div class="form-group"><label class="form-label" for="mz-party">${L('2 · Party (auto-fills)', '2 · الطرف (تعبئة تلقائية)')}</label>
          <select class="form-control" id="mz-party"></select></div>
      </div>
      <h4 style="margin:10px 0 6px">${L('3 · Highlighted fields', '3 · الحقول المطلوبة')}</h4>
      <div id="mz-fields"></div>
      <h4 style="margin:10px 0 6px">${L('4 · Bilingual preview', '4 · معاينة ثنائية اللغة')}</h4>
      <div id="mz-prev"></div>`,
    actions: [
      { label: t('common.cancel'), variant: 'ghost' },
      {
        label: L('Save draft', 'حفظ مسودة'),
        variant: 'outline',
        action: ({ body }) => createFromWizard(body, 'draft')
      },
      {
        label: L('Issue', 'إصدار'),
        variant: 'primary',
        action: ({ body }) => createFromWizard(body, 'issued')
      }
    ]
  });
  const dlg = document.querySelector('.modal-backdrop:last-child') || document;
  const cur = () => tpl(dlg.querySelector('#mz-type')?.value);
  const refreshParty = () => {
    const x = cur();
    const sel = dlg.querySelector('#mz-party');
    if (!x || !sel) {
      return;
    }
    sel.innerHTML = `<option value="">—</option>${partyOptions(x.party)
      .map(o => `<option value="${o.v}">${o.l}</option>`)
      .join('')}`;
  };
  const refreshFields = () => {
    const x = cur();
    const box = dlg.querySelector('#mz-fields');
    if (!x || !box) {
      return;
    }
    const ctx = partyContext(x, dlg.querySelector('#mz-party')?.value);
    box.innerHTML =
      (x.fields || [])
        .map(f => {
          const pre = f.def ?? resolveSource(f.source, ctx) ?? '';
          const input =
            f.kind === 'date'
              ? `<input class="form-control" data-f="${f.key}" type="date" value="${pre}" dir="ltr">`
              : f.kind === 'number'
                ? `<input class="form-control" data-f="${f.key}" type="number" step="1" value="${pre}" dir="ltr">`
                : `<input class="form-control" data-f="${f.key}" value="${String(pre).replace(/"/g, '&quot;')}">`;
          return `<div class="form-group"><label class="form-label">${currentLang() === 'ar' ? f.ar : f.en}</label>${input}</div>`;
        })
        .join('') ||
      `<div class="hr-empty">${L('No manual fields — fully auto-filled.', 'لا حقول يدوية — تعبئة تلقائية كاملة.')}</div>`;
  };
  const refreshPrev = () => {
    const x = cur();
    const box = dlg.querySelector('#mz-prev');
    if (!x || !box) {
      return;
    }
    const manual = gatherFields(dlg);
    const v = buildValues(x, dlg.querySelector('#mz-party')?.value, manual);
    box.innerHTML = `<div class="hr-form-2col">
      <div class="inv-doc" style="white-space:pre-line;font-size:12.5px" dir="ltr">${renderTemplate(x.bodyEn, v)}</div>
      <div class="inv-doc" style="white-space:pre-line;font-size:12.5px" dir="rtl">${renderTemplate(x.bodyAr, v)}</div>
    </div>`;
  };
  const refreshAll = () => {
    refreshFields();
    refreshPrev();
  };
  refreshParty();
  refreshFields();
  refreshPrev();
  dlg.querySelector('#mz-type')?.addEventListener('change', () => {
    refreshParty();
    refreshAll();
  });
  dlg.querySelector('#mz-party')?.addEventListener('change', refreshAll);
  dlg.querySelector('#mz-fields')?.addEventListener('input', refreshPrev);
}

function gatherFields(dlg) {
  const out = {};
  dlg.querySelectorAll('[data-f]').forEach(el => {
    out[el.dataset.f] = el.value;
  });
  return out;
}

function createFromWizard(dlg, status) {
  const type = dlg.querySelector('#mz-type')?.value;
  const party = dlg.querySelector('#mz-party')?.value;
  const x = tpl(type);
  if (!x) {
    return false;
  }
  if (!party) {
    showToast(L('Pick a party first', 'اختر الطرف أولًا'), { variant: 'warning' });
    return false;
  }
  const manual = gatherFields(dlg);
  for (const f of x.fields || []) {
    if (manual[f.key] === undefined || String(manual[f.key]).trim() === '') {
      showToast(L(`Fill: ${currentLang() === 'ar' ? f.ar : f.en}`, `أكمل: ${f.ar}`), {
        variant: 'warning'
      });
      return false;
    }
  }
  if (manual.probation_days !== undefined && !probationOk(manual.probation_days)) {
    showToast(
      L('Probation must be 1–180 days (§0.4) — blocked', 'التجربة 1–180 يومًا (0.4) — مرفوض'),
      { variant: 'error' }
    );
    return false;
  }
  const v = buildValues(x, party, manual);
  const start = v.start_date || new Date().toISOString().slice(0, 10);
  let end = v.end_date || '';
  if (!end && manual.duration_months) {
    end = contractEnd(start, Number(manual.duration_months));
  }
  const id = nextId();
  saveImportedRows('contracts', [
    {
      id,
      type,
      partyKind: x.party,
      party,
      start,
      end,
      status,
      sign: 'unsigned',
      signedAt: '',
      templateVer: x.version,
      qiwa: '',
      filed: false,
      values: manual
    }
  ]);
  renderAll();
  showToast(
    status === 'issued'
      ? L(`Issued ${id}`, `أُصدر ${id}`)
      : L(`Draft ${id} saved`, `حُفظت مسودة ${id}`),
    { variant: 'success' }
  );
  return true;
}

function openRenewModal(id) {
  const c = getSeed('contracts').find(r => r.id === id);
  if (!c) {
    return;
  }
  showModal({
    title: `${L('Renew', 'تجديد')} ${id}`,
    body: `<div class="form-group"><label class="form-label" for="rn-m">${L('Extend by (months)', 'التمديد (أشهر)')}</label>
      <input class="form-control" id="rn-m" type="number" min="1" step="1" value="${c.values?.duration_months || 12}" dir="ltr"></div>`,
    actions: [
      { label: t('common.cancel'), variant: 'ghost' },
      {
        label: L('Renew', 'تجديد'),
        variant: 'primary',
        action: ({ body }) => {
          const m = Number(body.querySelector('#rn-m').value) || 0;
          if (!(m > 0)) {
            showToast(L('Enter months', 'أدخل الأشهر'), { variant: 'warning' });
            return false;
          }
          const base =
            c.end && c.end >= new Date().toISOString().slice(0, 10)
              ? c.end
              : new Date().toISOString().slice(0, 10);
          patchSeedRow('contracts', c, {
            end: contractEnd(base, m),
            status: 'active',
            values: { ...(c.values || {}), duration_months: m }
          });
          renderAll();
          showToast(L('Contract renewed', 'جُدد العقد'), { variant: 'success' });
          return true;
        }
      }
    ]
  });
}

export function initContracts() {
  const root = document.querySelector('[data-hr-contracts]');
  if (!root) {
    return;
  }
  renderAll();
  if (booted) {
    return;
  }
  booted = true;
  document.getElementById('ct-cat')?.addEventListener('change', e => {
    catFilter = e.target.value;
    renderRows();
  });
  document.getElementById('ct-new')?.addEventListener('click', openWizard);
  document.getElementById('ct-rows')?.addEventListener('click', e => {
    const q = sel => e.target.closest(sel);
    const sg = q('[data-sign]');
    const fl = q('[data-file]');
    const av = q('[data-adv]');
    const rn = q('[data-renew]');
    const cl = q('[data-close]');
    if (sg) {
      const c = getSeed('contracts').find(r => r.id === sg.dataset.sign);
      if (!c) {
        return;
      }
      const next = SIGN_NEXT[c.sign];
      const patch = { sign: next };
      if (next === 'signed') {
        patch.signedAt = new Date().toISOString().slice(0, 10);
        if (c.status === 'issued') {
          patch.status = 'signed';
        }
      }
      patchSeedRow('contracts', c, patch);
      renderAll();
      showToast(L('Signature recorded', 'سُجل التوقيع'), { variant: 'success' });
    } else if (fl) {
      const c = getSeed('contracts').find(r => r.id === fl.dataset.file);
      if (!c) {
        return;
      }
      patchSeedRow('contracts', c, { filed: true });
      renderAll();
      showToast(L('Filed to vault', 'أُرشف في الخزينة'), { variant: 'success' });
    } else if (av) {
      const c = getSeed('contracts').find(r => r.id === av.dataset.adv);
      if (!c) {
        return;
      }
      patchSeedRow('contracts', c, { status: ST_NEXT[c.status] });
      renderAll();
    } else if (rn) {
      openRenewModal(rn.dataset.renew);
    } else if (cl) {
      const c = getSeed('contracts').find(r => r.id === cl.dataset.close);
      if (!c) {
        return;
      }
      patchSeedRow('contracts', c, { status: 'closed' });
      renderAll();
    }
  });
  const cols = [
    { key: 'id', label: 'Contract' },
    { key: 'type', label: 'Type' },
    { key: 'party', label: 'Party' },
    { key: 'start', label: 'Start' },
    { key: 'end', label: 'End' },
    { key: 'status', label: 'Status' },
    { key: 'sign', label: 'Sign' }
  ];
  document.getElementById('ct-export-xlsx')?.addEventListener('click', () => {
    exportData('xlsx', 'contracts', cols, getSeed('contracts'), 'Contracts');
  });
  document.getElementById('ct-export-csv')?.addEventListener('click', () => {
    exportCSV('contracts.csv', cols, getSeed('contracts'));
  });
  window.addEventListener(LANG_EVENT, renderAll);
}
