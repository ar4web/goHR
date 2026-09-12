// HR + Operations — hiring pipeline board (hr_pipeline.html).
// Stage columns with explicit move buttons (mobile-first; no drag-drop).
// Moves share candidates.js rules — hired needs an accepted offer.

import { showToast } from './toast.js';
import { currentLang, LANG_EVENT, applyI18n } from './i18n.js';
import { getSeed } from './hr-api.js';
import { moveCandidate, stageLabel, STAGES } from './candidates.js';

let booted = false;

function L(en, ar) {
  return currentLang() === 'ar' ? ar : en;
}

function jobTitle(id) {
  const j = getSeed('jobs').find(x => x.id === id);
  return j ? (currentLang() === 'ar' ? j.titleAr || j.titleEn : j.titleEn) : id;
}

function renderAll() {
  const board = document.getElementById('pl-board');
  if (board) {
    const cols = [...STAGES, 'rejected'];
    board.innerHTML = cols
      .map(st => {
        const cards = getSeed('candidates').filter(c => c.stage === st);
        return `<div class="pl-col">
        <div class="pl-head"><strong>${stageLabel(st)}</strong><span class="status status-blue" dir="ltr">${cards.length}</span></div>
        <div class="pl-cards">${
          cards
            .map(c => {
              const i = STAGES.indexOf(c.stage);
              return `<div class="pl-card">
            <div><strong>${currentLang() === 'ar' ? c.nameAr || c.nameEn : c.nameEn}</strong></div>
            <div style="font-size:11.5px;color:var(--text-muted)" dir="ltr">${c.id} · ${c.job}</div>
            <div style="font-size:11.5px">${c.nat} · ${jobTitle(c.job)}</div>
            <div style="display:flex;gap:6px;margin-top:6px;flex-wrap:wrap">
              ${
                c.stage === 'rejected'
                  ? `<button class="btn btn-outline btn-sm" data-to="new" data-id="${c.id}">${L('Reopen', 'إعادة فتح')}</button>`
                  : `${i > 0 ? `<button class="btn btn-outline btn-sm" data-to="${STAGES[i - 1]}" data-id="${c.id}">→</button>` : ''}
                ${i < STAGES.length - 1 ? `<button class="btn btn-outline btn-sm" data-to="${STAGES[i + 1]}" data-id="${c.id}">←</button>` : ''}
                <button class="btn btn-outline btn-sm" data-to="rejected" data-id="${c.id}">✕</button>`
              }
            </div>
          </div>`;
            })
            .join('') || '<div class="hr-empty">—</div>'
        }</div>
      </div>`;
      })
      .join('');
  }
  applyI18n(document.querySelector('[data-hr-pipeline]') || document);
}

export function initPipeline() {
  const root = document.querySelector('[data-hr-pipeline]');
  if (!root) {
    return;
  }
  renderAll();
  if (booted) {
    return;
  }
  booted = true;
  document.getElementById('pl-board')?.addEventListener('click', e => {
    const b = e.target.closest('[data-to]');
    if (!b) {
      return;
    }
    const r = moveCandidate(b.dataset.id, b.dataset.to);
    if (!r.ok && r.msg) {
      showToast(r.msg, { variant: 'warning' });
    }
    renderAll();
  });
  window.addEventListener(LANG_EVENT, renderAll);
}
