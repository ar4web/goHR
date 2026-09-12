// HR + Operations — shared contract placeholder values (P5).
// Auto-fills {{placeholders}} from records (no retyping); manual entries win.

import { getSeed } from './hr-api.js';
import { sellerProfile } from './hr-statutory.js';

export function seller() {
  const s = sellerProfile();
  return { nameEn: s.nameEn, nameAr: s.nameAr, cr: s.cr, vat: s.vat };
}

export function templateByCode(code) {
  return getSeed('templates').find(t => t.code === code);
}

function wageTotalOf(e) {
  return (Number(e?.basic) || 0) + (Number(e?.housing) || 0) + (Number(e?.transport) || 0);
}

function idNoOf(e) {
  if (!e) {
    return '';
  }
  return e.saudi ? e.nid || '' : e.iqama || '';
}

export function partyContext(tpl, partyId) {
  const ctx = {};
  if (!tpl || !partyId) {
    return ctx;
  }
  if (tpl.party === 'employee') {
    ctx.employee = getSeed('employees').find(e => e.code === partyId);
  } else if (tpl.party === 'candidate') {
    ctx.candidate = getSeed('candidates').find(c => c.id === partyId);
    if (ctx.candidate?.job) {
      ctx.job = getSeed('jobs').find(j => j.id === ctx.candidate.job);
    }
  } else if (tpl.party === 'client') {
    ctx.client = getSeed('clients').find(c => c.id === partyId);
  } else if (tpl.party === 'assignment') {
    ctx.assignment = getSeed('assignments').find(a => a.id === partyId);
    if (ctx.assignment) {
      ctx.employee = getSeed('employees').find(e => e.code === ctx.assignment.emp);
      ctx.client = getSeed('clients').find(c => c.id === ctx.assignment.client);
      ctx.site = getSeed('sites').find(s => s.id === ctx.assignment.site);
    }
  }
  return ctx;
}

// Dotted source paths used by template field defs.
export function resolveSource(source, ctx) {
  if (!source) {
    return '';
  }
  if (source === 'today') {
    return new Date().toISOString().slice(0, 10);
  }
  const parts = String(source).split('.');
  let cur = { ...ctx, company: seller() };
  for (const p of parts) {
    cur = cur?.[p];
    if (cur === undefined) {
      return '';
    }
  }
  return cur === null ? '' : cur;
}

export function buildValues(tpl, partyId, manual = {}) {
  const s = seller();
  const ctx = partyContext(tpl, partyId);
  const v = {
    company_en: s.nameEn,
    company_ar: s.nameAr,
    company_cr: s.cr,
    company_vat: s.vat || '',
    today_date: new Date().toISOString().slice(0, 10),
    issuer_name: 'Abdullah Al-Otaibi',
    issuer_title: 'HR Manager'
  };
  const e = ctx.employee;
  if (e) {
    v.worker_name = e.nameEn;
    v.worker_name_ar = e.nameAr;
    v.id_no = idNoOf(e);
    v.nationality = e.nat;
    v.job_title = e.titleEn;
    v.job_title_ar = e.titleAr;
    v.wage_basic = e.basic;
    v.wage_housing = e.housing;
    v.wage_transport = e.transport;
    v.wage_total = wageTotalOf(e);
    v.salary_total = wageTotalOf(e);
    v.start_date = e.join;
  }
  const c = ctx.candidate;
  if (c) {
    v.worker_name = c.nameEn;
    v.worker_name_ar = c.nameAr;
    v.nationality = c.nat;
    v.id_no = c.passport || '';
    if (ctx.job) {
      v.job_title = ctx.job.titleEn;
      v.job_title_ar = ctx.job.titleAr;
    }
  }
  const cl = ctx.client;
  if (cl) {
    v.client_name = cl.nameEn;
    v.client_name_ar = cl.nameAr;
    v.client_cr = cl.cr;
  }
  if (ctx.site) {
    v.site_name = ctx.site.nameEn;
  }
  if (ctx.assignment) {
    v.assignment_ref = ctx.assignment.id;
    v.ajeer_ref = ctx.assignment.ajeer || '';
  }
  const out = { ...v, ...manual };
  if (
    manual.wage_basic !== undefined ||
    manual.wage_housing !== undefined ||
    manual.wage_transport !== undefined
  ) {
    const b = Number(out.wage_basic) || 0;
    const h = Number(out.wage_housing) || 0;
    const tr = Number(out.wage_transport) || 0;
    out.wage_total = b + h + tr;
  }
  return out;
}

export function partyLabel(tpl, partyId) {
  const ctx = partyContext(tpl, partyId);
  if (ctx.employee) {
    return `${ctx.employee.code} — ${ctx.employee.nameEn}`;
  }
  if (ctx.candidate) {
    return `${ctx.candidate.id} — ${ctx.candidate.nameEn}`;
  }
  if (ctx.client) {
    return `${ctx.client.id} — ${ctx.client.nameEn}`;
  }
  if (ctx.assignment) {
    return ctx.assignment.id;
  }
  return partyId || '—';
}
