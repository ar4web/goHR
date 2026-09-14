// HR + Operations — employee 360 file (employee.html?code=EMP-0001).
// Tabs: Overview / Job & Pay / GOSI / Residency / Deployment / Leave / Documents.

import { showToast } from './toast.js';
import { showModal } from './modal.js';
import { t, currentLang, LANG_EVENT, applyI18n } from './i18n.js';
import { fmtSAR, fmtDate, fmtHijri, initialsOf, maskIban, L} from './hr-locale.js';
import { calcGosi, calcEOSB, daysUntil } from './hr-statutory.js';
import { getSeed } from './hr-api.js';
import { exportData } from './import-export.js';
import { DEPARTMENTS, PROFESSIONS, CLIENTS, SITES } from './hr-seed.js';
import { escapeHtml as esc } from './markup.js';

// Avatar backgrounds — dark variants only, so white initials pass AA.
// (Bright base hues with white text fail contrast; see _tokens.scss.)
const AV = {
  primary: 'var(--avatar-teal)',
  azure: 'var(--avatar-azure)',
  purple: 'var(--avatar-purple)',
  yellow: 'var(--avatar-yellow)',
  red: 'var(--avatar-red)',
  green: 'var(--avatar-green)',
  blue: 'var(--avatar-blue)'
};

let booted = false;
function emp() {
  const code = new URLSearchParams(window.location.search).get('code') || 'EMP-0001';
  return getSeed('employees').find(e => e.code === code) || getSeed('employees')[0];
}

function profName(code) {
  const p = PROFESSIONS.find(x => x.code === code);
  return p ? (currentLang() === 'ar' ? p.ar : p.en) : code || '—';
}

function deptName(code) {
  const d = DEPARTMENTS.find(x => x.code === code);
  return d ? (currentLang() === 'ar' ? d.ar : d.en) : code || '—';
}

function expBadge(iso) {
  if (!iso) {
    return `<span class="status status-red">${t('status.missing')}</span>`;
  }
  const d = daysUntil(iso);
  if (d < 0) {
    return `<span class="status status-red">${fmtDate(iso)} · ${t('status.expired')}</span>`;
  }
  if (d <= 30) {
    return `<span class="status status-red">${fmtDate(iso)} · ${d} ${t('common.days')}</span>`;
  }
  if (d <= 90) {
    return `<span class="status status-yellow">${fmtDate(iso)} · ${d} ${t('common.days')}</span>`;
  }
  return `<span class="status status-green">${fmtDate(iso)}</span>`;
}

function kv(k, v) {
  return `<div class="hr-kv"><span>${k}</span><strong>${v}</strong></div>`;
}

function kvd(k, v) {
  return `<div class="hr-kv"><span>${k}</span><strong>${esc(v ?? '')}</strong></div>`;
}

function renderHeader(e) {
  const aHead = document.getElementById('a4-head');
  const avatarEl = document.getElementById('a4-avatar');
  if (avatarEl) { avatarEl.style.background = AV[e.av] || 'var(--avatar-teal)'; avatarEl.textContent = initialsOf(e.nameEn); }
  if (!aHead) {return;}
  const client = CLIENTS.find(c => c.id === e.client);
  const site = SITES.find(s => s.id === e.site);
  const total = (e.basic||0)+(e.housing||0)+(e.transport||0);
  aHead.innerHTML = `
    <div style="display:flex;gap:16px;align-items:flex-start;flex-wrap:wrap">
      <div style="flex:1;min-width:220px">
        <h2 style="margin:0;font-size:18px;font-weight:700">${esc(currentLang()==='ar'?e.nameAr||e.nameEn:e.nameEn)}</h2>
        <div style="color:var(--text-muted);font-size:12.5px">${esc(e.code)} · ${esc(profName(e.prof))} · ${esc(deptName(e.dept))} · ${esc(fmtDate(e.join))}</div>
        <div style="margin-top:8px;display:flex;gap:6px;flex-wrap:wrap">
          <span class="status status-${e.st==='active'?'green':e.st==='huroob'?'red':'yellow'}">${esc(t(`status.${e.st}`))}</span>
          <span class="status status-blue">${esc(e.nat)}</span>
          ${client ? `<span class="status status-green">${esc(currentLang()==='ar'?client.nameAr:client.nameEn)}${site?` · ${esc(currentLang()==='ar'?site.nameAr:site.nameEn)}`:''}</span>` : `<span class="status status-blue">${t('status.bench')}</span>`}
        </div>
      </div>
      <div style="text-align:end;min-width:140px">
        <div style="font-size:11px;color:var(--text-muted)">Total package</div>
        <div style="font-size:18px;font-weight:700;color:var(--primary)">${esc(fmtSAR(total))}</div>
        <div style="font-size:11px;color:var(--text-muted)">${esc(e.phone||'')}<br>${esc(e.email||'')}</div>
      </div>
    </div>`;
  document.getElementById('emp360-export')?.addEventListener('click', () => {
    exportData(
      'xlsx',
      e.code,
      [
        { key: 'code', label: 'Code' },
        { key: 'nameEn', label: 'Name (EN)' },
        { key: 'nameAr', label: 'Name (AR)' },
        { key: 'nat', label: 'Nationality' },
        { key: 'prof', label: 'Profession' },
        { key: 'dept', label: 'Department' },
        { key: 'join', label: 'Join' },
        { key: 'basic', label: 'Basic' },
        { key: 'housing', label: 'Housing' },
        { key: 'transport', label: 'Transport' },
        { key: 'iqama', label: 'Iqama' },
        { key: 'iqamaExp', label: 'Iqama expiry' },
        { key: 'q', label: 'Qiwa' },
        { key: 'st', label: 'Status' }
      ],
      [e],
      'Employee'
    );
  });
  document.getElementById('emp360-edit')?.addEventListener('click', () => openEditModal(e));
}

function renderBody(e) {
  const grid = document.getElementById('a4-grid');
  const extra = document.getElementById('a4-extra');
  if (!grid) {return;}
  const total = (e.basic || 0) + (e.housing || 0) + (e.transport || 0);
  const g = calcGosi({ basic: e.basic, housing: e.housing, isSaudi: e.saudi, enrolledOn: e.gosiOn });
  const eosb = calcEOSB({ basic: e.basic, joinDate: e.join, endReason: 'termination' });
  // A4 dense dossier — all areas visible, not tabs
  const overview = '<div class="a4-card"><h3>Personal</h3>' + '<div class="hr-kv"><span>Code</span><strong>'+esc(e.code)+'</strong></div>' + kvd('Nationality',e.nat) + kvd(e.saudi?'National ID':'Iqama', e.saudi?e.nid||'—':e.iqama||'—') + kvd('Phone',e.phone||'—') + kvd('Email',e.email||'—') + kvd('Join', `${fmtDate(e.join)} · ${fmtHijri(e.join)}`) + (e.entry?kvd('KSA entry',fmtDate(e.entry)):'') + kvd('Qiwa', t(`status.${e.q}`)) + '</div>';
  const job = '<div class="a4-card"><h3>Job & Pay</h3>' + kvd('Department',deptName(e.dept)) + kvd('Title', currentLang()==='ar'?e.titleAr||e.titleEn:e.titleEn) + kvd('Profession',profName(e.prof)) + kvd('Basic',fmtSAR(e.basic)) + kvd('Housing',fmtSAR(e.housing)) + kvd('Transport',fmtSAR(e.transport)) + kv('Total', `<b>${fmtSAR(total)}</b>`) + kvd('EOSB est.',fmtSAR(eosb.net)) + '</div>';
  const gosi = '<div class="a4-card"><h3>GOSI</h3>' + kvd('GOSI no.', e.gosi || (e.saudi?'—':'Expat 2%')) + kv('System', g.system==='expat'?'Expat 2%':g.system==='old'?'Old 9%':`New ${Math.round(g.pensionRate*100)}%`) + kvd('Contributory',fmtSAR(g.base)) + kvd('Employee',fmtSAR(g.employee)) + kvd('Employer',fmtSAR(g.employer)) + '</div>';
  const residency = e.saudi ? `<div class="a4-card"><h3>Residency</h3><div class="hr-kv"><span>National ID</span><strong>${esc(e.nid||'—')}</strong></div></div>` : '<div class="a4-card"><h3>Residency</h3>' + kvd('Iqama no.',e.iqama||'—') + kv('Expiry', expBadge(e.iqamaExp)) + kvd('Iqama profession',profName(e.prof)) + kv(e.iban?maskIban(e.iban):'—', e.bank||'—') + '</div>';
  const docs = '<div class="a4-card"><h3>Documents</h3>' + kvd('Contract','PDF · Valid') + kvd(e.saudi?'NID copy':'Iqama copy','PDF · Valid') + kvd('Qiwa', t(`status.${e.q}`)) + kvd('Insurance', e.ins || '—') + '</div>';
  const skills = e.skills?.length ? '<div class="a4-card"><h3>Skills</h3><div style="display:flex;gap:6px;flex-wrap:wrap">' + e.skills.map(s=>`<span class="status status-blue" style="font-size:11px">${esc(s)}</span>`).join('') + '</div></div>' : '';
  grid.innerHTML = overview + job + gosi + residency + docs + skills;
  if (extra) {extra.innerHTML = `<div class="a4-card"><h3>Notes</h3><div style="font-size:12.5px;color:var(--text-muted)">File: ${esc(e.code)} · Generated ${fmtDate(new Date().toISOString().slice(0,10))} · HRGO A4 dossier — print with Ctrl+P</div></div>`;}
  return;
}

function renderAll() {
  renderHeader(emp());
  renderBody(emp());
  applyI18n(document.querySelector('[data-hr-employee]') || document);
}

function openEditModal(e) {
  showModal({
    title: `${t('common.edit')} · ${e.code}`,
    body: `
      <div class="form-group"><label class="form-label">${L('Phone', 'الجوال')}</label>
        <input class="form-control" id="ed-phone" value="${e.phone || ''}" dir="ltr"></div>
      <div class="form-group"><label class="form-label">IBAN</label>
        <input class="form-control" id="ed-iban" value="${e.iban || ''}" dir="ltr"></div>
      <div class="form-group" style="margin-bottom:0"><label class="form-label">${L('Bank', 'البنك')}</label>
        <input class="form-control" id="ed-bank" value="${e.bank || ''}"></div>`,
    actions: [
      { label: t('common.cancel'), variant: 'ghost' },
      {
        label: t('common.save'),
        variant: 'primary',
        action: ({ body }) => {
          e.phone = body.querySelector('#ed-phone').value.trim();
          e.iban = body.querySelector('#ed-iban').value.trim();
          e.bank = body.querySelector('#ed-bank').value.trim();
          try {
            const ov = JSON.parse(localStorage.getItem('hr:import:employees') || '[]');
            const i = ov.findIndex(x => x.code === e.code);
            const patch = { ...e };
            if (i >= 0) {
              ov[i] = patch;
            } else {
              ov.push(patch);
            }
            localStorage.setItem('hr:import:employees', JSON.stringify(ov));
          } catch (_err) {
            /* ignore */
          }
          renderAll();
          showToast(L('Saved', 'تم الحفظ'), { variant: 'success' });
        }
      }
    ]
  });
}

export function initEmployeeDetail() {
  const root = document.querySelector('[data-hr-employee]');
  if (!root) {
    return;
  }
  renderAll();
  if (booted) {
    return;
  }
  booted = true;
  window.addEventListener(LANG_EVENT, renderAll);
}
