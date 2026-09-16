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
    // Customization studio (components/customize.js)
    'cz.title': 'Customization',
    'cz.company': 'Company profile',
    'cz.companyHint': 'Name and logo shown in the sidebar and browser tab.',
    'cz.logo': 'Logo',
    'cz.uploadLogo': 'Upload logo',
    'cz.removeLogo': 'Remove',
    'cz.logoHint': 'PNG, JPG, SVG or WebP image, up to 500 KB.',
    'cz.logoErr': 'Choose an image file smaller than 500 KB.',
    'cz.appearance': 'Appearance',
    'cz.accent': 'Accent color',
    'cz.hue': 'Color hue',
    'cz.typography': 'Typography',
    'cz.fontFamily': 'Font family',
    'cz.fontSize': 'Font size',
    'cz.ffInter': 'Inter',
    'cz.ffSystem': 'System UI',
    'cz.ffPlex': 'IBM Plex',
    'cz.shape': 'Shape, size & spacing',
    'cz.corner': 'Corner radius',
    'cz.spacing': 'Spacing & gaps',
    'cz.iconSize': 'Icon size',
    'cz.controlHeight': 'Button & input height',
    'cz.topbarHeight': 'Topbar height',
    'cz.sidebarWidth': 'Sidebar width',
    'cz.tables': 'Tables',
    'cz.tableAlign': 'Cell alignment',
    'cz.alignStart': 'Start',
    'cz.alignCenter': 'Center',
    'cz.alignEnd': 'End',
    'cz.customize': 'Customize…',
    'cz.reset': 'Reset to defaults',
    'cz.done': 'Done',
    'st.reset': 'Reset workspace data',
    'st.resetD': 'Clears companies, role preview and imported rows on this device.',
    'st.saved': 'Saved'
  },
  ar: {
    'navgroup.apps': 'التطبيقات',
    'navgroup.forms': 'النماذج',
    'navgroup.tables': 'الجداول',
    'navgroup.charts': 'الرسوم البيانية',
    'navgroup.projects': 'المشاريع',
    'navgroup.ui-library': 'مكتبة الواجهة',
    'navgroup.admin': 'الإدارة',
    'navgroup.layouts': 'التخطيطات',
    'navgroup.hr-operations': 'الموارد البشرية والتشغيل',
    'navgroup.workspace': 'مساحة العمل',
    'navgroup.overview': 'نظرة عامة',
    'navgroup.people': 'الموظفون',
    'navgroup.operations': 'التشغيل',
    'navgroup.contracts': 'العقود',
    'navgroup.time-leave': 'الدوام والإجازات',
    'navgroup.payroll': 'الرواتب',
    'navgroup.compliance-ksa': 'الامتثال (السعودية)',
    'navgroup.hiring': 'التوظيف',
    'navgroup.growth': 'التطوير',
    'navgroup.documents': 'المستندات',
    'nav.notifications': 'التنبيهات',
    'nav.profile': 'ملفك',
    'nav.settings': 'الإعدادات',
    'nav.hr-my-space': 'مساحتي',
    'nav.hr-employees': 'الموظفون',
    'nav.hr-org': 'الهيكل التنظيمي',
    'nav.hr-my-team': 'فريقي',
    'nav.hr-departments': 'الإدارات',
    'nav.hr-roles': 'الأدوار',
    'common.settingsSearch': 'ابحث في الإعدادات…',
    'common.noMatch': 'لا توجد إعدادات مطابقة',
    'common.export': 'تصدير',
    'common.import': 'استيراد',
    'common.save': 'حفظ',
    'common.cancel': 'إلغاء',
    'common.close': 'إغلاق',
    'common.edit': 'تعديل',
    'common.actions': 'إجراءات',
    'common.print': 'طباعة',
    'common.noData': 'لا توجد سجلات.',
    'common.status': 'الحالة',
    'common.chooseFile': 'اختر ملفًا',
    'common.gatewayTitle': 'من الذي يسجّل الدخول؟',
    'common.gatewaySub':
      '╪º╪«╪¬╪▒ ╪»┘ê╪▒┘â ┘ä┘ä╪»╪«┘ê┘ä. ┘ä╪º ╪¬┘ê╪¼╪» ┘â┘ä┘à╪º╪¬ ┘à╪▒┘ê╪▒ ╪╣┘ä┘ë ┘ç╪░╪º ╪º┘ä╪¼┘ç╪º╪▓ ΓÇö ╪º┘ä╪╡┘ä╪º╪¡┘è╪º╪¬ ╪¬┘Å┘à┘å╪¡ ┘à┘å ╪º┘ä┘à╪»┘è╪▒.',
    'common.gatewayModules': 'وحدة',
    'common.gatewayHint': 'يمكنك تبديل الدور في أي وقت من الأدوار والصلاحيات.',
    'common.gatewayFoot': 'أداة داخلية · معاينة لجهاز واحد',
    'common.template': 'قالب',
    'common.days': 'يوم',
    'common.urgent': 'عاجل',
    'common.attention': 'تنبيه',
    'common.open': 'فتح',
    'common.viewAll': 'عرض الكل',
    'common.markAllRead': 'تعيين الكل كمقروء',
    'common.allMarkedRead': 'تم تعيين كل التنبيهات كمقروءة',
    'common.viewAllNotif': 'عرض كل التنبيهات',
    'common.search': 'بحث',
    'cmdk.navigate': 'تنقل',
    'cmdk.select': 'اختيار',
    'common.searchPh': 'ابحث في الصفحات أو نفّذ أمرًا…',
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
    'status.active': 'نشط',
    'status.probation': 'فترة تجربة',
    'status.on-leave': 'في إجازة',
    'status.exited': 'منتهية خدمته',
    'status.huroob': 'هروب',
    'status.requested': 'مطلوب',
    'status.awaiting-release': 'بانتظار الإخلاء',
    'status.on-time': 'في الموعد',
    'status.inactive': 'غير نشط',
    'status.bench': 'احتياطي',
    'status.deployed': 'مُسند',
    'status.authenticated': 'موثّق',
    'status.sent': 'مُرسل',
    'status.draft': 'مسودة',
    'status.pending': 'قيد الانتظار',
    'status.approved': 'معتمد',
    'status.rejected': 'مرفوض',
    'status.paid': 'مدفوع',
    'status.expired': 'منتهي',
    'status.expiring': 'قارب على الانتهاء',
    'status.valid': 'ساري',
    'status.missing': 'مفقود',
    'status.deployable': 'جاهز للتوزيع',
    'status.blocked': 'محظور',
    'status.present': 'حاضر',
    'status.late': 'متأخر',
    'status.absent': 'غائب',
    'status.submitted': 'مُقدَّم',
    'status.accepted': 'مقبول',
    'status.returned': 'مُعاد',
    'status.issued': 'مُصدرة',
    'status.overdue': 'متأخرة',
    'hr.nav.analytics': 'التحليلات',
    'nav.analytics': 'التحليلات',
    'nav.employees': 'الموظفون',
    'hr.nav.employees': 'الموظفون',
    'hr.nav.mySpace': 'مساحتي',
    'hr.dashboard.collapseAll': 'طي الكل',
    'hr.dashboard.expandAll': 'توسيع الكل',
    'hr.dashboard.alerts': 'يحتاج انتباهًا',
    'hr.dashboard.deployTitle': 'مزيج التوزيع',
    'hr.dashboard.expiries': 'إقامات قاربت على الانتهاء',
    'hr.dashboard.zoneWorkforce': 'ديناميكية القوى العاملة والموارد البشرية',
    'hr.dashboard.headcount': 'حالة القوى العاملة',
    'hr.dashboard.tenure': 'مزيج مدد الخدمة',
    'hr.dashboard.separation': 'المعينون / الملتحقون / المنتهية خدماتهم · ٦ أشهر',
    'hr.dashboard.hired': 'معينون',
    'hr.dashboard.exitedW': 'خارجون',
    'hr.dashboard.huroobTitle': 'بلاغ هروب — يتطلب متابعة قانونية',
    'hr.dashboard.setupSteps': 'خطوات للتشغيل',
    'hr.dashboard.nitaqat': 'نطاقات',
    'hr.dashboard.heads': 'موظفًا',
    'hr.dashboard.zoneGeo': 'الجغرافيا والتركيبة',
    'hr.dashboard.rosterTitle': 'كشف الموقع',
    'hr.dashboard.selectSite': 'اختر موقعًا على الخريطة',
    'hr.dashboard.natMix': 'مزيج الجنسيات',
    'hr.dashboard.saudiExpat': 'سعودي / أجنبي',
    'hr.dashboard.genderMix': 'التوزيع حسب الجنس',
    'hr.dashboard.male': 'ذكر',
    'hr.dashboard.female': 'أنثى',
    'hr.dashboard.profMix': 'مزيج المهن',
    'hr.dashboard.skillsCloud': 'سحابة المهارات',
    'hr.dashboard.sponsorMatrix': 'مصفوفة الكفالة',
    'hr.dashboard.mapSites': 'المواقع',
    'hr.dashboard.mapClients': 'العملاء',
    'hr.dashboard.mapWorkers': 'موظفًا',
    'hr.dashboard.zoneCompliance': 'درع الامتثال',
    'hr.dashboard.nitaqatMeter': 'السعودة مقابل المستهدف',
    'hr.dashboard.gap': 'الفجوة',
    'hr.dashboard.expiryDeck': 'لوحة تنبيهات الانتهاء',
    'hr.employees.saudi': 'سعودي',
    'hr.employees.expat': 'أجنبي',
    'hr.company.manage': 'إدارة الشركات…',
    'hr.myspace.profile': 'الملف',
    'hr.myspace.pay': 'راتب هذا الشهر',
    'hr.myspace.deploy': 'توزيعي',
    'hr.myspace.leave': 'الإجازة السنوية',
    'hr.myspace.requests': 'طلباتي',
    'status.used': 'مستخدمة',
    'status.awaiting': 'بانتظار الدخول',
    'status.cancelled': 'ملغاة',
    'status.in-progress': 'قيد التنفيذ',
    'status.completed': 'مكتملة',
    'hr.nav.org': 'الهيكل التنظيمي',
    'hr.p2.present': 'حاضرون',
    'hr.p2.onLeave': 'في إجازة',
    'hr.p2.headcount': 'عدد الفريق',
    'hr.p2.pending': 'معلقة',
    'hr.p2.pendingReqs': 'الطلبات المعلقة',
    'hr.p6.code': 'الرمز',
    'hr.p6.newDept': 'إدارة جديدة',
    'hr.p6.department': 'الإدارة',
    'hr.p6.head': 'الرئيس',
    'hr.p6.headcount': 'عدد الموظفين',
    'hr.p6.costCenter': 'مركز التكلفة',
    'hr.p6.previewAs': 'معاينة القائمة بدور',
    'hr.p6.savePerms': 'حفظ الصلاحيات',
    'hr.p6.role': 'الدور',
    'hr.p6.uxOnly': 'للعرض فقط — الخادم يعيد التحقق من الصلاحيات دائمًا.',
    'hr.ui.pretitle': 'الموارد البشرية والعمليات',
    'hr.navgroup.settings': 'الإعدادات',
    'hr.navgroup.system': 'النظام',
    'hr.p6.custom': 'مخصص',
    'hr.org.tree': 'شجرة التبعية',
    'hr.org.depts': 'الإدارات',
    'st.title': 'الإعدادات',
    'st.sub': 'الشركة والصلاحيات والتفضيلات في مكان واحد.',
    'st.navGeneral': 'عام',
    'st.navNitaqat': 'السعودة والترخيص',
    'st.navPerms': 'الصلاحيات',
    'st.navPrefs': 'التفضيلات',
    'st.generalT': 'ملف الشركة',
    'st.generalD': 'الهوية المستخدمة في مساحة العمل.',
    'st.coNameEn': 'اسم الشركة (EN)',
    'st.coNameAr': 'اسم الشركة (AR)',
    'st.cr': 'السجل التجاري',
    'st.vat': 'الرقم الضريبي',
    'st.phone': 'الهاتف',
    'st.address': 'العنوان',
    'st.language': 'اللغة',
    'st.nitaqatT': 'السعودة والترخيص',
    'st.nitaqatD': 'مستهدف السعودة وتأكيد الترخيص.',
    'st.target': 'مستهدف السعودة ٪',
    'st.activity': 'النشاط',
    'st.size': 'حجم الشركة',
    'st.licScope': 'نطاق الترخيص',
    'st.licConfirm': 'تم تأكيد الترخيص',
    'st.licConfirmD': 'أكد المالك أو المستشار نطاق الترخيص.',
    'st.permsT': 'صلاحيات المستخدمين',
    'st.permsD': 'عاين مساحة العمل بدور آخر.',
    'st.previewAs': 'عاين الشريط الجانبي بدور',
    'st.openRoles': 'فتح مصفوفة الأدوار',
    'st.prefsT': 'التفضيلات',
    'st.prefsD': 'اللغة والمظهر وبيانات مساحة العمل.',
    'st.theme': 'المظهر',
    'st.themeLight': 'فاتح',
    'st.themeDark': 'داكن',
    // استوديو التخصيص (components/customize.js)
    'cz.title': 'التخصيص',
    'cz.company': 'ملف الشركة',
    'cz.companyHint': 'الاسم والشعار يظهران في الشريط الجانبي وتبويب المتصفح.',
    'cz.logo': 'الشعار',
    'cz.uploadLogo': 'تحميل شعار',
    'cz.removeLogo': 'إزالة',
    'cz.logoHint': 'صورة PNG أو JPG أو SVG أو WebP، حتى 500 كيلوبايت.',
    'cz.logoErr': 'اختر ملف صورة بحجم أقل من 500 كيلوبايت.',
    'cz.appearance': 'المظهر',
    'cz.accent': 'اللون الأساسي',
    'cz.hue': 'درجة اللون',
    'cz.typography': 'الطباعة',
    'cz.fontFamily': 'نوع الخط',
    'cz.fontSize': 'حجم الخط',
    'cz.ffInter': 'إنتر',
    'cz.ffSystem': 'خط النظام',
    'cz.ffPlex': 'آي بي إم بلكس',
    'cz.shape': 'الشكل والحجم والمسافات',
    'cz.corner': 'استدارة الحواف',
    'cz.spacing': 'المسافات والفجوات',
    'cz.iconSize': 'حجم الأيقونات',
    'cz.controlHeight': 'ارتفاع الأزرار والحقول',
    'cz.topbarHeight': 'ارتفاع الشريط العلوي',
    'cz.sidebarWidth': 'عرض الشريط الجانبي',
    'cz.tables': 'الجداول',
    'cz.tableAlign': 'محاذاة الخلايا',
    'cz.alignStart': 'البداية',
    'cz.alignCenter': 'الوسط',
    'cz.alignEnd': 'النهاية',
    'cz.customize': 'تخصيص…',
    'cz.reset': 'استعادة الافتراضي',
    'cz.done': 'تم',
    'st.reset': 'إعادة تعيين بيانات مساحة العمل',
    'st.resetD': 'يمسح الشركات ومعاينة الأدوار والصفوف المستوردة على هذا الجهاز.',
    'st.saved': 'تم الحفظ'
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
  // The language toggle is a plain icon; its accessible name is refreshed
  // by the shell-chrome module when the language changes.
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
