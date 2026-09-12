// HR + Operations — audit trail helper (P6).
// Seed history + locally appended entries. Full cross-module coverage and
// tamper-proofing are backend scope; P6 modules log their key mutations here.

import { getSeed } from './hr-api.js';

const KEY = 'hr:audit';

export function currentActor() {
  try {
    return localStorage.getItem('hr:my-code') || getSeed('employees')[0].code;
  } catch (_e) {
    return 'EMP-0001';
  }
}

export function storedEntries() {
  try {
    const rows = JSON.parse(localStorage.getItem(KEY) || '[]');
    return Array.isArray(rows) ? rows : [];
  } catch (_e) {
    return [];
  }
}

export function getAudit() {
  return [...getSeed('auditLog'), ...storedEntries()].sort((a, b) =>
    String(b.at).localeCompare(String(a.at))
  );
}

export function logAudit(action, entity = '', detail = '') {
  const rows = storedEntries();
  const id = `AU-2026-${String(100 + rows.length + 1).padStart(3, '0')}`;
  rows.push({
    id,
    at: new Date().toISOString().slice(0, 19),
    actor: currentActor(),
    action,
    entity,
    detail
  });
  try {
    localStorage.setItem(KEY, JSON.stringify(rows));
  } catch (_e) {
    /* ignore */
  }
  return id;
}
