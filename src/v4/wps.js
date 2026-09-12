// HR + Operations — WPS / Mudad (hr_wps.html).
// Builds the period SIF from the pay run, diffs registered contract wage vs
// net payable per worker, and tracks the Mudad upload state machine
// (draft → submitted → accepted → paid). Pay within the first 10 days of the
// following month; delays escalate at 10 / 15 / 20 days (§0.7).

import { showToast } from './toast.js';
import { t, currentLang, LANG_EVENT, applyI18n } from './i18n.js';
import { fmtSAR } from './hr-locale.js';
import { calcPayLine, sifBuild, wpsDeadline, daysUntil } from './hr-statutory.js';
import { getSeed, patchSeedRow } from './hr-api.js';
import { exportCSV, download } from './import-export.js';

let booted = false;
let runId = null;

const WPS_CLS = { draft: 'blue', submitted: 'yellow', accepted: 'purple', paid: 'green' };
const WPS_NEXT = { draft: 'submitted', submitted: 'accepted', accepted: 'paid' };

function L(en, ar) {
  return currentLang() === 'ar' ? ar : en;
}

function empName(e) {
  return currentLang() === 'ar' ? e.nameAr || e.nameEn : e.nameEn;
}

function runs() {
  return getSeed('payRuns');
}

function cur() {
  return runs().find(r => r.id === runId) || runs()[runs().length - 1];
}

function wageOf(e) {
  return (Number(e.basic) || 0) + (Number(e.housing) || 0) + (Number(e.transport) || 0);
}

function wpsRows(run) {
  const at = `${run.month}-15`;
  return getSeed('employees').map(e => {
    const line = calcPayLine(e, { ...((run.adjustments || {})[e.code] || {}), at });
    const wage = wageOf(e);
    return { e, line, wage, iban: e.iban || '', diff: line.net - wage };
  });
}

function wpsChip(st) {
  const lbl =
    {
      draft: t('status.draft'),
      submitted: t('status.submitted'),
      accepted: L('Accepted', 'مقبول'),
      paid: t('status.paid')
    }[st] || st;
  return `<span class="status status-${WPS_CLS[st] || 'blue'}">${lbl}</span>`;
}

function delayBand(run, deadline) {
  if (run.wps === 'paid') {
    return {
      cls: 'green',
      msg: `${L('Paid via Mudad', 'سُدد عبر مدد')}${run.wpsAt ? ` · ${String(run.wpsAt).slice(0, 10)}` : ''}`
    };
  }
  const today = new Date().toISOString().slice(0, 10);
  const late = -daysUntil(deadline, today);
  if (late >= 20) {
    return {
      cls: 'red',
      msg: L(
        `Inspection risk — ${late} days past the deadline`,
        `خطر تفتيش — تأخير ${late} يومًا عن الموعد`
      )
    };
  }
  if (late >= 15) {
    return {
      cls: 'red',
      msg: L(`Second alert — ${late} days late`, `التنبيه الثاني — تأخير ${late} يومًا`)
    };
  }
  if (late >= 10) {
    return {
      cls: 'yellow',
      msg: L(`First alert — ${late} days late`, `التنبيه الأول — تأخير ${late} يومًا`)
    };
  }
  if (late > 0) {
    return {
      cls: 'yellow',
      msg: L(`${late} days past the deadline`, `تأخير ${late} أيام عن الموعد`)
    };
  }
  return {
    cls: 'green',
    msg: L(`${-late} days left to payday deadline`, `المتبقي ${-late} أيام على موعد السداد`)
  };
}

function renderAll() {
  const run = cur();
  if (!run) {
    return;
  }
  runId = run.id;
  const sel = document.getElementById('w-run');
  if (sel) {
    sel.innerHTML = runs().map(
      r =>
        `<option value="${r.id}"${r.id === runId ? ' selected' : ''}>${r.id} · ${r.month}</option>`
    );
  }
  const set = (id, v) => {
    const el = document.getElementById(id);
    if (el) {
      el.textContent = v;
    }
  };
  const deadline = wpsDeadline(run.month);
  set('w-deadline', deadline);
  const band = delayBand(run, deadline);
  const alert = document.getElementById('w-alert');
  if (alert) {
    alert.innerHTML = `<span class="status status-${band.cls}">${band.msg}</span>`;
  }
  const chip = document.getElementById('w-status');
  if (chip) {
    chip.innerHTML = wpsChip(run.wps || 'draft');
  }
  const rows = wpsRows(run);
  const noIban = rows.filter(r => !r.iban);
  set('w-stat-pay', fmtSAR(rows.reduce((s, r) => s + r.line.net, 0)));
  set('w-stat-n', String(rows.length));
  set('w-stat-iban', String(noIban.length));
  set('w-stat-diff', fmtSAR(rows.reduce((s, r) => s + r.diff, 0)));
  const el = document.getElementById('w-rows');
  if (el) {
    el.innerHTML = rows
      .map(({ e, line, wage, iban, diff }) => {
        const flag =
          line.net < wage
            ? `<span class="status status-red">${L('Underpayment!', 'نقص سداد!')}</span>`
            : diff > 0
              ? `<span class="status status-blue">+${fmtSAR(diff)}</span>`
              : `<span class="status status-green">${L('Match', 'مطابق')}</span>`;
        return `<tr>
      <td data-label="${L('Employee', 'الموظف')}"><strong>${empName(e)}</strong>
        <div style="font-size:11.5px;color:var(--text-muted)" dir="ltr">${e.code}</div></td>
      <td data-label="${L('Registered wage', 'الأجر المسجل')}" dir="ltr">${fmtSAR(wage)}</td>
      <td data-label="${L('Net payable', 'صافي المستحق')}" dir="ltr"><strong>${fmtSAR(line.net)}</strong></td>
      <td data-label="${L('Check', 'الفحص')}">${flag}</td>
      <td data-label="IBAN" dir="ltr">${iban || `<span class="status status-red">${L('Missing', 'مفقود')}</span>`}</td>
    </tr>`;
      })
      .join('');
  }
  const sif = sifBuild(
    run.month,
    rows.map(r => ({ emp: r.e.code, iban: r.iban, net: r.line.net }))
  );
  const pre = document.getElementById('w-sif');
  if (pre) {
    pre.textContent = sif.text;
  }
  const eb = document.getElementById('w-errors');
  if (eb) {
    eb.innerHTML = sif.errors.length
      ? `<div class="hr-note" style="border-color:var(--danger)">⛔ ${L('Fix before submitting to Mudad:', 'صحح قبل الرفع إلى مدد:')}<br>• ${sif.errors.join('<br>• ')}</div>`
      : `<div class="hr-note">✅ ${L('SIF validates — ready for Mudad upload (SIF working format v1; confirm final bank layout before first live filing).', 'الملف سليم — جاهز للرفع إلى مدد (صيغة عمل v1؛ أكّد الصيغة النهائية مع البنك قبل أول رفع فعلي).')}</div>`;
  }
  const adv = document.getElementById('w-advance');
  if (adv) {
    const next = WPS_NEXT[run.wps || 'draft'];
    adv.style.display = next ? '' : 'none';
    adv.textContent = next
      ? `${L('Mark', 'تعيين')}: ${next === 'submitted' ? t('status.submitted') : next === 'accepted' ? L('Accepted', 'مقبول') : t('status.paid')}`
      : '';
    adv.dataset.next = next || '';
  }
  applyI18n(document.querySelector('[data-hr-wps]') || document);
}

export function initWps() {
  const root = document.querySelector('[data-hr-wps]');
  if (!root) {
    return;
  }
  renderAll();
  if (booted) {
    return;
  }
  booted = true;
  document.getElementById('w-run')?.addEventListener('change', e => {
    runId = e.target.value;
    renderAll();
  });
  document.getElementById('w-advance')?.addEventListener('click', e => {
    const run = cur();
    const next = e.currentTarget.dataset.next;
    if (!run || !next) {
      return;
    }
    if (next === 'submitted') {
      if (run.status !== 'paid' && run.status !== 'approved') {
        showToast(L('Approve the pay run first', 'اعتمد المسيرة أولًا'), { variant: 'warning' });
        return;
      }
      const rows = wpsRows(run);
      const sif = sifBuild(
        run.month,
        rows.map(r => ({ emp: r.e.code, iban: r.iban, net: r.line.net }))
      );
      if (sif.errors.length) {
        showToast(L('SIF has errors — fix before submitting', 'بالملف أخطاء — صححها قبل الرفع'), {
          variant: 'error'
        });
        return;
      }
    }
    patchSeedRow('payRuns', run, { wps: next, wpsAt: new Date().toISOString() });
    renderAll();
    showToast(L('WPS state updated', 'حُدثت حالة مدد'), { variant: 'success' });
  });
  document.getElementById('w-download')?.addEventListener('click', () => {
    const run = cur();
    const rows = wpsRows(run);
    const sif = sifBuild(
      run.month,
      rows.map(r => ({ emp: r.e.code, iban: r.iban, net: r.line.net }))
    );
    download(`SIF-${run.month}.txt`, sif.text, 'text/plain;charset=utf-8');
  });
  document.getElementById('w-copy')?.addEventListener('click', async () => {
    const txt = document.getElementById('w-sif')?.textContent || '';
    try {
      await navigator.clipboard.writeText(txt);
      showToast(L('SIF copied', 'نُسخ الملف'), { variant: 'success' });
    } catch (_e) {
      showToast(L('Copy failed', 'فشل النسخ'), { variant: 'error' });
    }
  });
  document.getElementById('w-export-csv')?.addEventListener('click', () => {
    const run = cur();
    exportCSV(
      `wps-${run.month}.csv`,
      [
        { key: 'emp', label: 'Employee' },
        { key: 'name', label: 'Name' },
        { key: 'wage', label: 'Registered wage (SAR)' },
        { key: 'net', label: 'Net payable (SAR)' },
        { key: 'diff', label: 'Diff (SAR)' },
        { key: 'iban', label: 'IBAN' }
      ],
      wpsRows(run).map(r => ({
        emp: r.e.code,
        name: r.e.nameEn,
        wage: r.wage,
        net: r.line.net,
        diff: r.diff,
        iban: r.iban
      }))
    );
  });
  window.addEventListener(LANG_EVENT, renderAll);
}
