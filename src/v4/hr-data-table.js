// Generic data table view — lazy-loaded by main-v4.js for new data pages.
// Reads data from hr-api.js seedAdapter and renders a sortable, filterable
// table with EN/AR name columns, export button, and status badges.

import { getSeed } from './hr-api.js';
import { t, currentLang, LANG_EVENT } from './i18n.js';
import { renderEchart } from './chart-helper.js';
import { L } from './hr-locale.js';
import { showToast } from './toast.js';

export function initDataTable(pageKey) {
  const root = document.querySelector(`[data-${pageKey}]`);
  if (!root) {
    return;
  }
  let booted = false;

  const configMap = {
    'hr-bank-accounts': { seed: 'bankAccounts', labelEn: 'Bank Accounts', labelAr: 'الحسابات البنكية', columns: ['bank', 'iban', 'accountNumber', 'isDefault'] },
    'hr-dependents': { seed: 'dependents', labelEn: 'Dependents', labelAr: 'أفراد العائلة', columns: ['nameEn', 'nameAr', 'relationship', 'dob', 'nationality'] },
    'hr-qualifications': { seed: 'qualifications', labelEn: 'Qualifications', labelAr: 'المؤهلات', columns: ['degree', 'institution', 'field', 'gradDate'] },
    'hr-emergency-contacts': { seed: 'emergencyContacts', labelEn: 'Emergency Contacts', labelAr: 'جهات الاتصال الطارئة', columns: ['contactName', 'relationship', 'phone'] },
    'hr-warnings': { seed: 'warnings', labelEn: 'Warnings', labelAr: 'تحذيرات', columns: ['warningType', 'severity', 'warningDate', 'descriptionEn'] },
    'hr-achievements': { seed: 'achievements', labelEn: 'Achievements', labelAr: 'الإنجازات', columns: ['achievementType', 'awardName', 'achievementDate'] },
    'hr-promotions': { seed: 'promotions', labelEn: 'Promotions', labelAr: 'الترقيات', columns: ['fromTitleEn', 'toTitleEn', 'promotionDate', 'toSalary'] },
    'hr-attendance-policies': { seed: 'attendancePolicies', labelEn: 'Attendance Policies', labelAr: 'سياسات الحضور', columns: ['en', 'standardHoursPerDay', 'isActive'] },
    'hr-attendance-locations': { seed: 'attendanceLocations', labelEn: 'Locations', labelAr: 'المواقع', columns: ['en', 'lat', 'lng', 'isActive'] },
    'hr-attendance-devices': { seed: 'attendanceDevices', labelEn: 'Devices', labelAr: 'الأجهزة', columns: ['deviceId', 'deviceType', 'isActive'] },
    'hr-attendance-exceptions': { seed: 'attendanceExceptions', labelEn: 'Exceptions', labelAr: 'الاستثناءات', columns: ['exceptionType', 'status', 'date'] },
    'hr-approval-workflows': { seed: 'approvalWorkflows', labelEn: 'Approval Workflows', labelAr: 'مسارات الاعتماد', columns: ['nameEn', 'approvalType', 'isActive'] },
    'hr-approval-requests': { seed: 'approvalRequests', labelEn: 'Requests', labelAr: 'الطلبات', columns: ['entityType', 'status', 'createdAt'] },
    'hr-system-notifications': { seed: 'systemNotifications', labelEn: 'Notifications', labelAr: 'الإشعارات', columns: ['titleEn', 'priority', 'isRead', 'createdAt'] },
    'hr-system-alerts': { seed: 'systemAlerts', labelEn: 'Alerts', labelAr: 'التنبيهات', columns: ['alertType', 'severity', 'isResolved'] },
    'hr-countries': { seed: 'countries', labelEn: 'Countries', labelAr: 'الدول', columns: ['code', 'nameEn', 'nameAr', 'currency', 'isActive'] },
    'hr-currencies': { seed: 'currencies', labelEn: 'Currencies', labelAr: 'العملات', columns: ['code', 'nameEn', 'symbol', 'isActive'] },
    'hr-work-permits': { seed: 'workPermits', labelEn: 'Work Permits', labelAr: 'تصاريح العمل', columns: ['permitNumber', 'status', 'expiryDate'] },
    'hr-leaves-balances': { seed: 'leavesBalances', labelEn: 'Leaves Balances', labelAr: 'أرصدة الإجازات', columns: ['annualEntitlement', 'annualUsed', 'annualPending'] },
    'hr-job-requisitions': { seed: 'jobRequisitions', labelEn: 'Job Requisitions', labelAr: 'طلبات التوظيف', columns: ['titleEn', 'department', 'status'] },
    'hr-training-programs': { seed: 'trainingPrograms', labelEn: 'Training Programs', labelAr: 'برامج التدريب', columns: ['nameEn', 'type', 'isActive'] },
'hr-payroll-components': { seed: 'payrollComponents', labelEn: 'Components', labelAr: 'مكونات الرواتب', columns: ['code', 'en', 'type', 'isActive'] }
};

  const config = configMap[pageKey];
  if (!config) {
    return;
  }

  function renderTable(data) {
    const colMap = {
      en: 'nameEn', ar: 'nameAr', bank: 'bank', iban: 'iban',
      accountNumber: 'accountNumber', isDefault: 'isDefault',
      nameEn: 'nameEn', nameAr: 'nameAr', relationship: 'relationship',
      dob: 'dob', nationality: 'nationality', degree: 'degree',
      institution: 'institution', field: 'field', gradDate: 'gradDate',
      contactName: 'contactName', phone: 'phone', warningType: 'warningType',
      severity: 'severity', warningDate: 'warningDate', descriptionEn: 'descriptionEn',
      achievementType: 'achievementType', awardName: 'awardName',
      achievementDate: 'achievementDate', fromTitleEn: 'fromTitleEn',
      toTitleEn: 'toTitleEn', promotionDate: 'promotionDate', toSalary: 'toSalary',
      standardHoursPerDay: 'standardHoursPerDay', isActive: 'isActive',
      lat: 'lat', lng: 'lng', deviceId: 'deviceId', deviceType: 'deviceType',
      exceptionType: 'exceptionType', status: 'status', date: 'date',
      approvalType: 'approvalType', entityType: 'entityType',
      createdAt: 'createdAt', titleEn: 'titleEn', priority: 'priority',
      isRead: 'isRead', code: 'code', currency: 'currency',
      permitNumber: 'permitNumber', expiryDate: 'expiryDate',
      annualEntitlement: 'annualEntitlement', annualUsed: 'annualUsed',
      annualPending: 'annualPending', department: 'department',
type: 'type', labelEn: 'labelEn', labelAr: 'labelAr'
};

    const seed = getSeed(config.seed);
    if (!seed || !seed.length) {
      root.innerHTML = '<div class="card"><div class="card-body" style="text-align:center;color:var(--text-muted);padding:40px">' + L('No data yet', 'لا توجد بيانات بعد') + '</div></div>';
      return;
    }

    const columns = config.columns;
    const colLabels = columns.map(c => c === 'en' ? L('EN', 'إنجليزي') : c === 'ar' ? L('AR', 'عربي') : c.replace(/([A-Z])/g, ' $1').replace(/^./, s => s.toUpperCase()));

    root.innerHTML =
      '<div class="page-header">' +
        '<h2 class="page-title">' + (currentLang() === 'ar' ? config.labelAr : config.labelEn) + '</h2>' +
      '</div>' +
      '<div class="card">' +
        '<div class="card-body" style="overflow-x:auto">' +
          '<table class="table" data-datatable>' +
            '<thead><tr>' + colLabels.join('') + '</tr></thead>' +
            '<tbody>' +
              seed.map(row =>
                '<tr>' +
                  columns.map(c => {
                    const val = row[colMap[c] || c];
                    if (c === 'isDefault' || c === 'isActive') {
                      return '<td><span class="badge ' + (val ? 'badge-teal' : 'badge-gray') + '">' + (val ? 'Yes' : 'No') + '</span></td>';
                    }
                    if (c === 'severity') {
                      return '<td><span class="badge badge-' + (val === 'critical' ? 'red' : val === 'warning' ? 'yellow' : 'blue') + '">' + val + '</span></td>';
                    }
                    if (c === 'status') {
                      return '<td><span class="badge ' + (val === 'active' || val === 'approved' ? 'badge-teal' : val === 'pending' ? 'badge-yellow' : 'badge-gray') + '">' + val + '</span></td>';
                    }
                    if (c === 'type' && config.seed === 'payrollComponents') {
                      return '<td>' + (val || '—') + '</td>';
                    }
                    if (val === null || val === undefined) {
                      return '<td>—</td>';
                    }
                    return '<td>' + String(val) + '</td>';
                  }).join('') +
                '</tr>'
              ).join('') +
            '</tbody>' +
          '</table>' +
        '</div>' +
      '</div>';
  }

  function boot() {
    if (booted) {
      return;
    }
    booted = true;
    const seed = getSeed(config.seed);
    renderTable(seed);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
  window.addEventListener(LANG_EVENT, () => {
    const seed = getSeed(config.seed);
    renderTable(seed);
  });
}
