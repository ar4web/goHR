// HR + Operations ΓÇö bilingual engine (English Γçä Arabic).
// Pages hardcode English + data-i18n attributes; this module translates at runtime.
// Shell (sidebar/topbar) is translated by href/label lookup ΓÇö no build-time coupling.
// Persisted per browser (hr:lang); default comes from Settings (language).

import { NAV } from './shell-render.js';
import { SEED_COMPANY } from './hr-seed.js';

export const LANG_KEY = 'hr:lang';
export const LANG_EVENT = 'hr:langchange';

const STR = {
  en: {
    'navgroup.apps': 'Apps',
    'navgroup.forms': 'Forms',
    'navgroup.tables': 'Tables',
    'navgroup.charts': 'Charts',
    'navgroup.projects': 'Projects',
    'navgroup.ui-library': 'UI library',
    'navgroup.admin': 'Admin',
    'navgroup.layouts': 'Layouts',
    'navgroup.hr-operations': 'HR & Operations',
    'navgroup.workspace': 'Workspace',
    'navgroup.overview': 'Overview',
    'navgroup.people': 'People',
    'navgroup.operations': 'Operations',
    'navgroup.contracts': 'Contracts',
    'navgroup.time-leave': 'Time & Leave',
    'navgroup.payroll': 'Payroll',
    'navgroup.compliance-ksa': 'Compliance (KSA)',
    'navgroup.hiring': 'Hiring',
    'navgroup.growth': 'Growth',
    'navgroup.documents': 'Documents',
    'nav.notifications': 'Notifications',
    'nav.profile': 'Your profile',
    'nav.settings': 'Settings',
    'nav.hr-my-space': 'My space',
    'nav.hr-employees': 'Employees',
    'nav.hr-org': 'Org chart',
    'nav.hr-my-team': 'My team',
    'nav.hr-departments': 'Departments',
    'nav.hr-roles': 'Roles',
    'common.settingsSearch': 'Search settingsΓÇª',
    'common.noMatch': 'No matching settings',
    'common.export': 'Export',
    'common.import': 'Import',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.close': 'Close',
    'common.edit': 'Edit',
    'common.actions': 'Actions',
    'common.print': 'Print',
    'common.noData': 'No records found.',
    'common.status': 'Status',
    'common.chooseFile': 'Choose file',
    'common.gatewayTitle': 'Who is signing in?',
    'common.gatewaySub':
      'Pick your role to enter. No passwords on this device ΓÇö access is granted by your administrator.',
    'common.gatewayModules': 'modules',
    'common.gatewayHint': 'You can switch roles anytime from Roles & access.',
    'common.gatewayFoot': 'Internal tool ┬╖ Single-device preview',
    'common.template': 'Template',
    'common.days': 'days',
    'common.urgent': 'Urgent',
    'common.attention': 'Attention',
    'common.open': 'Open',
    'common.viewAll': 'View all',
    'common.markAllRead': 'Mark all read',
    'common.allMarkedRead': 'All notifications marked read',
    'common.viewAllNotif': 'View all notifications',
    'common.search': 'Search',
    'common.searchPh': 'Search pages or run a command…',
    'cmdk.navigate': 'navigate',
    'cmdk.select': 'select',
    'common.messages': 'Messages',
    'common.language': 'Language',
    'common.appearance': 'Appearance',
    'common.signOut': 'Sign out',
    'common.signedOut': 'Signed out (demo)',
    'common.preferences': 'Preferences',
    'common.employeeDirectory': 'Employee directory',
    'common.emptyInbox': 'You’re all caught up',
    'notif.huroob': 'Huroob case',
    'notif.iqamaExpired': 'Iqama expired',
    'notif.iqamaExpiring': 'Iqama expiring',
    'notif.qiwaDraft': 'Qiwa contract draft',
    'notif.dayShort': 'd',
    'notif.today': 'Today',
    'profile.role': 'HR Manager',
    'msg.rec': 'Recruitment',
    'msg.recBody': '3 new candidates for Site Engineer',
    'msg.pay': 'Payroll',
    'msg.payBody': 'September payroll is ready for review',
    'msg.gosi': 'GOSI',
    'msg.gosiBody': 'Monthly GOSI submission completed',
    'status.active': 'Active',
    'status.probation': 'Probation',
    'status.on-leave': 'On leave',
    'status.exited': 'Exited',
    'status.huroob': 'Huroob',
    'status.requested': 'Requested',
    'status.awaiting-release': 'Awaiting release',
    'status.on-time': 'On time',
    'status.inactive': 'Inactive',
    'status.bench': 'Bench',
    'status.deployed': 'Deployed',
    'status.authenticated': 'Authenticated',
    'status.sent': 'Sent',
    'status.draft': 'Draft',
    'status.pending': 'Pending',
    'status.approved': 'Approved',
    'status.rejected': 'Rejected',
    'status.paid': 'Paid',
    'status.expired': 'Expired',
    'status.expiring': 'Expiring',
    'status.valid': 'Valid',
    'status.missing': 'Missing',
    'status.deployable': 'Deployable',
    'status.blocked': 'Blocked',
    'status.present': 'Present',
    'status.late': 'Late',
    'status.absent': 'Absent',
    'status.submitted': 'Submitted',
    'status.accepted': 'Accepted',
    'status.returned': 'Returned',
    'status.issued': 'Issued',
    'status.overdue': 'Overdue',
    'hr.nav.analytics': 'Analytics',
    'nav.analytics': 'Analytics',
    'nav.employees': 'Employees',
    'hr.nav.employees': 'Employees',
    'hr.nav.mySpace': 'My space',
    'hr.dashboard.collapseAll': 'Collapse all',
    'hr.dashboard.expandAll': 'Expand all',
    'hr.dashboard.alerts': 'Needs attention',
    'hr.dashboard.deployTitle': 'Deployment mix',
    'hr.dashboard.expiries': 'Upcoming Iqama expiries',
    'hr.dashboard.zoneWorkforce': 'Workforce & HR dynamics',
    'hr.dashboard.headcount': 'Headcount status',
    'hr.dashboard.tenure': 'Tenure mix',
    'hr.dashboard.separation': 'Hired / boarded / exited ┬╖ 6 mo',
    'hr.dashboard.hired': 'Hired',
    'hr.dashboard.exitedW': 'Exited',
    'hr.dashboard.huroobTitle': 'Huroob ΓÇö needs legal attention',
    'hr.dashboard.setupSteps': 'steps to go live',
    'hr.dashboard.nitaqat': 'Nitaqat',
    'hr.dashboard.heads': 'heads',
    'hr.dashboard.zoneGeo': 'Geography & demographics',
    'hr.dashboard.rosterTitle': 'Site roster',
    'hr.dashboard.selectSite': 'Select a site on the map',
    'hr.dashboard.natMix': 'Nationality mix',
    'hr.dashboard.saudiExpat': 'Saudi / expat',
    'hr.dashboard.genderMix': 'Gender split',
    'hr.dashboard.male': 'Male',
    'hr.dashboard.female': 'Female',
    'hr.dashboard.profMix': 'Profession mix',
    'hr.dashboard.skillsCloud': 'Skills cloud',
    'hr.dashboard.sponsorMatrix': 'Sponsorship matrix',
    'hr.dashboard.mapSites': 'Sites',
    'hr.dashboard.mapClients': 'Clients',
    'hr.dashboard.mapWorkers': 'workers',
    'hr.dashboard.zoneCompliance': 'Compliance shield',
    'hr.dashboard.nitaqatMeter': 'Saudization vs target',
    'hr.dashboard.gap': 'Gap',
    'hr.dashboard.expiryDeck': 'Expiration alert deck',
    'hr.employees.saudi': 'Saudi',
    'hr.employees.expat': 'Expat',
    'hr.company.manage': 'Manage companiesΓÇª',
    'hr.myspace.profile': 'Profile',
    'hr.myspace.pay': "This month's pay",
    'hr.myspace.deploy': 'My deployment',
    'hr.myspace.leave': 'Annual leave',
    'hr.myspace.requests': 'My requests',
    'status.used': 'Used',
    'status.awaiting': 'Awaiting entry',
    'status.cancelled': 'Cancelled',
    'status.in-progress': 'In progress',
    'status.completed': 'Completed',
    'hr.nav.org': 'Org chart',
    'hr.p2.present': 'Present',
    'hr.p2.onLeave': 'On leave',
    'hr.p2.headcount': 'Headcount',
    'hr.p2.pending': 'Pending',
    'hr.p2.pendingReqs': 'Pending requests',
    'hr.p6.code': 'Code',
    'hr.p6.newDept': 'New department',
    'hr.p6.department': 'Department',
    'hr.p6.head': 'Head',
    'hr.p6.headcount': 'Headcount',
    'hr.p6.costCenter': 'Cost center',
    'hr.p6.previewAs': 'Preview sidebar as',
    'hr.p6.savePerms': 'Save permissions',
    'hr.p6.role': 'Role',
    'hr.p6.uxOnly': 'Display only ΓÇö the server always re-checks permissions.',
    'hr.ui.pretitle': 'HR & Operations',
    'hr.navgroup.settings': 'Settings',
    'hr.navgroup.system': 'System',
    'hr.p6.custom': 'Custom',
    'hr.org.tree': 'Reporting tree',
    'hr.org.depts': 'Departments',
    'st.title': 'Settings',
    'st.sub': 'Company, access and preferences in one place.',
    'st.navGeneral': 'General',
    'st.navNitaqat': 'Saudization & licence',
    'st.navPerms': 'Permissions',
    'st.navPrefs': 'Preferences',
    'st.generalT': 'Company profile',
    'st.generalD': 'Identity used across the workspace.',
    'st.coNameEn': 'Company name (EN)',
    'st.coNameAr': 'Company name (AR)',
    'st.cr': 'CR number',
    'st.vat': 'VAT number',
    'st.phone': 'Phone',
    'st.address': 'Address',
    'st.language': 'Language',
    'st.nitaqatT': 'Saudization & licence',
    'st.nitaqatD': 'Nitaqat target and licence confirmation.',
    'st.target': 'Saudization target %',
    'st.activity': 'Activity',
    'st.size': 'Company size',
    'st.licScope': 'Licence scope',
    'st.licConfirm': 'Licence confirmed',
    'st.licConfirmD': 'Owner or counsel confirmed the licence scope.',
    'st.permsT': 'User permissions',
    'st.permsD': 'Preview the workspace as another role.',
    'st.previewAs': 'Preview sidebar as',
    'st.openRoles': 'Open roles matrix',
    'st.prefsT': 'Preferences',
    'st.prefsD': 'Language, theme and workspace data.',
    'st.theme': 'Theme',
    'st.themeLight': 'Light',
    'st.themeDark': 'Dark',
    'st.reset': 'Reset workspace data',
    'st.resetD': 'Clears companies, role preview and imported rows on this device.',
    'st.saved': 'Saved'
  },
  ar: {
    'navgroup.apps': '╪º┘ä╪¬╪╖╪¿┘è┘é╪º╪¬',
    'navgroup.forms': '╪º┘ä┘å┘à╪º╪░╪¼',
    'navgroup.tables': '╪º┘ä╪¼╪»╪º┘ê┘ä',
    'navgroup.charts': '╪º┘ä╪▒╪│┘ê┘à ╪º┘ä╪¿┘è╪º┘å┘è╪⌐',
    'navgroup.projects': '╪º┘ä┘à╪┤╪º╪▒┘è╪╣',
    'navgroup.ui-library': '┘à┘â╪¬╪¿╪⌐ ╪º┘ä┘ê╪º╪¼┘ç╪⌐',
    'navgroup.admin': '╪º┘ä╪Ñ╪»╪º╪▒╪⌐',
    'navgroup.layouts': '╪º┘ä╪¬╪«╪╖┘è╪╖╪º╪¬',
    'navgroup.hr-operations': '╪º┘ä┘à┘ê╪º╪▒╪» ╪º┘ä╪¿╪┤╪▒┘è╪⌐ ┘ê╪º┘ä╪¬╪┤╪║┘è┘ä',
    'navgroup.workspace': '┘à╪│╪º╪¡╪⌐ ╪º┘ä╪╣┘à┘ä',
    'navgroup.overview': '┘å╪╕╪▒╪⌐ ╪╣╪º┘à╪⌐',
    'navgroup.people': '╪º┘ä┘à┘ê╪╕┘ü┘ê┘å',
    'navgroup.operations': '╪º┘ä╪¬╪┤╪║┘è┘ä',
    'navgroup.contracts': '╪º┘ä╪╣┘é┘ê╪»',
    'navgroup.time-leave': '╪º┘ä╪»┘ê╪º┘à ┘ê╪º┘ä╪Ñ╪¼╪º╪▓╪º╪¬',
    'navgroup.payroll': '╪º┘ä╪▒┘ê╪º╪¬╪¿',
    'navgroup.compliance-ksa': '╪º┘ä╪º┘à╪¬╪½╪º┘ä (╪º┘ä╪│╪╣┘ê╪»┘è╪⌐)',
    'navgroup.hiring': '╪º┘ä╪¬┘ê╪╕┘è┘ü',
    'navgroup.growth': '╪º┘ä╪¬╪╖┘ê┘è╪▒',
    'navgroup.documents': '╪º┘ä┘à╪│╪¬┘å╪»╪º╪¬',
    'nav.notifications': '╪º┘ä╪¬┘å╪¿┘è┘ç╪º╪¬',
    'nav.profile': '┘à┘ä┘ü┘â',
    'nav.settings': '╪º┘ä╪Ñ╪╣╪»╪º╪»╪º╪¬',
    'nav.hr-my-space': '┘à╪│╪º╪¡╪¬┘è',
    'nav.hr-employees': '╪º┘ä┘à┘ê╪╕┘ü┘ê┘å',
    'nav.hr-org': '╪º┘ä┘ç┘è┘â┘ä ╪º┘ä╪¬┘å╪╕┘è┘à┘è',
    'nav.hr-my-team': '┘ü╪▒┘è┘é┘è',
    'nav.hr-departments': '╪º┘ä╪Ñ╪»╪º╪▒╪º╪¬',
    'nav.hr-roles': '╪º┘ä╪ú╪»┘ê╪º╪▒',
    'common.settingsSearch': '╪º╪¿╪¡╪½ ┘ü┘è ╪º┘ä╪Ñ╪╣╪»╪º╪»╪º╪¬ΓÇª',
    'common.noMatch': '┘ä╪º ╪¬┘ê╪¼╪» ╪Ñ╪╣╪»╪º╪»╪º╪¬ ┘à╪╖╪º╪¿┘é╪⌐',
    'common.export': '╪¬╪╡╪»┘è╪▒',
    'common.import': '╪º╪│╪¬┘è╪▒╪º╪»',
    'common.save': '╪¡┘ü╪╕',
    'common.cancel': '╪Ñ┘ä╪║╪º╪í',
    'common.close': '╪Ñ╪║┘ä╪º┘é',
    'common.edit': '╪¬╪╣╪»┘è┘ä',
    'common.actions': '╪Ñ╪¼╪▒╪º╪í╪º╪¬',
    'common.print': '╪╖╪¿╪º╪╣╪⌐',
    'common.noData': '┘ä╪º ╪¬┘ê╪¼╪» ╪│╪¼┘ä╪º╪¬.',
    'common.status': '╪º┘ä╪¡╪º┘ä╪⌐',
    'common.chooseFile': '╪º╪«╪¬╪▒ ┘à┘ä┘ü┘ï╪º',
    'common.gatewayTitle': '┘à┘å ╪º┘ä╪░┘è ┘è╪│╪¼┘æ┘ä ╪º┘ä╪»╪«┘ê┘ä╪ƒ',
    'common.gatewaySub':
      '╪º╪«╪¬╪▒ ╪»┘ê╪▒┘â ┘ä┘ä╪»╪«┘ê┘ä. ┘ä╪º ╪¬┘ê╪¼╪» ┘â┘ä┘à╪º╪¬ ┘à╪▒┘ê╪▒ ╪╣┘ä┘ë ┘ç╪░╪º ╪º┘ä╪¼┘ç╪º╪▓ ΓÇö ╪º┘ä╪╡┘ä╪º╪¡┘è╪º╪¬ ╪¬┘Å┘à┘å╪¡ ┘à┘å ╪º┘ä┘à╪»┘è╪▒.',
    'common.gatewayModules': '┘ê╪¡╪»╪⌐',
    'common.gatewayHint': '┘è┘à┘â┘å┘â ╪¬╪¿╪»┘è┘ä ╪º┘ä╪»┘ê╪▒ ┘ü┘è ╪ú┘è ┘ê┘é╪¬ ┘à┘å ╪º┘ä╪ú╪»┘ê╪º╪▒ ┘ê╪º┘ä╪╡┘ä╪º╪¡┘è╪º╪¬.',
    'common.gatewayFoot': '╪ú╪»╪º╪⌐ ╪»╪º╪«┘ä┘è╪⌐ ┬╖ ┘à╪╣╪º┘è┘å╪⌐ ┘ä╪¼┘ç╪º╪▓ ┘ê╪º╪¡╪»',
    'common.template': '┘é╪º┘ä╪¿',
    'common.days': '┘è┘ê┘à',
    'common.urgent': '╪╣╪º╪¼┘ä',
    'common.attention': '╪¬┘å╪¿┘è┘ç',
    'common.open': '┘ü╪¬╪¡',
    'common.viewAll': '╪╣╪▒╪╢ ╪º┘ä┘â┘ä',
    'common.markAllRead': '╪¬╪╣┘è┘è┘å ╪º┘ä┘â┘ä ┘â┘à┘é╪▒┘ê╪í',
    'common.allMarkedRead': '╪¬┘à ╪¬╪╣┘è┘è┘å ┘â┘ä ╪º┘ä╪¬┘å╪¿┘è┘ç╪º╪¬ ┘â┘à┘é╪▒┘ê╪í╪⌐',
    'common.viewAllNotif': '╪╣╪▒╪╢ ┘â┘ä ╪º┘ä╪¬┘å╪¿┘è┘ç╪º╪¬',
    'common.search': 'بحث',
    'cmdk.navigate': 'تنقل',
    'cmdk.select': 'اختيار',
    'common.searchPh': '╪º╪¿╪¡╪½ ┘ü┘è ╪º┘ä╪╡┘ü╪¡╪º╪¬ ╪ú┘ê ┘å┘ü┘æ╪░ ╪ú┘à╪▒┘ï╪ºΓÇª',
    'common.messages': 'الرسائل',
    'common.language': 'اللغة',
    'common.appearance': 'المظهر',
    'common.signOut': 'تسجيل الخروج',
    'common.signedOut': 'تم تسجيل الخروج (نسخة تجريبية)',
    'common.preferences': 'التفضيلات',
    'common.employeeDirectory': 'دليل الموظفين',
    'common.emptyInbox': 'لا تنبيهات جديدة',
    'notif.huroob': 'بلاغ هروب',
    'notif.iqamaExpired': 'انتهت الإقامة',
    'notif.iqamaExpiring': 'الإقامة على وشك الانتهاء',
    'notif.qiwaDraft': 'مسودة عقد قوى',
    'notif.dayShort': 'يوم',
    'notif.today': 'اليوم',
    'profile.role': 'مدير الموارد البشرية',
    'msg.rec': 'التوظيف',
    'msg.recBody': '٣ مرشحين جدد لوظيفة مهندس موقع',
    'msg.pay': 'الرواتب',
    'msg.payBody': 'رواتب سبتمبر جاهزة للمراجعة',
    'msg.gosi': 'التأمينات',
    'msg.gosiBody': 'اكتمل تقديم التأمينات الشهري',
    'status.active': '┘å╪┤╪╖',
    'status.probation': '┘ü╪¬╪▒╪⌐ ╪¬╪¼╪▒╪¿╪⌐',
    'status.on-leave': '┘ü┘è ╪Ñ╪¼╪º╪▓╪⌐',
    'status.exited': '┘à┘å╪¬┘ç┘è╪⌐ ╪«╪»┘à╪¬┘ç',
    'status.huroob': '┘ç╪▒┘ê╪¿',
    'status.requested': '┘à╪╖┘ä┘ê╪¿',
    'status.awaiting-release': '╪¿╪º┘å╪¬╪╕╪º╪▒ ╪º┘ä╪Ñ╪«┘ä╪º╪í',
    'status.on-time': '┘ü┘è ╪º┘ä┘à┘ê╪╣╪»',
    'status.inactive': '╪║┘è╪▒ ┘å╪┤╪╖',
    'status.bench': '╪º╪¡╪¬┘è╪º╪╖┘è',
    'status.deployed': '┘à┘Å╪│┘å╪»',
    'status.authenticated': '┘à┘ê╪½┘æ┘é',
    'status.sent': '┘à┘Å╪▒╪│┘ä',
    'status.draft': '┘à╪│┘ê╪»╪⌐',
    'status.pending': '┘é┘è╪» ╪º┘ä╪º┘å╪¬╪╕╪º╪▒',
    'status.approved': '┘à╪╣╪¬┘à╪»',
    'status.rejected': '┘à╪▒┘ü┘ê╪╢',
    'status.paid': '┘à╪»┘ü┘ê╪╣',
    'status.expired': '┘à┘å╪¬┘ç┘è',
    'status.expiring': '┘é╪º╪▒╪¿ ╪╣┘ä┘ë ╪º┘ä╪º┘å╪¬┘ç╪º╪í',
    'status.valid': '╪│╪º╪▒┘è',
    'status.missing': '┘à┘ü┘é┘ê╪»',
    'status.deployable': '╪¼╪º┘ç╪▓ ┘ä┘ä╪¬┘ê╪▓┘è╪╣',
    'status.blocked': '┘à╪¡╪╕┘ê╪▒',
    'status.present': '╪¡╪º╪╢╪▒',
    'status.late': '┘à╪¬╪ú╪«╪▒',
    'status.absent': '╪║╪º╪ª╪¿',
    'status.submitted': '┘à┘Å┘é╪»┘Ä┘æ┘à',
    'status.accepted': '┘à┘é╪¿┘ê┘ä',
    'status.returned': '┘à┘Å╪╣╪º╪»',
    'status.issued': '┘à┘Å╪╡╪»╪▒╪⌐',
    'status.overdue': '┘à╪¬╪ú╪«╪▒╪⌐',
    'hr.nav.analytics': '╪º┘ä╪¬╪¡┘ä┘è┘ä╪º╪¬',
    'nav.analytics': '╪º┘ä╪¬╪¡┘ä┘è┘ä╪º╪¬',
    'nav.employees': '╪º┘ä┘à┘ê╪╕┘ü┘ê┘å',
    'hr.nav.employees': '╪º┘ä┘à┘ê╪╕┘ü┘ê┘å',
    'hr.nav.mySpace': '┘à╪│╪º╪¡╪¬┘è',
    'hr.dashboard.collapseAll': '╪╖┘è ╪º┘ä┘â┘ä',
    'hr.dashboard.expandAll': '╪¬┘ê╪│┘è╪╣ ╪º┘ä┘â┘ä',
    'hr.dashboard.alerts': '┘è╪¡╪¬╪º╪¼ ╪º┘å╪¬╪¿╪º┘ç┘ï╪º',
    'hr.dashboard.deployTitle': '┘à╪▓┘è╪¼ ╪º┘ä╪¬┘ê╪▓┘è╪╣',
    'hr.dashboard.expiries': '╪Ñ┘é╪º┘à╪º╪¬ ┘é╪º╪▒╪¿╪¬ ╪╣┘ä┘ë ╪º┘ä╪º┘å╪¬┘ç╪º╪í',
    'hr.dashboard.zoneWorkforce': '╪»┘è┘å╪º┘à┘è┘â┘è╪⌐ ╪º┘ä┘é┘ê┘ë ╪º┘ä╪╣╪º┘à┘ä╪⌐ ┘ê╪º┘ä┘à┘ê╪º╪▒╪» ╪º┘ä╪¿╪┤╪▒┘è╪⌐',
    'hr.dashboard.headcount': '╪¡╪º┘ä╪⌐ ╪º┘ä┘é┘ê┘ë ╪º┘ä╪╣╪º┘à┘ä╪⌐',
    'hr.dashboard.tenure': '┘à╪▓┘è╪¼ ┘à╪»╪» ╪º┘ä╪«╪»┘à╪⌐',
    'hr.dashboard.separation': '╪º┘ä┘à╪╣┘è┘å┘ê┘å / ╪º┘ä┘à┘ä╪¬╪¡┘é┘ê┘å / ╪º┘ä┘à┘å╪¬┘ç┘è╪⌐ ╪«╪»┘à╪º╪¬┘ç┘à ┬╖ ┘ª ╪ú╪┤┘ç╪▒',
    'hr.dashboard.hired': '┘à╪╣┘è┘å┘ê┘å',
    'hr.dashboard.exitedW': '╪«╪º╪▒╪¼┘ê┘å',
    'hr.dashboard.huroobTitle': '╪¿┘ä╪º╪║ ┘ç╪▒┘ê╪¿ ΓÇö ┘è╪¬╪╖┘ä╪¿ ┘à╪¬╪º╪¿╪╣╪⌐ ┘é╪º┘å┘ê┘å┘è╪⌐',
    'hr.dashboard.setupSteps': '╪«╪╖┘ê╪º╪¬ ┘ä┘ä╪¬╪┤╪║┘è┘ä',
    'hr.dashboard.nitaqat': '┘å╪╖╪º┘é╪º╪¬',
    'hr.dashboard.heads': '┘à┘ê╪╕┘ü┘ï╪º',
    'hr.dashboard.zoneGeo': '╪º┘ä╪¼╪║╪▒╪º┘ü┘è╪º ┘ê╪º┘ä╪¬╪▒┘â┘è╪¿╪⌐',
    'hr.dashboard.rosterTitle': '┘â╪┤┘ü ╪º┘ä┘à┘ê┘é╪╣',
    'hr.dashboard.selectSite': '╪º╪«╪¬╪▒ ┘à┘ê┘é╪╣┘ï╪º ╪╣┘ä┘ë ╪º┘ä╪«╪▒┘è╪╖╪⌐',
    'hr.dashboard.natMix': '┘à╪▓┘è╪¼ ╪º┘ä╪¼┘å╪│┘è╪º╪¬',
    'hr.dashboard.saudiExpat': '╪│╪╣┘ê╪»┘è / ╪ú╪¼┘å╪¿┘è',
    'hr.dashboard.genderMix': '╪º┘ä╪¬┘ê╪▓┘è╪╣ ╪¡╪│╪¿ ╪º┘ä╪¼┘å╪│',
    'hr.dashboard.male': '╪░┘â╪▒',
    'hr.dashboard.female': '╪ú┘å╪½┘ë',
    'hr.dashboard.profMix': '┘à╪▓┘è╪¼ ╪º┘ä┘à┘ç┘å',
    'hr.dashboard.skillsCloud': '╪│╪¡╪º╪¿╪⌐ ╪º┘ä┘à┘ç╪º╪▒╪º╪¬',
    'hr.dashboard.sponsorMatrix': '┘à╪╡┘ü┘ê┘ü╪⌐ ╪º┘ä┘â┘ü╪º┘ä╪⌐',
    'hr.dashboard.mapSites': '╪º┘ä┘à┘ê╪º┘é╪╣',
    'hr.dashboard.mapClients': '╪º┘ä╪╣┘à┘ä╪º╪í',
    'hr.dashboard.mapWorkers': '┘à┘ê╪╕┘ü┘ï╪º',
    'hr.dashboard.zoneCompliance': '╪»╪▒╪╣ ╪º┘ä╪º┘à╪¬╪½╪º┘ä',
    'hr.dashboard.nitaqatMeter': '╪º┘ä╪│╪╣┘ê╪»╪⌐ ┘à┘é╪º╪¿┘ä ╪º┘ä┘à╪│╪¬┘ç╪»┘ü',
    'hr.dashboard.gap': '╪º┘ä┘ü╪¼┘ê╪⌐',
    'hr.dashboard.expiryDeck': '┘ä┘ê╪¡╪⌐ ╪¬┘å╪¿┘è┘ç╪º╪¬ ╪º┘ä╪º┘å╪¬┘ç╪º╪í',
    'hr.employees.saudi': '╪│╪╣┘ê╪»┘è',
    'hr.employees.expat': '╪ú╪¼┘å╪¿┘è',
    'hr.company.manage': '╪Ñ╪»╪º╪▒╪⌐ ╪º┘ä╪┤╪▒┘â╪º╪¬ΓÇª',
    'hr.myspace.profile': '╪º┘ä┘à┘ä┘ü',
    'hr.myspace.pay': '╪▒╪º╪¬╪¿ ┘ç╪░╪º ╪º┘ä╪┤┘ç╪▒',
    'hr.myspace.deploy': '╪¬┘ê╪▓┘è╪╣┘è',
    'hr.myspace.leave': '╪º┘ä╪Ñ╪¼╪º╪▓╪⌐ ╪º┘ä╪│┘å┘ê┘è╪⌐',
    'hr.myspace.requests': '╪╖┘ä╪¿╪º╪¬┘è',
    'status.used': '┘à╪│╪¬╪«╪»┘à╪⌐',
    'status.awaiting': '╪¿╪º┘å╪¬╪╕╪º╪▒ ╪º┘ä╪»╪«┘ê┘ä',
    'status.cancelled': '┘à┘ä╪║╪º╪⌐',
    'status.in-progress': '┘é┘è╪» ╪º┘ä╪¬┘å┘ü┘è╪░',
    'status.completed': '┘à┘â╪¬┘à┘ä╪⌐',
    'hr.nav.org': '╪º┘ä┘ç┘è┘â┘ä ╪º┘ä╪¬┘å╪╕┘è┘à┘è',
    'hr.p2.present': '╪¡╪º╪╢╪▒┘ê┘å',
    'hr.p2.onLeave': '┘ü┘è ╪Ñ╪¼╪º╪▓╪⌐',
    'hr.p2.headcount': '╪╣╪»╪» ╪º┘ä┘ü╪▒┘è┘é',
    'hr.p2.pending': '┘à╪╣┘ä┘é╪⌐',
    'hr.p2.pendingReqs': '╪º┘ä╪╖┘ä╪¿╪º╪¬ ╪º┘ä┘à╪╣┘ä┘é╪⌐',
    'hr.p6.code': '╪º┘ä╪▒┘à╪▓',
    'hr.p6.newDept': '╪Ñ╪»╪º╪▒╪⌐ ╪¼╪»┘è╪»╪⌐',
    'hr.p6.department': '╪º┘ä╪Ñ╪»╪º╪▒╪⌐',
    'hr.p6.head': '╪º┘ä╪▒╪ª┘è╪│',
    'hr.p6.headcount': '╪╣╪»╪» ╪º┘ä┘à┘ê╪╕┘ü┘è┘å',
    'hr.p6.costCenter': '┘à╪▒┘â╪▓ ╪º┘ä╪¬┘â┘ä┘ü╪⌐',
    'hr.p6.previewAs': '┘à╪╣╪º┘è┘å╪⌐ ╪º┘ä┘é╪º╪ª┘à╪⌐ ╪¿╪»┘ê╪▒',
    'hr.p6.savePerms': '╪¡┘ü╪╕ ╪º┘ä╪╡┘ä╪º╪¡┘è╪º╪¬',
    'hr.p6.role': '╪º┘ä╪»┘ê╪▒',
    'hr.p6.uxOnly': '┘ä┘ä╪╣╪▒╪╢ ┘ü┘é╪╖ ΓÇö ╪º┘ä╪«╪º╪»┘à ┘è╪╣┘è╪» ╪º┘ä╪¬╪¡┘é┘é ┘à┘å ╪º┘ä╪╡┘ä╪º╪¡┘è╪º╪¬ ╪»╪º╪ª┘à┘ï╪º.',
    'hr.ui.pretitle': '╪º┘ä┘à┘ê╪º╪▒╪» ╪º┘ä╪¿╪┤╪▒┘è╪⌐ ┘ê╪º┘ä╪╣┘à┘ä┘è╪º╪¬',
    'hr.navgroup.settings': '╪º┘ä╪Ñ╪╣╪»╪º╪»╪º╪¬',
    'hr.navgroup.system': '╪º┘ä┘å╪╕╪º┘à',
    'hr.p6.custom': '┘à╪«╪╡╪╡',
    'hr.org.tree': '╪┤╪¼╪▒╪⌐ ╪º┘ä╪¬╪¿╪╣┘è╪⌐',
    'hr.org.depts': '╪º┘ä╪Ñ╪»╪º╪▒╪º╪¬',
    'st.title': '╪º┘ä╪Ñ╪╣╪»╪º╪»╪º╪¬',
    'st.sub': '╪º┘ä╪┤╪▒┘â╪⌐ ┘ê╪º┘ä╪╡┘ä╪º╪¡┘è╪º╪¬ ┘ê╪º┘ä╪¬┘ü╪╢┘è┘ä╪º╪¬ ┘ü┘è ┘à┘â╪º┘å ┘ê╪º╪¡╪».',
    'st.navGeneral': '╪╣╪º┘à',
    'st.navNitaqat': '╪º┘ä╪│╪╣┘ê╪»╪⌐ ┘ê╪º┘ä╪¬╪▒╪«┘è╪╡',
    'st.navPerms': '╪º┘ä╪╡┘ä╪º╪¡┘è╪º╪¬',
    'st.navPrefs': '╪º┘ä╪¬┘ü╪╢┘è┘ä╪º╪¬',
    'st.generalT': '┘à┘ä┘ü ╪º┘ä╪┤╪▒┘â╪⌐',
    'st.generalD': '╪º┘ä┘ç┘ê┘è╪⌐ ╪º┘ä┘à╪│╪¬╪«╪»┘à╪⌐ ┘ü┘è ┘à╪│╪º╪¡╪⌐ ╪º┘ä╪╣┘à┘ä.',
    'st.coNameEn': '╪º╪│┘à ╪º┘ä╪┤╪▒┘â╪⌐ (EN)',
    'st.coNameAr': '╪º╪│┘à ╪º┘ä╪┤╪▒┘â╪⌐ (AR)',
    'st.cr': '╪º┘ä╪│╪¼┘ä ╪º┘ä╪¬╪¼╪º╪▒┘è',
    'st.vat': '╪º┘ä╪▒┘é┘à ╪º┘ä╪╢╪▒┘è╪¿┘è',
    'st.phone': '╪º┘ä┘ç╪º╪¬┘ü',
    'st.address': '╪º┘ä╪╣┘å┘ê╪º┘å',
    'st.language': '╪º┘ä┘ä╪║╪⌐',
    'st.nitaqatT': '╪º┘ä╪│╪╣┘ê╪»╪⌐ ┘ê╪º┘ä╪¬╪▒╪«┘è╪╡',
    'st.nitaqatD': '┘à╪│╪¬┘ç╪»┘ü ╪º┘ä╪│╪╣┘ê╪»╪⌐ ┘ê╪¬╪ú┘â┘è╪» ╪º┘ä╪¬╪▒╪«┘è╪╡.',
    'st.target': '┘à╪│╪¬┘ç╪»┘ü ╪º┘ä╪│╪╣┘ê╪»╪⌐ ┘¬',
    'st.activity': '╪º┘ä┘å╪┤╪º╪╖',
    'st.size': '╪¡╪¼┘à ╪º┘ä╪┤╪▒┘â╪⌐',
    'st.licScope': '┘å╪╖╪º┘é ╪º┘ä╪¬╪▒╪«┘è╪╡',
    'st.licConfirm': '╪¬┘à ╪¬╪ú┘â┘è╪» ╪º┘ä╪¬╪▒╪«┘è╪╡',
    'st.licConfirmD': '╪ú┘â╪» ╪º┘ä┘à╪º┘ä┘â ╪ú┘ê ╪º┘ä┘à╪│╪¬╪┤╪º╪▒ ┘å╪╖╪º┘é ╪º┘ä╪¬╪▒╪«┘è╪╡.',
    'st.permsT': '╪╡┘ä╪º╪¡┘è╪º╪¬ ╪º┘ä┘à╪│╪¬╪«╪»┘à┘è┘å',
    'st.permsD': '╪╣╪º┘è┘å ┘à╪│╪º╪¡╪⌐ ╪º┘ä╪╣┘à┘ä ╪¿╪»┘ê╪▒ ╪ó╪«╪▒.',
    'st.previewAs': '╪╣╪º┘è┘å ╪º┘ä╪┤╪▒┘è╪╖ ╪º┘ä╪¼╪º┘å╪¿┘è ╪¿╪»┘ê╪▒',
    'st.openRoles': '┘ü╪¬╪¡ ┘à╪╡┘ü┘ê┘ü╪⌐ ╪º┘ä╪ú╪»┘ê╪º╪▒',
    'st.prefsT': '╪º┘ä╪¬┘ü╪╢┘è┘ä╪º╪¬',
    'st.prefsD': '╪º┘ä┘ä╪║╪⌐ ┘ê╪º┘ä┘à╪╕┘ç╪▒ ┘ê╪¿┘è╪º┘å╪º╪¬ ┘à╪│╪º╪¡╪⌐ ╪º┘ä╪╣┘à┘ä.',
    'st.theme': '╪º┘ä┘à╪╕┘ç╪▒',
    'st.themeLight': '┘ü╪º╪¬╪¡',
    'st.themeDark': '╪»╪º┘â┘å',
    'st.reset': '╪Ñ╪╣╪º╪»╪⌐ ╪¬╪╣┘è┘è┘å ╪¿┘è╪º┘å╪º╪¬ ┘à╪│╪º╪¡╪⌐ ╪º┘ä╪╣┘à┘ä',
    'st.resetD': '┘è┘à╪│╪¡ ╪º┘ä╪┤╪▒┘â╪º╪¬ ┘ê┘à╪╣╪º┘è┘å╪⌐ ╪º┘ä╪ú╪»┘ê╪º╪▒ ┘ê╪º┘ä╪╡┘ü┘ê┘ü ╪º┘ä┘à╪│╪¬┘ê╪▒╪»╪⌐ ╪╣┘ä┘ë ┘ç╪░╪º ╪º┘ä╪¼┘ç╪º╪▓.',
    'st.saved': '╪¬┘à ╪º┘ä╪¡┘ü╪╕'
  }
};

function storedLang() {
  try {
    return localStorage.getItem(LANG_KEY) || '';
  } catch (_e) {
    return '';
  }
}

function settingsDefaultLang() {
  try {
    const s = JSON.parse(localStorage.getItem('hr:settings:v1') || '{}');
    if (s.language) {
      return s.language;
    }
    return s.company && s.company.defaultLang ? s.company.defaultLang : '';
  } catch (_e) {
    return '';
  }
}

export function currentLang() {
  const l = storedLang() || settingsDefaultLang() || 'en';
  return l === 'ar' ? 'ar' : 'en';
}

export function t(key) {
  const lang = currentLang();
  return (STR[lang] && STR[lang][key]) || STR.en[key] || key;
}

/** Brand/logo URLs may only be remote images or image data-URLs (bounded). */
export function isSafeMediaUrl(url) {
  const u = String(url || '').trim();
  if (!u || u.length > 700000) {
    return false;
  }
  return u.startsWith('https://') || u.startsWith('http://') || u.startsWith('data:image/');
}

export function applyI18n(root = document) {
  const lang = currentLang();
  root.querySelectorAll('[data-i18n]').forEach(el => {
    const v = STR[lang][el.getAttribute('data-i18n')] || STR.en[el.getAttribute('data-i18n')];
    if (v) {
      el.textContent = v;
    }
  });
  root.querySelectorAll('[data-i18n-ph]').forEach(el => {
    const v = STR[lang][el.getAttribute('data-i18n-ph')] || STR.en[el.getAttribute('data-i18n-ph')];
    if (v) {
      el.setAttribute('placeholder', v);
    }
  });
}

function slugifyLabel(label) {
  return (label || '')
    .toLowerCase()
    .replace(/[^a-z]+/g, '-')
    .replace(/^-|-$/g, '');
}

// Translate build-time-injected shell (sidebar + topbar) by stable href/label lookup.
export function applyShellI18n() {
  const groups = document.querySelectorAll('.sidebar .nav-group');
  groups.forEach((g, gi) => {
    const def = NAV[gi];
    if (!def) {
      return;
    }
    const label = g.querySelector('.nav-label');
    if (label) {
      label.textContent = t(`navgroup.${slugifyLabel(def.label)}`);
    }
    def.items.forEach(item => {
      if (!item.children) {
        const a = g.querySelector(`a[href="${item.href}"] .nav-text`);
        if (a) {
          const k = `nav.${item.key}`;
          if (t(k) !== k) {a.textContent = t(k);}
        }
        return;
      }
      // Section parent: flat link, label via its i18n key.
      if (item.i18n && item.children[0]) {
        const lbl = g.querySelector(`a.nav-parent[href="${item.children[0].href}"] .nav-text`);
        if (lbl) {
          lbl.textContent = t(item.i18n);
        }
      }
    });
  });
  // Inline pages of the active section: translate whenever a nav.* key exists.
  document.querySelectorAll('.sidebar-nav .nav-page[data-navkey]').forEach(a => {
    const k = `nav.${a.getAttribute('data-navkey')}`;
    if (t(k) === k) {return;}
    const s = a.querySelector('.nav-text');
    if (s) {s.textContent = t(k);}
  });
  // Footer Settings toggle (the window itself is built translated at open).
  const settingsToggle = document.querySelector('.sidebar .settings-toggle .nav-text');
  if (settingsToggle) {
    settingsToggle.textContent = t('hr.navgroup.settings');
  }
  // Topbar language toggle shows a compact single letter of the active
  // language: E (English) or ع (Arabic).
  const langLabel = document.getElementById('topbar-lang-label');
  if (langLabel) {
    langLabel.textContent = currentLang() === 'ar' ? 'ع' : 'E';
  }
}

/** Apply owner brand (name + logo) to the sidebar. Only when saved in Settings. */
export function applyBranding() {
  let stored = null;
  try {
    stored = JSON.parse(localStorage.getItem('hr:settings:v1') || 'null');
  } catch (_e) {
    /* private mode */
  }
  // Multi-company: prefer the active profile, fall back to the legacy
  // single-company shape, then to seed defaults.
  const list = stored && Array.isArray(stored.companies) ? stored.companies : [];
  const active = list.find(c => c.id === stored.activeCompanyId) || list[0];
  const sc = active || (stored && stored.company) || {};
  const raw = {
    company: {
      nameEn: sc.nameEn || SEED_COMPANY.nameEn,
      nameAr: sc.nameAr || SEED_COMPANY.nameAr,
      logo: sc.logo || SEED_COMPANY.logoUrl,
      primary: sc.primary || SEED_COMPANY.primary
    }
  };
  if (!raw.company.nameEn) {
    return;
  }
  const lang = currentLang();
  const name = lang === 'ar' ? raw.company.nameAr || raw.company.nameEn : raw.company.nameEn;
  // White-label: browser tab + theme color follow the company profile.
  const base = (document.title.split('|')[0] || '').trim() || name;
  document.title = `${base} | ${String(name).replace(/\|/g, ' ')}`;
  const hex = raw.company.primary;
  // The seed company carries the built-in teal; only a genuinely customized
  // brand color overrides the theme accent — otherwise the dark-orange theme
  // (data-theme="dark") would be repainted teal at boot.
  const isCustomBrand =
    hex && hex.toLowerCase() !== (SEED_COMPANY.primary || '').toLowerCase();
  if (isCustomBrand && /^#[0-9a-fA-F]{6}$/.test(hex || '')) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const dk = [r, g, b].map(v => Math.round(v * 0.85));
    const root = document.documentElement.style;
    root.setProperty('--primary', hex);
    root.setProperty('--primary-rgb', `${r}, ${g}, ${b}`);
    root.setProperty('--primary-lt', `rgba(${r},${g},${b},0.1)`);
    root.setProperty('--primary-dk', `rgb(${dk[0]},${dk[1]},${dk[2]})`);
    root.setProperty('--sidebar-active', `rgba(${r},${g},${b},0.16)`);
    root.setProperty('--card-hover-border', `rgba(${r},${g},${b},0.25)`);
  }
  const brandName = document.querySelector('.sidebar-brand .brand-name');
  if (brandName) {
    brandName.textContent = name;
  }
  const icon = document.querySelector('.sidebar-brand .brand-icon');
  if (icon) {
    if (raw.company.logo && isSafeMediaUrl(raw.company.logo)) {
      icon.innerHTML = '';
      const img = document.createElement('img');
      img.src = raw.company.logo;
      img.alt = name;
      img.style.cssText = 'width:100%;height:100%;object-fit:contain;border-radius:inherit';
      icon.appendChild(img);
    } else if (!icon.querySelector('img')) {
      icon.textContent = (name || 'H').trim().charAt(0);
    }
  }
}

export function setLang(lang) {
  const next = lang === 'ar' ? 'ar' : 'en';
  try {
    localStorage.setItem(LANG_KEY, next);
  } catch (_e) {
    /* private mode */
  }
  document.documentElement.setAttribute('lang', next);
  document.documentElement.setAttribute('dir', next === 'ar' ? 'rtl' : 'ltr');
  applyI18n(document);
  applyShellI18n();
  applyBranding();
  window.dispatchEvent(new CustomEvent(LANG_EVENT, { detail: { lang: next } }));
}

let inited = false;

export function initI18n() {
  if (inited) {
    return;
  }
  inited = true;
  const lang = currentLang();
  document.documentElement.setAttribute('lang', lang);
  document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
  // Bind the topbar language toggle (rendered by the shell).
  const toggle = document.getElementById('lang-toggle');
  if (toggle && !toggle.dataset.bound) {
    toggle.dataset.bound = '1';
    toggle.addEventListener('click', () => setLang(currentLang() === 'ar' ? 'en' : 'ar'));
  }
  applyI18n(document);
  applyShellI18n();
  applyBranding();
}
