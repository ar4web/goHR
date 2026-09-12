// HR + Operations — leave calendar (hr_leave_calendar.html).
// Month grid: weekends + Hijri days + holidays + leave overlays. Idempotent.

import { t, currentLang, LANG_EVENT, applyI18n } from './i18n.js';
import { fmtDate } from './hr-locale.js';
import { getSeed } from './hr-api.js';
import { LEAVE_TYPES } from './hr-seed.js';

let booted = false;
let cursor = '';
let picked = '';

function L(en, ar) {
  return currentLang() === 'ar' ? ar : en;
}

function pad(n) {
  return String(n).padStart(2, '0');
}

function monthStart() {
  const base = cursor || new Date().toISOString().slice(0, 10);
  return base.slice(0, 7);
}

function hijriDay(iso) {
  try {
    return new Intl.DateTimeFormat(currentLang() === 'ar' ? 'ar-SA' : 'en-SA', {
      day: 'numeric',
      calendar: 'islamic-umalqura'
    }).format(new Date(`${iso}T00:00:00`));
  } catch (_e) {
    return '';
  }
}

function empName(code) {
  const e = getSeed('employees').find(x => x.code === code);
  if (!e) {
    return code;
  }
  return currentLang() === 'ar' ? e.nameAr || e.nameEn : e.nameEn;
}

function typeName(code) {
  const x = LEAVE_TYPES.find(l => l.code === code);
  if (!x) {
    return code;
  }
  return currentLang() === 'ar' ? x.ar : x.en;
}

function holidayOn(iso) {
  return getSeed('holidays').find(h => {
    const s = new Date(`${h.start}T00:00:00`).getTime();
    const t = new Date(`${iso}T00:00:00`).getTime();
    return t >= s && t < s + (h.days || 1) * 86400000;
  });
}

function leavesOn(iso) {
  return getSeed('leaveRequests').filter(
    r => (r.status === 'approved' || r.status === 'pending') && iso >= r.from && iso <= r.to
  );
}

function renderHead() {
  const el = document.getElementById('lc-label');
  if (!el) {
    return;
  }
  const [y, m] = monthStart().split('-').map(Number);
  const name = new Date(y, m - 1, 1).toLocaleDateString(
    currentLang() === 'ar' ? 'ar-SA' : 'en-SA',
    {
      month: 'long',
      year: 'numeric'
    }
  );
  el.textContent = name;
}

function renderGrid() {
  const el = document.getElementById('lc-grid');
  if (!el) {
    return;
  }
  const [y, m] = monthStart().split('-').map(Number);
  const first = new Date(y, m - 1, 1);
  const startPad = first.getDay(); // 0 = Sunday
  const daysIn = new Date(y, m, 0).getDate();
  const today = new Date().toISOString().slice(0, 10);
  const wd =
    currentLang() === 'ar'
      ? ['أحد', 'إثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة', 'سبت']
      : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  let html =
    '<div class="lc-week">' +
    wd.map(d => `<div class="lc-dow">${d}</div>`).join('') +
    '</div><div class="lc-days">';
  for (let i = 0; i < startPad; i += 1) {
    html += '<div class="lc-day lc-pad"></div>';
  }
  for (let d = 1; d <= daysIn; d += 1) {
    const iso = `${y}-${pad(m)}-${pad(d)}`;
    const dow = new Date(y, m - 1, d).getDay();
    const weekend = dow === 5 || dow === 6;
    const hol = holidayOn(iso);
    const leaves = leavesOn(iso);
    const cls = ['lc-day'];
    if (weekend) {
      cls.push('lc-we');
    }
    if (hol) {
      cls.push('lc-hol');
    }
    if (iso === today) {
      cls.push('lc-today');
    }
    if (iso === picked) {
      cls.push('lc-picked');
    }
    html += `<button type="button" class="${cls.join(' ')}" data-day="${iso}">
      <span class="lc-num">${d}<small>${hijriDay(iso)}</small></span>
      ${hol ? `<span class="lc-dot lc-dot-h" title="${currentLang() === 'ar' ? hol.ar : hol.en}"></span>` : ''}
      ${leaves
        .slice(0, 3)
        .map(
          r =>
            `<span class="lc-dot ${r.status === 'approved' ? 'lc-dot-a' : 'lc-dot-p'}" title="${empName(r.emp)} · ${typeName(r.type)}"></span>`
        )
        .join('')}
      ${leaves.length > 3 ? `<span class="lc-more">+${leaves.length - 3}</span>` : ''}
    </button>`;
  }
  html += '</div>';
  el.innerHTML = html;
}

function renderDetail() {
  const el = document.getElementById('lc-detail');
  if (!el) {
    return;
  }
  if (!picked) {
    el.innerHTML = `<div class="hr-empty">${L('Pick a day to see who is off.', 'اختر يومًا لترى من في إجازة.')}</div>`;
    return;
  }
  const hol = holidayOn(picked);
  const leaves = leavesOn(picked);
  el.innerHTML = `
    <div class="cell-strong" style="margin-bottom:8px">${fmtDate(picked)}</div>
    ${hol ? `<div style="margin-bottom:8px"><span class="status status-green">${currentLang() === 'ar' ? hol.ar : hol.en}</span></div>` : ''}
    ${
      leaves.length
        ? leaves
            .map(
              r => `
      <div class="hr-kv"><span><a href="hr_employee.html?code=${r.emp}">${empName(r.emp)}</a> · ${typeName(r.type)}</span>
      <strong><span class="status status-${r.status === 'approved' ? 'green' : 'yellow'}">${t(`status.${r.status}`)}</span></strong></div>`
            )
            .join('')
        : `<div class="hr-empty">${L('Nobody on leave.', 'لا أحد في إجازة.')}</div>`
    }`;
}

function renderAll() {
  renderHead();
  renderGrid();
  renderDetail();
  applyI18n(document.querySelector('[data-hr-leavecal]') || document);
}

function shiftMonth(delta) {
  const [y, m] = monthStart().split('-').map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  cursor = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-01`;
  renderAll();
}

export function initLeaveCalendar() {
  const root = document.querySelector('[data-hr-leavecal]');
  if (!root) {
    return;
  }
  renderAll();
  if (booted) {
    return;
  }
  booted = true;
  document.getElementById('lc-prev')?.addEventListener('click', () => shiftMonth(-1));
  document.getElementById('lc-next')?.addEventListener('click', () => shiftMonth(1));
  document.getElementById('lc-today')?.addEventListener('click', () => {
    cursor = '';
    renderAll();
  });
  document.getElementById('lc-grid')?.addEventListener('click', e => {
    const btn = e.target.closest('[data-day]');
    if (!btn) {
      return;
    }
    picked = btn.dataset.day;
    renderGrid();
    renderDetail();
  });
  window.addEventListener(LANG_EVENT, renderAll);
}
