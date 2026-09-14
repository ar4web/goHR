// ── Consolidated extra data types from Saudi HR documentation ──
// All name fields use nameEn/nameAr as FULL names (no first/middle/last split).
// Every entity has a unique id/code key field for lookups.
// This file supplements hr-seed.js; import from hr-api.js.

// ── Payroll components (component-based salary structure) ──
export const PAYROLL_COMPONENTS = [
  { code: 'BASIC', en: 'Basic Salary', ar: 'الراتب الأساسي', type: 'earning', calcMethod: 'fixed', isTaxable: true, isGosiApplicable: true, supportsProration: true, displayOrder: 1, isActive: true },
  { code: 'HOUSING', en: 'Housing Allowance', ar: 'بدل السكن', type: 'earning', calcMethod: 'fixed', isTaxable: true, isGosiApplicable: true, supportsProration: false, displayOrder: 2, isActive: true },
  { code: 'TRANSPORT', en: 'Transportation Allowance', ar: 'بدل النقل', type: 'earning', calcMethod: 'fixed', isTaxable: true, isGosiApplicable: false, supportsProration: false, displayOrder: 3, isActive: true },
  { code: 'FOOD', en: 'Food Allowance', ar: 'بدل الطعام', type: 'earning', calcMethod: 'fixed', isTaxable: true, isGosiApplicable: false, supportsProration: false, displayOrder: 4, isActive: true },
  { code: 'MOBILE', en: 'Mobile Allowance', ar: 'بدل الجوال', type: 'earning', calcMethod: 'fixed', isTaxable: true, isGosiApplicable: false, supportsProration: false, displayOrder: 5, isActive: true },
  { code: 'OT', en: 'Overtime Pay', ar: 'أجر العمل الإضافي', type: 'earning', calcMethod: 'formula', isTaxable: true, isGosiApplicable: true, supportsProration: true, displayOrder: 6, isActive: true },
  { code: 'BONUS', en: 'Performance Bonus', ar: 'مكافأة الأداء', type: 'earning', calcMethod: 'percentage', isTaxable: true, isGosiApplicable: true, supportsProration: false, displayOrder: 7, isActive: true },
  { code: 'GOSI_EMP', en: 'GOSI Employee Share', ar: 'حصة الموظف من التأمينات', type: 'deduction', calcMethod: 'percentage', isTaxable: false, isGosiApplicable: false, supportsProration: false, displayOrder: 8, isActive: true },
  { code: 'LOAN', en: 'Loan Deduction', ar: 'اقتساط القرض', type: 'deduction', calcMethod: 'fixed', isTaxable: false, isGosiApplicable: false, supportsProration: false, displayOrder: 9, isActive: true },
  { code: 'ADVANCE', en: 'Advance Deduction', ar: 'خصم السلفة', type: 'deduction', calcMethod: 'fixed', isTaxable: false, isGosiApplicable: false, supportsProration: false, displayOrder: 10, isActive: true },
  { code: 'ABSENCE', en: 'Absence Deduction', ar: 'خصم الغياب', type: 'deduction', calcMethod: 'formula', isTaxable: false, isGosiApplicable: false, supportsProration: true, displayOrder: 11, isActive: true },
  { code: 'ZAKAT', en: 'Zakat', ar: 'الزكاة', type: 'deduction', calcMethod: 'percentage', isTaxable: false, isGosiApplicable: false, supportsProration: false, displayOrder: 12, isActive: true },
  { code: 'GOSI_ER', en: 'GOSI Employer Share', ar: 'حصة صاحب العمل من التأمينات', type: 'employer_cost', calcMethod: 'percentage', isTaxable: false, isGosiApplicable: true, supportsProration: false, displayOrder: 13, isActive: true },
  { code: 'YEARSERVICE', en: 'End of Service', ar: 'مكافأة نهاية الخدمة', type: 'employer_cost', calcMethod: 'formula', isTaxable: false, isGosiApplicable: false, supportsProration: false, displayOrder: 14, isActive: true }
];

// ── Bank accounts (per employee) ──
export const BANK_ACCOUNTS = [
  { id: 'BA-001', emp: 'EMP-0001', bank: 'Al Rajhi', iban: 'SA1000000000000000000001', accountNumber: 'XXXXXX', branchCode: '', isDefault: true },
  { id: 'BA-002', emp: 'EMP-0002', bank: 'SNB', iban: 'SA1000000000000000000002', accountNumber: 'XXXXXX', branchCode: '', isDefault: true },
  { id: 'BA-003', emp: 'EMP-0003', bank: 'Al Rajhi', iban: 'SA1000000000000000000003', accountNumber: 'XXXXXX', branchCode: '', isDefault: true },
  { id: 'BA-004', emp: 'EMP-0004', bank: 'Riyad Bank', iban: 'SA1000000000000000000004', accountNumber: 'XXXXXX', branchCode: '', isDefault: true },
  { id: 'BA-005', emp: 'EMP-0006', bank: 'Al Rajhi', iban: 'SA1000000000000000000006', accountNumber: 'XXXXXX', branchCode: '', isDefault: true },
  { id: 'BA-006', emp: 'EMP-0007', bank: 'SNB', iban: 'SA1000000000000000000007', accountNumber: 'XXXXXX', branchCode: '', isDefault: true },
  { id: 'BA-007', emp: 'EMP-0008', bank: 'Al Rajhi', iban: 'SA1000000000000000000008', accountNumber: 'XXXXXX', branchCode: '', isDefault: true },
  { id: 'BA-008', emp: 'EMP-0009', bank: 'Al Rajhi', iban: 'SA1000000000000000000009', accountNumber: 'XXXXXX', branchCode: '', isDefault: true },
  { id: 'BA-009', emp: 'EMP-0010', bank: 'SNB', iban: 'SA1000000000000000000010', accountNumber: 'XXXXXX', branchCode: '', isDefault: true },
  { id: 'BA-010', emp: 'EMP-0011', bank: 'Al Rajhi', iban: 'SA1000000000000000000011', accountNumber: 'XXXXXX', branchCode: '', isDefault: true }
];

// ── Dependents (per employee) ──
export const DEPENDENTS = [
  { id: 'DEP-001', emp: 'EMP-0001', nameEn: 'Ahmed Abdullah Al-Otaibi', nameAr: 'أحمد عبدالله العتيبي', relationship: 'son', dob: '2005-03-15', nationality: 'Saudi', iqama: '' },
  { id: 'DEP-002', emp: 'EMP-0001', nameEn: 'Sara Abdullah Al-Otaibi', nameAr: 'سارة عبدالله العتيبي', relationship: 'daughter', dob: '2008-07-22', nationality: 'Saudi', iqama: '' },
  { id: 'DEP-003', emp: 'EMP-0006', nameEn: 'Priya Rajesh Kumar', nameAr: 'بريا راجيش كومار', relationship: 'spouse', dob: '1990-05-10', nationality: 'India', iqama: '' },
  { id: 'DEP-004', emp: 'EMP-0007', nameEn: 'Fatima Ahmed Raza', nameAr: 'فاطمة أحمد رضا', relationship: 'spouse', dob: '1992-08-14', nationality: 'Pakistan', iqama: '' },
  { id: 'DEP-005', emp: 'EMP-0009', nameEn: 'Jose Ramos Jr', nameAr: 'خوسيه راموس جونيور', relationship: 'son', dob: '2000-11-03', nationality: 'Philippines', iqama: '' }
];

// ── Qualifications (per employee) ──
export const QUALIFICATIONS = [
  { id: 'Q-001', emp: 'EMP-0001', degree: 'MBA', institution: 'King Saud University', gradDate: '2018-06-15', field: 'Business Administration', certUrl: '' },
  { id: 'Q-002', emp: 'EMP-0001', degree: 'BSc', institution: 'King Saud University', gradDate: '2012-06-15', field: 'Information Systems', certUrl: '' },
  { id: 'Q-003', emp: 'EMP-0002', degree: 'BSc', institution: 'KFUPM', gradDate: '2015-06-15', field: 'Industrial Engineering', certUrl: '' },
  { id: 'Q-004', emp: 'EMP-0003', degree: 'LLB', institution: 'Imam Muhammad Ibn Saud University', gradDate: '2019-06-15', field: 'Law', certUrl: '' },
  { id: 'Q-005', emp: 'EMP-0004', degree: 'BCom', institution: 'King Saud University', gradDate: '2017-06-15', field: 'Accounting', certUrl: '' },
  { id: 'Q-006', emp: 'EMP-0020', degree: 'Diploma', institution: 'TVET College India', gradDate: '2015-05-20', field: 'Electrical Engineering', certUrl: '' }
];

// ── Emergency contacts (per employee) ──
export const EMERGENCY_CONTACTS = [
  { id: 'EC-001', emp: 'EMP-0001', contactName: 'Abdullah Al-Otaibi', relationship: 'brother', phone: '+966 555 011 001', email: '' },
  { id: 'EC-002', emp: 'EMP-0006', contactName: 'Rajesh Kumar Sr', relationship: 'father', phone: '+91 98765 43210', email: '' },
  { id: 'EC-003', emp: 'EMP-0007', contactName: 'Ahmed Raza Sr', relationship: 'father', phone: '+92 300 123 4567', email: '' },
  { id: 'EC-004', emp: 'EMP-0023', contactName: 'Manoj Tiwari Sr', relationship: 'father', phone: '+91 98765 43210', email: '' }
];

// ── Warnings (per employee) ──
export const WARNINGS = [
  { id: 'WN-001', emp: 'EMP-0011', warningType: 'attendance', descriptionEn: 'Repeated late arrivals in September', descriptionAr: 'تأخر متكرر في سبتمبر', warningDate: '2026-09-15', issuedBy: 'EMP-0002', severity: 'warning' },
  { id: 'WN-002', emp: 'EMP-0025', warningType: 'compliance', descriptionEn: 'Iqama expiry approaching', descriptionAr: 'صلاحية الإقامة قرب الانتهاء', warningDate: '2026-09-01', issuedBy: 'EMP-0001', severity: 'critical' },
  { id: 'WN-003', emp: 'EMP-0008', warningType: 'attendance', descriptionEn: 'No check-in recorded for 3 consecutive days', descriptionAr: 'لا سجل حضور لمدة 3 أيام متتالية', warningDate: '2026-09-10', issuedBy: 'EMP-0002', severity: 'critical' }
];

// ── Achievements (per employee) ──
export const ACHIEVEMENTS = [
  { id: 'ACH-001', emp: 'EMP-0001', achievementType: 'performance', descriptionEn: 'Excellent HR Manager of the Year', descriptionAr: 'أفضل مدير موارد بشرية للعام', achievementDate: '2025-12-15', awardName: 'Excellence Award' },
  { id: 'ACH-002', emp: 'EMP-0020', achievementType: 'skill', descriptionEn: 'Certified Electrician Level 3', descriptionAr: 'كهربائي معتمد المستوى 3', achievementDate: '2025-08-20', awardName: 'Certification' },
  { id: 'ACH-003', emp: 'EMP-0023', achievementType: 'loyalty', descriptionEn: '5 Years Service Milestone', descriptionAr: 'علامة 5 سنوات خدمة', achievementDate: '2025-01-20', awardName: 'Service Milestone' }
];

// ── Promotions (per employee) ──
export const PROMOTIONS = [
  { id: 'PR-001', emp: 'EMP-0001', fromTitleEn: 'HR Specialist', fromTitleAr: 'أخصائي موارد بشرية', toTitleEn: 'HR Manager', toTitleAr: 'مدير الموارد البشرية', fromSalary: 7000, toSalary: 9000, promotionDate: '2024-09-01', reason: 'Annual performance review' },
  { id: 'PR-002', emp: 'EMP-0019', fromTitleEn: 'Mason', fromTitleAr: 'بناء', toTitleEn: 'Foreman', toTitleAr: 'مشرف عمال', fromSalary: 2200, toSalary: 3200, promotionDate: '2025-06-01', reason: 'Promotion based on experience' }
];

// ── Attendance policies ──
export const ATTENDANCE_POLICIES = [
  { id: 'AP-001', en: 'Standard Office Policy', ar: 'سياسة المكتب القياسية', standardHoursPerDay: 8, standardHoursPerWeek: 40, gracePeriodMinutes: 30, breakDurationMinutes: 60, overtimeRateMultiplier: 1.5, maxDailyOvertimeHours: 2, maxWeeklyOvertimeHours: 10, workingDays: 'sun-mon-tue-wed-thu', weekendDays: 'fri-sat', ramadanHoursReduction: 2, isActive: true },
  { id: 'AP-002', en: 'Site Work Policy', ar: 'سياسة عمل الموقع', standardHoursPerDay: 8, standardHoursPerWeek: 48, gracePeriodMinutes: 15, breakDurationMinutes: 30, overtimeRateMultiplier: 1.5, maxDailyOvertimeHours: 2, maxWeeklyOvertimeHours: 12, workingDays: 'sun-mon-tue-wed-thu', weekendDays: 'fri-sat', ramadanHoursReduction: 2, isActive: true },
  { id: 'AP-003', en: 'FM Tower Policy', ar: 'سياسة برج المرافق', standardHoursPerDay: 8, standardHoursPerWeek: 40, gracePeriodMinutes: 30, breakDurationMinutes: 60, overtimeRateMultiplier: 1.5, maxDailyOvertimeHours: 2, maxWeeklyOvertimeHours: 10, workingDays: 'sun-mon-tue-wed-thu', weekendDays: 'fri-sat', ramadanHoursReduction: 2, isActive: true }
];

// ── Employee shifts (assignment of shift to employee) ──
export const EMPLOYEE_SHIFTS = [
  { id: 'ES-001', emp: 'EMP-0006', shift: 'SH-SITE', startDate: '2026-01-05', endDate: '' },
  { id: 'ES-002', emp: 'EMP-0007', shift: 'SH-SITE', startDate: '2026-01-05', endDate: '' },
  { id: 'ES-003', emp: 'EMP-0009', shift: 'SH-FM', startDate: '2026-02-01', endDate: '' },
  { id: 'ES-004', emp: 'EMP-0010', shift: 'SH-FM', startDate: '2026-02-01', endDate: '' },
  { id: 'ES-005', emp: 'EMP-0013', shift: 'SH-SITE', startDate: '2026-01-12', endDate: '' }
];

// ── Attendance locations ──
export const ATTENDANCE_LOCATIONS = [
  { id: 'AL-001', en: 'HQ Office Riyadh', ar: 'المكتب الرئيسي الرياض', lat: 24.7136, lng: 46.6753, isActive: true },
  { id: 'AL-002', en: 'Site North Ring', ar: 'موقع الطريق الشمالي', lat: 24.81, lng: 46.68, isActive: true },
  { id: 'AL-003', en: 'Site Diriyah', ar: 'موقع الدرعية', lat: 24.732, lng: 46.575, isActive: true },
  { id: 'AL-004', en: 'Site KAFD Tower', ar: 'موقع برج كافد', lat: 24.767, lng: 46.641, isActive: true },
  { id: 'AL-005', en: 'Site Jeddah Corniche', ar: 'موقع كورنيش جدة', lat: 21.5433, lng: 39.1728, isActive: true },
  { id: 'AL-006', en: 'Site Dammam North', ar: 'موقع الدمام الشمالية', lat: 26.4207, lng: 50.0888, isActive: true }
];

// ── Attendance devices ──
export const ATTENDANCE_DEVICES = [
  { id: 'AD-001', deviceId: 'BIO-001', locationId: 'AL-001', deviceType: 'biometric', isActive: true },
  { id: 'AD-002', deviceId: 'BIO-002', locationId: 'AL-002', deviceType: 'biometric', isActive: true },
  { id: 'AD-003', deviceId: 'BIO-003', locationId: 'AL-003', deviceType: 'biometric', isActive: true },
  { id: 'AD-004', deviceId: 'MOB-001', locationId: 'AL-004', deviceType: 'mobile', isActive: true },
  { id: 'AD-005', deviceId: 'BIO-004', locationId: 'AL-005', deviceType: 'biometric', isActive: true },
  { id: 'AD-006', deviceId: 'BIO-005', locationId: 'AL-006', deviceType: 'biometric', isActive: true }
];

// ── Attendance exceptions ──
export const ATTENDANCE_EXCEPTIONS = [
  { id: 'AE-001', emp: 'EMP-0012', date: '2026-09-05', exceptionType: 'late', descriptionEn: 'Medical appointment', descriptionAr: 'موعد طبي', status: 'approved', approvedBy: 'EMP-0002' },
  { id: 'AE-002', emp: 'EMP-0027', date: '2026-09-10', exceptionType: 'absent', descriptionEn: 'Huroob case - pending investigation', descriptionAr: 'بلاغ هروب - تحت التحقيق', status: 'pending', approvedBy: '' }
];

// ── Expense policies ──
export const EXPENSE_POLICIES = [
  { id: 'EP-001', en: 'Standard Expense Policy', ar: 'سياسة المصاريف القياسية', approvalThreshold: 1000, requireReceipt: true, maxAmount: 5000, reimbursementCycle: 'monthly', isActive: true },
  { id: 'EP-002', en: 'Travel Expense Policy', ar: 'سياسة مصاريف السفر', approvalThreshold: 500, requireReceipt: true, maxAmount: 10000, reimbursementCycle: 'monthly', isActive: true },
  { id: 'EP-003', en: 'Medical Expense Policy', ar: 'سياسة المصاريف الطبية', approvalThreshold: 2000, requireReceipt: true, maxAmount: 15000, reimbursementCycle: 'monthly', isActive: true }
];

// ── Expense approvers ──
export const EXPENSE_APPROVERS = [
  { id: 'EA-001', expenseClaimId: 'EXP-2026-011', approverId: 'EMP-0002', approvalOrder: 1, status: 'approved' },
  { id: 'EA-002', expenseClaimId: 'EXP-2026-012', approverId: 'EMP-0001', approvalOrder: 1, status: 'approved' },
  { id: 'EA-003', expenseClaimId: 'EXP-2026-013', approverId: 'EMP-0001', approvalOrder: 1, status: 'approved' },
  { id: 'EA-004', expenseClaimId: 'EXP-2026-013', approverId: 'EMP-0002', approvalOrder: 2, status: 'approved' }
];

// ── System notifications ──
export const SYSTEM_NOTIFICATIONS = [
  { id: 'SN-001', module: 'employees', titleEn: 'Iqama Expiry Alert', titleAr: 'تنبيه انتهاء الإقامة', messageEn: '5 employees have Iqama expiring within 30 days', messageAr: '5 موظفين تنتهي إقامتهم خلال 30 يومًا', priority: 'high', isRead: false, actionUrl: 'hr_sa_compliance.html', recipientId: 'EMP-0001', createdAt: '2026-09-10T08:00:00' },
  { id: 'SN-002', module: 'payroll', titleEn: 'August Payroll Paid', titleAr: 'تم صرف راتب أغسطس', messageEn: 'August 2026 payroll batch processed successfully', messageAr: 'تمت معالجة دفعة راتب أغسطس 2026 بنجاح', priority: 'medium', isRead: true, actionUrl: 'hr_payroll.html', recipientId: 'EMP-0004', createdAt: '2026-09-02T10:00:00' },
  { id: 'SN-003', module: 'leave', titleEn: 'Leave Request Pending', titleAr: 'طلب إجازة معلّق', messageEn: '3 leave requests need your approval', messageAr: '3 طلبات إجازة تحتاج موافقتك', priority: 'urgent', isRead: false, actionUrl: 'hr_leave.html', recipientId: 'EMP-0002', createdAt: '2026-09-12T09:00:00' },
  { id: 'SN-004', module: 'visas', titleEn: 'Visa Renewal Required', titleAr: 'يجب تجديد التأشيرة', messageEn: '2 work permits expiring this month', messageAr: 'تأشيرتا عمل تنتهيان هذا الشهر', priority: 'high', isRead: false, actionUrl: 'hr_visas.html', recipientId: 'EMP-0001', createdAt: '2026-09-08T14:00:00' }
];

// ── Approval workflows ──
export const APPROVAL_WORKFLOWS = [
  { id: 'AW-001', nameEn: 'Leave Approval', nameAr: 'اعتماد الإجازة', entityType: 'leave_requests', approvalType: 'sequential', slaHours: 48, escalationEnabled: true, escalationHours: 24, escalationTarget: 'hr', isActive: true, version: 2 },
  { id: 'AW-002', nameEn: 'Expense Approval', nameAr: 'اعتماد المصاريف', entityType: 'expenses', approvalType: 'sequential', slaHours: 72, escalationEnabled: true, escalationHours: 48, escalationTarget: 'finance', isActive: true, version: 1 },
  { id: 'AW-003', nameEn: 'Payroll Approval', nameAr: 'اعتماد الرواتب', entityType: 'pay_runs', approvalType: 'parallel', slaHours: 24, escalationEnabled: false, escalationHours: 0, escalationTarget: '', isActive: true, version: 1 },
  { id: 'AW-004', nameEn: 'Timesheet Approval', nameAr: 'اعتماد الورديات', entityType: 'timesheets', approvalType: 'sequential', slaHours: 72, escalationEnabled: true, escalationHours: 24, escalationTarget: 'ops', isActive: true, version: 1 }
];

export const APPROVAL_WORKFLOW_STEPS = [
  { id: 'AWS-001', workflowId: 'AW-001', stepOrder: 1, stepType: 'approval', approverType: 'manager', approverId: 'EMP-0002', votingWeight: 1, slaHours: 24, isRequired: true },
  { id: 'AWS-002', workflowId: 'AW-001', stepOrder: 2, stepType: 'approval', approverType: 'role', approverId: 'hr', votingWeight: 1, slaHours: 24, isRequired: true },
  { id: 'AWS-003', workflowId: 'AW-002', stepOrder: 1, stepType: 'approval', approverType: 'manager', approverId: 'EMP-0002', votingWeight: 1, slaHours: 48, isRequired: true },
  { id: 'AWS-004', workflowId: 'AW-002', stepOrder: 2, stepType: 'approval', approverType: 'role', approverId: 'finance', votingWeight: 1, slaHours: 24, isRequired: true },
  { id: 'AWS-005', workflowId: 'AW-003', stepOrder: 1, stepType: 'approval', approverType: 'role', approverId: 'payroll', votingWeight: 1, slaHours: 24, isRequired: true },
  { id: 'AWS-006', workflowId: 'AW-003', stepOrder: 2, stepType: 'approval', approverType: 'role', approverId: 'finance', votingWeight: 1, slaHours: 24, isRequired: true },
  { id: 'AWS-007', workflowId: 'AW-004', stepOrder: 1, stepType: 'approval', approverType: 'role', approverId: 'site-supervisor', votingWeight: 1, slaHours: 48, isRequired: true },
  { id: 'AWS-008', workflowId: 'AW-004', stepOrder: 2, stepType: 'approval', approverType: 'role', approverId: 'ops', votingWeight: 1, slaHours: 24, isRequired: true }
];

// ── Approval requests ──
export const APPROVAL_REQUESTS = [
  { id: 'AR-001', entityType: 'leave_requests', entityId: 'LV-2026-031', workflowInstanceId: 'AW-001', status: 'pending', approvalType: 'single', priority: 'normal', createdAt: '2026-09-14T10:00:00' },
  { id: 'AR-002', entityType: 'expenses', entityId: 'EXP-2026-011', workflowInstanceId: 'AW-002', status: 'approved', approvalType: 'single', priority: 'normal', createdAt: '2026-09-03T08:00:00', approvedAt: '2026-09-04T09:00:00' },
  { id: 'AR-003', entityType: 'pay_runs', entityId: 'PR-2026-08', workflowInstanceId: 'AW-003', status: 'approved', approvalType: 'dual', priority: 'high', createdAt: '2026-09-01T12:00:00', approvedAt: '2026-09-01T15:00:00' }
];

// ── Approval actions ──
export const APPROVAL_ACTIONS = [
  { id: 'AA-001', requestId: 'AR-002', approverId: 'EMP-0002', action: 'approve', comment: 'Approved - within policy', timestamp: '2026-09-04T09:00:00' },
  { id: 'AA-002', requestId: 'AR-003', approverId: 'EMP-0004', action: 'approve', comment: 'Payroll batch verified', timestamp: '2026-09-01T15:00:00' },
  { id: 'AA-003', requestId: 'AR-003', approverId: 'EMP-0001', action: 'approve', comment: 'Dual approval complete', timestamp: '2026-09-01T16:00:00' }
];

// ── System alerts ──
export const SYSTEM_ALERTS = [
  { id: 'SA-001', alertType: 'document_expiry', severity: 'critical', titleEn: 'Iqama Expiring - EMP-0008', titleAr: 'إقامة تنتهي - EMP-0008', messageEn: 'Mohammad Asif Iqama expires on 2026-09-28', messageAr: 'إقامة محمد آصف تنتهي في 28/09/2026', entityId: 'EMP-0008', entityType: 'employees', isResolved: false, resolvedAt: null, createdAt: '2026-09-08T00:00:00', daysUntilExpiry: 18 },
  { id: 'SA-002', alertType: 'policy_violation', severity: 'warning', titleEn: 'Saudization Below Target', titleAr: 'نسبة السعودة أقل من المستهدف', messageEn: 'Current Saudization 28% vs target 30%', messageAr: 'السعودة الحالية 28% مقابل مستهدف 30%', entityId: 'nitaqat', entityType: 'compliance', isResolved: false, resolvedAt: null, createdAt: '2026-09-01T00:00:00', daysUntilExpiry: null },
  { id: 'SA-003', alertType: 'attendance_exception', severity: 'info', titleEn: 'Unapproved Absence Detected', titleAr: 'غياب غير معتمد', messageEn: 'EMP-0027 has 3 unapproved absence records', messageAr: 'EMP-0027 لديه 3 سجلات غياب غير معتمدة', entityId: 'EMP-0027', entityType: 'attendance', isResolved: false, resolvedAt: null, createdAt: '2026-09-10T00:00:00', daysUntilExpiry: null }
];

// ── Alert subscriptions ──
export const ALERT_SUBSCRIPTIONS = [
  { id: 'AS-001', userId: 'EMP-0001', alertType: 'document_expiry', notificationChannel: 'email', isActive: true, threshold: 90 },
  { id: 'AS-002', userId: 'EMP-0001', alertType: 'policy_violation', notificationChannel: 'in_app', isActive: true, threshold: 0 },
  { id: 'AS-003', userId: 'EMP-0002', alertType: 'attendance_exception', notificationChannel: 'in_app', isActive: true, threshold: 0 },
  { id: 'AS-004', userId: 'EMP-0004', alertType: 'document_expiry', notificationChannel: 'email', isActive: true, threshold: 30 },
  { id: 'AS-005', userId: 'EMP-0001', alertType: 'nitaqat_compliance', notificationChannel: 'email', isActive: true, threshold: 0 }
];

// ── System activity log ──
export const SYSTEM_ACTIVITY_LOG = [
  { id: 'AL-001', userId: 'EMP-0001', action: 'create', entityType: 'employees', entityId: 'EMP-0021', oldValues: null, newValues: { nameEn: 'Imran Khan', nat: 'Pakistan' }, ipAddress: '192.168.1.1', userAgent: 'Chrome 120', timestamp: '2026-08-01T09:00:00', companyId: 'co-1' },
  { id: 'AL-002', userId: 'EMP-0001', action: 'update', entityType: 'employees', entityId: 'EMP-0006', oldValues: { basic: 1800 }, newValues: { basic: 2000 }, ipAddress: '192.168.1.1', userAgent: 'Chrome 120', timestamp: '2026-09-01T10:00:00', companyId: 'co-1' },
  { id: 'AL-003', userId: 'EMP-0004', action: 'approve', entityType: 'pay_runs', entityId: 'PR-2026-08', oldValues: { status: 'pending' }, newValues: { status: 'approved' }, ipAddress: '192.168.1.1', userAgent: 'Chrome 120', timestamp: '2026-09-01T15:00:00', companyId: 'co-1' },
  { id: 'AL-004', userId: 'EMP-0002', action: 'create', entityType: 'leave_requests', entityId: 'LV-2026-031', oldValues: null, newValues: { emp: 'EMP-0009', type: 'annual', from: '2026-09-20', to: '2026-10-04' }, ipAddress: '192.168.1.1', userAgent: 'Firefox 121', timestamp: '2026-09-14T10:00:00', companyId: 'co-1' },
  { id: 'AL-005', userId: 'EMP-0005', action: 'import', entityType: 'employees', entityId: 'batch', oldValues: null, newValues: { count: 5, source: 'xlsx' }, ipAddress: '192.168.1.1', userAgent: 'Chrome 120', timestamp: '2026-09-10T11:00:00', companyId: 'co-1' }
];

// ── Custom reports ──
export const CUSTOM_REPORTS = [
  { id: 'CR-001', nameEn: 'Monthly Payroll Summary', nameAr: 'ملخص الرواتب الشهري', descriptionEn: 'Summary of payroll for all employees', descriptionAr: 'ملخص الرواتب لجميع الموظفين', reportBuilderConfig: { type: 'payroll', filters: { month: '2026-08' } }, isShareable: true, createdBy: 'EMP-0004', createdAt: '2026-08-25T00:00:00' },
  { id: 'CR-002', nameEn: 'Saudization Report', nameAr: 'تقرير نطاقات السعودة', descriptionEn: 'Nitaqat compliance report by department', descriptionAr: 'تقرير نطاقات السعودة حسب الإدارة', reportBuilderConfig: { type: 'compliance', filters: { date: '2026-09-01' } }, isShareable: true, createdBy: 'EMP-0001', createdAt: '2026-09-01T00:00:00' },
  { id: 'CR-003', nameEn: 'Attendance Summary', nameAr: 'ملخص الحضور', descriptionEn: 'Monthly attendance summary with late/absent counts', descriptionAr: 'ملخص الحضور الشهري مع عدد المتأخرين والغائبين', reportBuilderConfig: { type: 'attendance', filters: { month: '2026-09' } }, isShareable: false, createdBy: 'EMP-0002', createdAt: '2026-09-05T00:00:00' }
];

// ── Report schedules ──
export const REPORT_SCHEDULES = [
  { id: 'RS-001', reportId: 'CR-001', frequency: 'monthly', deliveryMethod: 'email', recipientId: 'EMP-0001', isActive: true, nextRunAt: '2026-10-01T08:00:00', lastRunAt: '2026-09-01T08:00:00' },
  { id: 'RS-002', reportId: 'CR-002', frequency: 'weekly', deliveryMethod: 'email', recipientId: 'EMP-0001', isActive: true, nextRunAt: '2026-09-21T08:00:00', lastRunAt: '2026-09-14T08:00:00' }
];

// ── Integration links ──
export const INTEGRATION_LINKS = [
  { id: 'IL-001', sourceEntityType: 'expenses', sourceEntityId: 'EXP-2026-011', targetEntityType: 'travel', targetEntityId: 'TR-001', linkType: 'expense_to_travel' },
  { id: 'IL-002', sourceEntityType: 'payroll', sourceEntityId: 'PR-2026-08', targetEntityType: 'attendance', targetEntityId: 'ATT-2026-08', linkType: 'payroll_to_attendance' },
  { id: 'IL-003', sourceEntityType: 'documents', sourceEntityId: 'DOC-001', targetEntityType: 'employees', targetEntityId: 'EMP-0006', linkType: 'document_to_employee' }
];

// ── System settings (extended) ──
export const SYSTEM_SETTINGS = {
  modules: {
    employees: { visible: true, labelEn: 'Employees', labelAr: 'الموظفون', icon: 'users', order: 1, category: 'hr' },
    payroll: { visible: true, labelEn: 'Payroll', labelAr: 'الرواتب', icon: 'creditCard', order: 2, category: 'finance' },
    leave: { visible: true, labelEn: 'Leave', labelAr: 'الإجازات', icon: 'calendar', order: 3, category: 'hr' },
    attendance: { visible: true, labelEn: 'Attendance', labelAr: 'الحضور', icon: 'clock', order: 4, category: 'hr' },
    gosi: { visible: true, labelEn: 'GOSI', labelAr: 'التأمينات', icon: 'shield', order: 5, category: 'compliance' },
    wps: { visible: true, labelEn: 'WPS', labelAr: 'حماية الأجور', icon: 'file-dollar', order: 6, category: 'compliance' },
    compliance: { visible: true, labelEn: 'Compliance', labelAr: 'الامتثال', icon: 'check-circle', order: 7, category: 'compliance' },
    visas: { visible: true, labelEn: 'Visas', labelAr: 'التأشيرات', icon: 'passport', order: 8, category: 'hr' },
    contracts: { visible: true, labelEn: 'Contracts', labelAr: 'العقود', icon: 'file-text', order: 9, category: 'hr' },
    expenses: { visible: true, labelEn: 'Expenses', labelAr: 'المصاريف', icon: 'receipt', order: 10, category: 'finance' },
    onboarding: { visible: true, labelEn: 'Onboarding', labelAr: 'التوجيه', icon: 'rocket', order: 11, category: 'hr' },
    reports: { visible: true, labelEn: 'Reports', labelAr: 'التقارير', icon: 'bar-chart', order: 12, category: 'other' },
    settings: { visible: true, labelEn: 'Settings', labelAr: 'الإعدادات', icon: 'settings', order: 13, category: 'other' },
    ajeer: { visible: true, labelEn: 'Ajeer', labelAr: 'أجير', icon: 'briefcase', order: 14, category: 'ops' },
    timesheets: { visible: true, labelEn: 'Timesheets', labelAr: 'الورديات', icon: 'list', order: 15, category: 'hr' },
    documents: { visible: true, labelEn: 'Documents', labelAr: 'المستندات', icon: 'folder', order: 16, category: 'hr' },
    tasks: { visible: true, labelEn: 'Tasks', labelAr: 'المهام', icon: 'task', order: 17, category: 'ops' },
    announcements: { visible: true, labelEn: 'Announcements', labelAr: 'الإعلانات', icon: 'megaphone', order: 18, category: 'hr' },
    // ── Extended modules ──
    bankAccounts: { visible: true, labelEn: 'Bank Accounts', labelAr: 'الحسابات البنكية', icon: 'bank', order: 19, category: 'finance' },
    dependents: { visible: true, labelEn: 'Dependents', labelAr: 'أفراد العائلة', icon: 'users', order: 20, category: 'hr' },
    qualifications: { visible: true, labelEn: 'Qualifications', labelAr: 'المؤهلات', icon: 'graduation', order: 21, category: 'hr' },
    emergencyContacts: { visible: true, labelEn: 'Emergency Contacts', labelAr: 'جهات الاتصال الطارئة', icon: 'phone', order: 22, category: 'hr' },
    warnings: { visible: true, labelEn: 'Warnings', labelAr: 'تحذيرات', icon: 'alert-triangle', order: 23, category: 'compliance' },
    achievements: { visible: true, labelEn: 'Achievements', labelAr: 'الإنجازات', icon: 'award', order: 24, category: 'hr' },
    promotions: { visible: true, labelEn: 'Promotions', labelAr: 'الترقيات', icon: 'arrow-up', order: 25, category: 'hr' },
    attendancePolicies: { visible: true, labelEn: 'Attendance Policies', labelAr: 'سياسات الحضور', icon: 'shield', order: 26, category: 'hr' },
    approvalWorkflows: { visible: true, labelEn: 'Approval Workflows', labelAr: 'مسارات الاعتماد', icon: 'check-circle', order: 27, category: 'compliance' },
    systemNotifications: { visible: true, labelEn: 'Notifications', labelAr: 'الإشعارات', icon: 'bell', order: 28, category: 'other' },
    systemAlerts: { visible: true, labelEn: 'Alerts', labelAr: 'التنبيهات', icon: 'alert', order: 29, category: 'compliance' },
    countries: { visible: true, labelEn: 'Countries', labelAr: 'الدول', icon: 'globe', order: 30, category: 'global' },
    currencies: { visible: true, labelEn: 'Currencies', labelAr: 'العملات', icon: 'currency', order: 31, category: 'global' },
    workPermits: { visible: true, labelEn: 'Work Permits', labelAr: 'تصاريح العمل', icon: 'file-check', order: 32, category: 'compliance' },
    leavesBalances: { visible: true, labelEn: 'Leaves Balances', labelAr: 'أرصدة الإجازات', icon: 'calendar', order: 33, category: 'hr' },
    jobRequisitions: { visible: true, labelEn: 'Job Requisitions', labelAr: 'طلبات التوظيف', icon: 'briefcase', order: 34, category: 'hr' },
    trainingPrograms: { visible: true, labelEn: 'Training Programs', labelAr: 'برامج التدريب', icon: 'graduation', order: 35, category: 'hr' },
    customReports: { visible: true, labelEn: 'Custom Reports', labelAr: 'التقارير المخصصة', icon: 'bar-chart', order: 36, category: 'other' }
  },
  tableDefaults: {
    pageSize: 25,
    sortBy: 'nameEn',
    sortDir: 'asc',
    showExport: true,
    showFilter: true,
    showSearch: true
  },
  theme: {
    primaryColor: '#1ABB9C',
    darkMode: false,
    sidebarCollapsed: false,
    sidebarDraggable: true
  }
};

// ── Countries (for global HR) ──
export const COUNTRIES = [
  { code: 'SA', nameEn: 'Saudi Arabia', nameAr: 'المملكة العربية السعودية', region: 'Middle East', currency: 'SAR', dateFormat: 'YYYY-MM-DD', timeFormat: '12h', timezone: 'Asia/Riyadh', workingDays: 'sun-mon-tue-wed-thu', workingHoursPerDay: 8, workingHoursPerWeek: 40, minWage: 4000, overtimeMultiplier: 1.5, socialSecurityRate: 0.22, pensionRate: 0.0975, workPermitRequired: true, mandatoryInsurance: true, laborLawReference: 'Saudi Labor Law', languageConfig: 'ar-ltr', isActive: true },
  { code: 'AE', nameEn: 'United Arab Emirates', nameAr: 'الإمارات العربية المتحدة', region: 'Middle East', currency: 'AED', dateFormat: 'YYYY-MM-DD', timeFormat: '12h', timezone: 'Asia/Dubai', workingDays: 'sun-mon-tue-wed-thu', workingHoursPerDay: 8, workingHoursPerWeek: 40, minWage: 0, overtimeMultiplier: 1.25, socialSecurityRate: 0, pensionRate: 0, workPermitRequired: true, mandatoryInsurance: true, laborLawReference: 'UAE Labor Law', languageConfig: 'ar-ltr', isActive: true },
  { code: 'EG', nameEn: 'Egypt', nameAr: 'مصر', region: 'Middle East', currency: 'EGP', dateFormat: 'YYYY-MM-DD', timeFormat: '12h', timezone: 'Africa/Cairo', workingDays: 'sun-mon-tue-wed-thu', workingHoursPerDay: 8, workingHoursPerWeek: 40, minWage: 0, overtimeMultiplier: 1.35, socialSecurityRate: 0.1875, pensionRate: 0.1875, workPermitRequired: true, mandatoryInsurance: true, laborLawReference: 'Egyptian Labor Law', languageConfig: 'ar-rtl', isActive: true },
  { code: 'PK', nameEn: 'Pakistan', nameAr: 'باكستان', region: 'Asia-Pacific', currency: 'PKR', dateFormat: 'YYYY-MM-DD', timeFormat: '12h', timezone: 'Asia/Karachi', workingDays: 'mon-tue-wed-thu-fri', workingHoursPerDay: 8, workingHoursPerWeek: 48, minWage: 0, overtimeMultiplier: 1.5, socialSecurityRate: 0.06, pensionRate: 0.06, workPermitRequired: true, mandatoryInsurance: false, laborLawReference: 'Pakistan Labor Law', languageConfig: 'en-ltr', isActive: true },
  { code: 'IN', nameEn: 'India', nameAr: 'الهند', region: 'Asia-Pacific', currency: 'INR', dateFormat: 'YYYY-MM-DD', timeFormat: '24h', timezone: 'Asia/Kolkata', workingDays: 'mon-tue-wed-thu-fri', workingHoursPerDay: 9, workingHoursPerWeek: 48, minWage: 0, overtimeMultiplier: 2.0, socialSecurityRate: 0.12, pensionRate: 0.0833, workPermitRequired: true, mandatoryInsurance: true, laborLawReference: 'India Labor Code', languageConfig: 'en-ltr', isActive: true },
  { code: 'PH', nameEn: 'Philippines', nameAr: 'الفلبين', region: 'Asia-Pacific', currency: 'PHP', dateFormat: 'YYYY-MM-DD', timeFormat: '12h', timezone: 'Asia/Manila', workingDays: 'mon-tue-wed-thu-fri', workingHoursPerDay: 8, workingHoursPerWeek: 48, minWage: 0, overtimeMultiplier: 2.0, socialSecurityRate: 0.0833, pensionRate: 0.0333, workPermitRequired: true, mandatoryInsurance: true, laborLawReference: 'Philippine Labor Code', languageConfig: 'en-ltr', isActive: true }
];

// ── Currencies ──
export const CURRENCIES = [
  { code: 'SAR', nameEn: 'Saudi Riyal', nameAr: 'الريال السعودي', symbol: 'ر.س', decimalPlaces: 2, symbolPosition: 'after', isActive: true },
  { code: 'USD', nameEn: 'US Dollar', nameAr: 'دولار أمريكي', symbol: '$', decimalPlaces: 2, symbolPosition: 'before', isActive: true },
  { code: 'AED', nameEn: 'UAE Dirham', nameAr: 'درهم إماراتي', symbol: 'د.إ', decimalPlaces: 2, symbolPosition: 'after', isActive: true },
  { code: 'EGP', nameEn: 'Egyptian Pound', nameAr: 'الجنيه المصري', symbol: '£', decimalPlaces: 2, symbolPosition: 'before', isActive: true },
  { code: 'PKR', nameEn: 'Pakistani Rupee', nameAr: 'الروبية الباكستانية', symbol: '₨', decimalPlaces: 2, symbolPosition: 'after', isActive: true },
  { code: 'INR', nameEn: 'Indian Rupee', nameAr: 'الروبية الهندية', symbol: '₹', decimalPlaces: 2, symbolPosition: 'before', isActive: true },
  { code: 'PHP', nameEn: 'Philippine Peso', nameAr: 'البيزو الفلبيني', symbol: '₱', decimalPlaces: 2, symbolPosition: 'before', isActive: true }
];

// ── Exchange rates ──
export const EXCHANGE_RATES = [
  { fromCurrency: 'SAR', target: 'USD', rate: 0.2667, effectiveDate: '2026-09-01', source: 'Central Bank', isActive: true },
  { fromCurrency: 'SAR', target: 'AED', rate: 0.9795, effectiveDate: '2026-09-01', source: 'Central Bank', isActive: true },
  { fromCurrency: 'SAR', target: 'EGP', rate: 12.54, effectiveDate: '2026-09-01', source: 'Central Bank', isActive: true },
  { fromCurrency: 'SAR', target: 'PKR', rate: 75.23, effectiveDate: '2026-09-01', source: 'Central Bank', isActive: true },
  { fromCurrency: 'SAR', target: 'INR', rate: 22.45, effectiveDate: '2026-09-01', source: 'Central Bank', isActive: true },
  { fromCurrency: 'SAR', target: 'PHP', rate: 14.89, effectiveDate: '2026-09-01', source: 'Central Bank', isActive: true }
];

// ── Country labor laws ──
export const COUNTRY_LABOR_LAWS = [
  { countryCode: 'SA', employmentType: 'permanent', contractRequirement: 'Written contract mandatory via Qiwa', workingHoursDaily: 8, workingHoursWeekly: 48, maxConsecutiveDays: 6, restPeriodRequired: true, breakInterval: 60, overtimeMultiplier: 1.5, overtimeMaxDaily: 2, noticePeriodDays: 30, severanceCalculation: 'Art. 84: half-month × 5y then full-month', leaveAccrualMethod: '21 days/year (30 after 5y)', probationDays: 90, terminationRules: 'Art. 80-84' },
  { countryCode: 'SA', employmentType: 'fixed-term', contractRequirement: 'Max 4 years (Art. 53)', workingHoursDaily: 8, workingHoursWeekly: 48, maxConsecutiveDays: 6, restPeriodRequired: true, breakInterval: 60, overtimeMultiplier: 1.5, overtimeMaxDaily: 2, noticePeriodDays: 60, severanceCalculation: 'Art. 85: reduced for fixed-term resignation', leaveAccrualMethod: '21 days/year (30 after 5y)', probationDays: 90, terminationRules: 'Art. 85: resignation haircut' },
  { countryCode: 'AE', employmentType: 'permanent', contractRequirement: 'Written contract via MoHRE', workingHoursDaily: 8, workingHoursWeekly: 48, maxConsecutiveDays: 6, restPeriodRequired: true, breakInterval: 60, overtimeMultiplier: 1.25, overtimeMaxDaily: 2, noticePeriodDays: 30, severanceCalculation: '21 days per year for first 5 years', leaveAccrualMethod: '30 days/year', probationDays: 90, terminationRules: 'UAE Labor Law Art. 120' }
];

// ── Country holidays ──
export const COUNTRY_HOLIDAYS = [
  { countryCode: 'SA', holidayDate: '2026-09-23', holidayNameEn: 'National Day', holidayNameAr: 'اليوم الوطني', holidayType: 'national', isRecurring: true, recurrencePattern: 'annual', payMultiplier: 1, workPermitted: false },
  { countryCode: 'SA', holidayDate: '2026-03-20', holidayNameEn: 'Eid al-Fitr', holidayNameAr: 'عيد الفطر', holidayType: 'religious', isRecurring: true, recurrencePattern: 'lunar', payMultiplier: 1.5, workPermitted: false },
  { countryCode: 'SA', holidayDate: '2026-05-27', holidayNameEn: 'Eid al-Adha', holidayNameAr: 'عيد الأضحى', holidayType: 'religious', isRecurring: true, recurrencePattern: 'lunar', payMultiplier: 1.5, workPermitted: false },
  { countryCode: 'PK', holidayDate: '2026-08-14', holidayNameEn: 'Independence Day', holidayNameAr: 'يوم الاستقلال', holidayType: 'national', isRecurring: true, recurrencePattern: 'annual', payMultiplier: 1, workPermitted: false }
];

// ── Employee work locations ──
export const EMPLOYEE_WORK_LOCATIONS = [
  { id: 'EWL-001', emp: 'EMP-0001', locationNameEn: 'HQ Office Riyadh', locationNameAr: 'المكتب الرئيسي الرياض', countryCode: 'SA', isPrimary: true, startDate: '2022-03-01', taxResidency: true, workPermitReference: '', payrollCountry: 'SA', costCenter: 'CC-200' },
  { id: 'EWL-002', emp: 'EMP-0006', locationNameEn: 'KAFD Tower', locationNameAr: 'برج كافد', countryCode: 'SA', isPrimary: true, startDate: '2026-01-05', taxResidency: false, workPermitReference: 'V-2021-011', payrollCountry: 'SA', costCenter: 'CC-300' },
  { id: 'EWL-003', emp: 'EMP-0021', locationNameEn: 'Jeddah Corniche Tower', locationNameAr: 'برج كورنيش جدة', countryCode: 'SA', isPrimary: true, startDate: '2026-08-01', taxResidency: false, workPermitReference: 'V-2026-101', payrollCountry: 'SA', costCenter: 'CC-300' }
];

// ── Expatriates ──
export const EXPATIATES = [
  { id: 'EX-001', emp: 'EMP-0006', assignmentType: 'long-term', homeCountry: 'India', hostCountry: 'SA', assignmentStart: '2021-06-10', assignmentEnd: '2027-03-14', expectedReturn: '', actualReturn: '', baseSalary: 1800, salaryCurrency: 'SAR', housingAllowance: 500, transportationAllowance: 300, educationAllowance: 0, relocationAllowance: 5000, hardshipAllowance: 0, costOfLivingAdjustment: 0, taxTreatment: 'tax_equalization', status: 'active' },
  { id: 'EX-002', emp: 'EMP-0021', assignmentType: 'long-term', homeCountry: 'Pakistan', hostCountry: 'SA', assignmentStart: '2026-08-01', assignmentEnd: '2027-08-14', expectedReturn: '', actualReturn: '', baseSalary: 2400, salaryCurrency: 'SAR', housingAllowance: 600, transportationAllowance: 350, educationAllowance: 0, relocationAllowance: 4000, hardshipAllowance: 0, costOfLivingAdjustment: 0, taxTreatment: 'tax_protection', status: 'active' }
];

// ── Work permits ──
export const WORK_PERMITS = [
  { id: 'WP-001', emp: 'EMP-0006', permitType: 'work_visa', permitNumber: 'V-2021-011', issueDate: '2021-05-20', expiryDate: '2023-05-19', status: 'used', applicationReference: 'VB-2025-02', applicationDate: '2021-04-01', restrictions: 'Profession: driver only', sponsorId: 'EMP-0001', documentUrl: '', renewalDate: '2023-04-01' },
  { id: 'WP-002', emp: 'EMP-0021', permitType: 'work_visa', permitNumber: 'V-2026-101', issueDate: '2026-07-10', expiryDate: '2028-07-09', status: 'active', applicationReference: 'VB-2026-02', applicationDate: '2026-06-15', restrictions: 'Profession: electrician only', sponsorId: 'EMP-0001', documentUrl: '', renewalDate: '2027-06-15' }
];

// ── Leaves balances (per employee) ──
export const LEAVES_BALANCES = [
  { id: 'LB-001', emp: 'EMP-0001', annualEntitlement: 30, annualUsed: 12, annualPending: 0, sickEntitlement: 120, sickUsed: 0, sickPending: 0, hajjEntitlement: 15, hajjUsed: 0, hajjPending: 0, maternityEntitlement: 70, maternityUsed: 0, marriageEntitlement: 5, marriageUsed: 0, carryoverDays: 0 },
  { id: 'LB-002', emp: 'EMP-0006', annualEntitlement: 21, annualUsed: 21, annualPending: 0, sickEntitlement: 120, sickUsed: 5, sickPending: 0, hajjEntitlement: 15, hajjUsed: 0, hajjPending: 0, maternityEntitlement: 0, marriageEntitlement: 5, marriageUsed: 0, carryoverDays: 0 },
  { id: 'LB-003', emp: 'EMP-0009', annualEntitlement: 30, annualUsed: 15, annualPending: 11, sickEntitlement: 120, sickUsed: 3, sickPending: 0, hajjEntitlement: 15, hajjUsed: 0, hajjPending: 0, maternityEntitlement: 70, marriageEntitlement: 5, marriageUsed: 0, carryoverDays: 15 }
];

// ── Job requisitions ──
export const JOB_REQUISITIONS = [
  { id: 'JR-2026-001', titleEn: 'Construction Worker', titleAr: 'عامل إنشاءات', department: 'OPS', hiringManagerId: 'EMP-0002', salaryRangeMin: 1500, salaryRangeMax: 2200, budgetAmount: 22000, status: 'open', positionRequirementsEn: 'Construction experience, valid Iqama', positionRequirementsAr: 'خبرة في البناء، إقامة سارية', approvalStatus: 'approved', createdAt: '2026-06-01' },
  { id: 'JR-2026-002', titleEn: 'Electrician', titleAr: 'كهربائي', department: 'OPS', hiringManagerId: 'EMP-0002', salaryRangeMin: 2300, salaryRangeMax: 2800, budgetAmount: 28000, status: 'deploying', positionRequirementsEn: 'Certified electrician, electrical license', positionRequirementsAr: 'كهربائي معتمد، رخصة كهربائية', approvalStatus: 'approved', createdAt: '2026-07-01' }
];

// ── Performance reviews ──
export const PERFORMANCE_REVIEWS = [
  { id: 'PRV-001', emp: 'EMP-0001', reviewerId: 'EMP-0002', period: '2026-Q3', overallScore: 92, attendance: 95, goals: 90, feedback: 95, commentsEn: 'Excellent performance throughout Q3', commentsAr: 'أداء ممتاز خلال الربع الثالث', status: 'completed', reviewedAt: '2026-09-15' },
  { id: 'PRV-002', emp: 'EMP-0020', reviewerId: 'EMP-0002', period: '2026-Q3', overallScore: 78, attendance: 85, goals: 75, feedback: 80, commentsEn: 'Good technical skills, needs improvement in punctuality', commentsAr: 'مهارات تقنية جيدة، يحتاج تحسين في الانتظام', status: 'completed', reviewedAt: '2026-09-15' },
  { id: 'PRV-003', emp: 'EMP-0006', reviewerId: 'EMP-0002', period: '2026-Q3', overallScore: 85, attendance: 90, goals: 80, feedback: 85, commentsEn: 'Reliable worker, good attendance', commentsAr: 'عامل موثوق، حضور جيد', status: 'completed', reviewedAt: '2026-09-15' }
];

// ── Training programs ──
export const TRAINING_PROGRAMS = [
  { id: 'TP-001', nameEn: 'Safety Training', nameAr: 'تدريب السلامة', descriptionEn: 'Mandatory site safety training', descriptionAr: 'تدريب السلامة في الموقع إلزامي', duration: 8, type: 'mandatory', provider: 'OSHA', startDate: '2026-09-15', endDate: '2026-09-22', cost: 500, isActive: true },
  { id: 'TP-002', nameEn: 'GOSI Compliance', nameAr: 'امتثال التأمينات', descriptionEn: 'GOSI rates and filing training', descriptionAr: 'تدريب معدلات التأمينات والتقديم', duration: 4, type: 'optional', provider: 'GOSI', startDate: '2026-10-01', endDate: '2026-10-04', cost: 200, isActive: true },
  { id: 'TP-003', nameEn: 'Leadership Development', nameAr: 'تطوير القيادة', descriptionEn: 'Management skills for supervisors', descriptionAr: 'مهارات الإدارة للمشرفين', duration: 16, type: 'optional', provider: 'Internal', startDate: '2026-10-05', endDate: '2026-11-01', cost: 1500, isActive: true }
];

// ── Training enrollments ──
export const TRAINING_ENROLLMENTS = [
  { id: 'TE-001', emp: 'EMP-0002', trainingId: 'TP-001', status: 'completed', score: 92, completedAt: '2026-09-22' },
  { id: 'TE-002', emp: 'EMP-0006', trainingId: 'TP-001', status: 'in-progress', score: null, completedAt: null },
  { id: 'TE-003', emp: 'EMP-0001', trainingId: 'TP-003', status: 'enrolled', score: null, completedAt: null }
];

// ── Payroll WPS files ──
export const PAYROLL_WPS_FILES = [
  { id: 'WPS-2026-08', cycleId: 'PR-2026-08', fileName: 'WPS_AUG2026_20260901_100000.sif', bankCode: '80', employerId: '123456789', totalRecords: 27, totalAmount: 1250000, molReference: 'MOL-2026-08-001', submissionDate: '2026-09-01', acceptanceStatus: 'accepted', fileDownloadUrl: '', status: 'paid' },
  { id: 'WPS-2026-09', cycleId: 'PR-2026-09', fileName: '', bankCode: '', employerId: '', totalRecords: 0, totalAmount: 0, molReference: '', submissionDate: '', acceptanceStatus: 'pending', fileDownloadUrl: '', status: 'draft' }
];

// ── Payroll tax withholding ──
export const PAYROLL_TAX_WITHHOLDING = [
  { id: 'TWH-001', cycleEmployeeId: 'CE-PR-2026-08-001', iqamaNumber: '1000000001', grossIncome: 12250, taxableIncome: 12250, taxRate: 0, taxAmount: 0, ytdGross: 98000, ytdTax: 0, residentStatus: 'resident', taxExemptions: 0, country: 'SA' },
  { id: 'TWH-002', cycleEmployeeId: 'CE-PR-2026-08-006', iqamaNumber: '2000000006', grossIncome: 2600, taxableIncome: 2600, taxRate: 0, taxAmount: 0, ytdGross: 20800, ytdTax: 0, residentStatus: 'non-resident', taxExemptions: 0, country: 'SA' }
];

// ── Payroll zakat calculations ──
export const PAYROLL_ZAKAT_CALCULATIONS = [
  { id: 'ZAK-001', cycleEmployeeId: 'CE-PR-2026-08-001', zakatableIncome: 98000, zakatRate: 0.025, zakatAmount: 2450, nisabThreshold: 44660, isDeductedAutomatically: true, deductionStatus: 'deducted', ytdZakat: 2450, paymentStatus: 'paid' },
  { id: 'ZAK-002', cycleEmployeeId: 'CE-PR-2026-08-003', zakatableIncome: 72000, zakatRate: 0.025, zakatAmount: 1800, nisabThreshold: 44660, isDeductedAutomatically: true, deductionStatus: 'deducted', ytdZakat: 1800, paymentStatus: 'paid' }
];

// ── Payroll validations ──
export const PAYROLL_VALIDATIONS = [
  { id: 'PV-001', cycleId: 'PR-2026-08', validationType: 'error', severity: 'error', messageEn: 'Missing IBAN for EMP-0014', messageAr: 'IBAN مفقود لـ EMP-0014', employeeId: 'EMP-0014', field: 'iban', isBlocking: true, resolved: true },
  { id: 'PV-002', cycleId: 'PR-2026-08', validationType: 'warning', severity: 'warning', messageEn: 'Negative net salary for EMP-0027', messageAr: 'صافي راتب سالب لـ EMP-0027', employeeId: 'EMP-0027', field: 'net', isBlocking: false, resolved: true },
  { id: 'PV-003', cycleId: 'PR-2026-09', validationType: 'info', severity: 'info', messageEn: 'Payroll batch contains 27 employees', messageAr: 'دفعة الرواتب تحتوي على 27 موظفاً', employeeId: null, field: null, isBlocking: false, resolved: false }
];

// ── Payroll approvals ──
export const PAYROLL_APPROVALS = [
  { id: 'PA-001', cycleId: 'PR-2026-08', approvalLevel: 1, approverId: 'EMP-0004', approvalStatus: 'approved', comment: 'Payroll verified', approvedAt: '2026-09-01T14:00:00', isSequential: true },
  { id: 'PA-002', cycleId: 'PR-2026-08', approvalLevel: 2, approverId: 'EMP-0001', approvalStatus: 'approved', comment: 'Final approval', approvedAt: '2026-09-01T15:00:00', isSequential: true }
];

// ── Payroll adjustments ──
export const PAYROLL_ADJUSTMENTS = [
  { id: 'ADJ-001', originalCycleId: 'PR-2026-08', adjustmentType: 'bonus', adjustmentAmount: 500, effectivePeriodStart: '2026-08-01', effectivePeriodEnd: '2026-08-31', descriptionEn: 'Performance bonus for EMP-0003', descriptionAr: 'مكافأة أداء لـ EMP-0003', approvalStatus: 'approved', createdAt: '2026-09-03T10:00:00' },
  { id: 'ADJ-002', originalCycleId: 'PR-2026-08', adjustmentType: 'retroactive', adjustmentAmount: 300, effectivePeriodStart: '2026-07-01', effectivePeriodEnd: '2026-07-31', descriptionEn: 'Retroactive salary adjustment', descriptionAr: 'تعديل راتب بأثر رجعي', approvalStatus: 'pending', createdAt: '2026-09-05T10:00:00' }
];

// ── Payroll bank files ──
export const PAYROLL_BANK_FILES = [
  { id: 'BF-001', cycleId: 'PR-2026-08', fileFormat: 'xlsx', bankCode: '80', fileContent: 'base64_encoded', totalRecords: 27, totalAmount: 1250000, digitalSignature: 'sig_abc123', status: 'completed' },
  { id: 'BF-002', cycleId: 'PR-2026-09', fileFormat: 'csv', bankCode: '10', fileContent: '', totalRecords: 0, totalAmount: 0, digitalSignature: '', status: 'draft' }
];

// ── Payroll payslips ──
export const PAYROLL_PAYSLIPS = [
  { id: 'PS-001', cycleEmployeeId: 'CE-PR-2026-08-001', payslipNumber: 'PS-2026-08-001', generatedAt: '2026-09-01T10:00:00', deliveryMethod: 'email', isViewed: true, downloadCount: 3, pdfUrl: '', language: 'en' },
  { id: 'PS-002', cycleEmployeeId: 'CE-PR-2026-08-006', payslipNumber: 'PS-2026-08-006', generatedAt: '2026-09-01T10:00:00', deliveryMethod: 'portal', isViewed: false, downloadCount: 0, pdfUrl: '', language: 'ar' },
  { id: 'PS-003', cycleEmployeeId: 'CE-PR-2026-08-003', payslipNumber: 'PS-2026-08-003', generatedAt: '2026-09-01T10:00:00', deliveryMethod: 'email', isViewed: true, downloadCount: 1, pdfUrl: '', language: 'en' }
];

// ── Payroll cost allocation ──
export const PAYROLL_COST_ALLOCATION = [
  { id: 'CA-001', cycleEmployeeId: 'CE-PR-2026-08-001', costCenter: 'CC-200', percentage: 100, amount: 12250, department: 'HR', project: '' },
  { id: 'CA-002', cycleEmployeeId: 'CE-PR-2026-08-006', costCenter: 'CC-300', percentage: 60, amount: 9150, department: 'OPS', project: 'North Ring' },
  { id: 'CA-003', cycleEmployeeId: 'CE-PR-2026-08-006', costCenter: 'CC-400', percentage: 40, amount: 6100, department: 'PRO', project: '' }
];

// ── Payroll garnishments ──
export const PAYROLL_GARNISHMENTS = [
  { id: 'GR-001', emp: 'EMP-0010', garnishmentType: 'court_order', amount: 300, isFixedAmount: true, percentage: 0, priority: 1, remainingBalance: 1200, completionStatus: 'in-progress', courtOrderNumber: 'CO-2026-001' },
  { id: 'GR-002', emp: 'EMP-0007', garnishmentType: 'loan_attachment', amount: 200, isFixedAmount: true, percentage: 0, priority: 2, remainingBalance: 0, completionStatus: 'completed', courtOrderNumber: '' }
];

// ── Global payroll runs ──
export const GLOBAL_PAYROLL_RUNS = [
  { id: 'GPR-2026-08', runNameEn: 'August 2026 Global Payroll', runNameAr: 'رواتب أغسطس 2026 العالمية', monthYear: '2026-08', countries: ['SA', 'AE'], totalEmployees: 35, consolidatedGross: 850000, consolidatedNet: 620000, baseCurrencyTotal: 620000, approvalStatus: 'approved', paymentStatus: 'paid', currencyBreakdown: { SAR: 620000, AED: 0 } }
];

// ── Cross-border transfers ──
export const CROSS_BORDER_TRANSFERS = [
  { id: 'CBT-001', employeeId: 'EMP-0006', transferType: 'salary', sourceCountry: 'SA', destinationCountry: 'IN', sourceCurrency: 'SAR', destinationCurrency: 'INR', amount: 1800, exchangeRate: 22.45, exchangeRateDate: '2026-09-01', transferFee: 50, bankCharges: 25, bankDetails: { swift: 'SARBSAJJ', iban: 'SA1000000000000000000006', account: 'XXXXXX' }, paymentMethod: 'wire', transferReference: 'TXN-2026-0001', status: 'completed', purpose: 'Salary remittance', approvalStatus: 'approved', initiatedDate: '2026-09-01', expectedArrival: '2026-09-05', actualArrival: '2026-09-04' }
];

// ── Tax calculations ──
export const TAX_CALCULATIONS = [
  { id: 'TC-001', employeeId: 'EMP-0001', countryCode: 'SA', incomeTaxAmount: 0, socialSecurityAmount: 980, pensionContribution: 735, healthInsuranceAmount: 245, grossIncome: 12250, taxableIncome: 12250, totalDeductions: 1960, netSalary: 10290, ytdIncomeTax: 0, ytdSocialSecurity: 7840, ytdHealthInsurance: 1960, calculationDate: '2026-09-01' }
];

// ── Country payroll settings ──
export const COUNTRY_PAYROLL_SETTINGS = [
  { countryCode: 'SA', paymentFrequency: 'monthly', paymentDay: 27, currency: 'SAR', bankTransferSettings: { processingDays: 3, requiresWps: true }, roundingRules: 'round_to_nearest_riyal', filingRequirements: 'WPS monthly submission before 10th', thirteenthMonth: false, fourteenth_month: false, salary_advance_rules: 'Max 1 month basic, once per 12 months' },
  { countryCode: 'AE', paymentFrequency: 'monthly', paymentDay: 28, currency: 'AED', bankTransferSettings: { processingDays: 2, requiresWps: false }, roundingRules: 'round_to_nearest_dirham', filingRequirements: 'MoHRA monthly', thirteenthMonth: true, fourteenth_month: false, salary_advance_rules: 'Max 50% of salary' }
];

// ── Country compliance checklist ──
export const COUNTRY_COMPLIANCE_CHECKLIST = [
  { countryCode: 'SA', complianceCategory: 'registration', requirementName: 'GOSI Registration', dueDate: '2026-12-31', status: 'completed', documentRequired: true, documentUploaded: true, assignedTo: 'EMP-0004', penaltyAmount: 0, legalReference: 'GOSI Law Art. 2' },
  { countryCode: 'SA', complianceCategory: 'filing', requirementName: 'WPS Monthly Filing', dueDate: '2026-10-10', status: 'in_progress', documentRequired: true, documentUploaded: true, assignedTo: 'EMP-0004', penaltyAmount: 5000, legalReference: 'WPS Regulations Art. 5' },
  { countryCode: 'SA', complianceCategory: 'renewal', requirementName: 'Iqama Renewal Batch', dueDate: '2027-03-14', status: 'pending', documentRequired: true, documentUploaded: false, assignedTo: 'EMP-0001', penaltyAmount: 0, legalReference: 'Iqama Law Art. 10' }
];

// ── Global reports ──
export const GLOBAL_REPORTS = [
  { id: 'GR-001', reportType: 'headcount', countryScope: ['SA', 'AE'], dateRangeStart: '2026-08-01', dateRangeEnd: '2026-08-31', currencyScope: ['SAR', 'AED'], fileAttachment: '', status: 'generated', generatedAt: '2026-09-01T10:00:00', generatedBy: 'EMP-0001', reportData: { totalEmployees: 35, saudiCount: 6, expatCount: 29 } },
  { id: 'GR-002', reportType: 'payroll', countryScope: ['SA'], dateRangeStart: '2026-08-01', dateRangeEnd: '2026-08-31', currencyScope: ['SAR'], fileAttachment: '', status: 'generated', generatedAt: '2026-09-02T10:00:00', generatedBy: 'EMP-0004', reportData: { totalGross: 1567000, totalNet: 1250000, totalGosi: 317000 } }
];

// ── Skills (extended from hr-seed.js) ──
// These are the skill codes used in employee.skills arrays
export const SKILLS_EXTENDED = [
  { code: 'heavy-driving', en: 'Heavy-vehicle driving', ar: 'قيادة المعدات الثقيلة', category: 'technical' },
  { code: 'light-driving', en: 'Light-vehicle driving', ar: 'قيادة المركبات الخفيفة', category: 'technical' },
  { code: 'scaffolding', en: 'Scaffolding', ar: 'السقالات', category: 'construction' },
  { code: 'concrete-work', en: 'Concrete work', ar: 'أعمال الخرسانة', category: 'construction' },
  { code: 'site-safety', en: 'Site safety', ar: 'السلامة الموقعية', category: 'safety' },
  { code: 'blockwork', en: 'Blockwork', ar: 'البناء بالطوب', category: 'construction' },
  { code: 'tiling', en: 'Tiling', ar: 'التبليط', category: 'construction' },
  { code: 'plastering', en: 'Plastering', ar: 'اللياسة', category: 'construction' },
  { code: 'wiring', en: 'Electrical wiring', ar: 'التمديدات الكهربائية', category: 'technical' },
  { code: 'troubleshooting', en: 'Fault troubleshooting', ar: 'كشف الأعطال', category: 'technical' },
  { code: 'data-entry', en: 'Data entry', ar: 'إدخال البيانات', category: 'admin' },
  { code: 'recruitment', en: 'Recruitment', ar: 'الاستقطاب', category: 'hr' },
  { code: 'payroll', en: 'Payroll processing', ar: 'معالجة الرواتب', category: 'finance' },
  { code: 'accounting', en: 'Accounting', ar: 'المحاسبة', category: 'finance' },
  { code: 'supervision', en: 'Team supervision', ar: 'الإشراف على الفريق', category: 'management' },
  { code: 'interviewing', en: 'Interviewing', ar: 'المقابلات', category: 'hr' },
  { code: 'government-relations', en: 'Government relations', ar: 'العلاقات الحكومية', category: 'compliance' },
  { code: 'documentation', en: 'Documentation', ar: 'التوثيق', category: 'admin' },
  { code: 'logistics', en: 'Logistics coordination', ar: 'تنسيق اللوجستيات', category: 'ops' },
  { code: 'route-planning', en: 'Route planning', ar: 'تخطيط المسارات', category: 'technical' },
  { code: 'deep-cleaning', en: 'Deep cleaning', ar: 'التنظيف العميق', category: 'facilities' },
  { code: 'housekeeping', en: 'Housekeeping', ar: 'التدبير المنزلي', category: 'facilities' },
  { code: 'waste-handling', en: 'Waste handling', ar: 'التعامل مع النفايات', category: 'facilities' },
  { code: 'fixture-install', en: 'Fixture installation', ar: 'تركيب الأدوات الصحية', category: 'technical' },
  { code: 'pipefitting', en: 'Pipefitting', ar: 'تركيب الأنابيب', category: 'technical' },
  { code: 'drainage', en: 'Drainage works', ar: 'أعمال الصرف', category: 'technical' }
];

// ── Skills assessment scores (per employee) ──
export const SKILL_ASSESSMENTS = [
  { id: 'SA-001', emp: 'EMP-0020', skill: 'wiring', proficiency: 'advanced', yearsOfExperience: 8, certification: 'Electrician Level 3' },
  { id: 'SA-002', emp: 'EMP-0023', skill: 'scaffolding', proficiency: 'expert', yearsOfExperience: 10, certification: 'Scaffolding Supervisor' },
  { id: 'SA-003', emp: 'EMP-0002', skill: 'reporting', proficiency: 'intermediate', yearsOfExperience: 3, certification: '' },
  { id: 'SA-004', emp: 'EMP-0003', skill: 'government-relations', proficiency: 'expert', yearsOfExperience: 5, certification: 'PRO Certification' }
];

// ── Performance goals ──
export const PERFORMANCE_GOALS = [
  { id: 'GO-001', emp: 'EMP-0001', titleEn: 'Complete Nitaqat audit', titleAr: 'إتمام تدقيق نطاقات', descriptionEn: 'Ensure all Nitaqat requirements are met', descriptionAr: 'التأكد من استيفاء جميع متطلبات النطاقات', target: 100, current: 85, status: 'in-progress', category: 'compliance', dueDate: '2026-09-30', priority: 'high' },
  { id: 'GO-002', emp: 'EMP-0002', titleEn: 'Reduce site overtime', titleAr: 'تقليل العمل الإضافي في المواقع', descriptionEn: 'Reduce average overtime by 20%', descriptionAr: 'تقليل متوسط العمل الإضافي بنسبة 20%', target: 100, current: 60, status: 'in-progress', category: 'efficiency', dueDate: '2026-10-31', priority: 'medium' },
  { id: 'GO-003', emp: 'EMP-0020', titleEn: 'Obtain electrician certification', titleAr: 'الحصول على شهادة الكهربائي', descriptionEn: 'Pass electrician Level 3 exam', descriptionAr: 'اجتياز امتحان الكهربائي المستوى 3', target: 100, current: 40, status: 'in-progress', category: 'development', dueDate: '2026-12-31', priority: 'high' },
  { id: 'GO-004', emp: 'EMP-0001', titleEn: 'Complete 360 review', titleAr: 'إتمام مراجعة 360', descriptionEn: 'Submit 360-degree feedback for all team members', descriptionAr: 'تقديم ملاحظات 360 درجة لجميع أعضاء الفريق', target: 100, current: 100, status: 'completed', category: 'management', dueDate: '2026-09-15', priority: 'medium' }
];

// ── Tasks (extended) ──
export const TASKS_EXTENDED = [
  { id: 'TSK-009', titleEn: 'Review GOSI rates for 2027', titleAr: 'مراجعة معدلات التأمينات لعام 2027', owner: 'EMP-0004', due: '2026-09-20', priority: 'high', done: false, link: 'hr_gosi.html' },
  { id: 'TSK-010', titleEn: 'Update employee skills assessment', titleAr: 'تحديث تقييم المهارات', owner: 'EMP-0002', due: '2026-09-25', priority: 'medium', done: false, link: 'hr_employees.html' },
  { id: 'TSK-011', titleEn: 'Generate September payslips', titleAr: 'إنشاء كشوف الرواتب لشهر سبتمبر', owner: 'EMP-0004', due: '2026-09-27', priority: 'high', done: false, link: 'hr_payroll.html' },
  { id: 'TSK-012', titleEn: 'Complete WPS filing for August', titleAr: 'إتمام تقديم WPS لأغسطس', owner: 'EMP-0004', due: '2026-09-10', priority: 'high', done: true, link: 'hr_wps.html' },
  { id: 'TSK-013', titleEn: 'Update Nitaqat targets', titleAr: 'تحديث مستهدفات النطاقات', owner: 'EMP-0001', due: '2026-09-15', priority: 'medium', done: false, link: 'hr_settings.html' }
];

// ── Announcements ──
export const ANNOUNCEMENTS = [
  { id: 'ANN-001', titleEn: 'Ramadan Working Hours', titleAr: 'ساعات العمل في رمضان', bodyEn: 'During Ramadan, working hours will be reduced to 6 hours per day.', bodyAr: 'خلال رمضان، ستُخفَّض ساعات العمل إلى 6 ساعات يوميًا.', startDate: '2026-02-18', endDate: '2026-03-19', priority: 'high', isActive: false, createdBy: 'EMP-0001' },
  { id: 'ANN-002', titleEn: 'New Employee Onboarding', titleAr: 'إرشادات التوجيه للموظفين الجدد', bodyEn: 'All new employees must complete onboarding within their first week.', bodyAr: 'يجب على جميع الموظفين الجدد إكمال التوجيه خلال أول أسبوع.', startDate: '2026-09-01', endDate: '', priority: 'medium', isActive: true, createdBy: 'EMP-0001' },
  { id: 'ANN-003', titleEn: 'GOSI Rate Update', titleAr: 'تحديث معدلات التأمينات', bodyEn: 'GOSI pension rate increases to 10% effective July 2026.', BodyAr: 'ترتفع معدلة تقاعد التأمينات إلى 10% اعتباراً من يوليو 2026.', startDate: '2026-07-01', endDate: '', priority: 'high', isActive: true, createdBy: 'EMP-0004' }
];
