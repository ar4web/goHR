// User management (admin) — create accounts, assign the account type via
// login-ID prefix + role, enable/disable, reset passwords, delete.
// Server-enforced: users.read (admin/manager) and users.write (admin only).
import { t, currentLang, applyI18n } from './i18n.js';
import { getSession, api, destFor } from './session.js';
import { showToast } from './toast.js';
import { showModal } from './modal.js';
import { escapeHtml as esc } from './markup.js';

const ROLE_CLASS = { admin: 'active', manager: '', employee: '', vendor: '' };

function guard() {
  const s = getSession();
  const role = s && s.user && s.user.role;
  if (!s || !s.refreshToken) {
    window.location.replace('login.html');
    return null;
  }
  if (role !== 'admin' && role !== 'manager') {
    window.location.replace(destFor(s.user));
    return null;
  }
  return { session: s, canWrite: role === 'admin' };
}

const roleChip = (role) => `<span class="chip ${ROLE_CLASS[role] || ''}">${esc(role)}</span>`;
const statusChip = (status) => `<span class="chip ${status === 'active' ? '' : 'active'}">${esc(status === 'active' ? t('um.active') : t('um.disabled'))}</span>`;

// client-side search + role filter state
const FILTER = { q: '', role: 'all' };

function renderRoleChips(rows) {
  const host = document.getElementById('um-roles');
  if (!host) {return;}
  const counts = { all: rows.length };
  for (const r of rows) {counts[r.role] = (counts[r.role] || 0) + 1;}
  const order = ['all', 'admin', 'manager', 'employee', 'vendor'];
  host.innerHTML = order
    .filter(k => counts[k])
    .map(k => `<button class="chip um-role-chip${FILTER.role === k ? ' active' : ''}" type="button" data-um-role="${k}">${esc(k === 'all' ? t('um.all') : t(k === 'vendor' ? 'auth.roleVendor' : `um.role${k[0].toUpperCase()}${k.slice(1)}`))} · ${counts[k]}</button>`)
    .join('');
  host.querySelectorAll('[data-um-role]').forEach(b => {
    b.addEventListener('click', () => {
      FILTER.role = b.dataset.umRole;
      applyFilter(ctx0.rows);
    });
  });
}

function applyFilter(rows) {
  const q = FILTER.q.trim().toLowerCase();
  const filtered = rows.filter(u =>
    (FILTER.role === 'all' || u.role === FILTER.role) &&
    (!q || [u.loginId, u.nameEn, u.nameAr, u.email, u.phone].some(v => String(v || '').toLowerCase().includes(q))));
  renderRows(filtered);
  renderRoleChips(rows);
}

async function loadRows(ctx) {
  ctx0 = ctx;
  const r = await api('GET', '/api/admin/users');
  const body = document.getElementById('um-rows');
  if (!r.ok) {
    body.innerHTML = `<tr><td colspan="6"><span class="caption-muted">${esc(t('um.loadErr'))} (${r.status})</span></td></tr>`;
    return;
  }
  ctx.rows = r.data.rows;
  applyFilter(ctx.rows);
}

function renderRows(rows) {
  const ctx = ctx0;
  const body = document.getElementById('um-rows');
  const ar = currentLang() === 'ar';
  body.innerHTML = rows.map((u) => `
    <tr>
      <td class="cell-mono">${esc(u.loginId)}</td>
      <td>${esc(ar && u.nameAr ? u.nameAr : u.nameEn)}<div class="caption-muted" style="font-size:11px">${esc(u.email || '')}</div></td>
      <td>${roleChip(u.role)}</td>
      <td class="cell-mono">${esc(u.phone || '—')}</td>
      <td>${statusChip(u.status)}</td>
      <td style="text-align:end">
        ${ctx.canWrite ? `
        <button class="btn btn-outline btn-sm" data-um-edit="${esc(u.id)}">${esc(t('um.edit'))}</button>
        <button class="btn btn-outline btn-sm" data-um-toggle="${esc(u.id)}" data-status="${esc(u.status)}">${u.status === 'active' ? esc(t('um.disable')) : esc(t('um.enable'))}</button>
        <button class="btn btn-outline btn-sm" data-um-reset="${esc(u.id)}">${esc(t('um.resetPw'))}</button>
        <button class="btn btn-ghost btn-sm" data-um-del="${esc(u.id)}" aria-label="Delete">${esc(t('common.delete'))}</button>` : ''}
      </td>
    </tr>`).join('');

  body.querySelectorAll('[data-um-toggle]').forEach(b => {
    b.addEventListener('click', async () => {
      const next = b.dataset.status === 'active' ? 'disabled' : 'active';
      const out = await api('PUT', `/api/admin/users/${b.dataset.umToggle}`, { status: next });
      if (!out.ok) {return showToast(t(out.data.error === 'cannot_disable_self' ? 'um.errSelf' : 'um.err'), { variant: 'error' });}
      showToast(t('um.saved'), { variant: 'success' });
      loadRows(ctx);
    });
  });
  body.querySelectorAll('[data-um-edit]').forEach(b => {
    b.addEventListener('click', () => editModal(ctx, ctx.rows.find(x => x.id === b.dataset.umEdit)));
  });
  body.querySelectorAll('[data-um-reset]').forEach(b => {
    b.addEventListener('click', () => resetPwModal(ctx, b.dataset.umReset));
  });
  body.querySelectorAll('[data-um-del]').forEach(b => {
    b.addEventListener('click', async () => {
      if (!window.confirm(t('um.confirmDel'))) {return;}
      const out = await api('DELETE', `/api/admin/users/${b.dataset.umDel}`);
      if (!out.ok) {return showToast(t(out.data.error === 'cannot_delete_self' ? 'um.errSelf' : 'um.err'), { variant: 'error' });}
      showToast(t('um.saved'), { variant: 'success' });
      loadRows(ctx);
    });
  });
}

function addModal(ctx) {
  showModal({
    title: t('um.add'),
    size: 'md',
    body: `
      <label class="modal-form-row"><span>${esc(t('um.loginId'))}</span><input class="form-control" id="um-f-loginid" placeholder="EMP-014"></label>
      <div class="caption-muted" style="margin:-6px 0 8px">${esc(t('um.prefixHint'))}</div>
      <label class="modal-form-row"><span>${esc(t('um.nameEn'))}</span><input class="form-control" id="um-f-nameen"></label>
      <label class="modal-form-row"><span>${esc(t('um.nameAr'))}</span><input class="form-control" id="um-f-namear"></label>
      <label class="modal-form-row"><span>${esc(t('um.role'))}</span>
        <select class="form-control" id="um-f-role">
          <option value="employee">${esc(t('um.roleEmployee'))}</option>
          <option value="manager">${esc(t('um.roleManager'))}</option>
          <option value="admin">${esc(t('um.roleAdmin'))}</option>
          <option value="vendor">${esc(t('um.roleVendor'))}</option>
        </select>
      </label>
      <label class="modal-form-row"><span>${esc(t('um.phone'))}</span><input class="form-control" id="um-f-phone" placeholder="+9665…"></label>
      <label class="modal-form-row"><span>Iqama</span><input class="form-control" id="um-f-iqama" placeholder="2XXXXXXXXX"></label>
      <label class="modal-form-row"><span>Email</span><input class="form-control" id="um-f-email" type="email"></label>
      <label class="modal-form-row"><span>${esc(t('auth.password'))}</span><input class="form-control" id="um-f-pw" type="password" placeholder="≥ 6"></label>`,
    actions: [
      { label: t('common.cancel'), variant: 'ghost' },
      {
        label: t('common.save'), variant: 'primary',
        action: async ({ dialog }) => {
          const val = (id) => dialog.querySelector(`#${id}`).value.trim();
          const payload = {
            loginId: val('um-f-loginid'), nameEn: val('um-f-nameen'), nameAr: val('um-f-namear'),
            role: dialog.querySelector('#um-f-role').value, phone: val('um-f-phone'),
            iqama: val('um-f-iqama'), email: val('um-f-email'), password: dialog.querySelector('#um-f-pw').value
          };
          const out = await api('POST', '/api/admin/users', payload);
          if (!out.ok) {
            const key = { invalid_login_id: 'um.prefixHint', login_id_taken: 'um.errTaken', password_too_short: 'um.errPw', invalid_iqama_format: 'auth.errIqamaFormat' }[out.data.error] || 'um.err';
            showToast(t(key), { variant: 'error' });
            return false;
          }
          showToast(t('um.saved'), { variant: 'success' });
          loadRows(ctx);
          return true;
        }
      }
    ]
  });
}

function editModal(ctx, u) {
  if (!u) {return;}
  showModal({
    title: `${t('um.edit')} · ${u.loginId}`,
    size: 'md',
    body: `
      <div class="set-row"><span class="cell-strong">${esc(t('um.loginId'))}</span><span class="cell-mono">${esc(u.loginId)}</span></div>
      <label class="modal-form-row"><span>${esc(t('um.role'))}</span>
        <select class="form-control" id="um-e-role">
          <option value="employee"${u.role === 'employee' ? ' selected' : ''}>${esc(t('um.roleEmployee'))}</option>
          <option value="manager"${u.role === 'manager' ? ' selected' : ''}>${esc(t('um.roleManager'))}</option>
          <option value="admin"${u.role === 'admin' ? ' selected' : ''}>${esc(t('um.roleAdmin'))}</option>
          <option value="vendor"${u.role === 'vendor' ? ' selected' : ''}>${esc(t('um.roleVendor'))}</option>
        </select>
      </label>
      <label class="modal-form-row"><span>${esc(t('um.nameEn'))}</span><input class="form-control" id="um-e-nameen" value="${esc(u.nameEn)}"></label>
      <label class="modal-form-row"><span>${esc(t('um.nameAr'))}</span><input class="form-control" id="um-e-namear" value="${esc(u.nameAr)}"></label>
      <label class="modal-form-row"><span>${esc(t('um.phone'))}</span><input class="form-control" id="um-e-phone" value="${esc(u.phone)}"></label>
      <label class="modal-form-row"><span>Iqama</span><input class="form-control" id="um-e-iqama" value="${esc(u.iqama || '')}"></label>
      <label class="modal-form-row"><span>Email</span><input class="form-control" id="um-e-email" type="email" value="${esc(u.email)}"></label>`,
    actions: [
      { label: t('common.cancel'), variant: 'ghost' },
      {
        label: t('common.save'), variant: 'primary',
        action: async ({ dialog }) => {
          const val = (id) => dialog.querySelector(`#${id}`).value.trim();
          const out = await api('PUT', `/api/admin/users/${u.id}`, {
            role: dialog.querySelector('#um-e-role').value,
            nameEn: val('um-e-nameen'), nameAr: val('um-e-namear'),
            phone: val('um-e-phone'), iqama: val('um-e-iqama'), email: val('um-e-email')
          });
          if (!out.ok) {
            showToast(t(out.data.error === 'invalid_iqama_format' ? 'auth.errIqamaFormat' : 'um.err'), { variant: 'error' });
            return false;
          }
          showToast(t('um.saved'), { variant: 'success' });
          loadRows(ctx);
          return true;
        }
      }
    ]
  });
}

let ctx0 = { rows: [] };

function resetPwModal(ctx, id) {
  showModal({
    title: t('um.resetPw'),
    size: 'sm',
    body: `<label class="modal-form-row"><span>${esc(t('auth.password'))}</span><input class="form-control" id="um-r-pw" type="password" placeholder="≥ 6"></label>`,
    actions: [
      { label: t('common.cancel'), variant: 'ghost' },
      {
        label: t('common.save'), variant: 'primary',
        action: async ({ dialog }) => {
          const pw = dialog.querySelector('#um-r-pw').value;
          const out = await api('PUT', `/api/admin/users/${id}`, { password: pw });
          if (!out.ok) {showToast(t(out.data.error === 'password_too_short' ? 'um.errPw' : 'um.err'), { variant: 'error' }); return false;}
          showToast(t('um.saved'), { variant: 'success' });
          return true;
        }
      }
    ]
  });
}

// ── security card (policy + geofence = admin; change-my-password = all) ──
function wireSecurity(ctx) {
  const el = (id) => document.getElementById(id);
  if (ctx.canWrite) {
    api('GET', '/api/security/policy').then((r) => {
      if (!r.ok) {return;}
      if (el('sec-pwmin')) {el('sec-pwmin').value = r.data.passwordMinLength || 6;}
      const tg = el('sec-signup');
      if (tg) {
        tg.classList.toggle('on', !!r.data.selfSignup);
        tg.setAttribute('aria-checked', r.data.selfSignup ? 'true' : 'false');
      }
    });
    api('GET', '/api/geofence').then((r) => {
      if (!r.ok) {return;}
      if (el('sec-countries')) {el('sec-countries').value = (r.data.allowedCountries || []).join(', ');}
      if (el('sec-failmode')) {el('sec-failmode').value = r.data.failMode || 'open';}
    });
    el('sec-pw-save')?.addEventListener('click', async () => {
      const r = await api('PUT', '/api/security/policy', { passwordMinLength: Number(el('sec-pwmin').value) });
      showToast(r.ok ? t('sec.saved') : t('um.err'), { variant: r.ok ? 'success' : 'error' });
    });
    el('sec-signup')?.addEventListener('click', async () => {
      const next = !el('sec-signup').classList.contains('on');
      const r = await api('PUT', '/api/security/policy', { selfSignup: next });
      if (r.ok) {
        el('sec-signup').classList.toggle('on', next);
        el('sec-signup').setAttribute('aria-checked', next ? 'true' : 'false');
        showToast(t('sec.saved'), { variant: 'success' });
      } else {
        showToast(t('um.err'), { variant: 'error' });
      }
    });
    el('sec-geo-save')?.addEventListener('click', async () => {
      const list = el('sec-countries').value.split(',').map(x => x.trim().toUpperCase()).filter(Boolean);
      const r = await api('PUT', '/api/geofence', { allowedCountries: list, failMode: el('sec-failmode').value });
      showToast(r.ok ? t('sec.saved') : t('um.err'), { variant: r.ok ? 'success' : 'error' });
    });
  } else {
    document.getElementById('sec-admin')?.remove();
  }
  el('sec-chpw')?.addEventListener('click', async () => {
    const r = await api('POST', '/auth/change-password', { currentPassword: el('sec-cur').value, newPassword: el('sec-new').value });
    if (!r.ok) {
      const key = { wrong_current_password: 'sec.errCurrent', password_too_short: 'um.errPw' }[r.data.error] || 'um.err';
      return showToast(t(key), { variant: 'error' });
    }
    el('sec-cur').value = '';
    el('sec-new').value = '';
    showToast(t('sec.pwChanged'), { variant: 'success' });
  });
}

async function wireDatabase() {
  const card = document.getElementById('db-card');
  if (!card) {return;}
  const r = await api('GET', '/api/system/db');
  if (!r.ok) {return;} // non-admins: the card stays hidden
  const q = (id) => document.getElementById(id);
  q('db-driver').textContent = r.data.driver === 'sqlite' ? t('db.sqlite') : 'JSON';
  q('db-file').textContent = r.data.file || '—';
  q('db-integrity').textContent = r.data.integrity || '—';
  if (r.data.integrity === 'ok') {q('db-badge').hidden = false;}
  const rows = r.data.rows || {};
  q('db-rows').textContent = (rows.users || 0) + ' ' + t('db.users') + ' · ' + (rows.sessions || 0) + ' ' + t('db.sessions') + ' · ' + (rows.logs || 0) + ' ' + t('db.audit');
  card.hidden = false;
}

export function initUsers() {
  const ctx = guard();
  if (!ctx) {return;}
  document.getElementById('um-add')?.addEventListener('click', () => addModal(ctx));
  const search = document.getElementById('um-search');
  if (search) {
    search.placeholder = t('um.search');
    search.addEventListener('input', () => {
      FILTER.q = search.value;
      applyFilter(ctx.rows || []);
    });
  }
  loadRows(ctx);
  wireSecurity(ctx);
  wireDatabase();
  applyI18n();
}
