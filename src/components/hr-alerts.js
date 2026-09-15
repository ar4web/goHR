// goHR — live people alerts for the topbar bell.
// Iqama expiries (≤60d) across active employees. Most urgent first, capped
// at 8. Alerts are sticky live state: they clear when the underlying expiry
// is resolved, not when "mark all read" is pressed.

import { currentLang } from './i18n.js';
import { L } from './hr-locale.js';
import { getSeed } from './hr-api.js';
import { daysUntil } from './hr-statutory.js';

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
          href: 'employees.html'
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
