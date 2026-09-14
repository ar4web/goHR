// HRGO — employee self-service "My space" (my_space.html).
// Identity switcher (demo login) + profile, pay slip, deployment, leave balance.

import { showToast } from './toast.js';
import { t, currentLang, LANG_EVENT, applyI18n } from './i18n.js';
import { fmtSAR, fmtDate, fmtHijri, initialsOf, L} from './hr-locale.js';
import { calcGosi, calcEOSB, annualEntitlement } from './hr-statutory.js';
import { getSeed } from './hr-api.js';
import { CLIENTS, SITES } from './hr-seed.js';

let booted = false;
let who = null;

function name(e) {
  return currentLang() === 'ar' ? e.nameAr || e.nameEn : e.nameEn;
}

function current() {
  const list = getSeed('employees');
  if (!who) {
    try {
      who = localStorage.getItem('hr:my-code') || list[0].code;
    } catch (_e) {
      who = list[0].code;
    }
  }
  return list.find(e => e.code === who) || list[0];
}

function kv(k, v) {
  return `<div class="hr-kv"><span>${k}</span><strong>${v}</strong></div>`;
}

function render() {
  const root = document.querySelector('[data-hr-myspace]');
  if (!root) {
    return;
  }
  const e = current();
  const list = getSeed('employees');
  const g = calcGosi({
    basic: e.basic,
    housing: e.housing,
    isSaudi: e.saudi,
    enrolledOn: e.gosiOn
  });
  const total = (e.basic || 0) + (e.housing || 0) + (e.transport || 0);
  const net = total - g.employee;
  const eosb = calcEOSB({ basic: e.basic, joinDate: e.join, endReason: 'termination' });
  const ent = annualEntitlement(e.join);
  const used = e.annualUsed || 0;
  const client = CLIENTS.find(c => c.id === e.client);
  const site = SITES.find(s => s.id === e.site);

  const sel = document.getElementById('my-who');
  if (sel && !sel.options.length) {
    sel.innerHTML = list
      .map(
        x =>
          `<option value="${x.code}">${x.code} · ${currentLang() === 'ar' ? x.nameAr || x.nameEn : x.nameEn}</option>`
      )
      .join('');
    sel.value = e.code;
  } else if (sel) {
    sel.value = e.code;
  }

  const head = document.getElementById('my-head');
  if (head) {
    head.innerHTML = `
      <div class="cell-avatar" style="width:56px;height:56px;font-size:20px;background:var(--avatar-teal);color:#fff">${initialsOf(e.nameEn)}</div>
      <div style="flex:1;min-width:0">
        <div class="cell-strong" style="font-size:16px">${name(e)}</div>
        <div style="font-size:12.5px;color:var(--text-muted)">${e.code} · ${e.nat}</div>
        <div style="margin-top:6px"><span class="status status-${e.st === 'active' ? 'green' : 'yellow'}">${t(`status.${e.st}`)}</span></div>
      </div>`;
  }

  document.getElementById('my-profile').innerHTML =
    '<div class="hr-kv-grid">' +
    kv(L('Join date', 'الالتحاق'), `${fmtDate(e.join)} · ${fmtHijri(e.join)}`) +
    kv(L('Department', 'الإدارة'), e.dept) +
    kv(L('Phone', 'الجوال'), `<span dir="ltr">${e.phone || '—'}</span>`) +
    (e.saudi
      ? kv(L('National ID', 'الهوية'), e.nid || '—')
      : kv(
        L('Iqama expiry', 'انتهاء الإقامة'),
        e.iqamaExp ? fmtDate(e.iqamaExp) : t('status.missing')
      )) +
    '</div>';

  document.getElementById('my-pay').innerHTML =
    '<div class="hr-kv-grid">' +
    kv(L('Basic', 'الأساسي'), fmtSAR(e.basic)) +
    kv(
      L('Housing + transport', 'السكن + المواصلات'),
      fmtSAR((e.housing || 0) + (e.transport || 0))
    ) +
    kv(L('GOSI (employee)', 'التأمينات (الموظف)'), `− ${fmtSAR(g.employee)}`) +
    kv(`<b>${L('Net pay', 'صافي الراتب')}</b>`, `<b>${fmtSAR(net)}</b>`) +
    kv(L('EOSB accrued (est.)', 'نهاية الخدمة (تقديري)'), fmtSAR(eosb.net)) +
    '</div>';

  document.getElementById('my-deploy').innerHTML = client
    ? '<div class="hr-kv-grid">' +
      kv(L('Client', 'العميل'), currentLang() === 'ar' ? client.nameAr : client.nameEn) +
      kv(L('Site', 'الموقع'), site ? (currentLang() === 'ar' ? site.nameAr : site.nameEn) : '—') +
      '</div>'
    : `<div class="hr-empty">${L('On bench — no active deployment.', 'احتياطي — لا يوجد توزيع نشط.')}</div>`;

  document.getElementById('my-leave').innerHTML = `
    <div class="my-leave-ring"><strong>${Math.max(0, ent - used)}</strong><span>${L('days left', 'يوم متبق')}</span></div>
    <div style="font-size:12.5px;color:var(--text-muted);margin-top:8px">${L('Entitlement', 'الرصيد')}: ${ent} · ${L('Used', 'المستخدم')}: ${used}</div>
    <button type="button" class="btn btn-outline btn-sm" id="my-leave-btn" style="margin-top:10px">${L('Request leave', 'طلب إجازة')}</button>`;

  const rq = document.getElementById('my-requests');
  if (rq) {
    rq.innerHTML = `<div class="hr-empty">${t('common.noData')}</div>`;
  }

  document.getElementById('my-leave-btn')?.addEventListener('click', () => {
    showToast(
      L(
        'Leave requests open in P2 — approval workflow.',
        'طلبات الإجازة تُفتح في P2 — سير الاعتماد.'
      ),
      { variant: 'info' }
    );
  });
  applyI18n(root);
}

export function initMySpace() {
  const root = document.querySelector('[data-hr-myspace]');
  if (!root) {
    return;
  }
  render();
  if (booted) {
    return;
  }
  booted = true;
  document.getElementById('my-who')?.addEventListener('change', e => {
    who = e.target.value;
    try {
      localStorage.setItem('hr:my-code', who);
    } catch (_err) {
      /* ignore */
    }
    render();
  });
  document.getElementById('my-print')?.addEventListener('click', () => window.print());
  window.addEventListener(LANG_EVENT, render);
}
