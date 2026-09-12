// HR + Operations — live compliance alerts for the topbar bell.
// Same expiry sources as reports §5: Iqama ≤60d, contracts ≤90d, Ajeer
// permits ≤60d. Most urgent first, capped at 8. Alerts are sticky live
// state: they clear when the underlying expiry is resolved, not when
// "mark all read" is pressed.

import { currentLang } from './i18n.js';
import { getSeed } from './hr-api.js';
import { daysUntil } from './hr-statutory.js';

function L(en, ar) {
  return currentLang() === 'ar' ? ar : en;
}

function empName(e) {
  return currentLang() === 'ar' ? e.nameAr || e.nameEn : e.nameEn;
}

export function hrAlerts() {
  const out = [];
  try {
    const active = getSeed('employees').filter(e => e.st === 'active');
    for (const e of active.filter(x => !x.saudi && x.iqamaExp)) {
      const d = daysUntil(e.iqamaExp);
      if (d <= 60) {
        out.push({
          d,
          kind: 'alert',
          sticky: true,
          from: L('Iqama expiring', 'الإقامة تنتهي'),
          text: `${e.code} · ${empName(e)}`,
          href: 'hr_residency.html'
        });
      }
    }
    for (const c of getSeed('contracts').filter(x => x.status === 'active' && x.end)) {
      const d = daysUntil(c.end);
      if (d <= 90) {
        out.push({
          d,
          kind: 'alert',
          sticky: true,
          from: L('Contract expiring', 'العقد ينتهي'),
          text: `${c.id} · ${c.party}`,
          href: `hr_contract.html?id=${c.id}`
        });
      }
    }
    for (const p of getSeed('ajeerPermits').filter(x => x.status === 'active' && x.exp)) {
      const d = daysUntil(p.exp);
      if (d <= 60) {
        out.push({
          d,
          kind: 'alert',
          sticky: true,
          from: L('Ajeer expiring', 'تصريح أجير ينتهي'),
          text: `${p.no} · ${p.emp}`,
          href: 'hr_ajeer.html'
        });
      }
    }
  } catch (_e) {
    return [];
  }
  out.sort((a, b) => a.d - b.d);
  return out.slice(0, 8).map(({ d, ...r }) => ({
    ...r,
    unread: true,
    time:
      d < 0
        ? L(`Expired ${-d}d ago`, `منتهٍ منذ ${-d} يوم`)
        : d === 0
          ? L('Expires today', 'ينتهي اليوم')
          : L(`${d}d left`, `متبقٍ ${d} يوم`)
  }));
}
