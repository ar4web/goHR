// HR + Operations — SA compliance command center (hr_sa_compliance.html).
// Tabs: Ajeer gates / Residencies / Qiwa contracts / Saudization / Action queue.

import { openMenu } from './menus.js';
import { t, currentLang, LANG_EVENT, applyI18n } from './i18n.js';
import { fmtDate } from './hr-locale.js';
import { daysUntil, nitaqatEstimate, ajeerCheck, getSettings } from './hr-statutory.js';
import { getSeed } from './hr-api.js';
import { exportData } from './import-export.js';
import { CLIENTS } from './hr-seed.js';

let booted = false;
let activeTab = 'ajeer';

function L(en, ar) {
  return currentLang() === 'ar' ? ar : en;
}

function empName(e) {
  return currentLang() === 'ar' ? e.nameAr || e.nameEn : e.nameEn;
}

function ajeerRows() {
  const emps = getSeed('employees');
  return getSeed('assignments').map(a => {
    const e = emps.find(x => x.code === a.emp);
    const c = CLIENTS.find(x => x.id === a.client);
    return {
      a,
      e,
      c,
      gate: e
        ? ajeerCheck(a, e, c)
        : { ok: false, reasons: [L('unknown worker', 'عامل غير معروف')] }
    };
  });
}

function resRows() {
  return getSeed('employees')
    .filter(e => !e.saudi && e.st === 'active')
    .map(e => ({ e, d: e.iqamaExp ? daysUntil(e.iqamaExp) : null }))
    .sort((x, y) => (x.d === null ? -1 : x.d) - (y.d === null ? -1 : y.d));
}

function qiwaRows() {
  return getSeed('employees').filter(e => e.q !== 'authenticated');
}

function actions() {
  const out = [];
  ajeerRows().forEach(({ a, e, gate }) => {
    gate.reasons.forEach(r =>
      out.push({
        sev: r === 'no-ajeer-ref' || r === 'ajeer-expired' ? 'red' : 'yellow',
        where: `Ajeer · ${a.id}`,
        who: e ? empName(e) : a.emp,
        what: r,
        href: e ? `hr_employee.html?code=${e.code}` : 'hr_employees.html'
      })
    );
  });
  resRows().forEach(({ e, d }) => {
    if (d === null || d > 90) {
      return;
    }
    out.push({
      sev: d < 0 || d <= 30 ? 'red' : 'yellow',
      where: L('Residency', 'الإقامة'),
      who: empName(e),
      what: d < 0 ? 'iqama-expired' : `iqama-expires-${d}d`,
      href: `hr_employee.html?code=${e.code}`
    });
  });
  qiwaRows().forEach(e =>
    out.push({
      sev: 'yellow',
      where: 'Qiwa',
      who: empName(e),
      what: `qiwa-${e.q}`,
      href: `hr_employee.html?code=${e.code}`
    })
  );
  const rank = { red: 0, yellow: 1 };
  return out.sort((a, b) => rank[a.sev] - rank[b.sev]);
}

function renderStats() {
  const aj = ajeerRows();
  const blocked = aj.filter(r => !r.gate.ok).length;
  const res = resRows();
  const urgent = res.filter(r => r.d !== null && r.d <= 30).length;
  const qiwa = qiwaRows().length;
  const n = nitaqatEstimate(getSeed('employees'));
  const set = (id, v) => {
    const el = document.getElementById(id);
    if (el) {
      el.textContent = v;
    }
  };
  set('cmp-stat-blocked', blocked);
  set('cmp-stat-iqama', urgent);
  set('cmp-stat-qiwa', qiwa);
  set('cmp-stat-saud', `${n.pct}%`);
}

function tabButtons() {
  const tabs = [
    ['ajeer', L('Ajeer gates', 'بوابات أجير')],
    ['residency', L('Residencies', 'الإقامات')],
    ['qiwa', L('Qiwa contracts', 'عقود قوى')],
    ['nitaqat', L('Saudization', 'السعودة')],
    ['actions', `${L('Action queue', 'قائمة الإجراءات')} (${actions().length})`]
  ];
  return tabs
    .map(
      ([k, label]) =>
        `<button type="button" class="hr-tab${k === activeTab ? ' active' : ''}" data-tab="${k}">${label}</button>`
    )
    .join('');
}

function renderBody() {
  const el = document.getElementById('cmp-body');
  if (!el) {
    return;
  }
  let html;
  if (activeTab === 'ajeer') {
    html =
      `<div class="table-responsive"><table class="table hr-table"><thead><tr>
      <th>#</th><th>${L('Worker', 'الموظف')}</th><th>${L('Client', 'العميل')}</th>
      <th>Ajeer</th><th>${L('Result', 'النتيجة')}</th></tr></thead><tbody>` +
      ajeerRows()
        .map(
          ({ a, e, c, gate }) => `<tr>
        <td data-label="#">${a.id}</td>
        <td data-label="${L('Worker', 'الموظف')}">${e ? `<a href="hr_employee.html?code=${e.code}">${empName(e)}</a>` : a.emp}</td>
        <td data-label="${L('Client', 'العميل')}" style="font-size:12.5px">${c ? (currentLang() === 'ar' ? c.nameAr : c.nameEn) : a.client}</td>
        <td data-label="Ajeer">${a.ajeer ? `<span class="status status-green">${a.ajeer}</span><div style="font-size:11.5px;color:var(--text-muted)">${fmtDate(a.ajeerExp)}</div>` : `<span class="status status-red">${t('status.missing')}</span>`}</td>
        <td data-label="${L('Result', 'النتيجة')}">${gate.ok ? `<span class="status status-green">${t('status.deployable')}</span>` : `<span class="status status-red">${t('status.blocked')}</span><div style="font-size:11.5px;color:var(--text-muted)">${gate.reasons.join(', ')}</div>`}</td>
      </tr>`
        )
        .join('') +
      '</tbody></table></div>';
  } else if (activeTab === 'residency') {
    html =
      `<div class="table-responsive"><table class="table hr-table"><thead><tr>
      <th>${L('Worker', 'الموظف')}</th><th>${L('Iqama', 'الإقامة')}</th><th>${L('Expiry', 'الانتهاء')}</th><th>${t('common.status')}</th></tr></thead><tbody>` +
      resRows()
        .map(({ e, d }) => {
          const cls = d === null || d < 0 ? 'red' : d <= 30 ? 'red' : d <= 90 ? 'yellow' : 'green';
          const msg =
            d === null
              ? t('status.missing')
              : d < 0
                ? t('status.expired')
                : `${d} ${t('common.days')}`;
          return `<tr><td data-label="${L('Worker', 'الموظف')}"><a href="hr_employee.html?code=${e.code}">${empName(e)}</a></td>
        <td data-label="${L('Iqama', 'الإقامة')}" dir="ltr">${e.iqama || '—'}</td>
        <td data-label="${L('Expiry', 'الانتهاء')}">${e.iqamaExp ? fmtDate(e.iqamaExp) : '—'}</td>
        <td data-label="${t('common.status')}"><span class="status status-${cls}">${msg}</span></td></tr>`;
        })
        .join('') +
      '</tbody></table></div>';
  } else if (activeTab === 'qiwa') {
    html =
      `<div class="table-responsive"><table class="table hr-table"><thead><tr>
      <th>${L('Worker', 'الموظف')}</th><th>${L('Join date', 'الالتحاق')}</th><th>Qiwa</th></tr></thead><tbody>` +
      qiwaRows()
        .map(
          e => `<tr><td data-label="${L('Worker', 'الموظف')}"><a href="hr_employee.html?code=${e.code}">${empName(e)}</a></td>
        <td data-label="${L('Join date', 'الالتحاق')}">${fmtDate(e.join)}</td>
        <td data-label="Qiwa"><span class="status status-${e.q === 'sent' ? 'yellow' : 'blue'}">${t(`status.${e.q}`)}</span></td></tr>`
        )
        .join('') +
      '</tbody></table></div>';
  } else if (activeTab === 'nitaqat') {
    const s = getSettings();
    const n = nitaqatEstimate(getSeed('employees'));
    html = `<div class="hr-kv-grid">
      <div class="hr-kv"><span>${L('Estimated rate', 'النسبة التقديرية')}</span><strong>${n.pct}%</strong></div>
      <div class="hr-kv"><span>${L('Effective Saudis', 'السعوديون الفعليون')}</span><strong>${n.saudiUnits}</strong></div>
      <div class="hr-kv"><span>${L('Total headcount', 'إجمالي العدد')}</span><strong>${n.total}</strong></div>
      <div class="hr-kv"><span>${L('Activity', 'النشاط')}</span><strong>${s.nitaqat.activity}</strong></div>
      <div class="hr-kv"><span>${L('Size band', 'الحجم')}</span><strong>${s.nitaqat.size}</strong></div>
      <div class="hr-kv"><span>${L('Target', 'المستهدف')}</span><strong>${s.nitaqat.target}%</strong></div>
      </div><p style="color:var(--text-muted);font-size:12.5px;margin-top:12px">${L('Official band comes from Qiwa. Edit activity/size/target in HR Settings.', 'النطاق الرسمي من قوى. عدّل النشاط والحجم والمستهدف من الإعدادات.')}</p>`;
  } else {
    html =
      `<div class="table-responsive"><table class="table hr-table"><thead><tr>
      <th>${L('Severity', 'الخطورة')}</th><th>${L('Area', 'المجال')}</th><th>${L('Who', 'المعني')}</th><th>${L('Issue', 'المشكلة')}</th><th></th></tr></thead><tbody>` +
      actions()
        .map(
          x => `<tr>
        <td data-label="${L('Severity', 'الخطورة')}"><span class="status status-${x.sev}">${x.sev === 'red' ? t('common.urgent') : t('common.attention')}</span></td>
        <td data-label="${L('Area', 'المجال')}" style="font-size:12.5px">${x.where}</td>
        <td data-label="${L('Who', 'المعني')}"><a href="${x.href}">${x.who}</a></td>
        <td data-label="${L('Issue', 'المشكلة')}" dir="ltr" style="font-size:12.5px">${x.what}</td>
        <td data-label=""><a class="btn btn-outline btn-sm" href="${x.href}">${t('common.open')}</a></td>
      </tr>`
        )
        .join('') +
      '</tbody></table></div>';
  }
  el.innerHTML = html;
}

function renderAll() {
  const tabs = document.getElementById('cmp-tabs');
  if (tabs) {
    tabs.innerHTML = tabButtons();
    tabs.querySelectorAll('[data-tab]').forEach(b =>
      b.addEventListener('click', () => {
        activeTab = b.dataset.tab;
        renderAll();
      })
    );
  }
  renderStats();
  renderBody();
  applyI18n(document.querySelector('[data-hr-compliance]') || document);
}

export function initCompliance() {
  const root = document.querySelector('[data-hr-compliance]');
  if (!root) {
    return;
  }
  renderAll();
  if (booted) {
    return;
  }
  booted = true;
  document.getElementById('cmp-export')?.addEventListener('click', e => {
    e.stopPropagation();
    openMenu(e.currentTarget, [
      {
        label: `${t('common.export')} CSV`,
        action: () =>
          exportData(
            'csv',
            'compliance-action-queue',
            [
              { key: 'sev', label: 'Severity' },
              { key: 'where', label: 'Area' },
              { key: 'who', label: 'Who' },
              { key: 'what', label: 'Issue' }
            ],
            actions()
          )
      },
      {
        label: `${t('common.export')} Excel`,
        action: () =>
          exportData(
            'xlsx',
            'compliance-action-queue',
            [
              { key: 'sev', label: 'Severity' },
              { key: 'where', label: 'Area' },
              { key: 'who', label: 'Who' },
              { key: 'what', label: 'Issue' }
            ],
            actions(),
            'Queue'
          )
      }
    ]);
  });
  window.addEventListener(LANG_EVENT, renderAll);
}
