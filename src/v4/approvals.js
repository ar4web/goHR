// HR + Operations — approvals queue (hr_approvals.html).
// Generic mobile-first queue over leave + timesheets (chains v1). Idempotent.

import { showToast } from './toast.js';
import { showModal } from './modal.js';
import { t, currentLang, LANG_EVENT, applyI18n } from './i18n.js';
import { fmtDate, initialsOf, L} from './hr-locale.js';
import { patchSeedRow, getSeed } from './hr-api.js';
import { exportData } from './import-export.js';
import { APPROVAL_CHAINS, ACTOR_ROLES, LEAVE_TYPES, SITES } from './hr-seed.js';

let booted = false;
let tab = 'queue';

function actor() {
  try {
    return localStorage.getItem('hr:actor-role') || 'manager';
  } catch (_e) {
    return 'manager';
  }
}

function setActor(role) {
  try {
    localStorage.setItem('hr:actor-role', role);
  } catch (_e) {
    /* ignore */
  }
}

function chain(flow) {
  return (APPROVAL_CHAINS.find(c => c.flow === flow) || { steps: [] }).steps;
}

function roleName(r) {
  return t(`role.${r}`);
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

function siteName(id) {
  const s = SITES.find(x => x.id === id);
  if (!s) {
    return id;
  }
  return currentLang() === 'ar' ? s.nameAr : s.nameEn;
}

function queue() {
  const items = [];
  for (const r of getSeed('leaveRequests')) {
    if (r.status !== 'pending') {
      continue;
    }
    items.push({
      flow: 'leave',
      id: r.id,
      title: `${typeName(r.type)} · ${r.days}${L('d', 'ي')}`,
      who: empName(r.emp),
      emp: r.emp,
      sub: `${fmtDate(r.from)} → ${fmtDate(r.to)}${r.note ? ` · ${r.note}` : ''}`,
      step: r.step || 0,
      row: r
    });
  }
  for (const x of getSeed('timesheets')) {
    if (x.status !== 'submitted') {
      continue;
    }
    const reg = (x.lines || []).reduce((s, l) => s + (l.regH || 0), 0);
    const ot = (x.lines || []).reduce((s, l) => s + (l.otH || 0), 0);
    items.push({
      flow: 'timesheet',
      id: x.id,
      title: `${siteName(x.site)} · ${L('week', 'أسبوع')} ${x.weekStart}`,
      who: `${(x.lines || []).length} ${L('workers', 'عامل')}`,
      emp: '',
      sub: `${L('Regular', 'أساسي')} ${reg}h · OT ${ot}h · ${L('by', 'بواسطة')} ${x.submittedBy || ''}`,
      step: x.step || 0,
      row: x
    });
  }
  return items;
}

function history() {
  const items = [];
  for (const r of getSeed('leaveRequests')) {
    if (r.status === 'pending' || r.status === 'cancelled') {
      continue;
    }
    items.push({
      flow: 'leave',
      id: r.id,
      title: `${typeName(r.type)} · ${empName(r.emp)}`,
      status: r.status,
      hist: r.history || []
    });
  }
  for (const x of getSeed('timesheets')) {
    if (x.status === 'submitted' || x.status === 'draft') {
      continue;
    }
    items.push({
      flow: 'timesheet',
      id: x.id,
      title: `${siteName(x.site)} · ${x.weekStart}`,
      status: x.status,
      hist: x.history || []
    });
  }
  return items;
}

function canAct(item) {
  const a = actor();
  if (a === 'admin') {
    return true;
  }
  return chain(item.flow)[item.step] === a;
}

function stepsHtml(item) {
  return chain(item.flow)
    .map((r, i) => {
      const cls = i < item.step ? 'green' : i === item.step ? 'yellow' : 'blue';
      return `<span class="status status-${cls}">${i + 1}. ${roleName(r)}</span>`;
    })
    .join(' ');
}

function renderTabs() {
  const el = document.getElementById('ap-tabs');
  if (!el) {
    return;
  }
  const q = queue().length;
  el.innerHTML = `
    <button type="button" class="hr-tab${tab === 'queue' ? ' active' : ''}" data-tab="queue">${L('Queue', 'القائمة')} (${q})</button>
    <button type="button" class="hr-tab${tab === 'history' ? ' active' : ''}" data-tab="history">${L('History', 'السجل')}</button>`;
  el.querySelectorAll('[data-tab]').forEach(b =>
    b.addEventListener('click', () => {
      tab = b.dataset.tab;
      renderAll();
    })
  );
}

function renderBody() {
  const el = document.getElementById('ap-body');
  if (!el) {
    return;
  }
  if (tab === 'history') {
    const items = history();
    el.innerHTML = items.length
      ? items
          .map(
            h => `
        <div class="card ap-card"><div class="card-body">
          <div class="hr-360-top">
            <div style="flex:1;min-width:0">
              <div class="cell-strong" dir="auto">${h.title}</div>
              <div style="font-size:11.5px;color:var(--text-muted)" dir="ltr">${h.id} · ${h.flow}</div>
            </div>
            <span class="status status-${h.status === 'approved' ? 'green' : 'red'}">${t(`status.${h.status}`)}</span>
          </div>
          ${(h.hist || []).map(s => `<div style="font-size:12px;color:var(--text-muted);margin-top:4px" dir="auto">${roleName(s.by)} · ${s.at} · ${s.decision}${s.note ? ` · ${s.note}` : ''}</div>`).join('')}
        </div></div>`
          )
          .join('')
      : `<div class="hr-empty">${t('common.noData')}</div>`;
    return;
  }
  const items = queue();
  el.innerHTML = items.length
    ? items
        .map(
          item => `
      <div class="card ap-card"><div class="card-body">
        <div class="hr-360-top">
          <div class="cell-avatar" style="width:40px;height:40px;font-size:14px;background:var(--avatar-teal);color:#fff">${initialsOf(item.who)}</div>
          <div style="flex:1;min-width:0">
            <div class="cell-strong" dir="auto">${item.title}</div>
            <div style="font-size:12px;color:var(--text-muted)" dir="auto">${item.who}</div>
            <div style="font-size:12px;margin-top:2px" dir="auto">${item.sub}</div>
          </div>
        </div>
        <div style="margin:10px 0;display:flex;gap:6px;flex-wrap:wrap">${stepsHtml(item)}</div>
        ${
          canAct(item)
            ? `<div class="ap-actions">
                <button class="btn btn-primary" data-ok="${item.flow}:${item.id}">${L('Approve', 'اعتماد')}</button>
                <button class="btn btn-outline" data-no="${item.flow}:${item.id}">${L('Reject', 'رفض')}</button>
              </div>`
            : `<div style="font-size:12px;color:var(--text-muted)">${L('Waiting for', 'بانتظار')}: ${roleName(chain(item.flow)[item.step] || '')}</div>`
        }
      </div></div>`
        )
        .join('')
    : `<div class="hr-empty">${L('Queue is clear. 🎉', 'القائمة فارغة. 🎉')}</div>`;
}

function renderAll() {
  const sel = document.getElementById('ap-actor');
  if (sel && !sel.options.length) {
    sel.innerHTML = ACTOR_ROLES.map(r => `<option value="${r}">${roleName(r)}</option>`).join('');
  }
  if (sel) {
    sel.value = actor();
  }
  renderTabs();
  renderBody();
  applyI18n(document.querySelector('[data-hr-approvals]') || document);
}

function openNoteModal(flow, id, decision) {
  const isLeave = flow === 'leave';
  showModal({
    title: `${decision === 'approved' ? L('Approve', 'اعتماد') : L('Reject', 'رفض')} · ${id}`,
    body: `<div class="form-group" style="margin-bottom:0"><label class="form-label" for="ap-note">${L('Note (optional)', 'ملاحظة (اختيارية)')}</label>
      <input class="form-control" id="ap-note"></div>`,
    actions: [
      { label: t('common.cancel'), variant: 'ghost' },
      {
        label: decision === 'approved' ? L('Approve', 'اعتماد') : L('Reject', 'رفض'),
        variant: decision === 'approved' ? 'primary' : 'outline',
        action: ({ body }) => {
          const note = body.querySelector('#ap-note').value.trim();
          const coll = isLeave ? 'leaveRequests' : 'timesheets';
          const row = getSeed(coll).find(x => x.id === id);
          if (!row) {
            return true;
          }
          const today = new Date().toISOString().slice(0, 10);
          const hist = (row.history || []).concat([{ by: actor(), at: today, decision, note }]);
          if (decision === 'rejected') {
            patchSeedRow(coll, row, { status: 'rejected', history: hist });
          } else {
            const next = (row.step || 0) + 1;
            if (next >= chain(flow).length) {
              patchSeedRow(coll, row, {
                status: 'approved',
                step: next,
                history: hist,
                approvedAt: today
              });
              sideEffects(flow, row);
            } else {
              patchSeedRow(coll, row, { step: next, history: hist });
            }
          }
          renderAll();
          showToast(
            decision === 'approved' ? L('Approved', 'تم الاعتماد') : L('Rejected', 'تم الرفض'),
            {
              variant: decision === 'approved' ? 'success' : 'info'
            }
          );
          return true;
        }
      }
    ]
  });
}

function sideEffects(flow, row) {
  if (flow === 'leave') {
    const e = getSeed('employees').find(x => x.code === row.emp);
    if (!e) {
      return;
    }
    if (row.type === 'annual') {
      patchSeedRow('employees', e, { annualUsed: (e.annualUsed || 0) + (row.days || 0) });
    }
    if (row.type === 'sick') {
      patchSeedRow('employees', e, { sickUsed: (e.sickUsed || 0) + (row.days || 0) });
    }
  }
}

export function initApprovals() {
  const root = document.querySelector('[data-hr-approvals]');
  if (!root) {
    return;
  }
  renderAll();
  if (booted) {
    return;
  }
  booted = true;
  document.getElementById('ap-actor')?.addEventListener('change', e => {
    setActor(e.target.value);
    renderAll();
  });
  document.getElementById('ap-body')?.addEventListener('click', e => {
    const okBtn = e.target.closest('[data-ok]');
    const noBtn = e.target.closest('[data-no]');
    if (okBtn) {
      const [flow, id] = okBtn.dataset.ok.split(':');
      openNoteModal(flow, id, 'approved');
    } else if (noBtn) {
      const [flow, id] = noBtn.dataset.no.split(':');
      openNoteModal(flow, id, 'rejected');
    }
  });
  document.getElementById('ap-export')?.addEventListener('click', () => {
    exportData(
      'xlsx',
      'approvals-queue',
      [
        { key: 'flow', label: 'Flow' },
        { key: 'id', label: 'Ref' },
        { key: 'title', label: 'Title' },
        { key: 'who', label: 'Who' },
        { key: 'step', label: 'Step' }
      ],
      queue(),
      'Queue'
    );
  });
  window.addEventListener(LANG_EVENT, renderAll);
}
