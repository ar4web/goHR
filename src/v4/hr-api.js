// HR + Operations — data access. Seed mode (default) merges hr-seed.js with any
// locally imported rows (localStorage overlay). API mode (?api=1) uses httpAdapter.

import { useApiMode, seedAdapter, httpAdapter } from './data-adapter.js';
import {
  EMPLOYEES,
  CLIENTS,
  SITES,
  ASSIGNMENTS,
  REQUESTS,
  LEAVE_TYPES,
  HOLIDAYS,
  EXPENSE_CATEGORIES,
  VISA_BLOCKS,
  VISAS,
  ONBOARDING,
  TRANSFERS,
  RESIDENCY_DOCS,
  DOCUMENTS,
  ORG_LINKS,
  SHIFTS,
  SITE_SHIFTS,
  ATTENDANCE,
  TIMESHEETS,
  LEAVE_REQUESTS,
  AJEER_PERMITS,
  INVOICES,
  PAY_RUNS,
  EXPENSES,
  ADVANCES,
  TEMPLATES,
  CONTRACTS,
  JOBS,
  CANDIDATES,
  INTERVIEWS,
  OFFERS,
  GOALS,
  REVIEWS,
  FEEDBACK,
  TRAININGS,
  DEPARTMENTS,
  ROLES,
  ROLE_SCOPES,
  AUDIT_LOG,
  ANNOUNCEMENTS,
  TASKS,
  SKILLS,
  COMPANIES,
  SALUTATIONS
} from './hr-seed.js';
import {
  PAYROLL_COMPONENTS,
  BANK_ACCOUNTS,
  DEPENDENTS,
  QUALIFICATIONS,
  EMERGENCY_CONTACTS,
  WARNINGS,
  ACHIEVEMENTS,
  PROMOTIONS,
  ATTENDANCE_POLICIES,
  EMPLOYEE_SHIFTS,
  ATTENDANCE_LOCATIONS,
  ATTENDANCE_DEVICES,
  ATTENDANCE_EXCEPTIONS,
  EXPENSE_POLICIES,
  EXPENSE_APPROVERS,
  SYSTEM_NOTIFICATIONS,
  APPROVAL_WORKFLOWS,
  APPROVAL_WORKFLOW_STEPS,
  APPROVAL_REQUESTS,
  APPROVAL_ACTIONS,
  SYSTEM_ALERTS,
  ALERT_SUBSCRIPTIONS,
  SYSTEM_ACTIVITY_LOG,
  CUSTOM_REPORTS,
  REPORT_SCHEDULES,
  INTEGRATION_LINKS,
  COUNTRIES,
  CURRENCIES,
  EXCHANGE_RATES,
  COUNTRY_LABOR_LAWS,
  COUNTRY_HOLIDAYS,
  EMPLOYEE_WORK_LOCATIONS,
  EXPATIATES,
  WORK_PERMITS,
  LEAVES_BALANCES,
  JOB_REQUISITIONS,
  PERFORMANCE_REVIEWS,
  TRAINING_PROGRAMS,
  TRAINING_ENROLLMENTS,
  PAYROLL_WPS_FILES,
  PAYROLL_TAX_WITHHOLDING,
  PAYROLL_ZAKAT_CALCULATIONS,
  PAYROLL_VALIDATIONS,
  PAYROLL_APPROVALS,
  PAYROLL_ADJUSTMENTS,
  PAYROLL_BANK_FILES,
  PAYROLL_PAYSLIPS,
  PAYROLL_COST_ALLOCATION,
  PAYROLL_GARNISHMENTS,
  GLOBAL_PAYROLL_RUNS,
  CROSS_BORDER_TRANSFERS,
  TAX_CALCULATIONS,
  COUNTRY_PAYROLL_SETTINGS,
  COUNTRY_COMPLIANCE_CHECKLIST,
  GLOBAL_REPORTS,
  SKILLS_EXTENDED,
  SKILL_ASSESSMENTS,
  PERFORMANCE_GOALS,
  TASKS_EXTENDED,
  SYSTEM_SETTINGS
} from './hr-seed-extra.js';

const SEED_MAP = {
  employees: EMPLOYEES,
  clients: CLIENTS,
  sites: SITES,
  assignments: ASSIGNMENTS,
  requests: REQUESTS,
  leaveTypes: LEAVE_TYPES,
  holidays: HOLIDAYS,
  expenseCategories: EXPENSE_CATEGORIES,
  visaBlocks: VISA_BLOCKS,
  visas: VISAS,
  onboarding: ONBOARDING,
  transfers: TRANSFERS,
  residencyDocs: RESIDENCY_DOCS,
  documents: DOCUMENTS,
  orgLinks: ORG_LINKS,
  shifts: SHIFTS,
  siteShifts: SITE_SHIFTS,
  attendance: ATTENDANCE,
  timesheets: TIMESHEETS,
  leaveRequests: LEAVE_REQUESTS,
  ajeerPermits: AJEER_PERMITS,
  invoices: INVOICES,
  payRuns: PAY_RUNS,
  expenses: EXPENSES,
  advances: ADVANCES,
  templates: TEMPLATES,
  contracts: CONTRACTS,
  jobs: JOBS,
  candidates: CANDIDATES,
  interviews: INTERVIEWS,
  offers: OFFERS,
  goals: GOALS,
  reviews: REVIEWS,
  feedback: FEEDBACK,
  trainings: TRAININGS,
  departments: DEPARTMENTS,
  roles: ROLES,
  roleScopes: ROLE_SCOPES,
  auditLog: AUDIT_LOG,
  announcements: ANNOUNCEMENTS,
  tasks: TASKS,
  skills: SKILLS,
  companies: COMPANIES,
  salutations: SALUTATIONS,
  // ── hr-seed-extra.js ──
  payrollComponents: PAYROLL_COMPONENTS,
  bankAccounts: BANK_ACCOUNTS,
  dependents: DEPENDENTS,
  qualifications: QUALIFICATIONS,
  emergencyContacts: EMERGENCY_CONTACTS,
  warnings: WARNINGS,
  achievements: ACHIEVEMENTS,
  promotions: PROMOTIONS,
  attendancePolicies: ATTENDANCE_POLICIES,
  employeeShifts: EMPLOYEE_SHIFTS,
  attendanceLocations: ATTENDANCE_LOCATIONS,
  attendanceDevices: ATTENDANCE_DEVICES,
  attendanceExceptions: ATTENDANCE_EXCEPTIONS,
  expensePolicies: EXPENSE_POLICIES,
  expenseApprovers: EXPENSE_APPROVERS,
  systemNotifications: SYSTEM_NOTIFICATIONS,
  approvalWorkflows: APPROVAL_WORKFLOWS,
  approvalWorkflowSteps: APPROVAL_WORKFLOW_STEPS,
  approvalRequests: APPROVAL_REQUESTS,
  approvalActions: APPROVAL_ACTIONS,
  systemAlerts: SYSTEM_ALERTS,
  alertSubscriptions: ALERT_SUBSCRIPTIONS,
  systemActivityLog: SYSTEM_ACTIVITY_LOG,
  customReports: CUSTOM_REPORTS,
  reportSchedules: REPORT_SCHEDULES,
  integrationLinks: INTEGRATION_LINKS,
  countries: COUNTRIES,
  currencies: CURRENCIES,
  exchangeRates: EXCHANGE_RATES,
  countryLaborLaws: COUNTRY_LABOR_LAWS,
  countryHolidays: COUNTRY_HOLIDAYS,
  employeeWorkLocations: EMPLOYEE_WORK_LOCATIONS,
  expatiates: EXPATIATES,
  workPermits: WORK_PERMITS,
  leavesBalances: LEAVES_BALANCES,
  jobRequisitions: JOB_REQUISITIONS,
  performanceReviews: PERFORMANCE_REVIEWS,
  trainingPrograms: TRAINING_PROGRAMS,
  trainingEnrollments: TRAINING_ENROLLMENTS,
  payrollWpsFiles: PAYROLL_WPS_FILES,
  payrollTaxWithholding: PAYROLL_TAX_WITHHOLDING,
  payrollZakatCalculations: PAYROLL_ZAKAT_CALCULATIONS,
  payrollValidations: PAYROLL_VALIDATIONS,
  payrollApprovals: PAYROLL_APPROVALS,
  payrollAdjustments: PAYROLL_ADJUSTMENTS,
  payrollBankFiles: PAYROLL_BANK_FILES,
  payrollPayslips: PAYROLL_PAYSLIPS,
  payrollCostAllocation: PAYROLL_COST_ALLOCATION,
  payrollGarnishments: PAYROLL_GARNISHMENTS,
  globalPayrollRuns: GLOBAL_PAYROLL_RUNS,
  crossBorderTransfers: CROSS_BORDER_TRANSFERS,
  taxCalculations: TAX_CALCULATIONS,
  countryPayrollSettings: COUNTRY_PAYROLL_SETTINGS,
  countryComplianceChecklist: COUNTRY_COMPLIANCE_CHECKLIST,
  globalReports: GLOBAL_REPORTS,
  skillsExtended: SKILLS_EXTENDED,
  skillAssessments: SKILL_ASSESSMENTS,
  performanceGoals: PERFORMANCE_GOALS,
  tasksExtended: TASKS_EXTENDED,
  systemSettings: SYSTEM_SETTINGS
};

const API_MAP = {
  employees: { path: '/api/hr/employees', listKey: 'employees' },
  clients: { path: '/api/hr/clients', listKey: 'clients' },
  sites: { path: '/api/hr/sites', listKey: 'sites' },
  assignments: { path: '/api/hr/assignments', listKey: 'assignments' },
  requests: { path: '/api/hr/requests', listKey: 'requests' },
  leaveTypes: { path: '/api/hr/leave-types', listKey: 'types' },
  holidays: { path: '/api/hr/holidays', listKey: 'holidays' },
  expenseCategories: { path: '/api/hr/expense-categories', listKey: 'categories' },
  visaBlocks: { path: '/api/hr/visa-blocks', listKey: 'blocks' },
  visas: { path: '/api/hr/visas', listKey: 'visas' },
  onboarding: { path: '/api/hr/onboarding', listKey: 'cases' },
  transfers: { path: '/api/hr/transfers', listKey: 'transfers' },
  residencyDocs: { path: '/api/hr/residency-docs', listKey: 'docs' },
  documents: { path: '/api/hr/documents', listKey: 'documents' },
  orgLinks: { path: '/api/hr/org', listKey: 'links' },
  shifts: { path: '/api/hr/shifts', listKey: 'shifts' },
  siteShifts: { path: '/api/hr/site-shifts', listKey: 'mappings' },
  attendance: { path: '/api/hr/attendance', listKey: 'rows' },
  timesheets: { path: '/api/hr/timesheets', listKey: 'sheets' },
  leaveRequests: { path: '/api/hr/leave-requests', listKey: 'requests' },
  ajeerPermits: { path: '/api/hr/ajeer', listKey: 'permits' },
  invoices: { path: '/api/hr/invoices', listKey: 'invoices' },
  payRuns: { path: '/api/hr/pay-runs', listKey: 'runs' },
  expenses: { path: '/api/hr/expenses', listKey: 'expenses' },
  advances: { path: '/api/hr/advances', listKey: 'advances' },
  templates: { path: '/api/hr/templates', listKey: 'templates' },
  contracts: { path: '/api/hr/contracts', listKey: 'contracts' },
  jobs: { path: '/api/hr/jobs', listKey: 'jobs' },
  candidates: { path: '/api/hr/candidates', listKey: 'candidates' },
  interviews: { path: '/api/hr/interviews', listKey: 'interviews' },
  offers: { path: '/api/hr/offers', listKey: 'offers' },
  goals: { path: '/api/hr/goals', listKey: 'goals' },
  reviews: { path: '/api/hr/reviews', listKey: 'reviews' },
  feedback: { path: '/api/hr/feedback', listKey: 'items' },
  trainings: { path: '/api/hr/trainings', listKey: 'trainings' },
  departments: { path: '/api/hr/departments', listKey: 'departments' },
  roles: { path: '/api/hr/roles', listKey: 'roles' },
  auditLog: { path: '/api/hr/audit', listKey: 'entries' },
  announcements: { path: '/api/hr/announcements', listKey: 'items' },
  tasks: { path: '/api/hr/tasks', listKey: 'tasks' },
  skills: { path: '/api/hr/skills', listKey: 'skills' },
  companies: { path: '/api/hr/companies', listKey: 'companies' },
  salutations: { path: '/api/hr/salutations', listKey: 'salutations' },
  // ── hr-seed-extra.js ──
  payrollComponents: { path: '/api/hr/payroll-components', listKey: 'components' },
  bankAccounts: { path: '/api/hr/bank-accounts', listKey: 'accounts' },
  dependents: { path: '/api/hr/dependents', listKey: 'dependents' },
  qualifications: { path: '/api/hr/qualifications', listKey: 'qualifications' },
  emergencyContacts: { path: '/api/hr/emergency-contacts', listKey: 'contacts' },
  warnings: { path: '/api/hr/warnings', listKey: 'warnings' },
  achievements: { path: '/api/hr/achievements', listKey: 'achievements' },
  promotions: { path: '/api/hr/promotions', listKey: 'promotions' },
  attendancePolicies: { path: '/api/hr/attendance-policies', listKey: 'policies' },
  employeeShifts: { path: '/api/hr/employee-shifts', listKey: 'shifts' },
  attendanceLocations: { path: '/api/hr/attendance-locations', listKey: 'locations' },
  attendanceDevices: { path: '/api/hr/attendance-devices', listKey: 'devices' },
  attendanceExceptions: { path: '/api/hr/attendance-exceptions', listKey: 'exceptions' },
  expensePolicies: { path: '/api/hr/expense-policies', listKey: 'policies' },
  expenseApprovers: { path: '/api/hr/expense-approvers', listKey: 'approvers' },
  systemNotifications: { path: '/api/hr/system-notifications', listKey: 'notifications' },
  approvalWorkflows: { path: '/api/hr/approval-workflows', listKey: 'workflows' },
  approvalWorkflowSteps: { path: '/api/hr/approval-workflow-steps', listKey: 'steps' },
  approvalRequests: { path: '/api/hr/approval-requests', listKey: 'requests' },
  approvalActions: { path: '/api/hr/approval-actions', listKey: 'actions' },
  systemAlerts: { path: '/api/hr/system-alerts', listKey: 'alerts' },
  alertSubscriptions: { path: '/api/hr/alert-subscriptions', listKey: 'subscriptions' },
  systemActivityLog: { path: '/api/hr/system-activity-log', listKey: 'entries' },
  customReports: { path: '/api/hr/custom-reports', listKey: 'reports' },
  reportSchedules: { path: '/api/hr/report-schedules', listKey: 'schedules' },
  integrationLinks: { path: '/api/hr/integration-links', listKey: 'links' },
  countries: { path: '/api/hr/countries', listKey: 'countries' },
  currencies: { path: '/api/hr/currencies', listKey: 'currencies' },
  exchangeRates: { path: '/api/hr/exchange-rates', listKey: 'rates' },
  countryLaborLaws: { path: '/api/hr/country-labor-laws', listKey: 'laws' },
  countryHolidays: { path: '/api/hr/country-holidays', listKey: 'holidays' },
  employeeWorkLocations: { path: '/api/hr/employee-work-locations', listKey: 'locations' },
  expatiates: { path: '/api/hr/expatiates', listKey: 'expatiates' },
  workPermits: { path: '/api/hr/work-permits', listKey: 'permits' },
  leavesBalances: { path: '/api/hr/leaves-balances', listKey: 'balances' },
  jobRequisitions: { path: '/api/hr/job-requisitions', listKey: 'requisitions' },
  performanceReviews: { path: '/api/hr/performance-reviews', listKey: 'reviews' },
  trainingPrograms: { path: '/api/hr/training-programs', listKey: 'programs' },
  trainingEnrollments: { path: '/api/hr/training-enrollments', listKey: 'enrollments' },
  payrollWpsFiles: { path: '/api/hr/payroll-wps-files', listKey: 'files' },
  payrollTaxWithholding: { path: '/api/hr/payroll-tax-withholding', listKey: 'withholdings' },
  payrollZakatCalculations: { path: '/api/hr/payroll-zakat-calculations', listKey: 'calculations' },
  payrollValidations: { path: '/api/hr/payroll-validations', listKey: 'validations' },
  payrollApprovals: { path: '/api/hr/payroll-approvals', listKey: 'approvals' },
  payrollAdjustments: { path: '/api/hr/payroll-adjustments', listKey: 'adjustments' },
  payrollBankFiles: { path: '/api/hr/payroll-bank-files', listKey: 'files' },
  payrollPayslips: { path: '/api/hr/payroll-payslips', listKey: 'payslips' },
  payrollCostAllocation: { path: '/api/hr/payroll-cost-allocation', listKey: 'allocations' },
  payrollGarnishments: { path: '/api/hr/payroll-garnishments', listKey: 'garnishments' },
  globalPayrollRuns: { path: '/api/hr/global-payroll-runs', listKey: 'runs' },
  crossBorderTransfers: { path: '/api/hr/cross-border-transfers', listKey: 'transfers' },
  taxCalculations: { path: '/api/hr/tax-calculations', listKey: 'calculations' },
  countryPayrollSettings: { path: '/api/hr/country-payroll-settings', listKey: 'settings' },
  countryComplianceChecklist: { path: '/api/hr/country-compliance-checklist', listKey: 'checklist' },
  globalReports: { path: '/api/hr/global-reports', listKey: 'reports' },
  skillsExtended: { path: '/api/hr/skills-extended', listKey: 'skills' },
  skillAssessments: { path: '/api/hr/skill-assessments', listKey: 'assessments' },
  performanceGoals: { path: '/api/hr/performance-goals', listKey: 'goals' },
  tasksExtended: { path: '/api/hr/tasks-extended', listKey: 'tasks' },
  systemSettings: { path: '/api/hr/system-settings', listKey: 'settings' }
};

function overlayRows(name) {
  try {
    return JSON.parse(localStorage.getItem(`hr:import:${name}`) || '[]');
  } catch (_e) {
    return [];
  }
}

function writeOverlay(name, rows) {
  try {
    localStorage.setItem(`hr:import:${name}`, JSON.stringify(rows));
  } catch (_e) {
    /* quota */
  }
}

function keyOf(r) {
  return r.code || r.id || r.emp || r.no;
}

export function saveImportedRows(name, rows) {
  const prev = overlayRows(name);
  writeOverlay(name, prev.concat(rows));
}

export function clearImportedRows(name) {
  try {
    localStorage.removeItem(`hr:import:${name}`);
  } catch (_e) {
    /* ignore */
  }
}

/** Upsert a patch into the overlay. `row` carries the key (code/id/emp/no). */
export function patchSeedRow(name, row, patch) {
  const rows = overlayRows(name);
  const k = keyOf(row);
  const merged = { ...row, ...patch };
  const i = rows.findIndex(r => keyOf(r) === k);
  if (i >= 0) {
    rows[i] = { ...rows[i], ...merged };
  } else {
    rows.push(merged);
  }
  writeOverlay(name, rows);
}

/** Seeds merged with local overlay (seed mode only). Overlay rows whose key
 *  matches a seed row act as patches; unknown keys append as new rows. */
export function getSeed(name) {
  const raw = SEED_MAP[name];
  if (raw && !Array.isArray(raw)) {
    return raw; // object seeds (e.g. roleScopes) carry no row overlays
  }
  const base = (raw || []).slice();
  const extra = overlayRows(name);
  if (!extra.length) {
    return base;
  }
  const out = base.slice();
  for (const r of extra) {
    const k = keyOf(r);
    const i = out.findIndex(x => keyOf(x) === k);
    if (i >= 0) {
      out[i] = { ...out[i], ...r };
    } else {
      out.push(r);
    }
  }
  return out;
}

const adapters = {};

export function hrAdapter(name) {
  if (adapters[name]) {
    return adapters[name];
  }
  let b;
  if (useApiMode() && API_MAP[name]) {
    b = httpAdapter(API_MAP[name].path, { listKey: API_MAP[name].listKey });
  } else {
    b = seedAdapter(getSeed(name));
  }
  adapters[name] = b;
  return b;
}

export async function hrList(name, query = {}) {
  return hrAdapter(name).list(query);
}

export function isApi() {
  return useApiMode();
}
