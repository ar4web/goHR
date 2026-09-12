// HR + Operations — customization center (hr_settings.html).
// Brand · Nitaqat · Licence · Language · Departments · Professions · Reset.

import { showToast } from './toast.js';
import { showModal } from './modal.js';
import { t, currentLang, setLang, LANG_EVENT, applyI18n, applyBranding } from './i18n.js';
import {
  getSettings,
  saveSettings,
  getEosbConfig,
  getCompanies,
  getActiveCompany,
  setActiveCompany,
  addCompany,
  removeCompany,
  saveCompany,
  addLetter,
  removeLetter,
  setDefaultLetter,
  LETTER_MAX_BYTES
} from './hr-statutory.js';
import { download } from './import-export.js';
import { getSeed } from './hr-api.js';
import { DEPARTMENTS, APPROVAL_CHAINS, ROLES } from './hr-seed.js';

let booted = false;

function L(en, ar) {
  return currentLang() === 'ar' ? ar : en;
}

function customLists() {
  let lists = { departments: null, professions: null };
  try {
    lists = { ...lists, ...JSON.parse(localStorage.getItem('hr:custom-lists') || '{}') };
  } catch (_e) {
    /* ignore */
  }
  return lists;
}

function saveCustomLists(lists) {
  try {
    localStorage.setItem('hr:custom-lists', JSON.stringify(lists));
  } catch (_e) {
    /* ignore */
  }
}

function getDepts() {
  const c = customLists();
  return c.departments || DEPARTMENTS;
}

function field(id, label, value, opts = {}) {
  return `<div class="form-group"><label class="form-label" for="${id}">${label}</label>
    <input class="form-control" id="${id}" value="${(value ?? '').toString().replace(/"/g, '&quot;')}" ${opts.dir ? `dir="${opts.dir}"` : ''} ${opts.type ? `type="${opts.type}"` : ''} ${opts.extra || ''}></div>`;
}

// Cap stored logos at 256px PNG so brand uploads can't blow the 5MB
// localStorage quota (quota errors are silent by design).
function downscaleLogo(dataUrl, done) {
  const img = new Image();
  img.onload = () => {
    try {
      const k = Math.min(1, 256 / Math.max(img.width, img.height));
      const c = document.createElement('canvas');
      c.width = Math.max(1, Math.round(img.width * k));
      c.height = Math.max(1, Math.round(img.height * k));
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      done(c.toDataURL('image/png'));
    } catch (_e) {
      done(dataUrl);
    }
  };
  img.onerror = () => done(dataUrl);
  img.src = dataUrl;
}

function renderBrand(s) {
  const el = document.getElementById('set-brand');
  if (!el) {
    return;
  }
  el.innerHTML =
    '<div class="hr-form-2col">' +
    field('set-cname-en', L('Company name (EN)', 'اسم الشركة (إنجليزي)'), s.company.nameEn, {
      dir: 'ltr'
    }) +
    field('set-cname-ar', L('Company name (AR)', 'اسم الشركة (عربي)'), s.company.nameAr) +
    field('set-cr', L('CR number', 'السجل التجاري'), s.company.cr, { dir: 'ltr' }) +
    field('set-vat', L('VAT number', 'الرقم الضريبي'), s.company.vat, { dir: 'ltr' }) +
    field('set-addr', L('Address', 'العنوان'), s.company.address) +
    field('set-phone', L('Phone', 'الهاتف'), s.company.phone, { dir: 'ltr' }) +
    field('set-email', L('Email', 'البريد الإلكتروني'), s.company.email, { dir: 'ltr' }) +
    field('set-primary', L('Brand color', 'لون العلامة'), s.company.primary, {
      dir: 'ltr',
      type: 'color',
      extra: 'style="height:38px;padding:4px;cursor:pointer"'
    }) +
    `</div>
    <div class="form-group"><label class="form-label">${L('Logo', 'الشعار')}</label>
      <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">
        <img id="set-logo-preview" src="${s.company.logo || ''}" alt="" style="height:40px;max-width:120px;object-fit:contain;${s.company.logo ? '' : 'display:none'}">
        <label class="btn btn-outline btn-sm" style="cursor:pointer">${t('common.chooseFile')}
          <input type="file" id="set-logo" accept="image/*" hidden></label>
        <button type="button" class="btn btn-ghost btn-sm" id="set-logo-clear">${L('Remove', 'إزالة')}</button>
      </div>
      <p style="font-size:11.5px;color:var(--text-muted);margin:6px 0 0">${L('PNG or SVG, stored locally. Empty = company initial.', 'PNG أو SVG، يُحفظ محليًا. فارغ = الحرف الأول للشركة.')}</p>
    </div>`;
  el.querySelector('#set-logo')?.addEventListener('change', e => {
    const f = e.target.files[0];
    if (!f) {
      return;
    }
    const r = new FileReader();
    r.onload = () => {
      downscaleLogo(String(r.result || ''), dataUrl => {
        const prev = el.querySelector('#set-logo-preview');
        if (prev) {
          prev.src = dataUrl;
          prev.style.display = '';
        }
        el.dataset.logo = dataUrl;
      });
    };
    r.readAsDataURL(f);
  });
  el.querySelector('#set-logo-clear')?.addEventListener('click', () => {
    el.dataset.logo = '';
    const prev = el.querySelector('#set-logo-preview');
    if (prev) {
      prev.style.display = 'none';
    }
  });
}

function renderNitaqat(s) {
  const el = document.getElementById('set-nitaqat');
  if (!el) {
    return;
  }
  el.innerHTML =
    '<div class="hr-form-2col">' +
    field('set-nit-activity', L('Activity category', 'فئة النشاط'), s.nitaqat.activity) +
    field('set-nit-size', L('Size band', 'فئة الحجم'), s.nitaqat.size) +
    field('set-nit-target', L('Target Saudization %', 'مستهدف السعودة %'), s.nitaqat.target, {
      type: 'number',
      dir: 'ltr',
      extra: 'min="0" max="100"'
    }) +
    '</div>';
}

function renderLicence(s) {
  const el = document.getElementById('set-licence');
  if (!el) {
    return;
  }
  const scope = s.licence.scope;
  const opt = (v, en, ar) =>
    `<option value="${v}"${scope === v ? ' selected' : ''}>${L(en, ar)}</option>`;
  el.innerHTML = `<div class="hr-form-2col">
    <div class="form-group"><label class="form-label" for="set-lic-scope">${L('Licence scope', 'نطاق الترخيص')}</label>
      <select class="form-control" id="set-lic-scope">
        ${opt('service', 'Service contracting only', 'التعاقد على الخدمات فقط')}
        ${opt('labour', 'Labour supply only', 'توريد العمالة فقط')}
        ${opt('both', 'Both (service + labour)', 'كلاهما (خدمات + عمالة)')}
      </select></div>
    <div class="form-group"><label class="form-label">${L('Strict Ajeer default', 'التشدد الافتراضي لأجير')}</label>
      <label style="display:flex;gap:8px;align-items:center;font-size:13px"><input type="checkbox" id="set-lic-strict" ${s.licence.strictAjeer ? 'checked' : ''}> ${L('Block deployment when Ajeer permit is missing', 'منع التوزيع عند غياب تصريح أجير')}</label>
      <label style="display:flex;gap:8px;align-items:center;font-size:13px;margin-top:8px"><input type="checkbox" id="set-lic-confirm" ${s.licence.confirmed ? 'checked' : ''}> ${L('Scope confirmed with legal counsel', 'تم تأكيد النطاق مع المستشار القانوني')}</label></div>
    </div>`;
}

function renderLang(s) {
  const el = document.getElementById('set-lang');
  if (!el) {
    return;
  }
  el.innerHTML = `<div class="form-group" style="margin:0"><label class="form-label" for="set-deflang">${L('Default language', 'اللغة الافتراضية')}</label>
    <select class="form-control" id="set-deflang">
      <option value="en"${s.language === 'en' ? ' selected' : ''}>English</option>
      <option value="ar"${s.language === 'ar' ? ' selected' : ''}>العربية</option>
    </select>
    <p style="font-size:11.5px;color:var(--text-muted);margin:6px 0 0">${L('Applies to new browsers; your toggle choice wins on this device.', 'يطبق على المتصفحات الجديدة؛ اختيارك من الزر يغلب على هذا الجهاز.')}</p></div>`;
}

function renderDepts() {
  const el = document.getElementById('set-depts');
  if (!el) {
    return;
  }
  const depts = getDepts();
  el.innerHTML = `
    <div style="margin-bottom:10px">${depts.map(d => `<span class="hr-dept-chip">${d.code} · ${currentLang() === 'ar' ? d.ar : d.en}<button type="button" data-del-dept="${d.code}" aria-label="Remove">×</button></span>`).join('')}</div>
    <div style="display:flex;gap:8px;flex-wrap:wrap">
      <input class="form-control" id="set-dept-code" placeholder="CODE" style="max-width:110px" dir="ltr">
      <input class="form-control" id="set-dept-en" placeholder="Name (EN)" style="flex:1;min-width:120px">
      <input class="form-control" id="set-dept-ar" placeholder="الاسم (عربي)" style="flex:1;min-width:120px">
      <button type="button" class="btn btn-outline btn-sm" id="set-dept-add">${L('Add', 'إضافة')}</button>
    </div>`;
  el.querySelector('#set-dept-add')?.addEventListener('click', () => {
    const code = el.querySelector('#set-dept-code').value.trim().toUpperCase();
    const en = el.querySelector('#set-dept-en').value.trim();
    const ar = el.querySelector('#set-dept-ar').value.trim();
    if (!code || !en) {
      showToast(L('Code and English name are required', 'الرمز والاسم الإنجليزي مطلوبان'), {
        variant: 'warning'
      });
      return;
    }
    const lists = customLists();
    const arr = (lists.departments || DEPARTMENTS).slice();
    if (arr.some(d => d.code === code)) {
      showToast(L('Department exists', 'الإدارة موجودة'), { variant: 'warning' });
      return;
    }
    arr.push({ code, en, ar: ar || en });
    lists.departments = arr;
    saveCustomLists(lists);
    renderDepts();
    showToast(L('Department added', 'تمت إضافة الإدارة'), { variant: 'success' });
  });
  el.querySelectorAll('[data-del-dept]').forEach(b =>
    b.addEventListener('click', () => {
      const lists = customLists();
      const arr = (lists.departments || DEPARTMENTS).filter(d => d.code !== b.dataset.delDept);
      lists.departments = arr;
      saveCustomLists(lists);
      renderDepts();
    })
  );
}

function renderExport() {
  const el = document.getElementById('set-export');
  if (!el) {
    return;
  }
  el.innerHTML = `
    <p style="font-size:12.5px;color:var(--text-muted);margin:0 0 10px">${L('Download the full HR configuration as JSON, or restore it on another device.', 'نزّل إعدادات الموارد كاملة بصيغة JSON، أو استعدها على جهاز آخر.')}</p>
    <div style="display:flex;gap:8px;flex-wrap:wrap">
      <button type="button" class="btn btn-outline btn-sm" id="set-backup">${L('Download backup', 'تنزيل النسخة')}</button>
      <label class="btn btn-outline btn-sm" style="cursor:pointer">${L('Restore backup', 'استعادة النسخة')}
        <input type="file" id="set-restore" accept="application/json" hidden></label>
    </div>`;
  el.querySelector('#set-backup')?.addEventListener('click', () => {
    const data = {};
    [
      'hr:settings:v1',
      'hr:lang',
      'hr:custom-lists',
      'hr:my-code',
      'hr:client-id',
      'hr:audit',
      'hr:role-view'
    ].forEach(k => {
      try {
        data[k] = localStorage.getItem(k);
      } catch (_e) {
        /* ignore */
      }
    });
    download(
      `hr-settings-${new Date().toISOString().slice(0, 10)}.json`,
      JSON.stringify(data, null, 2),
      'application/json'
    );
    showToast(L('Backup downloaded', 'تم تنزيل النسخة'), { variant: 'success' });
  });
  el.querySelector('#set-restore')?.addEventListener('change', e => {
    const f = e.target.files[0];
    if (!f) {
      return;
    }
    f.text().then(txt => {
      try {
        const data = JSON.parse(txt);
        Object.keys(data || {}).forEach(k => {
          if (k.startsWith('hr:') && data[k] !== null) {
            try {
              localStorage.setItem(k, data[k]);
            } catch (_err) {
              /* ignore */
            }
          }
        });
        renderAll();
        showToast(L('Backup restored', 'تمت الاستعادة'), { variant: 'success' });
      } catch (_err) {
        showToast(L('Invalid backup file', 'ملف نسخة غير صالح'), { variant: 'error' });
      }
    });
  });
}

function renderDanger() {
  const el = document.getElementById('set-danger');
  if (!el) {
    return;
  }
  el.innerHTML = `
    <p style="font-size:12.5px;color:var(--text-muted);margin:0 0 10px">${L('Clears imported rows and your local customizations on this device. Seed demo data is unaffected.', 'يمسح الصفوف المستوردة وتخصيصاتك المحلية على هذا الجهاز. البيانات التجريبية لا تتأثر.')}</p>
      <button type="button" class="btn btn-outline btn-sm btn-danger" id="set-reset">${L('Reset local HR data', 'تصفير بيانات الموارد المحلية')}</button>`;
  el.querySelector('#set-reset')?.addEventListener('click', () => {
    Object.keys(localStorage)
      .filter(k => k.startsWith('hr:'))
      .forEach(k => {
        try {
          localStorage.removeItem(k);
        } catch (_e) {
          /* ignore */
        }
      });
    renderAll();
    showToast(L('Local data cleared', 'تم مسح البيانات المحلية'), { variant: 'success' });
  });
}

// ── P6: EOSB policy (live in hr-statutory via getEosbConfig) ──────────────
function renderEosb() {
  const el = document.getElementById('set-eosb');
  if (!el) {
    return;
  }
  const c = getEosbConfig();
  const opt = (v, en, ar) =>
    `<option value="${v}"${c.basis === v ? ' selected' : ''}>${L(en, ar)}</option>`;
  el.innerHTML = `<div class="hr-form-2col">
    <div class="form-group"><label class="form-label" for="set-eosb-basis">${L('EOSB basis', 'أساس المكافأة')}</label>
      <select class="form-control" id="set-eosb-basis">
        ${opt('basic', 'Basic salary (Art. 84 minimum)', 'الأساسي (الحد الأدنى م84)')}
        ${opt('basic+housing', 'Basic + housing (contractual)', 'الأساسي + السكن (تعاقدي)')}
      </select></div>
    ${field('set-eosb-cap', L('Cap (months of pay, 0 = none)', 'السقف (شهور، 0 = بلا)'), c.capMonths ?? 0, { type: 'number', dir: 'ltr', extra: 'min="0"' })}
    ${field('set-eosb-emp', L('Pay within (days) — employer end', 'السداد خلال (يوم) — إنهاء صاحب العمل'), c.payDaysEmployer ?? 7, { type: 'number', dir: 'ltr', extra: 'min="0"' })}
    ${field('set-eosb-res', L('Pay within (days) — resignation', 'السداد خلال (يوم) — الاستقالة'), c.payDaysResign ?? 14, { type: 'number', dir: 'ltr', extra: 'min="0"' })}
    </div>
    <p style="font-size:11.5px;color:var(--text-muted);margin:6px 0 0">⚖️ ${L('Art. 84: half-month × 5y then full-month; resignation haircut applies.', 'م84: نصف شهر × 5 سنوات ثم شهر كامل؛ ويُطبق خصم الاستقالة.')}</p>`;
}

// ── P6: expat levy floors (live in hr-statutory levyFor via settings) ────
function renderLevy() {
  const el = document.getElementById('set-levy');
  if (!el) {
    return;
  }
  const lv = getSettings().levy || {};
  el.innerHTML =
    '<div class="hr-form-2col">' +
    field(
      'set-levy-red',
      L('Reduced levy (SAR/mo)', 'المقابل المخفّض (ر.س/شهر)'),
      lv.reduced ?? 700,
      { type: 'number', dir: 'ltr', extra: 'min="0"' }
    ) +
    field(
      'set-levy-std',
      L('Standard levy (SAR/mo)', 'المقابل المعياري (ر.س/شهر)'),
      lv.standard ?? 800,
      { type: 'number', dir: 'ltr', extra: 'min="0"' }
    ) +
    '</div>';
}

// ── P6: expense categories (live override via expenseCats) ────────────────
function renderExpCats() {
  const el = document.getElementById('set-expcats');
  if (!el) {
    return;
  }
  const lists = customLists();
  const rows = (lists.expenseCats || getSeed('expenseCategories')).map(r => ({ ...r }));
  const draw = () => {
    el.innerHTML = `<table class="table hr-table"><thead><tr><th>${L('Code', 'الرمز')}</th><th>${L('EN', 'EN')}</th><th>${L('AR', 'AR')}</th><th>${L('Limit', 'السقف')}</th><th>${L('Receipt', 'إيصال')}</th><th>${L('VAT', 'ضريبة')}</th><th></th></tr></thead><tbody>
      ${rows
        .map(
          (r, i) => `<tr>
        <td data-label="${L('Code', 'الرمز')}"><input class="form-control" data-ec="${i}:code" value="${r.code}" dir="ltr"></td>
        <td data-label="EN"><input class="form-control" data-ec="${i}:en" value="${r.en}"></td>
        <td data-label="AR"><input class="form-control" data-ec="${i}:ar" value="${r.ar}"></td>
        <td data-label="${L('Limit', 'السقف')}"><input class="form-control" data-ec="${i}:limit" type="number" min="0" value="${r.limit}" dir="ltr"></td>
        <td data-label="${L('Receipt', 'إيصال')}"><input type="checkbox" data-ec="${i}:receipt"${r.receipt ? ' checked' : ''}></td>
        <td data-label="${L('VAT', 'ضريبة')}"><input type="checkbox" data-ec="${i}:vat"${r.vat ? ' checked' : ''}></td>
        <td data-label=""><button type="button" class="btn btn-ghost btn-sm" data-ec-del="${i}">×</button></td>
      </tr>`
        )
        .join('')}</tbody></table>
      <div style="display:flex;gap:8px;margin-top:10px">
        <button type="button" class="btn btn-outline btn-sm" id="set-ec-add">${L('Add category', 'إضافة فئة')}</button>
        <button type="button" class="btn btn-primary btn-sm" id="set-ec-save">${L('Save categories', 'حفظ الفئات')}</button>
      </div>`;
    el.querySelector('#set-ec-add')?.addEventListener('click', () => {
      rows.push({ code: '', en: '', ar: '', limit: 500, receipt: true, vat: true });
      draw();
    });
    el.querySelectorAll('[data-ec-del]').forEach(b =>
      b.addEventListener('click', () => {
        rows.splice(Number(b.dataset.ecDel), 1);
        draw();
      })
    );
    el.querySelector('#set-ec-save')?.addEventListener('click', () => {
      el.querySelectorAll('[data-ec]').forEach(inp => {
        const [i, k] = inp.dataset.ec.split(':');
        rows[Number(i)][k] =
          inp.type === 'checkbox'
            ? inp.checked
            : k === 'limit'
              ? Number(inp.value) || 0
              : inp.value.trim();
      });
      if (rows.some(r => !r.code || !r.en) || new Set(rows.map(r => r.code)).size !== rows.length) {
        showToast(L('Codes must be filled and unique', 'الرموز مطلوبة وفريدة'), {
          variant: 'warning'
        });
        return;
      }
      const l2 = customLists();
      l2.expenseCats = rows;
      saveCustomLists(l2);
      showToast(
        L(
          'Categories saved — Expenses page uses them now',
          'حُفظت الفئات — صفحة المصاريف تستخدمها الآن'
        ),
        { variant: 'success' }
      );
    });
  };
  draw();
}

// ── P6: approval chains (stored + effective preview; server enforces) ─────
const CHAIN_FLOWS = ['leave', 'timesheet', 'expense', 'offer'];

function chainBase() {
  const stored = getSettings().chains || {};
  const out = {};
  for (const f of CHAIN_FLOWS) {
    if (Array.isArray(stored[f])) {
      out[f] = stored[f].map(s => ({ role: s.role, sla: s.sla ?? 2 }));
    } else {
      const seed = APPROVAL_CHAINS.find(c => c.flow === f);
      const steps = seed
        ? seed.steps
        : f === 'expense'
          ? ['manager', 'finance']
          : ['hr', 'manager'];
      out[f] = steps.map(role => ({ role, sla: 2 }));
    }
  }
  return out;
}

function renderChains() {
  const el = document.getElementById('set-chains');
  if (!el) {
    return;
  }
  const chains = chainBase();
  const roles = ROLES.map(r => r.code);
  const draw = () => {
    el.innerHTML =
      CHAIN_FLOWS.map(f => {
        const steps = chains[f];
        return `<div class="hr-card" style="padding:12px;margin-bottom:10px">
        <strong dir="ltr">${f}</strong>
        <div style="font-size:12px;color:var(--text-muted);margin:4px 0 8px" dir="ltr">${steps.map(s => `${s.role} (${s.sla}d)`).join(' → ') || '—'}</div>
        ${steps
          .map(
            (s, i) => `<div style="display:flex;gap:8px;margin-bottom:6px">
          <select class="form-control" data-ch="${f}:${i}:role">${roles.map(r => `<option value="${r}"${s.role === r ? ' selected' : ''}>${r}</option>`).join('')}</select>
          <input class="form-control" data-ch="${f}:${i}:sla" type="number" min="1" value="${s.sla}" dir="ltr" style="max-width:90px" title="SLA days">
          <button type="button" class="btn btn-ghost btn-sm" data-ch-del="${f}:${i}">×</button>
        </div>`
          )
          .join('')}
        <button type="button" class="btn btn-outline btn-sm" data-ch-add="${f}">+ ${L('Step', 'خطوة')}</button>
      </div>`;
      }).join('') +
      `<button type="button" class="btn btn-primary btn-sm" id="set-ch-save">${L('Save chains', 'حفظ السلاسل')}</button>
      <p style="font-size:11.5px;color:var(--text-muted);margin:6px 0 0">🔒 ${L('Effective chain is previewed above each flow; the server enforces it on submit.', 'السلسلة الفعالة معروضة أعلى كل مسار؛ والخادم يُنفذها عند الإرسال.')}</p>`;
    el.querySelectorAll('[data-ch-add]').forEach(b =>
      b.addEventListener('click', () => {
        el.querySelectorAll('[data-ch]').forEach(inp => syncStep(inp, chains));
        chains[b.dataset.chAdd].push({ role: 'manager', sla: 2 });
        draw();
      })
    );
    el.querySelectorAll('[data-ch-del]').forEach(b =>
      b.addEventListener('click', () => {
        el.querySelectorAll('[data-ch]').forEach(inp => syncStep(inp, chains));
        const [f, i] = b.dataset.chDel.split(':');
        chains[f].splice(Number(i), 1);
        draw();
      })
    );
    el.querySelector('#set-ch-save')?.addEventListener('click', () => {
      el.querySelectorAll('[data-ch]').forEach(inp => syncStep(inp, chains));
      saveSettings({ chains });
      draw();
      showToast(L('Chains saved', 'حُفظت السلاسل'), { variant: 'success' });
    });
  };
  draw();
}

function syncStep(inp, chains) {
  const [f, i, k] = inp.dataset.ch.split(':');
  const step = chains[f]?.[Number(i)];
  if (step) {
    step[k] = k === 'sla' ? Math.max(1, Number(inp.value) || 1) : inp.value;
  }
}

// ── Companies (2–3 profiles; brand form above edits the ACTIVE one) ──────
function escHtml(v) {
  return String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function renderCompanies() {
  const el = document.getElementById('set-companies');
  if (!el) {
    return;
  }
  const active = getActiveCompany();
  const rows = getCompanies()
    .map(c => {
      const name = currentLang() === 'ar' ? c.nameAr || c.nameEn : c.nameEn;
      const isActive = c.id === active.id;
      return `<div class="hr-check" style="justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border-color-light)">
        <div style="min-width:0"><strong>${escHtml(name) || '—'}</strong>
          <div style="font-size:11.5px;color:var(--text-muted)" dir="ltr">CR ${escHtml(c.cr) || '—'} · VAT ${escHtml(c.vat) || '—'}</div></div>
        <div style="display:flex;gap:6px;flex-shrink:0;align-items:center">
          ${isActive
    ? `<span class="badge badge-teal">${t('common.active')}</span>`
    : `<button type="button" class="btn btn-ghost btn-sm" data-co-active="${c.id}">${t('hr.company.setActive')}</button>
               <button type="button" class="btn btn-ghost btn-sm text-danger" data-co-del="${c.id}">${t('common.delete')}</button>`}
        </div>
      </div>`;
    })
    .join('');
  el.innerHTML = `${rows}
    <div style="margin-top:10px"><button type="button" class="btn btn-outline btn-sm" id="set-co-add">${t('hr.company.add')}</button></div>`;
  el.querySelectorAll('[data-co-active]').forEach(b => b.addEventListener('click', () => {
    setActiveCompany(b.dataset.coActive);
    applyBranding();
    showToast(t('hr.company.switched'), { variant: 'success' });
    setTimeout(() => window.location.reload(), 500);
  }));
  el.querySelector('#set-co-add')?.addEventListener('click', () => {
    addCompany({ nameEn: `Company ${getCompanies().length + 1}` });
    showToast(t('hr.company.added'), { variant: 'success' });
    setTimeout(() => window.location.reload(), 500);
  });
  el.querySelectorAll('[data-co-del]').forEach(b => b.addEventListener('click', () => {
    const co = getCompanies().find(c => c.id === b.dataset.coDel);
    const name = co ? currentLang() === 'ar' ? co.nameAr || co.nameEn : co.nameEn : '';
    showModal({
      title: t('common.delete'),
      size: 'sm',
      body: `<p style="font-size:13px;color:var(--text-secondary);margin:0">${escHtml(name)} — ${t('hr.company.deleted')}?</p>`,
      actions: [
        { label: t('common.cancel'), variant: 'ghost' },
        {
          label: t('common.delete'),
          variant: 'danger',
          action: () => {
            const { removed } = removeCompany(b.dataset.coDel);
            showToast(t(removed ? 'hr.company.deleted' : 'hr.company.lastOne'), {
              variant: removed ? 'success' : 'warning'
            });
            if (removed) {
              setTimeout(() => window.location.reload(), 500);
            }
          }
        }
      ]
    });
  }));
}

// ── Company letters (letterheads per ACTIVE company) ───────────────────────
function fmtKB(n) {
  return `${Math.max(1, Math.round((Number(n) || 0) / 1024))} KB`;
}

function renderLetters() {
  const el = document.getElementById('set-letters');
  if (!el) {
    return;
  }
  const co = getActiveCompany();
  const letters = Array.isArray(co.letters) ? co.letters : [];
  const rows = letters.length
    ? letters
      .map(l => `<div class="hr-check" style="justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--border-color-light)">
        <div style="min-width:0"><strong>${escHtml(l.name)}</strong>
          <div style="font-size:11.5px;color:var(--text-muted)">${fmtKB(l.size)} · ${escHtml(l.addedAt || '')}</div></div>
        <div style="display:flex;gap:6px;flex-shrink:0;align-items:center">
          ${l.isDefault
    ? `<span class="badge badge-teal">${t('common.default')}</span>`
    : `<button type="button" class="btn btn-ghost btn-sm" data-lt-def="${l.id}">${t('hr.letters.setDefault')}</button>`}
          <button type="button" class="btn btn-ghost btn-sm" data-lt-dl="${l.id}">${t('common.download')}</button>
          <button type="button" class="btn btn-ghost btn-sm text-danger" data-lt-del="${l.id}">${t('common.delete')}</button>
        </div>
      </div>`)
      .join('')
    : `<p style="font-size:12.5px;color:var(--text-muted)">${t('hr.letters.empty')}</p>`;
  el.innerHTML = `${rows}
    <div style="margin-top:10px;display:flex;gap:8px;align-items:center;flex-wrap:wrap">
      <label class="btn btn-outline btn-sm" style="cursor:pointer">${t('hr.letters.upload')}
        <input type="file" id="set-letter-file" accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.svg,image/*" hidden></label>
    </div>
    <p style="font-size:11.5px;color:var(--text-muted);margin:6px 0 0">${t('hr.letters.hint')}</p>`;
  el.querySelector('#set-letter-file')?.addEventListener('change', e => {
    const f = e.target.files[0];
    if (!f) {
      return;
    }
    if (f.size > LETTER_MAX_BYTES) {
      showToast(t('hr.letters.tooBig'), { variant: 'warning' });
      e.target.value = '';
      return;
    }
    const r = new FileReader();
    r.onload = () => {
      addLetter(co.id, { name: f.name, kind: f.type, size: f.size, dataUrl: String(r.result || '') });
      showToast(t('hr.letters.added'), { variant: 'success' });
      renderLetters();
    };
    r.readAsDataURL(f);
  });
  el.querySelectorAll('[data-lt-def]').forEach(b => b.addEventListener('click', () => {
    setDefaultLetter(co.id, b.dataset.ltDef);
    renderLetters();
  }));
  el.querySelectorAll('[data-lt-del]').forEach(b => b.addEventListener('click', () => {
    removeLetter(co.id, b.dataset.ltDel);
    showToast(t('hr.letters.deleted'), { variant: 'success' });
    renderLetters();
  }));
  el.querySelectorAll('[data-lt-dl]').forEach(b => b.addEventListener('click', () => {
    const l = letters.find(x => x.id === b.dataset.ltDl);
    if (!l?.dataUrl) {return;}
    const a = document.createElement('a');
    a.href = l.dataUrl;
    a.download = l.name || 'letter';
    document.body.appendChild(a);
    a.click();
    a.remove();
  }));
}

// ── P6: quick links into the admin pages ─────────────────────────────────
function renderLinks() {
  const el = document.getElementById('set-links');
  if (!el) {
    return;
  }
  el.innerHTML = `<div style="display:flex;gap:8px;flex-wrap:wrap">
    <a class="btn btn-outline btn-sm" href="hr_roles.html">${L('Roles & access', 'الأدوار والصلاحيات')}</a>
    <a class="btn btn-outline btn-sm" href="hr_departments.html">${L('Departments', 'الإدارات')}</a>
    <a class="btn btn-outline btn-sm" href="hr_audit.html">${L('Audit log', 'سجل التدقيق')}</a>
    <a class="btn btn-outline btn-sm" href="hr_reports.html">${L('Reports', 'التقارير')}</a>
  </div>`;
}

function collectAndSave() {
  const val = id => document.getElementById(id)?.value ?? '';
  const s = getSettings();
  const active = getActiveCompany(s);
  const companyPatch = {
    nameEn: val('set-cname-en').trim(),
    nameAr: val('set-cname-ar').trim(),
    cr: val('set-cr').trim(),
    vat: val('set-vat').trim(),
    address: val('set-addr').trim(),
    phone: val('set-phone').trim(),
    email: val('set-email').trim(),
    primary: /^#[0-9a-fA-F]{6}$/.test(val('set-primary').trim())
      ? val('set-primary').trim()
      : active.primary,
    logo: document.getElementById('set-brand')?.dataset.logo ?? active.logo
  };
  if (!companyPatch.nameEn) {
    showToast(L('Company name (EN) is required', 'اسم الشركة بالإنجليزية مطلوب'), {
      variant: 'warning'
    });
    return;
  }
  // Brand form edits the ACTIVE company entry (multi-company store).
  saveCompany(active.id, companyPatch);
  const next = {
    nitaqat: {
      activity: val('set-nit-activity').trim(),
      size: val('set-nit-size').trim(),
      target: Number(val('set-nit-target')) || 0
    },
    licence: {
      scope: val('set-lic-scope') || 'both',
      strictAjeer: document.getElementById('set-lic-strict')?.checked !== false,
      confirmed: document.getElementById('set-lic-confirm')?.checked === true
    },
    eosb: {
      basis: val('set-eosb-basis') || 'basic',
      capMonths: Number(val('set-eosb-cap')) || 0,
      payDaysEmployer: Number(val('set-eosb-emp')) || 7,
      payDaysResign: Number(val('set-eosb-res')) || 14
    },
    levy: {
      reduced: Number(val('set-levy-red')) || 700,
      standard: Number(val('set-levy-std')) || 800
    },
    language: val('set-deflang') || 'en'
  };
  saveSettings(next);
  setLang(next.language);
  applyBranding();
  renderAll();
  showToast(L('Settings saved', 'تم حفظ الإعدادات'), { variant: 'success' });
}

function renderAll() {
  const s = getSettings();
  renderBrand(s);
  renderCompanies();
  renderLetters();
  renderNitaqat(s);
  renderLicence(s);
  renderLang(s);
  renderEosb();
  renderLevy();
  renderExpCats();
  renderChains();
  renderDepts();
  renderLinks();
  renderExport();
  renderDanger();
  applyI18n(document.querySelector('[data-hr-settings]') || document);
}

export function initHrSettings() {
  const root = document.querySelector('[data-hr-settings]');
  if (!root) {
    return;
  }
  renderAll();
  if (booted) {
    return;
  }
  booted = true;
  document.getElementById('set-save')?.addEventListener('click', collectAndSave);
  document.getElementById('set-save-top')?.addEventListener('click', collectAndSave);
  window.addEventListener(LANG_EVENT, renderAll);
}
