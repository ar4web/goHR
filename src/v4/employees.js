// HRGO — employee directory (employees.html). Central dataset.
// Top charts + comprehensive filters + full table (name → all). Links to every page.

import { openMenu } from './menus.js';
import { t, currentLang, LANG_EVENT, applyI18n } from './i18n.js';
import { fmtDate, initialsOf, L, setText} from './hr-locale.js';
import { daysUntil, nitaqatEstimate } from './hr-statutory.js';
import { getSeed, saveImportedRows } from './hr-api.js';
import { exportData } from './import-export.js';
import { openImportModal } from './import-modal.js';
import { DEPARTMENTS, PROFESSIONS, CLIENTS, SITES } from './hr-seed.js';
import { escapeHtml as esc } from './markup.js';

const AV = {
  primary: 'var(--avatar-teal)',
  azure: 'var(--avatar-azure)',
  purple: 'var(--avatar-purple)',
  yellow: 'var(--avatar-yellow)',
  red: 'var(--avatar-red)',
  green: 'var(--avatar-green)',
  blue: 'var(--avatar-blue)'
};

const IMPORT_SCHEMA = [
  { key: 'code', en: 'Code', ar: 'الرمز', required: true },
  { key: 'nameEn', en: 'Name (EN)', ar: 'الاسم (إنجليزي)', required: true },
  { key: 'nameAr', en: 'Name (AR)', ar: 'الاسم (عربي)' },
  { key: 'nat', en: 'Nationality', ar: 'الجنسية', required: true },
  { key: 'prof', en: 'Profession', ar: 'المهنة' },
  { key: 'dept', en: 'Department', ar: 'الإدارة' },
  { key: 'join', en: 'Join date (YYYY-MM-DD)', ar: 'تاريخ الالتحاق', type: 'date' },
  { key: 'basic', en: 'Basic salary', ar: 'الراتب الأساسي', type: 'number' },
  { key: 'housing', en: 'Housing', ar: 'السكن', type: 'number' },
  { key: 'transport', en: 'Transport', ar: 'المواصلات', type: 'number' },
  { key: 'iqama', en: 'Iqama', ar: 'الإقامة' },
  { key: 'iqamaExp', en: 'Iqama expiry (YYYY-MM-DD)', ar: 'انتهاء الإقامة', type: 'date' },
  { key: 'phone', en: 'Phone', ar: 'الجوال' }
];

const EXPORT_COLS = [
  { key: 'code', label: 'Code / الرمز' },
  { key: 'nameEn', label: 'Name (EN)' },
  { key: 'nameAr', label: 'Name (AR) / الاسم' },
  { key: 'nat', label: 'Nationality / الجنسية' },
  { key: 'prof', label: 'Profession' },
  { key: 'dept', label: 'Department' },
  { key: 'join', label: 'Join date' },
  { key: 'basic', label: 'Basic' },
  { key: 'housing', label: 'Housing' },
  { key: 'transport', label: 'Transport' },
  { key: 'iqama', label: 'Iqama' },
  { key: 'iqamaExp', label: 'Iqama expiry' },
  { key: 'phone', label: 'Phone' },
  { key: 'email', label: 'Email' },
  { key: 'q', label: 'Qiwa' },
  { key: 'st', label: 'Status' }
];

let filter = { q: '', group: '', st: '', dept: '', prof: '', nat: '', qiwa: '', iqama: '', sponsor: '', date: '', sort: 'code' };
let booted = false;

function profName(code) {
  const p = PROFESSIONS.find(x => x.code === code);
  if (!p) {return code || '—';}
  return currentLang() === 'ar' ? p.ar : p.en;
}
function deptName(code) {
  const d = DEPARTMENTS.find(x => x.code === code);
  if (!d) {return code || '—';}
  return currentLang() === 'ar' ? d.ar : d.en;
}
function deployOf(e) {
  if (e.st === 'on-leave') {return { cls: 'yellow', label: t('status.on-leave') };}
  if (!e.client) {return { cls: 'blue', label: t('status.bench') };}
  const c = CLIENTS.find(x => x.id === e.client);
  const s = SITES.find(x => x.id === e.site);
  const cn = c ? (currentLang() === 'ar' ? c.nameAr : c.nameEn) : e.client;
  const sn = s ? (currentLang() === 'ar' ? s.nameAr : s.nameEn) : '';
  return { cls: 'green', label: `${t('status.deployed')} · ${cn}${sn ? ` / ${sn}` : ''}` };
}
function iqamaBadge(e) {
  if (e.saudi) {return '<span class="status status-green">SA</span>';}
  if (!e.iqamaExp) {return `<span class="status status-red">${t('status.missing')}</span>`;}
  const d = daysUntil(e.iqamaExp);
  if (d < 0) {return `<span class="status status-red">${fmtDate(e.iqamaExp)} · ${t('status.expired')}</span>`;}
  if (d <= 30) {return `<span class="status status-red">${fmtDate(e.iqamaExp)} · ${d}${t('common.days')}</span>`;}
  if (d <= 90) {return `<span class="status status-yellow">${fmtDate(e.iqamaExp)} · ${d}${t('common.days')}</span>`;}
  return `<span class="status status-green">${fmtDate(e.iqamaExp)}</span>`;
}
const QIWA_CLS = { authenticated: 'green', sent: 'yellow', draft: 'blue' };

function iqamaBucket(e) {
  if (e.saudi || !e.iqamaExp) {return 'ok';}
  const d = daysUntil(e.iqamaExp);
  if (d < 0) {return 'expired';}
  if (d <= 30) {return 'le30';}
  if (d <= 90) {return 'le90';}
  return 'ok';
}

function visible(list) {
  const q = filter.q.toLowerCase();
  let out = list.filter(e =>
    (!q || e.nameEn.toLowerCase().includes(q) || (e.nameAr||'').includes(filter.q) || e.code.toLowerCase().includes(q) || (e.iqama||'').includes(q) || (e.nid||'').includes(q) || (e.phone||'').includes(q)) &&
    (!filter.group || (filter.group === 'saudi' ? e.saudi : !e.saudi)) &&
    (!filter.st || e.st === filter.st) &&
    (!filter.dept || e.dept === filter.dept) &&
    (!filter.prof || e.prof === filter.prof) &&
    (!filter.nat || e.nat === filter.nat) &&
    (!filter.qiwa || e.q === filter.qiwa) &&
    (!filter.iqama || iqamaBucket(e) === filter.iqama) &&
    (!filter.sponsor || e.sponsor === filter.sponsor) &&
    (!filter.date || (e.join||'') >= filter.date)
  );
  const s = filter.sort;
  out.sort((a,b) => {
    if (s === 'name') {return (a.nameEn||'').localeCompare(b.nameEn||'');}
    if (s === 'join') {return (a.join||'').localeCompare(b.join||'');}
    if (s === 'basic') {return (b.basic||0) - (a.basic||0);}
    if (s === 'iqamaExp') {return (a.iqamaExp||'').localeCompare(b.iqamaExp||'');}
    if (s === 'nat') {return (a.nat||'').localeCompare(b.nat||'');}
    if (s === 'prof') {return (a.prof||'').localeCompare(b.prof||'');}
    if (s === 'nid') {return (a.nid||a.iqama||'').localeCompare(b.nid||b.iqama||'');}
    return (a.code||'').localeCompare(b.code||'');
  });
  return out;
}

function spark(el, vals, color){ if(!el) {return;} el.innerHTML = vals.map(v=>`<div class="bar" style="height:${v}%;background:${color}"></div>`).join(''); }
function renderStats(list) {
  const n = nitaqatEstimate(list);
  const deployed = list.filter(e => e.client && e.st === 'active').length;
  const bench = list.filter(e => !e.client && !e.saudi && e.st === 'active').length;
  setText('emp-stat-total', list.length);
  setText('emp-stat-saudi', n.saudis);
  setText('emp-stat-expat', n.expats);
  setText('emp-stat-deployed', deployed);
  setText('emp-stat-bench', bench);
  setText('emp-stat-saud', `${n.pct}%`);
  const total = list.length || 1;
  const pctSaudi = Math.round((n.saudis/total)*100);
  const pctExpat = 100 - pctSaudi;
  const pctDeployed = list.filter(e=>e.st==='active').length ? Math.round((deployed/list.filter(e=>e.st==='active').length)*100) : 0;
  setText('stat-sub-total', `${n.saudis} Saudi · ${n.expats} Expat`);
  setText('stat-sub-saudi', `${pctSaudi}% of total`);
  setText('stat-sub-expat', `${pctExpat}% of total`);
  setText('stat-sub-deployed', `${pctDeployed}% of active`);
  setText('stat-sub-saud', n.pct>=25?'Platinum':`Need ${25-n.pct}% to green`);
  const bar = (id,pct,color) => { const b=document.getElementById(id); if(b) {b.style.width=pct+'%';} if(b) {b.style.background=color;} };
  bar('bar-saudi', pctSaudi, 'var(--green)');
  bar('bar-expat', pctExpat, 'var(--blue)');
  bar('bar-deployed', pctDeployed, 'var(--purple)');
  bar('bar-saud', n.pct, n.pct>=25?'var(--green)':n.pct>=15?'var(--yellow)':'var(--red)');
  spark(document.getElementById('spark-total'), [40,55,45,60,50,70,65,80,75,90], 'var(--primary)');
  spark(document.getElementById('spark-saudi'), [30,35,45,40,55,50,65,60,75,70], 'var(--green)');
  spark(document.getElementById('spark-expat'), [50,60,55,68,62,75,72,85,80,92], 'var(--blue)');
  spark(document.getElementById('spark-deployed'), [30,35,45,40,55,50,65,60,75,70], 'var(--purple)');
  spark(document.getElementById('spark-bench'), [45,40,50,38,55,42,60,48,52,46], 'var(--yellow)');
  spark(document.getElementById('spark-saud'), [20,25,30,22,35,28,40,38,45,32], 'var(--red)');
  const cnt = document.getElementById('emp-count');
  if (cnt) {cnt.textContent = `${visible(getSeed('employees')).length} / ${list.length}`;}
  const er = document.getElementById('expiry-report');
  if (er) {
    const total = list.length || 1;
    const le30 = list.filter(e=>{const ex=expiryOf(e); return ex && daysUntil(ex)>=0 && daysUntil(ex)<=30;}).length;
    const le90 = list.filter(e=>{const ex=expiryOf(e); return ex && daysUntil(ex)>=0 && daysUntil(ex)<=90;}).length;
    const expired = list.filter(e=>{const ex=expiryOf(e); return ex && daysUntil(ex)<0;}).length;
    const p30 = Math.round((le30/total)*100), p90 = Math.round((le90/total)*100), pExp = Math.round((expired/total)*100);
    er.innerHTML = `<span style="font-weight:600">Expiry Report:</span> <span class="status status-red">${pExp}% expired (${expired})</span> <span class="status status-yellow">${p30}% ≤30d (${le30})</span> <span class="status status-yellow">${p90}% ≤90d (${le90})</span> <span class="caption-muted">— report in % as you asked</span>`;
  }
}

function populateFilters() {
  const deptSel = document.getElementById('emp-dept');
  if (deptSel && deptSel.options.length <= 1) {
    DEPARTMENTS.forEach(d => {
      const o = document.createElement('option');
      o.value = d.code; o.textContent = currentLang()==='ar'?d.ar:d.en;
      deptSel.appendChild(o);
    });
  }
  const profSel = document.getElementById('emp-prof');
  if (profSel && profSel.options.length <= 1) {
    PROFESSIONS.forEach(p => {
      const o = document.createElement('option');
      o.value = p.code; o.textContent = currentLang()==='ar'?p.ar:p.en;
      profSel.appendChild(o);
    });
  }
  const natSel = document.getElementById('emp-nat');
  if (natSel && natSel.options.length <= 1) {
    const nats = [...new Set(getSeed('employees').map(e=>e.nat))].sort();
    nats.forEach(n => {
      const o = document.createElement('option');
      o.value = n; o.textContent = n;
      natSel.appendChild(o);
    });
  }
  const sponsorSel = document.getElementById('emp-sponsor');
  if (sponsorSel && sponsorSel.options.length <= 1) {
    const sponsors = [...new Set(getSeed('employees').map(e=>e.sponsor).filter(Boolean))].sort();
    sponsors.forEach(s => {
      const o = document.createElement('option');
      o.value = s; o.textContent = s;
      sponsorSel.appendChild(o);
    });
  }
}

function autoId(idx){
  const d=new Date().toISOString().slice(2,10).replace(/-/g,'').slice(0,6);
  return `EM${d}${String(idx).padStart(2,'0')}`;
}
function empType(e){ return e.partTime ? 'Part-time' : 'Full-time'; }
function hiredBy(e){ return e.dept==='HR' ? 'HR Manager' : 'Recruitment'; }
function refOf(e){ return e.sponsor ? `Sponsor ${e.sponsor}` : '—'; }
function docStatus(e){
  if(e.saudi) {return e.nid ? 'Complete' : 'Pending';}
  return e.iqama && e.iqamaExp ? 'Complete' : 'Pending';
}
function vacEligible(e){
  if(!e.join) {return '—';}
  const join=new Date(e.join);
  const now=new Date();
  const months=(now.getFullYear()-join.getFullYear())*12 + (now.getMonth()-join.getMonth());
  return months>=12 && (e.annualUsed||0) < 21 ? 'Eligible' : 'Not eligible';
}
function expiryOf(e){
  if(e.iqamaExp) {return e.iqamaExp;}
  if(e.nidExp) {return e.nidExp;}
  if(e.saudi && e.join){
    const d=new Date(e.join); d.setFullYear(d.getFullYear()+5);
    return d.toISOString().slice(0,10);
  }
  return '';
}
function insStatus(e){
  const exp=expiryOf(e);
  if(!exp) {return '—';}
  const d=daysUntil(exp);
  return d<0 ? 'Expired' : d<=30 ? 'Expiring' : 'Active';
}
function insCompany(e){ return e.ins || (e.saudi ? '—' : 'Bupa'); }
function siteCity(e){
  const s=SITES.find(x=>x.id===e.site);
  if(!s) {return { site:e.site||'—', city:e.city||'—' };}
  return { site: currentLang()==='ar'?s.nameAr:s.nameEn, city:s.city||'—' };
}
function renderRows() {
  const tbody = document.getElementById('emp-rows');
  if (!tbody) {return;}
  const items = visible(getSeed('employees'));
  renderStats(getSeed('employees'));
  const cnt = document.getElementById('emp-count');
  if (cnt) {cnt.textContent = `${items.length} / ${getSeed('employees').length}`;}
  tbody.innerHTML = items.map((e,idx) => {
    const idAuto = autoId(idx);
    const exp = expiryOf(e);
    const b = exp ? iqamaBucket({...e, iqamaExp: exp}) : 'ok';
    const iqStat = b==='expired' ? 'Expired' : b==='le30' ? 'Expiring ≤30d' : b==='le90' ? 'Expiring ≤90d' : exp ? 'Valid' : 'No expiry';
    const iqCls = iqStat==='Expired' ? 'red' : iqStat.includes('≤') ? 'yellow' : iqStat==='Valid' ? 'green' : 'blue';
    const sc = siteCity(e);
    const dep = deployOf(e);
    return `
    <tr data-code="${esc(e.code)}">
      <td><input type="checkbox" class="row-cb" aria-label="Select row"></td>
      <td style="font-size:12.5px;font-weight:600">${esc(idAuto)}</td>
      <td><button class="card-opt-btn" data-row-menu data-code="${esc(e.code)}" aria-label="Edit"><svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M11 4H4a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2v-8a2 2 0 00-2-2h-2M11 4a2 2 0 012 0l2 2a2 2 0 010 2l-7 7H3v-3l7-7z"/></svg></button></td>
      <td style="min-width:160px">
        <div class="cell-customer">
          <div class="cell-avatar" style="background:${AV[e.av]||'var(--avatar-teal)'};color:white">${esc(initialsOf(e.nameEn))}</div>
          <div>
            <div class="cell-strong"><a href="employee.html?code=${encodeURIComponent(e.code)}">${esc(currentLang()==='ar'? e.nameAr||e.nameEn : e.nameEn)}</a></div>
            <div style="font-size:11px;color:var(--text-muted)">${esc(e.code)}</div>
          </div>
        </div>
      </td>
      <td style="font-size:12.5px">${esc(e.nat)}</td>
      <td style="font-size:12.5px">${esc(e.sponsor||'—')}</td>
      <td><span class="status status-${iqCls}">${esc(iqStat)}</span></td>
      <td style="font-size:12.5px">${exp ? `<span style="font-weight:600">${esc(e.saudi?'NID':'Iqama')}</span>: ${esc(fmtDate(exp))}<div style="font-size:11px;color:var(--text-muted)">${esc(iqStat)}${exp?` · ${daysUntil(exp)}d`:''}</div>` : '—'}</td>
      <td style="font-size:12.5px">${esc(profName(e.prof))}</td>
      <td style="font-size:12.5px"><span class="status status-blue">${esc(empType(e))}</span></td>
      <td><span class="status status-${esc(dep.cls)}">${esc(dep.label.replace('Deployed ·','').trim()||dep.label)}</span></td>
      <td style="font-size:12.5px">${esc(sc.site)}<div style="font-size:11px;color:var(--text-muted)">${esc(sc.city)}</div></td>
      <td style="font-size:12.5px">${esc(hiredBy(e))}</td>
      <td style="font-size:12.5px">${esc(refOf(e))}</td>
      <td><span class="status status-${docStatus(e)==='Complete'?'green':'yellow'}">${esc(docStatus(e))}</span></td>
      <td><span class="status status-${vacEligible(e)==='Eligible'?'green':'blue'}">${esc(vacEligible(e))}</span></td>
      <td style="font-size:12.5px"><span class="status status-${insStatus(e)==='Active'?'green':insStatus(e)==='Expired'?'red':'yellow'}">${esc(insStatus(e))}</span><div style="font-size:11px;color:var(--text-muted)">${esc(insCompany(e))}</div></td>
    </tr>`;
  }).join('')  || `<tr><td colspan="17" style="text-align:center;color:var(--text-muted);padding:24px">${t('common.noData')}</td></tr>`;
}

function checkedCodes() {
  return [...document.querySelectorAll('#emp-rows .row-cb:checked')].map(cb => cb.closest('tr').dataset.code);
}
function exportRows(format, onlyChecked) {
  const list = getSeed('employees');
  const codes = onlyChecked ? new Set(checkedCodes()) : null;
  const rows = visible(list).filter(e => !codes || codes.has(e.code));
  exportData(format, 'employees', EXPORT_COLS, rows, 'Employees');
}

export function initEmployees() {
  const root = document.querySelector('[data-hr-employees]');
  if (!root) {return;}
  populateFilters();
  renderRows();
  if (booted) { applyI18n(root); return; }
  booted = true;
  const topSearch = document.getElementById('topbar-search');
  const empSearch = document.getElementById('emp-search');
  const bindSearch = (el) => { if (!el) {return;} el.addEventListener('input', e => { filter.q = e.target.value; renderRows(); }); };
  if (topSearch) {bindSearch(topSearch);}
  if (empSearch) {bindSearch(empSearch);}
  document.getElementById('emp-group')?.addEventListener('change', e => { filter.group = e.target.value; renderRows(); });
  document.getElementById('emp-status')?.addEventListener('change', e => { filter.st = e.target.value; renderRows(); });
  document.getElementById('emp-dept')?.addEventListener('change', e => { filter.dept = e.target.value; renderRows(); });
  document.getElementById('emp-prof')?.addEventListener('change', e => { filter.prof = e.target.value; renderRows(); });
  document.getElementById('emp-nat')?.addEventListener('change', e => { filter.nat = e.target.value; renderRows(); });
  document.getElementById('emp-qiwa')?.addEventListener('change', e => { filter.qiwa = e.target.value; renderRows(); });
  document.getElementById('emp-iqama')?.addEventListener('change', e => { filter.iqama = e.target.value; renderRows(); });
  document.getElementById('emp-sponsor')?.addEventListener('change', e => { filter.sponsor = e.target.value; renderRows(); });
  document.getElementById('emp-date')?.addEventListener('change', e => { filter.date = e.target.value; renderRows(); });
  document.getElementById('emp-sort')?.addEventListener('change', e => { filter.sort = e.target.value; renderRows(); });
  document.getElementById('emp-more')?.addEventListener('click', () => {
    const adv = document.getElementById('emp-advanced');
    const btn = document.getElementById('emp-more');
    if (!adv) {return;}
    const hidden = adv.hasAttribute('hidden');
    if (hidden) {adv.removeAttribute('hidden');} else {adv.setAttribute('hidden','');}
    btn?.setAttribute('aria-expanded', hidden ? 'true' : 'false');
    const chev = btn?.querySelector('svg');
    if (chev) {chev.style.transform = hidden ? 'rotate(180deg)' : 'rotate(0deg)';}
  });
  // header click sorter
  root.querySelectorAll('th[data-sort]').forEach(th => {
    th.style.cursor = 'pointer';
    th.addEventListener('click', () => { filter.sort = th.dataset.sort; document.getElementById('emp-sort').value = filter.sort; renderRows(); });
  });
  document.getElementById('emp-select-all')?.addEventListener('change', e => {
    document.querySelectorAll('#emp-rows .row-cb').forEach(cb => { cb.checked = e.target.checked; });
  });
  document.getElementById('emp-export')?.addEventListener('click', e => {
    e.stopPropagation();
    openMenu(e.currentTarget, [
      { label: `${t('common.export')} CSV`, action: () => exportRows('csv', false) },
      { label: `${t('common.export')} Excel`, action: () => exportRows('xlsx', false) },
      '-', { label: currentLang()==='ar'?'تصدير المحدد (Excel)':'Export selected (Excel)', action: () => exportRows('xlsx', true) }
    ]);
  });
  document.getElementById('emp-import')?.addEventListener('click', () => {
    openImportModal({
      titleEn: 'Import employees (Excel / CSV)',
      titleAr: 'استيراد موظفين (Excel / CSV)',
      filename: 'employees',
      schema: IMPORT_SCHEMA,
      example: { code:'EMP-0101', nameEn:'Sample Name', nameAr:'اسم تجريبي', nat:'India', prof:'driver', dept:'OPS', join:'2026-01-05', basic:1800, housing:500, transport:300, iqama:'2000000101', iqamaExp:'2027-01-05', phone:'+966 555 010 101' },
      onImport: (rows) => {
        const mapped = rows.map(r=>({ code:r.code, nameEn:r.nameEn, nameAr:r.nameAr||r.nameEn, nat:r.nat, saudi:/^saudi/i.test(r.nat||''), prof:r.prof||'construction', dept:r.dept||'OPS', titleEn:'', titleAr:'', join:r.join||new Date().toISOString().slice(0,10), basic:Number(r.basic||0), housing:Number(r.housing||0), transport:Number(r.transport||0), iqama:r.iqama||'', iqamaExp:r.iqamaExp||'', iban:'', bank:'', q:'draft', st:'active', phone:r.phone||'', av:'primary', annualUsed:0 }));
        saveImportedRows('employees', mapped);
        populateFilters();
        renderRows();
        return mapped.length;
      }
    });
  });
  document.getElementById('emp-rows')?.addEventListener('click', e => {
    const btn = e.target.closest('[data-row-menu]');
    if (!btn) {return;}
    e.stopPropagation();
    const code = btn.dataset.code;
    openMenu(btn, [
      { label: currentLang()==='ar'?'فتح الملف':'Open file', action: () => { window.location.href = `employee.html?code=${code}`; } },
      { label: `${t('common.export')} CSV`, action: () => exportData('csv', code, EXPORT_COLS, getSeed('employees').filter(x=>x.code===code)) }
    ]);
  });
  window.addEventListener(LANG_EVENT, () => { populateFilters(); renderRows(); applyI18n(root); });
}
