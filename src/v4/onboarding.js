// HR + Operations — onboarding wizard (hr_onboarding.html).
// §4.7 visa→deploy stage machine + checklists + Art.40 cost capture. Idempotent.

import { showToast } from './toast.js';
import { showModal } from './modal.js';
import { t, currentLang, LANG_EVENT, applyI18n } from './i18n.js';
import { fmtSAR } from './hr-locale.js';
import { getSeed, patchSeedRow, saveImportedRows } from './hr-api.js';
import { exportData } from './import-export.js';
import { openImportModal } from './import-modal.js';
import { AGENTS, PROFESSIONS } from './hr-seed.js';

let booted = false;
let selected = '';

function L(en, ar) {
  return currentLang() === 'ar' ? ar : en;
}

// kind: text | date | bool | select. only: restrict to a case type.
const STAGES = [
  {
    n: 1,
    en: 'Sourcing & offer',
    ar: 'الاستقطاب والعرض',
    items: [
      {
        key: 'agent',
        en: 'Recruitment agent',
        ar: 'وكيل الاستقدام',
        kind: 'select',
        options: 'agents',
        only: 'overseas',
        req: 1
      },
      {
        key: 'offerSigned',
        en: 'Bilingual offer signed',
        ar: 'توقيع العرض الثنائي',
        kind: 'bool',
        only: 'overseas',
        req: 1
      },
      {
        key: 'fromSponsor',
        en: 'Current sponsor',
        ar: 'الكفيل الحالي',
        kind: 'text',
        only: 'transfer',
        req: 1
      },
      {
        key: 'fee',
        en: 'Transfer fee (SAR)',
        ar: 'رسوم النقل',
        kind: 'select',
        options: 'fees',
        only: 'transfer',
        req: 1
      }
    ]
  },
  {
    n: 2,
    en: 'Work visa',
    ar: 'تأشيرة العمل',
    items: [
      { key: 'visaNo', en: 'Visa no.', ar: 'رقم التأشيرة', kind: 'text', req: 1 },
      { key: 'validUntil', en: 'Visa valid until', ar: 'صلاحية التأشيرة', kind: 'date', req: 1 }
    ]
  },
  {
    n: 3,
    en: 'Arrival',
    ar: 'الوصول',
    items: [
      { key: 'entry', en: 'Entry date (stamp)', ar: 'تاريخ الدخول (الختم)', kind: 'date', req: 1 }
    ]
  },
  {
    n: 4,
    en: 'Medical + fingerprints',
    ar: 'الطبي والبصمات',
    items: [
      { key: 'medicalOk', en: 'Medical fit', ar: 'لائق طبيًا', kind: 'bool', req: 1 },
      { key: 'bioOk', en: 'Fingerprints done', ar: 'تمت البصمات', kind: 'bool', req: 1 }
    ]
  },
  {
    n: 5,
    en: 'Iqama issuance',
    ar: 'إصدار الإقامة',
    items: [
      { key: 'iqama', en: 'Iqama no.', ar: 'رقم الإقامة', kind: 'text', req: 1 },
      { key: 'iqamaExp', en: 'Iqama expiry', ar: 'انتهاء الإقامة', kind: 'date', req: 1 }
    ]
  },
  {
    n: 6,
    en: 'GOSI registration',
    ar: 'التسجيل في التأمينات',
    items: [
      {
        key: 'gosiNo',
        en: 'GOSI no. (expat 2%)',
        ar: 'رقم التأمينات (2% أجنبي)',
        kind: 'text',
        req: 1
      }
    ]
  },
  {
    n: 7,
    en: 'Bank + WPS',
    ar: 'البنك وحماية الأجور',
    items: [
      { key: 'iban', en: 'IBAN', ar: 'الآيبان', kind: 'text', req: 1 },
      { key: 'bank', en: 'Bank', ar: 'البنك', kind: 'text' }
    ]
  },
  {
    n: 8,
    en: 'Housing',
    ar: 'السكن',
    items: [
      {
        key: 'housing',
        en: 'Housing type',
        ar: 'نوع السكن',
        kind: 'select',
        options: 'housing',
        req: 1
      }
    ]
  },
  {
    n: 9,
    en: 'Deployment (Ajeer)',
    ar: 'التوزيع (أجير)',
    items: [
      { key: 'assignRef', en: 'Assignment ref', ar: 'مرجع التكليف', kind: 'text', req: 1 },
      { key: 'ajeer', en: 'Ajeer ref (if issued)', ar: 'مرجع أجير (إن صدر)', kind: 'text' }
    ]
  },
  { n: 10, en: 'Active ops', ar: 'التشغيل النشط', items: [] },
  {
    n: 11,
    en: 'Exit',
    ar: 'الخروج',
    items: [
      { key: 'exitDate', en: 'Exit date', ar: 'تاريخ الخروج', kind: 'date', req: 1 },
      { key: 'settlement', en: 'Settlement paid', ar: 'سُددت المستحقات', kind: 'bool', req: 1 }
    ]
  }
];

const SKIP = { transfer: [2, 3, 4, 5] };

function isSkipped(c, n) {
  return (SKIP[c.type] || []).includes(n);
}

function applicable(c) {
  return STAGES.filter(s => !isSkipped(c, s.n));
}

function caseName(c) {
  return currentLang() === 'ar' ? c.nameAr || c.nameEn : c.nameEn;
}

function profName(code) {
  const p = PROFESSIONS.find(x => x.code === code);
  if (!p) {
    return code || '—';
  }
  return currentLang() === 'ar' ? p.ar : p.en;
}

function getCase(id) {
  return getSeed('onboarding').find(x => x.id === id);
}

function caseData(c) {
  return c.data || {};
}

function renderStats() {
  const list = getSeed('onboarding');
  const active = list.filter(c => c.stage < 10).length;
  const transfers = list.filter(c => c.type === 'transfer' && c.stage < 10).length;
  const spend = list.reduce(
    (s, c) => s + (c.costs || []).reduce((a, l) => a + (l.amount || 0), 0),
    0
  );
  const set = (id, v) => {
    const el = document.getElementById(id);
    if (el) {
      el.textContent = v;
    }
  };
  set('ob-stat-active', active);
  set('ob-stat-transfer', transfers);
  set('ob-stat-deployed', list.filter(c => c.stage >= 10).length);
  set('ob-stat-spend', fmtSAR(spend));
}

function progress(c) {
  const app = applicable(c);
  const done = app.filter(s => (c.stages || {})[s.n]).length;
  return { done, total: app.length, pct: Math.round((done / Math.max(1, app.length)) * 100) };
}

function renderList() {
  const el = document.getElementById('ob-rows');
  if (!el) {
    return;
  }
  el.innerHTML = getSeed('onboarding')
    .map(c => {
      const p = progress(c);
      const st = STAGES.find(s => s.n === c.stage);
      return `<tr class="${selected === c.id ? 'row-selected' : ''}">
      <td data-label="#"><span dir="ltr">${c.id}</span>
        <div style="font-size:11.5px;color:var(--text-muted)">${c.type === 'transfer' ? L('Transfer-in', 'نقل كفالة') : L('Overseas', 'استقدام')}</div></td>
      <td data-label="${L('Candidate', 'المرشح')}"><strong>${caseName(c)}</strong>
        <div style="font-size:11.5px;color:var(--text-muted)">${c.nat} · ${profName(c.prof)}</div></td>
      <td data-label="${L('Stage', 'المرحلة')}"><span class="status status-blue">${c.stage} · ${L(st.en, st.ar)}</span>
        ${c.emp ? `<div style="font-size:11.5px;margin-top:4px"><a href="hr_employee.html?code=${c.emp}" dir="ltr">${c.emp}</a></div>` : ''}</td>
      <td data-label="${L('Progress', 'التقدم')}"><div class="hr-bar-track"><div class="hr-bar-fill" style="width:${p.pct}%;background:var(--primary)"></div></div>
        <div style="font-size:11.5px;color:var(--text-muted)">${p.done}/${p.total}</div></td>
      <td data-label=""><button class="btn btn-outline btn-sm" data-open="${c.id}">${t('common.open')}</button></td>
    </tr>`;
    })
    .join('');
}

function fieldHtml(c, item) {
  const d = caseData(c);
  const v = d[item.key] ?? '';
  const label = L(item.en, item.ar);
  if (item.kind === 'bool') {
    return `<label class="ob-check"><input type="checkbox" data-f="${item.key}" ${v ? 'checked' : ''}> ${label}${item.req ? ' *' : ''}</label>`;
  }
  if (item.kind === 'select') {
    let opts = [];
    if (item.options === 'agents') {
      opts = AGENTS.map(a => [a.id, `${a.id} · ${a.name}`]);
    }
    if (item.options === 'fees') {
      opts = [
        ['2000', '2000'],
        ['4000', '4000'],
        ['6000', '6000']
      ];
    }
    if (item.options === 'housing') {
      opts =
        currentLang() === 'ar'
          ? [
              ['camp', 'سكن عمال'],
              ['allowance', 'بدل سكن']
            ]
          : [
              ['camp', 'Labour camp'],
              ['allowance', 'Housing allowance']
            ];
    }
    const pre = item.key === 'agent' && c.agent ? c.agent : v;
    return `<div class="form-group"><label class="form-label">${label}${item.req ? ' *' : ''}</label>
      <select class="form-control" data-f="${item.key}"><option value="">—</option>
      ${opts.map(([val, lab]) => `<option value="${val}"${pre === val ? ' selected' : ''}>${lab}</option>`).join('')}</select></div>`;
  }
  const type = item.kind === 'date' ? 'date' : 'text';
  const pre = (item.key === 'visaNo' && c.visa ? c.visa : v) || '';
  return `<div class="form-group"><label class="form-label">${label}${item.req ? ' *' : ''}</label>
    <input class="form-control" data-f="${item.key}" type="${type}" value="${pre}" ${type === 'date' ? 'dir="ltr"' : ''}></div>`;
}

function renderDetail() {
  const el = document.getElementById('ob-detail');
  if (!el) {
    return;
  }
  const c = selected ? getCase(selected) : null;
  if (!c) {
    el.innerHTML = `<div class="hr-empty">${L('Select a case to run the wizard.', 'اختر حالة لتشغيل المعالج.')}</div>`;
    return;
  }
  const doneStages = c.stages || {};
  const steps = STAGES.map(s => {
    const cls = isSkipped(c, s.n)
      ? 'skipped'
      : doneStages[s.n]
        ? 'done'
        : s.n === c.stage
          ? 'current'
          : 'todo';
    return `<div class="ob-step ${cls}" title="${L(s.en, s.ar)}${doneStages[s.n] ? ` · ${doneStages[s.n]}` : ''}">
      <span class="ob-dot">${cls === 'done' ? '✓' : s.n}</span><span class="ob-lbl">${L(s.en, s.ar)}</span></div>`;
  }).join('');
  const cur = STAGES.find(s => s.n === c.stage);
  const items = cur.items.filter(i => !i.only || i.only === c.type);
  const spend = (c.costs || []).reduce((s, l) => s + (l.amount || 0), 0);
  const closed = c.stage >= 11;
  el.innerHTML = `
    <div class="hr-360-top" style="margin-bottom:12px">
      <div style="flex:1;min-width:0">
        <div class="cell-strong" style="font-size:15px">${caseName(c)}</div>
        <div style="font-size:12.5px;color:var(--text-muted)"><span dir="ltr">${c.id}</span> · ${c.nat} · ${profName(c.prof)}</div>
      </div>
      <span class="status status-${closed ? 'green' : 'blue'}">${closed ? t('status.completed') : `${t('common.stage')} ${c.stage}`}</span>
    </div>
    <div class="ob-steps">${steps}</div>
    ${
      closed
        ? `<div class="hr-empty">${L('Case closed.', 'أُغلقت الحالة.')}</div>`
        : `<div class="ob-stage-card">
        <div class="cell-strong" style="margin-bottom:8px">${c.stage} · ${L(cur.en, cur.ar)}</div>
        ${items.length ? items.map(i => fieldHtml(c, i)).join('') : `<p style="font-size:12.5px;color:var(--text-muted)">${L('Monitoring stage — advance when the worker exits or needs action.', 'مرحلة متابعة — تقدّم عند خروج العامل أو الحاجة لإجراء.')}</p>`}
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px">
          <button class="btn btn-primary btn-sm" id="ob-advance">${t('common.advance')} →</button>
          ${c.stage >= 9 && !c.emp && c.type === 'overseas' ? `<button class="btn btn-outline btn-sm" id="ob-convert">${t('common.convert')}</button>` : ''}
          ${c.emp ? `<a class="btn btn-ghost btn-sm" href="hr_employee.html?code=${c.emp}">${c.emp}</a>` : ''}
        </div>
      </div>`
    }
    <div class="cell-strong" style="margin:14px 0 6px;font-size:13px">${L('Costs (employer-borne, Art. 40)', 'التكاليف (على صاحب العمل، مادة 40)')}</div>
    ${(c.costs || []).map(l => `<div class="hr-kv"><span>${l.label}</span><strong>${fmtSAR(l.amount)}</strong></div>`).join('') || `<div class="hr-empty">${t('common.noData')}</div>`}
    <div class="hr-kv"><span><b>${t('common.total')}</b></span><strong>${fmtSAR(spend)}</strong></div>
    <div style="display:flex;gap:8px;margin-top:8px">
      <button class="btn btn-outline btn-sm" id="ob-cost">${L('Add cost', 'إضافة تكلفة')}</button>
    </div>`;
  document.getElementById('ob-advance')?.addEventListener('click', () => advance(c));
  document.getElementById('ob-convert')?.addEventListener('click', () => convertToEmployee(c));
  document.getElementById('ob-cost')?.addEventListener('click', () => openCostModal(c));
}

function collectItems(c) {
  const cur = STAGES.find(s => s.n === c.stage);
  const items = cur.items.filter(i => !i.only || i.only === c.type);
  const data = { ...caseData(c) };
  const missing = [];
  items.forEach(i => {
    const input = document.querySelector(`#ob-detail [data-f="${i.key}"]`);
    if (!input) {
      return;
    }
    const val = i.kind === 'bool' ? input.checked : input.value.trim();
    data[i.key] = val;
    if (i.req && (val === '' || val === false)) {
      missing.push(L(i.en, i.ar));
    }
  });
  return { data, missing };
}

function advance(c) {
  const { data, missing } = collectItems(c);
  if (missing.length) {
    patchSeedRow('onboarding', c, { data });
    showToast(`${L('Missing', 'مفقود')}: ${missing.join(', ')}`, { variant: 'warning' });
    return;
  }
  let next = c.stage + 1;
  while (next <= 11 && isSkipped(c, next)) {
    next += 1;
  }
  const stages = { ...(c.stages || {}), [c.stage]: new Date().toISOString().slice(0, 10) };
  patchSeedRow('onboarding', c, { data, stages, stage: Math.min(next, 11) });
  if (selected) {
    const still = getCase(selected);
    if (still && c.stage === 9) {
      // keep assignment ref visible; nothing else automatic in seed mode
    }
  }
  renderAll();
  const label = STAGES.find(s => s.n === Math.min(next, 11));
  showToast(`${t('common.advance')} → ${L(label.en, label.ar)}`, { variant: 'success' });
}

function nextEmpCode() {
  let n = 25;
  try {
    n = Number(localStorage.getItem('hr:emp-counter') || 25);
    localStorage.setItem('hr:emp-counter', String(n + 1));
  } catch (_e) {
    /* ignore */
  }
  return `EMP-${String(n).padStart(4, '0')}`;
}

function convertToEmployee(c) {
  const d = caseData(c);
  const code = nextEmpCode();
  const avs = ['primary', 'blue', 'green', 'purple', 'yellow', 'red', 'azure'];
  const row = {
    code,
    nameEn: c.nameEn,
    nameAr: c.nameAr || c.nameEn,
    nat: c.nat,
    saudi: false,
    prof: c.prof,
    dept: 'OPS',
    titleEn: '',
    titleAr: '',
    join: new Date().toISOString().slice(0, 10),
    basic: 0,
    housing: 0,
    transport: 0,
    iqama: d.iqama || '',
    iqamaExp: d.iqamaExp || '',
    iban: d.iban || '',
    bank: d.bank || '',
    q: 'draft',
    st: 'probation',
    phone: '',
    av: avs[code.charCodeAt(code.length - 1) % avs.length],
    annualUsed: 0
  };
  saveImportedRows('employees', [row]);
  patchSeedRow('onboarding', c, { emp: code });
  renderAll();
  showToast(`${L('Created', 'تم إنشاء')} ${code}`, { variant: 'success' });
}

function openCostModal(c) {
  showModal({
    title: L('Add cost', 'إضافة تكلفة'),
    body: `<div class="form-group"><label class="form-label" for="oc-label">${L('Description', 'الوصف')}</label>
        <input class="form-control" id="oc-label"></div>
      <div class="form-group" style="margin-bottom:0"><label class="form-label" for="oc-amt">${L('Amount (SAR)', 'المبلغ')}</label>
        <input class="form-control" id="oc-amt" type="number" min="0" dir="ltr"></div>`,
    actions: [
      { label: t('common.cancel'), variant: 'ghost' },
      {
        label: t('common.save'),
        variant: 'primary',
        action: ({ body }) => {
          const label = body.querySelector('#oc-label').value.trim();
          const amount = Number(body.querySelector('#oc-amt').value);
          if (!label || !amount) {
            showToast(L('Description and amount are required', 'الوصف والمبلغ مطلوبان'), {
              variant: 'warning'
            });
            return false;
          }
          patchSeedRow('onboarding', c, { costs: (c.costs || []).concat([{ label, amount }]) });
          renderAll();
          showToast(L('Cost added (employer-borne)', 'أُضيفت التكلفة (على صاحب العمل)'), {
            variant: 'success'
          });
          return true;
        }
      }
    ]
  });
}

function openNewCaseModal() {
  showModal({
    title: L('New onboarding case', 'حالة تهيئة جديدة'),
    body: `<div class="hr-form-2col">
        <div class="form-group"><label class="form-label" for="nc-en">${L('Name (EN)', 'الاسم (إنجليزي)')}</label>
          <input class="form-control" id="nc-en" dir="ltr"></div>
        <div class="form-group"><label class="form-label" for="nc-ar">${L('Name (AR)', 'الاسم (عربي)')}</label>
          <input class="form-control" id="nc-ar"></div>
      </div>
      <div class="hr-form-2col">
        <div class="form-group"><label class="form-label" for="nc-nat">${L('Nationality', 'الجنسية')}</label>
          <input class="form-control" id="nc-nat"></div>
        <div class="form-group"><label class="form-label" for="nc-prof">${L('Profession', 'المهنة')}</label>
          <select class="form-control" id="nc-prof">${PROFESSIONS.map(p => `<option value="${p.code}">${L(p.en, p.ar)}</option>`).join('')}</select></div>
      </div>
      <div class="form-group" style="margin-bottom:0"><label class="form-label" for="nc-type">${L('Channel', 'القناة')}</label>
        <select class="form-control" id="nc-type">
          <option value="overseas">${L('Overseas recruitment', 'استقدام خارجي')}</option>
          <option value="transfer">${L('Local transfer (Qiwa)', 'نقل محلي (قوى)')}</option>
        </select></div>`,
    actions: [
      { label: t('common.cancel'), variant: 'ghost' },
      {
        label: t('common.save'),
        variant: 'primary',
        action: ({ body }) => {
          const nameEn = body.querySelector('#nc-en').value.trim();
          const nat = body.querySelector('#nc-nat').value.trim();
          if (!nameEn || !nat) {
            showToast(L('Name and nationality are required', 'الاسم والجنسية مطلوبان'), {
              variant: 'warning'
            });
            return false;
          }
          const n = getSeed('onboarding').length + 19;
          const id = `OB-2026-0${n}`;
          saveImportedRows('onboarding', [
            {
              id,
              type: body.querySelector('#nc-type').value,
              emp: '',
              nameEn,
              nameAr: body.querySelector('#nc-ar').value.trim(),
              nat,
              prof: body.querySelector('#nc-prof').value,
              agent: '',
              visa: '',
              stage: 1,
              stages: {},
              costs: []
            }
          ]);
          selected = id;
          renderAll();
          showToast(`${L('Case opened', 'فُتحت الحالة')} ${id}`, { variant: 'success' });
          return true;
        }
      }
    ]
  });
}

const EXPORT_COLS = [
  { key: 'id', label: 'Case' },
  { key: 'type', label: 'Channel' },
  { key: 'nameEn', label: 'Name (EN)' },
  { key: 'nat', label: 'Nationality' },
  { key: 'prof', label: 'Profession' },
  { key: 'stage', label: 'Stage' },
  { key: 'emp', label: 'Employee' }
];

function renderAll() {
  renderStats();
  renderList();
  renderDetail();
  applyI18n(document.querySelector('[data-hr-onboarding]') || document);
}

export function initOnboarding() {
  const root = document.querySelector('[data-hr-onboarding]');
  if (!root) {
    return;
  }
  const deep = new URLSearchParams(window.location.search).get('case');
  if (deep) {
    selected = deep;
  }
  renderAll();
  if (booted) {
    return;
  }
  booted = true;
  document.getElementById('ob-rows')?.addEventListener('click', e => {
    const btn = e.target.closest('[data-open]');
    if (!btn) {
      return;
    }
    selected = btn.dataset.open;
    renderList();
    renderDetail();
    document.getElementById('ob-detail')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });
  document.getElementById('ob-new')?.addEventListener('click', openNewCaseModal);
  const obSchema = [
    { key: 'nameEn', en: 'Name (EN)', ar: 'الاسم (إنجليزي)', required: true },
    { key: 'nameAr', en: 'Name (AR)', ar: 'الاسم (عربي)' },
    { key: 'nat', en: 'Nationality', ar: 'الجنسية', required: true },
    { key: 'prof', en: 'Profession', ar: 'المهنة' },
    { key: 'type', en: 'Type (overseas/transfer)', ar: 'النوع' },
    { key: 'agent', en: 'Agent', ar: 'الوكيل' },
    { key: 'visa', en: 'Visa no.', ar: 'رقم التأشيرة' }
  ];
  document.getElementById('ob-import')?.addEventListener('click', () =>
    openImportModal({
      titleEn: 'Import starters (Excel / CSV)',
      titleAr: 'استيراد ملتحقين جدد (Excel / CSV)',
      filename: 'onboarding',
      schema: obSchema,
      example: {
        nameEn: 'Imran Khan',
        nameAr: 'عمران خان',
        nat: 'Pakistan',
        prof: 'electrician',
        type: 'overseas',
        agent: 'AG-02',
        visa: ''
      },
      onImport: rows => {
        let n = getSeed('onboarding').length + 19;
        saveImportedRows(
          'onboarding',
          rows.map(r => {
            n += 1;
            return {
              id: `OB-2026-0${n}`,
              type: r.type === 'transfer' ? 'transfer' : 'overseas',
              emp: '',
              nameEn: r.nameEn,
              nameAr: r.nameAr || '',
              nat: r.nat || '',
              prof: r.prof || '',
              agent: r.agent || '',
              visa: r.visa || '',
              stage: 1,
              stages: {},
              costs: []
            };
          })
        );
        renderAll();
        return rows.length;
      }
    })
  );
  document.getElementById('ob-export')?.addEventListener('click', () => {
    exportData('xlsx', 'onboarding-pipeline', EXPORT_COLS, getSeed('onboarding'), 'Pipeline');
  });
  window.addEventListener(LANG_EVENT, renderAll);
}
