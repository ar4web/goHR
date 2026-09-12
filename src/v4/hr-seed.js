// HR + Operations — shared demo seed (manpower-supply company, Riyadh).
// Fictional data only (sequential fake IDs). Company profile / Nitaqat / licence
// are placeholders — the owner edits them in Settings (hr_settings.html).
// In API mode (?api=1) these are replaced by /api/hr/* via hr-api.js.

export const SEED_COMPANY = {
  nameEn: 'Manpower Supply Co.',
  nameAr: 'شركة توريد العمالة',
  crNo: '1010XXXXXX',
  addressEn: 'Riyadh, Saudi Arabia',
  addressAr: 'الرياض، المملكة العربية السعودية',
  logoUrl: '',
  primary: '#1ABB9C',
  defaultLang: 'en'
};

export const SEED_NITAQAT = {
  activity: '', // set in Settings, e.g. "Construction — Alexandria, VA 22302"
  sizeClass: '', // set in Settings, e.g. "Medium (50–499)"
  targetPct: 0, // Saudization target % for the band math
  notes: ''
};

export const SEED_LICENCE = {
  scope: 'both', // service | labour | both — confirm with counsel (D11)
  licenceNo: '',
  notes: '',
  strictAjeerGuards: true // pre-2026 secondment guardrails ON until counsel relaxes
};

export const DEPARTMENTS = [
  { code: 'OPS', en: 'Operations', ar: 'التشغيل', head: 'EMP-0004', costCenter: 'CC-100' },
  {
    code: 'HR',
    en: 'Human Resources',
    ar: 'الموارد البشرية',
    head: 'EMP-0001',
    costCenter: 'CC-200'
  },
  { code: 'FIN', en: 'Finance', ar: 'المالية', head: 'EMP-0002', costCenter: 'CC-300' },
  {
    code: 'PRO',
    en: 'Government Relations',
    ar: 'العلاقات الحكومية',
    head: 'EMP-0003',
    costCenter: 'CC-400'
  },
  { code: 'REC', en: 'Recruitment', ar: 'التوظيف', head: 'EMP-0005', costCenter: 'CC-500' }
];

export const PROFESSIONS = [
  { code: 'driver', en: 'Driver', ar: 'سائق' },
  { code: 'cleaner', en: 'Cleaner', ar: 'عامل نظافة' },
  { code: 'construction', en: 'Construction worker', ar: 'عامل إنشاءات' },
  { code: 'mason', en: 'Mason', ar: 'بناء' },
  { code: 'electrician', en: 'Electrician', ar: 'كهربائي' },
  { code: 'plumber', en: 'Plumber', ar: 'سباك' },
  { code: 'guard', en: 'Security guard', ar: 'حارس أمن' },
  { code: 'foreman', en: 'Foreman', ar: 'مشرف عمال' },
  { code: 'office', en: 'Office assistant', ar: 'مساعد إداري' },
  { code: 'specialist', en: 'Specialist', ar: 'أخصائي' }
];

// — T2 Command Center seed extensions (v3 §2–§3, §6) —
export const SKILLS = [
  { code: 'heavy-driving', en: 'Heavy-vehicle driving', ar: 'قيادة المعدات الثقيلة' },
  { code: 'light-driving', en: 'Light-vehicle driving', ar: 'قيادة المركبات الخفيفة' },
  { code: 'route-planning', en: 'Route planning', ar: 'تخطيط المسارات' },
  { code: 'deep-cleaning', en: 'Deep cleaning', ar: 'التنظيف العميق' },
  { code: 'waste-handling', en: 'Waste handling', ar: 'التعامل مع النفايات' },
  { code: 'housekeeping', en: 'Housekeeping', ar: 'التدبير المنزلي' },
  { code: 'scaffolding', en: 'Scaffolding', ar: 'السقالات' },
  { code: 'concrete-work', en: 'Concrete work', ar: 'أعمال الخرسانة' },
  { code: 'site-safety', en: 'Site safety', ar: 'السلامة الموقعية' },
  { code: 'blockwork', en: 'Blockwork', ar: 'البناء بالطوب' },
  { code: 'tiling', en: 'Tiling', ar: 'التبليط' },
  { code: 'plastering', en: 'Plastering', ar: 'اللياسة' },
  { code: 'wiring', en: 'Electrical wiring', ar: 'التمديدات الكهربائية' },
  { code: 'panel-maintenance', en: 'Panel maintenance', ar: 'صيانة اللوحات' },
  { code: 'troubleshooting', en: 'Fault troubleshooting', ar: 'كشف الأعطال' },
  { code: 'pipefitting', en: 'Pipefitting', ar: 'تركيب الأنابيب' },
  { code: 'drainage', en: 'Drainage works', ar: 'أعمال الصرف' },
  { code: 'fixture-install', en: 'Fixture installation', ar: 'تركيب الأدوات الصحية' },
  { code: 'supervision', en: 'Team supervision', ar: 'الإشراف على الفريق' },
  { code: 'reporting', en: 'Site reporting', ar: 'تقارير الموقع' },
  { code: 'data-entry', en: 'Data entry', ar: 'إدخال البيانات' },
  { code: 'filing', en: 'Filing & records', ar: 'الأرشفة' },
  { code: 'reception', en: 'Reception', ar: 'الاستقبال' },
  { code: 'recruitment', en: 'Recruitment', ar: 'الاستقطاب' },
  { code: 'employee-relations', en: 'Employee relations', ar: 'علاقات الموظفين' },
  { code: 'scheduling', en: 'Shift scheduling', ar: 'جدولة الورديات' },
  { code: 'logistics', en: 'Logistics coordination', ar: 'تنسيق اللوجستيات' },
  { code: 'government-relations', en: 'Government relations', ar: 'العلاقات الحكومية' },
  { code: 'documentation', en: 'Documentation', ar: 'التوثيق' },
  { code: 'payroll', en: 'Payroll processing', ar: 'معالجة الرواتب' },
  { code: 'accounting', en: 'Accounting', ar: 'المحاسبة' },
  { code: 'interviewing', en: 'Interviewing', ar: 'المقابلات' }
];

export const SPONSORS = [
  {
    id: 'HQ',
    nameEn: 'Manpower Supply Co. — HQ',
    nameAr: 'شركة توريد العمالة — المركز الرئيسي',
    cr: '1010XXXXXX',
    city: 'Riyadh'
  },
  {
    id: 'BR-JED',
    nameEn: 'Manpower Supply Co. — Jeddah Branch',
    nameAr: 'شركة توريد العمالة — فرع جدة',
    cr: '4030XXXXXX',
    city: 'Jeddah'
  }
];

export const LEAVE_DELAY_REASONS = [
  { code: 'flight', en: 'Flight delay', ar: 'تأخر رحلة الطيران' },
  { code: 'emergency', en: 'Family emergency', ar: 'ظرف عائلي طارئ' },
  { code: 'transfer-delay', en: 'Transfer delay', ar: 'تأخر النقل' },
  { code: 'other', en: 'Other', ar: 'أخرى' }
];

// owner = EMP code (personal) or role code (hr/pro/payroll/finance/manager).
// done flips via the hr:import:tasks overlay (same import machinery as the rest).
export const TASKS = [
  {
    id: 'TSK-01',
    titleEn: 'Renew iqamas expiring within 30 days',
    titleAr: 'تجديد الإقامات التي تنتهي خلال ٣٠ يومًا',
    owner: 'pro',
    due: '2026-09-15',
    priority: 'high',
    done: false,
    link: 'hr_sa_compliance.html'
  },
  {
    id: 'TSK-02',
    titleEn: 'Close huroob case file (EMP-0027)',
    titleAr: 'إغلاق ملف بلاغ الهروب (EMP-0027)',
    owner: 'hr',
    due: '2026-09-14',
    priority: 'high',
    done: false,
    link: 'hr_employee.html?code=EMP-0027'
  },
  {
    id: 'TSK-03',
    titleEn: 'Approve leave LV-2026-031 (site coverage check)',
    titleAr: 'اعتماد الإجازة LV-2026-031 (التحقق من تغطية الموقع)',
    owner: 'manager',
    due: '2026-09-12',
    priority: 'medium',
    done: false,
    link: 'hr_leave.html'
  },
  {
    id: 'TSK-04',
    titleEn: 'Review August WPS SIF before Mudad upload',
    titleAr: 'مراجعة ملف الأجور لشهر أغسطس قبل الرفع على مدد',
    owner: 'payroll',
    due: '2026-09-13',
    priority: 'high',
    done: false,
    link: 'hr_wps.html'
  },
  {
    id: 'TSK-05',
    titleEn: 'Sign off EOSB settlement batch',
    titleAr: 'اعتماد دفعة تسويات نهاية الخدمة',
    owner: 'finance',
    due: '2026-09-25',
    priority: 'medium',
    done: false,
    link: 'hr_eosb.html'
  },
  {
    id: 'TSK-06',
    titleEn: 'Photograph the new Jeddah site roster board',
    titleAr: 'تصوير لوحة كشف موقع جدة الجديد',
    owner: 'EMP-0002',
    due: '2026-09-18',
    priority: 'low',
    done: false,
    link: 'hr_employees.html'
  },
  {
    id: 'TSK-07',
    titleEn: 'Confirm Nitaqat target with legal counsel',
    titleAr: 'تأكيد مستهدف نطاقات مع المستشار القانوني',
    owner: 'EMP-0001',
    due: '2026-09-20',
    priority: 'medium',
    done: false,
    link: 'hr_settings.html'
  },
  {
    id: 'TSK-08',
    titleEn: 'File July GOSI payment receipt',
    titleAr: 'أرشفة إيصال سداد التأمينات لشهر يوليو',
    owner: 'finance',
    due: '2026-09-05',
    priority: 'high',
    done: false,
    link: 'hr_gosi.html'
  }
];

// Money = monthly SAR (major units in seed; engine converts to halalas).
// q = Qiwa contract status: authenticated | sent | draft
// st = active | probation | on-leave | exited | huroob
export const EMPLOYEES = [
  // — Saudis (internal staff) —
  {
    code: 'EMP-0001',
    nameEn: 'Abdullah Al-Otaibi',
    nameAr: 'عبدالله العتيبي',
    nat: 'Saudi',
    saudi: true,
    nid: '1000000001',
    prof: 'specialist',
    dept: 'HR',
    titleEn: 'HR Manager',
    titleAr: 'مدير الموارد البشرية',
    join: '2022-03-01',
    basic: 9000,
    housing: 2250,
    transport: 1000,
    gosi: 'G000001',
    gosiOn: '2022-03-05',
    iban: 'SA1000000000000000000001',
    bank: 'Al Rajhi',
    q: 'authenticated',
    st: 'active',
    gender: 'M',
    skills: ['employee-relations', 'documentation', 'recruitment'],
    sponsor: 'HQ',
    phone: '+966 555 010 001',
    email: 'a.alotaibi@company.sa',
    av: 'primary'
  },
  {
    code: 'EMP-0002',
    nameEn: 'Khalid Al-Dossari',
    nameAr: 'خالد الدوسري',
    nat: 'Saudi',
    saudi: true,
    nid: '1000000002',
    prof: 'specialist',
    dept: 'OPS',
    titleEn: 'Operations Coordinator',
    titleAr: 'منسق التشغيل',
    join: '2023-01-15',
    basic: 7500,
    housing: 1875,
    transport: 800,
    gosi: 'G000002',
    gosiOn: '2023-01-20',
    iban: 'SA1000000000000000000002',
    bank: 'SNB',
    q: 'authenticated',
    st: 'active',
    gender: 'M',
    skills: ['reporting', 'scheduling', 'logistics'],
    sponsor: 'HQ',
    phone: '+966 555 010 002',
    email: 'k.dossari@company.sa',
    av: 'blue'
  },
  {
    code: 'EMP-0003',
    nameEn: 'Noura Al-Qahtani',
    nameAr: 'نورة القحطاني',
    nat: 'Saudi',
    saudi: true,
    nid: '1000000003',
    prof: 'specialist',
    dept: 'PRO',
    titleEn: 'PRO Officer',
    titleAr: 'مسؤولة العلاقات الحكومية',
    join: '2024-09-01',
    basic: 6000,
    housing: 1500,
    transport: 700,
    gosi: 'G000003',
    gosiOn: '2024-09-05',
    iban: 'SA1000000000000000000003',
    bank: 'Al Rajhi',
    q: 'authenticated',
    st: 'active',
    gender: 'F',
    skills: ['government-relations', 'documentation'],
    sponsor: 'HQ',
    phone: '+966 555 010 003',
    email: 'n.qahtani@company.sa',
    av: 'purple'
  },
  {
    code: 'EMP-0004',
    nameEn: 'Fahad Al-Shammari',
    nameAr: 'فهد الشمري',
    nat: 'Saudi',
    saudi: true,
    nid: '1000000004',
    prof: 'specialist',
    dept: 'FIN',
    titleEn: 'Accountant',
    titleAr: 'محاسب',
    join: '2025-02-10',
    basic: 6500,
    housing: 1625,
    transport: 700,
    gosi: 'G000004',
    gosiOn: '2025-02-12',
    iban: 'SA1000000000000000000004',
    bank: 'Riyad Bank',
    q: 'sent',
    st: 'active',
    gender: 'M',
    skills: ['accounting', 'reporting', 'payroll'],
    sponsor: 'HQ',
    phone: '+966 555 010 004',
    email: 'f.shammari@company.sa',
    av: 'green'
  },
  {
    code: 'EMP-0005',
    nameEn: 'Reem Al-Harbi',
    nameAr: 'ريم الحربي',
    nat: 'Saudi',
    saudi: true,
    nid: '1000000005',
    prof: 'specialist',
    dept: 'REC',
    titleEn: 'Recruiter (part-time)',
    titleAr: 'أخصائية توظيف (دوام جزئي)',
    join: '2025-06-01',
    basic: 3500,
    housing: 0,
    transport: 0,
    partTime: true,
    gosi: 'G000005',
    gosiOn: '2025-06-03',
    iban: 'SA1000000000000000000005',
    bank: 'Al Rajhi',
    q: 'authenticated',
    st: 'active',
    gender: 'F',
    skills: ['documentation', 'recruitment', 'interviewing'],
    sponsor: 'HQ',
    phone: '+966 555 010 005',
    email: 'r.harbi@company.sa',
    av: 'yellow'
  },
  // — Expat workforce (deployed + bench) —
  {
    code: 'EMP-0006',
    nameEn: 'Rajesh Kumar',
    nameAr: 'راجيش كومار',
    nat: 'India',
    iqama: '2000000006',
    iqamaExp: '2027-03-14',
    prof: 'driver',
    dept: 'OPS',
    titleEn: 'Driver',
    titleAr: 'سائق',
    join: '2021-06-10',
    entry: '2021-06-08',
    basic: 1800,
    housing: 500,
    transport: 300,
    iban: 'SA1000000000000000000006',
    bank: 'Al Rajhi',
    q: 'authenticated',
    st: 'active',
    gender: 'M',
    skills: ['heavy-driving', 'light-driving'],
    sponsor: 'HQ',
    client: 'CL-002',
    site: 'ST-003',
    phone: '+966 555 010 006',
    av: 'primary',
    annualUsed: 12
  },
  {
    code: 'EMP-0007',
    nameEn: 'Ahmed Raza',
    nameAr: 'أحمد رضا',
    nat: 'Pakistan',
    iqama: '2000000007',
    iqamaExp: '2027-01-22',
    prof: 'driver',
    dept: 'OPS',
    titleEn: 'Driver',
    titleAr: 'سائق',
    join: '2022-02-01',
    entry: '2022-01-30',
    basic: 1800,
    housing: 500,
    transport: 300,
    iban: 'SA1000000000000000000007',
    bank: 'SNB',
    q: 'authenticated',
    st: 'active',
    gender: 'M',
    skills: ['light-driving', 'route-planning', 'heavy-driving'],
    sponsor: 'HQ',
    client: 'CL-002',
    site: 'ST-003',
    phone: '+966 555 010 007',
    av: 'blue',
    annualUsed: 5
  },
  {
    code: 'EMP-0008',
    nameEn: 'Mohammad Asif',
    nameAr: 'محمد آصف',
    nat: 'Pakistan',
    iqama: '2000000008',
    iqamaExp: '2026-09-28',
    prof: 'driver',
    dept: 'OPS',
    titleEn: 'Driver',
    titleAr: 'سائق',
    join: '2023-04-12',
    entry: '2023-04-10',
    basic: 1700,
    housing: 450,
    transport: 300,
    iban: 'SA1000000000000000000008',
    bank: 'Al Rajhi',
    q: 'authenticated',
    st: 'active',
    gender: 'M',
    skills: ['route-planning', 'heavy-driving', 'light-driving'],
    sponsor: 'BR-JED',
    site: 'ST-004',
    client: 'CL-001',
    phone: '+966 555 010 008',
    av: 'yellow',
    annualUsed: 0
  },
  {
    code: 'EMP-0009',
    nameEn: 'Jose Ramos',
    nameAr: 'خوسيه راموس',
    nat: 'Philippines',
    iqama: '2000000009',
    iqamaExp: '2027-05-30',
    prof: 'cleaner',
    dept: 'OPS',
    titleEn: 'Cleaner',
    titleAr: 'عامل نظافة',
    join: '2021-11-03',
    entry: '2021-11-01',
    basic: 1400,
    housing: 400,
    transport: 250,
    iban: 'SA1000000000000000000009',
    bank: 'Al Rajhi',
    q: 'authenticated',
    st: 'active',
    gender: 'M',
    skills: ['deep-cleaning', 'waste-handling'],
    sponsor: 'HQ',
    client: 'CL-002',
    site: 'ST-003',
    phone: '+966 555 010 009',
    av: 'green',
    annualUsed: 21
  },
  {
    code: 'EMP-0010',
    nameEn: 'Karim Hassan',
    nameAr: 'كريم حسن',
    nat: 'Bangladesh',
    iqama: '2000000010',
    iqamaExp: '2027-02-11',
    prof: 'cleaner',
    dept: 'OPS',
    titleEn: 'Cleaner',
    titleAr: 'عامل نظافة',
    join: '2022-08-20',
    entry: '2022-08-18',
    basic: 1400,
    housing: 400,
    transport: 250,
    iban: 'SA1000000000000000000010',
    bank: 'SNB',
    q: 'authenticated',
    st: 'active',
    gender: 'M',
    skills: ['waste-handling', 'housekeeping', 'deep-cleaning'],
    sponsor: 'HQ',
    client: 'CL-002',
    site: 'ST-003',
    phone: '+966 555 010 010',
    av: 'purple',
    annualUsed: 8
  },
  {
    code: 'EMP-0011',
    nameEn: 'Abdul Malek',
    nameAr: 'عبد المالك',
    nat: 'Bangladesh',
    iqama: '2000000011',
    iqamaExp: '2026-12-05',
    prof: 'cleaner',
    dept: 'OPS',
    titleEn: 'Cleaner',
    titleAr: 'عامل نظافة',
    join: '2023-01-25',
    entry: '2023-01-23',
    basic: 1400,
    housing: 400,
    transport: 250,
    iban: 'SA1000000000000000000011',
    bank: 'Al Rajhi',
    q: 'sent',
    st: 'active',
    gender: 'M',
    skills: ['housekeeping', 'deep-cleaning', 'waste-handling'],
    sponsor: 'HQ',
    client: 'CL-002',
    site: 'ST-003',
    phone: '+966 555 010 011',
    av: 'red',
    annualUsed: 3
  },
  {
    code: 'EMP-0012',
    nameEn: 'Maria Santos',
    nameAr: 'ماريا سانتوس',
    nat: 'Philippines',
    iqama: '2000000012',
    iqamaExp: '2026-10-15',
    prof: 'cleaner',
    dept: 'OPS',
    titleEn: 'Cleaner',
    titleAr: 'عاملة نظافة',
    join: '2022-05-14',
    entry: '2022-05-12',
    basic: 1400,
    housing: 400,
    transport: 250,
    iban: 'SA1000000000000000000012',
    bank: 'Al Rajhi',
    q: 'authenticated',
    st: 'on-leave',
    gender: 'F',
    skills: ['deep-cleaning', 'waste-handling'],
    sponsor: 'HQ',
    phone: '+966 555 010 012',
    av: 'azure',
    annualUsed: 15
  },
  {
    code: 'EMP-0013',
    nameEn: 'Suresh Patel',
    nameAr: 'سوريش باتيل',
    nat: 'India',
    iqama: '2000000013',
    iqamaExp: '2027-04-02',
    prof: 'construction',
    dept: 'OPS',
    titleEn: 'Construction worker',
    titleAr: 'عامل إنشاءات',
    join: '2020-09-01',
    entry: '2020-08-29',
    basic: 1600,
    housing: 450,
    transport: 300,
    iban: 'SA1000000000000000000013',
    bank: 'SNB',
    q: 'authenticated',
    st: 'active',
    gender: 'M',
    skills: ['concrete-work', 'site-safety', 'scaffolding'],
    sponsor: 'HQ',
    client: 'CL-001',
    site: 'ST-001',
    phone: '+966 555 010 013',
    av: 'primary',
    annualUsed: 20
  },
  {
    code: 'EMP-0014',
    nameEn: 'Vikram Singh',
    nameAr: 'فيكرام سينغ',
    nat: 'India',
    iqama: '2000000014',
    iqamaExp: '2027-06-19',
    prof: 'construction',
    dept: 'OPS',
    titleEn: 'Construction worker',
    titleAr: 'عامل إنشاءات',
    join: '2021-03-22',
    entry: '2021-03-20',
    basic: 1600,
    housing: 450,
    transport: 300,
    iban: '',
    bank: '',
    q: 'authenticated',
    st: 'active',
    gender: 'M',
    skills: ['site-safety', 'scaffolding', 'concrete-work'],
    sponsor: 'HQ',
    client: 'CL-001',
    site: 'ST-001',
    phone: '+966 555 010 014',
    av: 'blue',
    annualUsed: 6
  },
  {
    code: 'EMP-0015',
    nameEn: 'Bilal Ahmed',
    nameAr: 'بلال أحمد',
    nat: 'Pakistan',
    iqama: '2000000015',
    iqamaExp: '2027-02-27',
    prof: 'construction',
    dept: 'OPS',
    titleEn: 'Construction worker',
    titleAr: 'عامل إنشاءات',
    join: '2022-07-11',
    entry: '2022-07-09',
    basic: 1600,
    housing: 450,
    transport: 300,
    iban: 'SA1000000000000000000015',
    bank: 'Al Rajhi',
    q: 'authenticated',
    st: 'active',
    gender: 'M',
    skills: ['scaffolding', 'concrete-work'],
    sponsor: 'HQ',
    client: 'CL-001',
    site: 'ST-002',
    phone: '+966 555 010 015',
    av: 'green',
    annualUsed: 0
  },
  {
    code: 'EMP-0016',
    nameEn: 'Deepak Yadav',
    nameAr: 'ديباك ياداف',
    nat: 'India',
    iqama: '2000000016',
    iqamaExp: '2026-11-20',
    prof: 'construction',
    dept: 'OPS',
    titleEn: 'Construction worker',
    titleAr: 'عامل إنشاءات',
    join: '2023-05-30',
    entry: '2023-05-28',
    basic: 1500,
    housing: 400,
    transport: 300,
    iban: 'SA1000000000000000000016',
    bank: 'SNB',
    q: 'authenticated',
    st: 'active',
    gender: 'M',
    skills: ['concrete-work', 'site-safety', 'scaffolding'],
    sponsor: 'HQ',
    client: 'CL-001',
    site: 'ST-002',
    phone: '+966 555 010 016',
    av: 'purple',
    annualUsed: 10
  },
  {
    code: 'EMP-0017',
    nameEn: 'Rahim Uddin',
    nameAr: 'رحيم الدين',
    nat: 'Bangladesh',
    iqama: '2000000017',
    iqamaExp: '2027-08-08',
    prof: 'construction',
    dept: 'OPS',
    titleEn: 'Construction worker',
    titleAr: 'عامل إنشاءات',
    join: '2024-02-18',
    entry: '2024-02-16',
    basic: 1500,
    housing: 400,
    transport: 300,
    iban: 'SA1000000000000000000017',
    bank: 'Al Rajhi',
    q: 'authenticated',
    st: 'active',
    gender: 'M',
    skills: ['site-safety', 'scaffolding', 'concrete-work'],
    sponsor: 'HQ',
    site: 'ST-005',
    client: 'CL-002',
    phone: '+966 555 010 017',
    av: 'yellow',
    annualUsed: 2
  },
  {
    code: 'EMP-0018',
    nameEn: 'Mahmoud Ali',
    nameAr: 'محمود علي',
    nat: 'Egypt',
    iqama: '2000000018',
    iqamaExp: '2027-01-09',
    prof: 'mason',
    dept: 'OPS',
    titleEn: 'Mason',
    titleAr: 'بناء',
    join: '2021-12-05',
    entry: '2021-12-03',
    basic: 2200,
    housing: 550,
    transport: 300,
    iban: 'SA1000000000000000000018',
    bank: 'Riyad Bank',
    q: 'authenticated',
    st: 'active',
    gender: 'M',
    skills: ['blockwork', 'tiling'],
    sponsor: 'HQ',
    client: 'CL-001',
    site: 'ST-001',
    phone: '+966 555 010 018',
    av: 'red',
    annualUsed: 14
  },
  {
    code: 'EMP-0019',
    nameEn: 'Saeed Anwar',
    nameAr: 'سعيد أنور',
    nat: 'Pakistan',
    iqama: '2000000019',
    iqamaExp: '2027-03-25',
    prof: 'mason',
    dept: 'OPS',
    titleEn: 'Mason',
    titleAr: 'بناء',
    join: '2022-10-17',
    entry: '2022-10-15',
    basic: 2200,
    housing: 550,
    transport: 300,
    iban: 'SA1000000000000000000019',
    bank: 'Al Rajhi',
    q: 'authenticated',
    st: 'active',
    gender: 'M',
    skills: ['tiling', 'plastering', 'blockwork'],
    sponsor: 'HQ',
    client: 'CL-001',
    site: 'ST-002',
    phone: '+966 555 010 019',
    av: 'azure',
    annualUsed: 7
  },
  {
    code: 'EMP-0020',
    nameEn: 'Arun Nair',
    nameAr: 'أرون ناير',
    nat: 'India',
    iqama: '2000000020',
    iqamaExp: '2027-07-12',
    prof: 'electrician',
    dept: 'OPS',
    titleEn: 'Electrician',
    titleAr: 'كهربائي',
    join: '2022-04-09',
    entry: '2022-04-07',
    basic: 2500,
    housing: 600,
    transport: 350,
    iban: 'SA1000000000000000000020',
    bank: 'SNB',
    q: 'authenticated',
    st: 'active',
    gender: 'M',
    skills: ['troubleshooting', 'wiring', 'panel-maintenance'],
    sponsor: 'HQ',
    client: 'CL-001',
    site: 'ST-001',
    phone: '+966 555 010 020',
    av: 'primary',
    annualUsed: 4
  },
  {
    code: 'EMP-0021',
    nameEn: 'Imran Khan',
    nameAr: 'عمران خان',
    nat: 'Pakistan',
    iqama: '2000000021',
    iqamaExp: '2027-09-01',
    prof: 'electrician',
    dept: 'OPS',
    titleEn: 'Electrician',
    titleAr: 'كهربائي',
    join: '2026-08-01',
    entry: '2026-07-30',
    basic: 2400,
    housing: 600,
    transport: 350,
    iban: 'SA1000000000000000000021',
    bank: 'Al Rajhi',
    q: 'draft',
    st: 'probation',
    gender: 'M',
    skills: ['wiring', 'panel-maintenance'],
    sponsor: 'BR-JED',
    site: 'ST-004',
    client: 'CL-001',
    phone: '+966 555 010 021',
    av: 'blue',
    annualUsed: 0
  },
  {
    code: 'EMP-0022',
    nameEn: 'Khaled Ibrahim',
    nameAr: 'خالد إبراهيم',
    nat: 'Egypt',
    iqama: '2000000022',
    iqamaExp: '2027-05-17',
    prof: 'plumber',
    dept: 'OPS',
    titleEn: 'Plumber',
    titleAr: 'سباك',
    join: '2023-03-14',
    entry: '2023-03-12',
    basic: 2300,
    housing: 550,
    transport: 350,
    iban: 'SA1000000000000000000022',
    bank: 'Al Rajhi',
    q: 'authenticated',
    st: 'active',
    gender: 'M',
    skills: ['drainage', 'fixture-install', 'pipefitting'],
    sponsor: 'HQ',
    client: 'CL-002',
    site: 'ST-003',
    phone: '+966 555 010 022',
    av: 'green',
    annualUsed: 9
  },
  {
    code: 'EMP-0023',
    nameEn: 'Manoj Tiwari',
    nameAr: 'مانوج تيواري',
    nat: 'India',
    iqama: '2000000023',
    iqamaExp: '2027-02-03',
    prof: 'foreman',
    dept: 'OPS',
    titleEn: 'Foreman',
    titleAr: 'مشرف عمال',
    join: '2020-01-20',
    entry: '2020-01-18',
    basic: 3200,
    housing: 800,
    transport: 400,
    iban: 'SA1000000000000000000023',
    bank: 'SNB',
    q: 'authenticated',
    st: 'active',
    gender: 'M',
    skills: ['reporting', 'supervision', 'site-safety'],
    sponsor: 'HQ',
    client: 'CL-001',
    site: 'ST-001',
    phone: '+966 555 010 023',
    av: 'purple',
    annualUsed: 18
  },
  {
    code: 'EMP-0024',
    nameEn: 'Danilo Cruz',
    nameAr: 'دانيلو كروز',
    nat: 'Philippines',
    iqama: '2000000024',
    iqamaExp: '2027-06-06',
    prof: 'office',
    dept: 'HR',
    titleEn: 'Office assistant',
    titleAr: 'مساعد إداري',
    join: '2023-09-11',
    entry: '2023-09-09',
    basic: 2000,
    housing: 500,
    transport: 300,
    iban: 'SA1000000000000000000024',
    bank: 'Al Rajhi',
    q: 'authenticated',
    st: 'active',
    gender: 'M',
    skills: ['data-entry', 'filing'],
    sponsor: 'HQ',
    site: 'ST-006',
    client: 'CL-001',
    phone: '+966 555 010 024',
    av: 'yellow',
    annualUsed: 5
  },
  {
    code: 'EMP-0025',
    nameEn: 'Amit Sharma',
    nameAr: 'أميت شارما',
    nat: 'India',
    iqama: '2000000025',
    iqamaExp: '2026-10-30',
    prof: 'construction',
    dept: 'OPS',
    titleEn: 'Construction worker',
    titleAr: 'عامل إنشاءات',
    join: '2023-05-01',
    entry: '2023-04-29',
    basic: 1400,
    housing: 350,
    transport: 200,
    iban: 'SA1000000000000000000025',
    bank: 'Al Rajhi',
    q: 'sent',
    st: 'exited',
    gender: 'M',
    skills: ['scaffolding', 'concrete-work'],
    sponsor: 'HQ',
    exitDate: '2026-07-31',
    exitReason: 'End of contract',
    exitReasonAr: 'انتهاء العقد',
    client: '',
    site: '',
    phone: '+966 555 010 025',
    av: 'primary',
    annualUsed: 20
  },
  {
    code: 'EMP-0026',
    nameEn: 'Ana Reyes',
    nameAr: 'آنا رييس',
    nat: 'Philippines',
    iqama: '2000000026',
    iqamaExp: '2027-01-20',
    prof: 'cleaner',
    dept: 'OPS',
    titleEn: 'Cleaner',
    titleAr: 'عامل نظافة',
    join: '2024-02-10',
    entry: '2024-02-08',
    basic: 1200,
    housing: 300,
    transport: 200,
    iban: 'SA1000000000000000000026',
    bank: 'Al Rajhi',
    q: 'authenticated',
    st: 'exited',
    gender: 'F',
    skills: ['deep-cleaning', 'housekeeping'],
    sponsor: 'HQ',
    exitDate: '2026-08-15',
    exitReason: 'Resignation',
    exitReasonAr: 'استقالة',
    client: '',
    site: '',
    phone: '+966 555 010 026',
    av: 'primary',
    annualUsed: 8
  },
  {
    code: 'EMP-0027',
    nameEn: 'Tariq Mehmood',
    nameAr: 'طارق محمود',
    nat: 'Pakistan',
    iqama: '2000000027',
    iqamaExp: '2026-12-01',
    prof: 'driver',
    dept: 'OPS',
    titleEn: 'Driver',
    titleAr: 'سائق',
    join: '2024-11-01',
    entry: '2024-10-30',
    basic: 1800,
    housing: 500,
    transport: 300,
    iban: 'SA1000000000000000000027',
    bank: 'Al Rajhi',
    q: 'draft',
    st: 'huroob',
    gender: 'M',
    skills: ['light-driving', 'route-planning'],
    sponsor: 'HQ',
    reportedAt: '2026-09-08',
    legalNote: 'Absconding report filed via Absher; passport held per Art. 40 file.',
    legalNoteAr: 'تم رفع بلاغ هروب عبر أبشر؛ الجواز محفوظ في الملف حسب المادة ٤٠.',
    client: '',
    site: '',
    phone: '+966 555 010 027',
    av: 'primary',
    annualUsed: 0
  }
];

export const CLIENTS = [
  {
    id: 'CL-001',
    nameEn: 'Al-Bina Construction',
    nameAr: 'شركة البناء للمقاولات',
    cr: '1010XXXX11',
    contactEn: 'Eng. Sami Haddad',
    phone: '+966 555 020 001',
    email: 'sami@albina.example.sa',
    city: 'Riyadh',
    lat: 24.7136,
    lng: 46.6753,
    nitaqat: 'High Green',
    wpsOk: true,
    billingDay: 5,
    av: 'blue'
  },
  {
    id: 'CL-002',
    nameEn: 'Facility Care Services',
    nameAr: 'شركة العناية للمرافق',
    cr: '1010XXXX22',
    contactEn: 'Ms. Dana Kanaan',
    phone: '+966 555 020 002',
    email: 'dana@facilitycare.example.sa',
    city: 'Riyadh',
    lat: 24.7742,
    lng: 46.7385,
    nitaqat: 'Mid Green',
    wpsOk: true,
    billingDay: 10,
    av: 'green'
  }
];

export const SITES = [
  {
    id: 'ST-001',
    client: 'CL-001',
    nameEn: 'North Ring Site',
    nameAr: 'موقع الطريق الشمالي',
    city: 'Riyadh',
    lat: 24.81,
    lng: 46.68
  },
  {
    id: 'ST-002',
    client: 'CL-001',
    nameEn: 'Diriyah Project',
    nameAr: 'مشروع الدرعية',
    city: 'Diriyah',
    lat: 24.732,
    lng: 46.575
  },
  {
    id: 'ST-003',
    client: 'CL-002',
    nameEn: 'KAFD Tower FM',
    nameAr: 'برج كافد — إدارة المرافق',
    city: 'Riyadh',
    lat: 24.767,
    lng: 46.641
  },
  {
    id: 'ST-004',
    client: 'CL-001',
    nameEn: 'Jeddah Corniche Tower',
    nameAr: 'برج كورنيش جدة',
    city: 'Jeddah',
    lat: 21.5433,
    lng: 39.1728
  },
  {
    id: 'ST-005',
    client: 'CL-002',
    nameEn: 'Dammam North FM',
    nameAr: 'الدمام الشمالية — إدارة المرافق',
    city: 'Dammam',
    lat: 26.4207,
    lng: 50.0888
  },
  {
    id: 'ST-006',
    client: 'CL-001',
    nameEn: 'Riyadh South Depot',
    nameAr: 'مستودع جنوب الرياض',
    city: 'Riyadh',
    lat: 24.6,
    lng: 46.75
  }
];

// rate = monthly SAR charged to client per head. ajeer: null = MISSING (violation demo).
export const ASSIGNMENTS = [
  {
    id: 'ASN-2026-001',
    emp: 'EMP-0006',
    client: 'CL-002',
    site: 'ST-003',
    req: 'REQ-2026-004',
    start: '2026-01-05',
    end: '2026-12-31',
    rate: 3500,
    service: 'labour',
    consent: 'contract',
    ajeer: 'AJ-2026-101',
    ajeerExp: '2026-12-31',
    status: 'active'
  },
  {
    id: 'ASN-2026-002',
    emp: 'EMP-0007',
    client: 'CL-002',
    site: 'ST-003',
    req: 'REQ-2026-004',
    start: '2026-01-05',
    end: '2026-12-31',
    rate: 3500,
    service: 'labour',
    consent: 'contract',
    ajeer: 'AJ-2026-102',
    ajeerExp: '2026-12-31',
    status: 'active'
  },
  {
    id: 'ASN-2026-003',
    emp: 'EMP-0009',
    client: 'CL-002',
    site: 'ST-003',
    req: 'REQ-2026-006',
    start: '2026-02-01',
    end: '2027-01-31',
    rate: 2800,
    service: 'labour',
    consent: 'contract',
    ajeer: 'AJ-2026-103',
    ajeerExp: '2027-01-31',
    status: 'active'
  },
  {
    id: 'ASN-2026-004',
    emp: 'EMP-0010',
    client: 'CL-002',
    site: 'ST-003',
    req: 'REQ-2026-006',
    start: '2026-02-01',
    end: '2027-01-31',
    rate: 2800,
    service: 'labour',
    consent: 'contract',
    ajeer: 'AJ-2026-104',
    ajeerExp: '2027-01-31',
    status: 'active'
  },
  {
    id: 'ASN-2026-005',
    emp: 'EMP-0011',
    client: 'CL-002',
    site: 'ST-003',
    req: 'REQ-2026-006',
    start: '2026-03-01',
    end: '2027-02-28',
    rate: 2800,
    service: 'labour',
    consent: 'signed',
    ajeer: 'AJ-2026-105',
    ajeerExp: '2027-02-28',
    status: 'active'
  },
  {
    id: 'ASN-2026-006',
    emp: 'EMP-0013',
    client: 'CL-001',
    site: 'ST-001',
    req: 'REQ-2026-010',
    start: '2026-01-12',
    end: '2026-12-31',
    rate: 3200,
    service: 'labour',
    consent: 'contract',
    ajeer: 'AJ-2026-106',
    ajeerExp: '2026-12-31',
    status: 'active'
  },
  {
    id: 'ASN-2026-007',
    emp: 'EMP-0014',
    client: 'CL-001',
    site: 'ST-001',
    req: 'REQ-2026-010',
    start: '2026-01-12',
    end: '2026-12-31',
    rate: 3200,
    service: 'labour',
    consent: 'contract',
    ajeer: 'AJ-2026-107',
    ajeerExp: '2026-12-31',
    status: 'active'
  },
  {
    id: 'ASN-2026-008',
    emp: 'EMP-0015',
    client: 'CL-001',
    site: 'ST-002',
    req: 'REQ-2026-010',
    start: '2026-04-01',
    end: '2027-03-31',
    rate: 3200,
    service: 'labour',
    consent: 'contract',
    ajeer: 'AJ-2026-108',
    ajeerExp: '2027-03-31',
    status: 'active'
  },
  {
    id: 'ASN-2026-009',
    emp: 'EMP-0016',
    client: 'CL-001',
    site: 'ST-002',
    req: 'REQ-2026-010',
    start: '2026-04-01',
    end: '2027-03-31',
    rate: 3200,
    service: 'labour',
    consent: 'contract',
    ajeer: null,
    ajeerExp: null,
    status: 'active'
  },
  {
    id: 'ASN-2026-010',
    emp: 'EMP-0018',
    client: 'CL-001',
    site: 'ST-001',
    req: 'REQ-2026-010',
    start: '2026-01-12',
    end: '2026-12-31',
    rate: 4200,
    service: 'labour',
    consent: 'contract',
    ajeer: 'AJ-2026-110',
    ajeerExp: '2026-12-31',
    status: 'active'
  },
  {
    id: 'ASN-2026-011',
    emp: 'EMP-0019',
    client: 'CL-001',
    site: 'ST-002',
    req: 'REQ-2026-011',
    start: '2026-06-01',
    end: '2027-05-31',
    rate: 4200,
    service: 'labour',
    consent: 'contract',
    ajeer: 'AJ-2026-111',
    ajeerExp: '2026-09-25',
    status: 'active'
  },
  {
    id: 'ASN-2026-012',
    emp: 'EMP-0020',
    client: 'CL-001',
    site: 'ST-001',
    req: 'REQ-2026-007',
    start: '2026-02-10',
    end: '2027-02-09',
    rate: 4800,
    service: 'labour',
    consent: 'contract',
    ajeer: 'AJ-2026-112',
    ajeerExp: '2027-02-09',
    status: 'active'
  },
  {
    id: 'ASN-2026-013',
    emp: 'EMP-0022',
    client: 'CL-002',
    site: 'ST-003',
    req: 'REQ-2026-008',
    start: '2026-03-10',
    end: '2027-03-09',
    rate: 4600,
    service: 'labour',
    consent: 'contract',
    ajeer: 'AJ-2026-113',
    ajeerExp: '2027-03-09',
    status: 'active'
  },
  {
    id: 'ASN-2026-014',
    emp: 'EMP-0023',
    client: 'CL-001',
    site: 'ST-001',
    req: 'REQ-2026-007',
    start: '2026-02-10',
    end: '2027-02-09',
    rate: 6000,
    service: 'labour',
    consent: 'contract',
    ajeer: 'AJ-2026-114',
    ajeerExp: '2027-02-09',
    status: 'active'
  },
  {
    id: 'ASN-2026-015',
    emp: 'EMP-0008',
    client: 'CL-001',
    site: 'ST-004',
    req: 'REQ-2026-010',
    start: '2026-07-01',
    end: '2027-06-30',
    rate: 3000,
    service: 'labour',
    consent: 'contract',
    ajeer: 'AJ-2026-201',
    ajeerExp: '2027-06-30',
    status: 'active'
  },
  {
    id: 'ASN-2026-016',
    emp: 'EMP-0017',
    client: 'CL-002',
    site: 'ST-005',
    req: 'REQ-2026-011',
    start: '2026-08-01',
    end: '2027-07-31',
    rate: 3200,
    service: 'labour',
    consent: 'contract',
    ajeer: 'AJ-2026-202',
    ajeerExp: '2027-07-31',
    status: 'active'
  },
  {
    id: 'ASN-2026-017',
    emp: 'EMP-0021',
    client: 'CL-001',
    site: 'ST-004',
    req: 'REQ-2026-012',
    start: '2026-08-15',
    end: '2027-08-14',
    rate: 3400,
    service: 'labour',
    consent: 'contract',
    ajeer: 'AJ-2026-203',
    ajeerExp: '2027-08-14',
    status: 'active'
  },
  {
    id: 'ASN-2026-018',
    emp: 'EMP-0024',
    client: 'CL-001',
    site: 'ST-006',
    req: 'REQ-2026-010',
    start: '2026-09-01',
    end: '2027-02-28',
    rate: 3000,
    service: 'labour',
    consent: 'contract',
    ajeer: 'AJ-2026-204',
    ajeerExp: '2027-02-28',
    status: 'active'
  }
];

export const REQUESTS = [
  {
    id: 'REQ-2026-010',
    client: 'CL-001',
    site: 'ST-001',
    prof: 'construction',
    qty: 10,
    filled: 5,
    rate: 3200,
    start: '2026-01-12',
    durMo: 12,
    status: 'deploying'
  },
  {
    id: 'REQ-2026-011',
    client: 'CL-001',
    site: 'ST-002',
    prof: 'mason',
    qty: 4,
    filled: 1,
    rate: 4200,
    start: '2026-06-01',
    durMo: 12,
    status: 'sourcing'
  },
  {
    id: 'REQ-2026-012',
    client: 'CL-002',
    site: 'ST-003',
    prof: 'cleaner',
    qty: 6,
    filled: 3,
    rate: 2800,
    start: '2026-02-01',
    durMo: 12,
    status: 'proposed'
  }
];

// §0.3 — seeded leave types (admin-tunable in Settings from P2; engine reads this shape).
export const LEAVE_TYPES = [
  { code: 'annual', en: 'Annual', ar: 'سنوية', base: 21, after5: 30, pay: 1 },
  {
    code: 'sick',
    en: 'Sick',
    ar: 'مرضية',
    tiers: [
      { days: 30, pay: 1 },
      { days: 60, pay: 0.75 },
      { days: 30, pay: 0 }
    ]
  },
  { code: 'maternity', en: 'Maternity', ar: 'أمومة', weeks: 10 },
  { code: 'paternity', en: 'Newborn', ar: 'مولود جديد', days: 3, pay: 1 },
  { code: 'marriage', en: 'Marriage', ar: 'زواج', days: 5, pay: 1 },
  { code: 'bereavement', en: 'Bereavement', ar: 'وفاة قريب', days: 5, siblingDays: 3, pay: 1 },
  { code: 'iddah', en: 'Iddah (widow)', ar: 'عدة', months: 4, extraDays: 10, pay: 1 },
  { code: 'hajj', en: 'Hajj', ar: 'حج', days: 15, once: true, afterYears: 2 },
  { code: 'unpaid', en: 'Unpaid', ar: 'بدون أجر', days: 10, pay: 0 }
];

// Demo holiday calendar (Gregorian + Hijri). Eid dates are approximate demo values.
export const HOLIDAYS = [
  { en: 'Founding Day', ar: 'يوم التأسيس', start: '2026-02-22', days: 1, hijri: '1447-09-04' },
  { en: 'Eid al-Fitr', ar: 'عيد الفطر', start: '2026-03-20', days: 4, hijri: '1447-10-01' },
  { en: 'Eid al-Adha', ar: 'عيد الأضحى', start: '2026-05-27', days: 4, hijri: '1447-12-10' },
  { en: 'National Day', ar: 'اليوم الوطني', start: '2026-09-23', days: 1, hijri: '1448-04-01' },
  { en: 'Founding Day', ar: 'يوم التأسيس', start: '2027-02-22', days: 1, hijri: '1448-09-04' },
  { en: 'Eid al-Fitr', ar: 'عيد الفطر', start: '2027-03-10', days: 4, hijri: '1448-10-01' },
  { en: 'Eid al-Adha', ar: 'عيد الأضحى', start: '2027-05-17', days: 4, hijri: '1448-12-10' },
  { en: 'National Day', ar: 'اليوم الوطني', start: '2027-09-23', days: 1, hijri: '1449-04-01' }
];

// GOSI pension rate versions (each side), effective dates. SANED 0.75%/side, hazards 2% employer.
export const GOSI_VERSIONS = [
  { from: '2024-07-03', pension: 0.09 },
  { from: '2025-07-03', pension: 0.095 },
  { from: '2026-07-03', pension: 0.1 },
  { from: '2027-07-03', pension: 0.105 },
  { from: '2028-07-03', pension: 0.11 }
];
export const GOSI_SANED = 0.0075;
export const GOSI_HAZARDS = 0.02;
export const GOSI_CAP = 45000; // SAR/month on basic+housing
export const GOSI_CUTOFF = '2024-07-03'; // enrolled before → old system (fixed 9%)

// Work-permit levy bands (SAR/month) — versioned demo values, editable in Settings.
export const LEVY_TABLE = {
  reduced: 700,
  standard: 800,
  noteEn: 'Reduced rate when Saudization targets are met.',
  noteAr: 'السعر المخفض عند تحقيق نسب السعودة.'
};

export const EXPENSE_CATEGORIES = [
  { code: 'fuel', en: 'Fuel', ar: 'وقود', limit: 500, receipt: true, vat: true },
  { code: 'travel', en: 'Travel', ar: 'سفر', limit: 2000, receipt: true, vat: true },
  { code: 'housing', en: 'Housing', ar: 'سكن', limit: 3000, receipt: true, vat: false },
  { code: 'medical', en: 'Medical', ar: 'طبي', limit: 1500, receipt: true, vat: true },
  {
    code: 'govt',
    en: 'Government fees',
    ar: 'رسوم حكومية',
    limit: 10000,
    receipt: true,
    vat: false
  },
  {
    code: 'supplies',
    en: 'Site supplies',
    ar: 'مستلزمات الموقع',
    limit: 1000,
    receipt: true,
    vat: true
  },
  { code: 'perdiem', en: 'Per diem', ar: 'بدل يومي', limit: 300, receipt: false, vat: false },
  { code: 'other', en: 'Other', ar: 'أخرى', limit: 500, receipt: true, vat: true }
];

// Deduction categories payroll must REJECT when employer-borne (Art. 40).
export const BLOCKED_DEDUCTIONS = ['iqama', 'levy', 'insurance', 'recruitment'];

// ── P1: expat lifecycle + tracker ─────────────────────────────────────────
// Visa blocks & agents (overseas recruitment channel).
export const AGENTS = [
  { id: 'AG-01', name: 'Delta Overseas Manpower', country: 'India' },
  { id: 'AG-02', name: 'Gulf Link Recruiters', country: 'Pakistan' }
];

export const VISA_BLOCKS = [
  {
    id: 'VB-2025-01',
    profession: 'construction',
    qty: 20,
    issued: '2025-06-10',
    expires: '2027-06-09',
    agent: 'AG-01',
    costPerVisa: 2000
  },
  {
    id: 'VB-2025-02',
    profession: 'driver',
    qty: 8,
    issued: '2025-09-01',
    expires: '2027-08-31',
    agent: 'AG-01',
    costPerVisa: 2000
  },
  {
    id: 'VB-2025-03',
    profession: 'mason',
    qty: 6,
    issued: '2025-10-05',
    expires: '2027-10-04',
    agent: 'AG-02',
    costPerVisa: 2200
  },
  {
    id: 'VB-2026-01',
    profession: 'cleaner',
    qty: 10,
    issued: '2026-02-15',
    expires: '2028-02-14',
    agent: 'AG-02',
    costPerVisa: 2200
  },
  {
    id: 'VB-2026-02',
    profession: 'electrician',
    qty: 4,
    issued: '2026-05-01',
    expires: '2028-04-30',
    agent: 'AG-02',
    costPerVisa: 2500
  },
  {
    id: 'VB-2026-03',
    profession: 'general',
    qty: 10,
    issued: '2026-04-01',
    expires: '2028-03-31',
    agent: 'AG-01',
    costPerVisa: 2000
  }
];

// Per-worker visas. status: used | awaiting | expired | cancelled.
export const VISAS = [
  {
    no: 'V-2021-011',
    block: 'VB-2025-02',
    emp: 'EMP-0006',
    type: 'work',
    issued: '2021-05-20',
    validUntil: '2023-05-19',
    entry: '2021-06-08',
    status: 'used'
  },
  {
    no: 'V-2022-004',
    block: 'VB-2025-02',
    emp: 'EMP-0007',
    type: 'work',
    issued: '2022-01-10',
    validUntil: '2024-01-09',
    entry: '2022-01-30',
    status: 'used'
  },
  {
    no: 'V-2023-021',
    block: 'VB-2025-02',
    emp: 'EMP-0008',
    type: 'work',
    issued: '2023-03-22',
    validUntil: '2025-03-21',
    entry: '2023-04-10',
    status: 'used'
  },
  {
    no: 'V-2021-034',
    block: 'VB-2026-01',
    emp: 'EMP-0009',
    type: 'work',
    issued: '2021-10-12',
    validUntil: '2023-10-11',
    entry: '2021-11-01',
    status: 'used'
  },
  {
    no: 'V-2022-028',
    block: 'VB-2026-01',
    emp: 'EMP-0010',
    type: 'work',
    issued: '2022-07-28',
    validUntil: '2024-07-27',
    entry: '2022-08-18',
    status: 'used'
  },
  {
    no: 'V-2023-002',
    block: 'VB-2026-01',
    emp: 'EMP-0011',
    type: 'work',
    issued: '2023-01-03',
    validUntil: '2025-01-02',
    entry: '2023-01-23',
    status: 'used'
  },
  {
    no: 'V-2022-015',
    block: 'VB-2026-01',
    emp: 'EMP-0012',
    type: 'work',
    issued: '2022-04-20',
    validUntil: '2024-04-19',
    entry: '2022-05-12',
    status: 'used'
  },
  {
    no: 'V-2020-040',
    block: 'VB-2025-01',
    emp: 'EMP-0013',
    type: 'work',
    issued: '2020-08-05',
    validUntil: '2022-08-04',
    entry: '2020-08-29',
    status: 'used'
  },
  {
    no: 'V-2021-018',
    block: 'VB-2025-01',
    emp: 'EMP-0014',
    type: 'work',
    issued: '2021-02-26',
    validUntil: '2023-02-25',
    entry: '2021-03-20',
    status: 'used'
  },
  {
    no: 'V-2022-025',
    block: 'VB-2025-01',
    emp: 'EMP-0015',
    type: 'work',
    issued: '2022-06-15',
    validUntil: '2024-06-14',
    entry: '2022-07-09',
    status: 'used'
  },
  {
    no: 'V-2023-016',
    block: 'VB-2025-01',
    emp: 'EMP-0016',
    type: 'work',
    issued: '2023-05-02',
    validUntil: '2025-05-01',
    entry: '2023-05-28',
    status: 'used'
  },
  {
    no: 'V-2024-006',
    block: 'VB-2025-01',
    emp: 'EMP-0017',
    type: 'work',
    issued: '2024-01-22',
    validUntil: '2026-01-21',
    entry: '2024-02-16',
    status: 'used'
  },
  {
    no: 'V-2021-045',
    block: 'VB-2025-03',
    emp: 'EMP-0018',
    type: 'work',
    issued: '2021-11-08',
    validUntil: '2023-11-07',
    entry: '2021-12-03',
    status: 'used'
  },
  {
    no: 'V-2022-033',
    block: 'VB-2025-03',
    emp: 'EMP-0019',
    type: 'work',
    issued: '2022-09-20',
    validUntil: '2024-09-19',
    entry: '2022-10-15',
    status: 'used'
  },
  {
    no: 'V-2022-009',
    block: 'VB-2026-02',
    emp: 'EMP-0020',
    type: 'work',
    issued: '2022-03-11',
    validUntil: '2024-03-10',
    entry: '2022-04-07',
    status: 'used'
  },
  {
    no: 'V-2026-101',
    block: 'VB-2026-02',
    emp: 'EMP-0021',
    type: 'work',
    issued: '2026-07-10',
    validUntil: '2028-07-09',
    entry: '2026-07-30',
    status: 'used'
  },
  {
    no: 'V-2023-009',
    block: 'VB-2026-03',
    emp: 'EMP-0022',
    type: 'work',
    issued: '2023-02-14',
    validUntil: '2025-02-13',
    entry: '2023-03-12',
    status: 'used'
  },
  {
    no: 'V-2020-002',
    block: 'VB-2026-03',
    emp: 'EMP-0023',
    type: 'work',
    issued: '2019-12-20',
    validUntil: '2021-12-19',
    entry: '2020-01-18',
    status: 'used'
  },
  {
    no: 'V-2023-030',
    block: 'VB-2026-03',
    emp: 'EMP-0024',
    type: 'work',
    issued: '2023-08-15',
    validUntil: '2025-08-14',
    entry: '2023-09-09',
    status: 'used'
  },
  {
    no: 'V-2026-501',
    block: 'VB-2025-01',
    ob: 'OB-2026-016',
    type: 'work',
    issued: '2026-08-20',
    validUntil: '2027-08-19',
    entry: '',
    status: 'awaiting'
  },
  {
    no: 'V-2026-502',
    block: 'VB-2025-02',
    ob: 'OB-2026-017',
    type: 'work',
    issued: '2026-08-28',
    validUntil: '2027-08-27',
    entry: '2026-09-08',
    status: 'awaiting'
  },
  {
    no: 'V-2026-503',
    block: 'VB-2026-01',
    ob: '',
    type: 'work',
    issued: '2026-09-01',
    validUntil: '2026-10-05',
    entry: '',
    status: 'awaiting'
  },
  {
    no: 'V-2025-099',
    block: 'VB-2026-03',
    ob: '',
    type: 'work',
    issued: '2025-06-01',
    validUntil: '2026-05-31',
    entry: '',
    status: 'expired'
  },
  {
    no: 'V-2025-088',
    block: 'VB-2025-01',
    ob: '',
    type: 'work',
    issued: '2025-08-10',
    validUntil: '2027-08-09',
    entry: '',
    status: 'cancelled'
  }
];

// Onboarding pipeline (§4.7). type: overseas | transfer. stages: {n: dateISO}.
export const ONBOARDING = [
  {
    id: 'OB-2026-012',
    type: 'overseas',
    emp: 'EMP-0021',
    nameEn: 'Imran Khan',
    nameAr: 'عمران خان',
    nat: 'Pakistan',
    prof: 'electrician',
    agent: 'AG-02',
    visa: 'V-2026-101',
    stage: 10,
    stages: {
      1: '2026-06-02',
      2: '2026-07-10',
      3: '2026-07-30',
      4: '2026-08-03',
      5: '2026-08-12',
      6: '2026-08-14',
      7: '2026-08-18',
      8: '2026-08-18',
      9: '2026-09-01',
      10: '2026-09-01'
    },
    costs: [
      { label: 'Visa + agent fee', amount: 5700 },
      { label: 'Ticket + entry', amount: 1400 },
      { label: 'Medical + Iqama year 1', amount: 2150 }
    ]
  },
  {
    id: 'OB-2026-016',
    type: 'overseas',
    emp: '',
    nameEn: 'Sunil Thapa',
    nameAr: 'سونيل ثابا',
    nat: 'Nepal',
    prof: 'construction',
    agent: 'AG-01',
    visa: 'V-2026-501',
    stage: 2,
    stages: { 1: '2026-07-25', 2: '2026-08-20' },
    costs: [
      { label: 'Visa + agent fee', amount: 5200 },
      { label: 'Home-country medical', amount: 350 }
    ]
  },
  {
    id: 'OB-2026-017',
    type: 'overseas',
    emp: '',
    nameEn: 'Arjun Mehta',
    nameAr: 'أرجون ميهتا',
    nat: 'India',
    prof: 'driver',
    agent: 'AG-02',
    visa: 'V-2026-502',
    stage: 3,
    stages: { 1: '2026-07-30', 2: '2026-08-28', 3: '2026-09-08' },
    costs: [
      { label: 'Visa + agent fee', amount: 5400 },
      { label: 'Ticket + entry', amount: 1250 }
    ]
  },
  {
    id: 'OB-2026-018',
    type: 'transfer',
    emp: '',
    nameEn: 'Faisal Nadeem',
    nameAr: 'فيصل نديم',
    nat: 'Pakistan',
    prof: 'electrician',
    agent: '',
    visa: '',
    transfer: 'QX-2026-021',
    stage: 6,
    stages: { 1: '2026-08-01' },
    costs: [{ label: 'Qiwa transfer fee', amount: 4000 }]
  }
];

// Qiwa transfer cases (local-hire expats skip onboarding stages 2–5).
export const TRANSFERS = [
  {
    id: 'QX-2026-021',
    ob: 'OB-2026-018',
    nameEn: 'Faisal Nadeem',
    from: 'Al-Noor Contracting',
    fee: 4000,
    requested: '2026-08-20',
    noticeEnd: '2026-09-20',
    released: true,
    status: 'in-progress'
  },
  {
    id: 'QX-2026-015',
    ob: '',
    nameEn: 'Daniyal Sheikh',
    from: 'Riyadh Build Co.',
    fee: 2000,
    requested: '2026-05-10',
    noticeEnd: '2026-06-10',
    released: true,
    completed: '2026-06-30',
    status: 'completed'
  },
  {
    id: 'QX-2026-022',
    ob: '',
    nameEn: 'Omar Farouk',
    nameAr: 'عمر فاروق',
    from: 'Jeddah Towers Co.',
    fee: 2000,
    requested: '2026-09-05',
    noticeEnd: '2026-11-04',
    released: false,
    status: 'requested'
  },
  {
    id: 'QX-2026-020',
    ob: 'OB-2026-021',
    nameEn: 'Hassan Raza',
    nameAr: 'حسن رضا',
    from: 'Dammam Port Services',
    fee: 4000,
    requested: '2026-08-01',
    noticeEnd: '2026-09-30',
    released: false,
    status: 'awaiting-release'
  }
];

// Residency documents per expat (passport + medical insurance + traffic fines).
export const RESIDENCY_DOCS = [
  {
    emp: 'EMP-0006',
    passport: 'N100006',
    passportExp: '2029-04-11',
    ins: 'Bupa',
    insExp: '2027-03-14',
    fines: 0
  },
  {
    emp: 'EMP-0007',
    passport: 'P200007',
    passportExp: '2028-11-02',
    ins: 'Tawuniya',
    insExp: '2027-01-22',
    fines: 600
  },
  {
    emp: 'EMP-0008',
    passport: 'P300008',
    passportExp: '2029-01-19',
    ins: 'Bupa',
    insExp: '2026-09-28',
    fines: 0
  },
  {
    emp: 'EMP-0009',
    passport: 'F400009',
    passportExp: '2028-06-30',
    ins: 'Bupa',
    insExp: '2027-05-30',
    fines: 0
  },
  {
    emp: 'EMP-0010',
    passport: 'B500010',
    passportExp: '2029-09-14',
    ins: 'Tawuniya',
    insExp: '2027-02-11',
    fines: 0
  },
  {
    emp: 'EMP-0011',
    passport: 'B600011',
    passportExp: '2027-02-10',
    ins: 'Bupa',
    insExp: '2026-12-05',
    fines: 0
  },
  {
    emp: 'EMP-0012',
    passport: 'F700012',
    passportExp: '2028-03-22',
    ins: 'Bupa',
    insExp: '2026-10-15',
    fines: 0
  },
  {
    emp: 'EMP-0013',
    passport: 'N800013',
    passportExp: '2030-01-05',
    ins: 'Tawuniya',
    insExp: '2027-04-02',
    fines: 0
  },
  {
    emp: 'EMP-0014',
    passport: 'N900014',
    passportExp: '2029-07-17',
    ins: 'Bupa',
    insExp: '2027-06-19',
    fines: 0
  },
  {
    emp: 'EMP-0015',
    passport: 'P110015',
    passportExp: '2028-12-09',
    ins: 'Bupa',
    insExp: '2027-02-27',
    fines: 0
  },
  {
    emp: 'EMP-0016',
    passport: 'N120016',
    passportExp: '2029-05-25',
    ins: 'Tawuniya',
    insExp: '2026-11-20',
    fines: 0
  },
  {
    emp: 'EMP-0017',
    passport: 'B130017',
    passportExp: '2028-08-08',
    ins: 'Bupa',
    insExp: '2026-08-30',
    fines: 0
  },
  {
    emp: 'EMP-0018',
    passport: 'E140018',
    passportExp: '2029-02-28',
    ins: 'MedGulf',
    insExp: '2027-01-09',
    fines: 0
  },
  {
    emp: 'EMP-0019',
    passport: 'P150019',
    passportExp: '2028-10-11',
    ins: 'Bupa',
    insExp: '2027-03-25',
    fines: 0
  },
  {
    emp: 'EMP-0020',
    passport: 'N160020',
    passportExp: '2029-06-19',
    ins: 'Tawuniya',
    insExp: '2027-07-12',
    fines: 0
  },
  {
    emp: 'EMP-0021',
    passport: 'P170021',
    passportExp: '2030-05-01',
    ins: '',
    insExp: '',
    fines: 0
  },
  {
    emp: 'EMP-0022',
    passport: 'E180022',
    passportExp: '2028-04-27',
    ins: 'Bupa',
    insExp: '2027-05-17',
    fines: 0
  },
  {
    emp: 'EMP-0023',
    passport: 'N190023',
    passportExp: '2029-11-30',
    ins: 'Tawuniya',
    insExp: '2027-02-03',
    fines: 0
  },
  {
    emp: 'EMP-0024',
    passport: 'F200024',
    passportExp: '2028-07-15',
    ins: 'Bupa',
    insExp: '2027-06-06',
    fines: 0
  }
];

// Document vault. expires: '' = no expiry. Seeded rows are metadata records.
export const DOC_TYPES = [
  { code: 'contract', en: 'Employment contract', ar: 'عقد العمل' },
  { code: 'iqama', en: 'Iqama copy', ar: 'صورة الإقامة' },
  { code: 'passport', en: 'Passport copy', ar: 'صورة الجواز' },
  { code: 'visa', en: 'Visa copy', ar: 'صورة التأشيرة' },
  { code: 'insurance', en: 'Insurance card', ar: 'بطاقة التأمين' },
  { code: 'medical', en: 'Medical / fitness', ar: 'الكشف الطبي' },
  { code: 'qiwa', en: 'Qiwa record', ar: 'سجل قوى' },
  { code: 'iban', en: 'IBAN letter', ar: 'خطاب الآيبان' },
  { code: 'photo', en: 'Personal photo', ar: 'الصورة الشخصية' },
  { code: 'client-cr', en: 'Client CR', ar: 'سجل العميل' },
  { code: 'other', en: 'Other', ar: 'أخرى' }
];

export const DOCUMENTS = [
  {
    id: 'DOC-001',
    type: 'contract',
    emp: 'EMP-0006',
    title: 'Employment contract — Rajesh Kumar',
    uploaded: '2026-01-06',
    expires: '',
    size: '186 KB'
  },
  {
    id: 'DOC-002',
    type: 'iqama',
    emp: 'EMP-0006',
    title: 'Iqama copy — Rajesh Kumar',
    uploaded: '2026-03-15',
    expires: '2027-03-14',
    size: '240 KB'
  },
  {
    id: 'DOC-003',
    type: 'passport',
    emp: 'EMP-0006',
    title: 'Passport copy — Rajesh Kumar',
    uploaded: '2026-01-06',
    expires: '2029-04-11',
    size: '310 KB'
  },
  {
    id: 'DOC-004',
    type: 'insurance',
    emp: 'EMP-0006',
    title: 'Insurance card — Bupa',
    uploaded: '2026-03-15',
    expires: '2027-03-14',
    size: '150 KB'
  },
  {
    id: 'DOC-005',
    type: 'iban',
    emp: 'EMP-0006',
    title: 'IBAN letter — Al Rajhi',
    uploaded: '2026-01-12',
    expires: '',
    size: '120 KB'
  },
  {
    id: 'DOC-006',
    type: 'contract',
    emp: 'EMP-0013',
    title: 'Employment contract — Suresh Patel',
    uploaded: '2026-01-13',
    expires: '',
    size: '190 KB'
  },
  {
    id: 'DOC-007',
    type: 'iqama',
    emp: 'EMP-0008',
    title: 'Iqama copy — Mohammad Asif',
    uploaded: '2025-09-29',
    expires: '2026-09-28',
    size: '238 KB'
  },
  {
    id: 'DOC-008',
    type: 'iqama',
    emp: 'EMP-0012',
    title: 'Iqama copy — Maria Santos',
    uploaded: '2025-10-16',
    expires: '2026-10-15',
    size: '242 KB'
  },
  {
    id: 'DOC-009',
    type: 'iqama',
    emp: 'EMP-0016',
    title: 'Iqama copy — Deepak Yadav',
    uploaded: '2025-11-21',
    expires: '2026-11-20',
    size: '235 KB'
  },
  {
    id: 'DOC-010',
    type: 'passport',
    emp: 'EMP-0011',
    title: 'Passport copy — Abdul Malek',
    uploaded: '2023-01-26',
    expires: '2027-02-10',
    size: '305 KB'
  },
  {
    id: 'DOC-011',
    type: 'insurance',
    emp: 'EMP-0017',
    title: 'Insurance card — Bupa (expired)',
    uploaded: '2025-08-31',
    expires: '2026-08-30',
    size: '148 KB'
  },
  {
    id: 'DOC-012',
    type: 'visa',
    emp: '',
    title: 'Work visa V-2026-501 — Sunil Thapa',
    uploaded: '2026-08-20',
    expires: '2027-08-19',
    size: '175 KB'
  },
  {
    id: 'DOC-013',
    type: 'medical',
    emp: 'EMP-0021',
    title: 'Fitness certificate — Imran Khan',
    uploaded: '2026-08-05',
    expires: '',
    size: '210 KB'
  },
  {
    id: 'DOC-014',
    type: 'qiwa',
    emp: 'EMP-0001',
    title: 'Qiwa contract print — Abdullah Al-Otaibi',
    uploaded: '2024-03-02',
    expires: '',
    size: '160 KB'
  },
  {
    id: 'DOC-015',
    type: 'iban',
    emp: 'EMP-0013',
    title: 'IBAN letter — SNB',
    uploaded: '2026-01-14',
    expires: '',
    size: '118 KB'
  },
  {
    id: 'DOC-016',
    type: 'client-cr',
    client: 'CL-001',
    title: 'Commercial registration — Al-Bina',
    uploaded: '2026-01-12',
    expires: '2026-11-30',
    size: '280 KB'
  },
  {
    id: 'DOC-017',
    type: 'client-cr',
    client: 'CL-002',
    title: 'Commercial registration — Facility Care',
    uploaded: '2026-02-01',
    expires: '2027-05-01',
    size: '275 KB'
  },
  {
    id: 'DOC-018',
    type: 'photo',
    emp: 'EMP-0021',
    title: 'Personal photo — Imran Khan',
    uploaded: '2026-08-01',
    expires: '',
    size: '95 KB'
  },
  {
    id: 'DOC-019',
    type: 'qiwa',
    emp: 'EMP-0011',
    title: 'Qiwa transfer request — Abdul Malek',
    uploaded: '2026-08-25',
    expires: '',
    size: '140 KB'
  }
];

// Reporting lines (org chart). mgr: null = root.
export const ORG_LINKS = [
  { emp: 'EMP-0001', mgr: null },
  { emp: 'EMP-0002', mgr: 'EMP-0001' },
  { emp: 'EMP-0003', mgr: 'EMP-0001' },
  { emp: 'EMP-0004', mgr: 'EMP-0001' },
  { emp: 'EMP-0005', mgr: 'EMP-0001' },
  { emp: 'EMP-0024', mgr: 'EMP-0001' },
  { emp: 'EMP-0006', mgr: 'EMP-0002' },
  { emp: 'EMP-0007', mgr: 'EMP-0002' },
  { emp: 'EMP-0008', mgr: 'EMP-0002' },
  { emp: 'EMP-0009', mgr: 'EMP-0002' },
  { emp: 'EMP-0010', mgr: 'EMP-0002' },
  { emp: 'EMP-0011', mgr: 'EMP-0002' },
  { emp: 'EMP-0012', mgr: 'EMP-0002' },
  { emp: 'EMP-0013', mgr: 'EMP-0002' },
  { emp: 'EMP-0014', mgr: 'EMP-0002' },
  { emp: 'EMP-0015', mgr: 'EMP-0002' },
  { emp: 'EMP-0016', mgr: 'EMP-0002' },
  { emp: 'EMP-0017', mgr: 'EMP-0002' },
  { emp: 'EMP-0018', mgr: 'EMP-0002' },
  { emp: 'EMP-0019', mgr: 'EMP-0002' },
  { emp: 'EMP-0020', mgr: 'EMP-0002' },
  { emp: 'EMP-0021', mgr: 'EMP-0002' },
  { emp: 'EMP-0022', mgr: 'EMP-0002' },
  { emp: 'EMP-0023', mgr: 'EMP-0002' }
];

// ── P2: time & leave ─────────────────────────────────────────────────────
// Weekend in KSA: Friday + Saturday (JS day numbers).
export const WEEKEND_DAYS = [5, 6];

export const SHIFTS = [
  {
    id: 'SH-DAY',
    en: 'Day shift (office)',
    ar: 'صباحية (مكتب)',
    start: '08:00',
    end: '17:00',
    breakMin: 60,
    days: ['sun', 'mon', 'tue', 'wed', 'thu'],
    ramadanStart: '09:00',
    ramadanEnd: '15:00'
  },
  {
    id: 'SH-SITE',
    en: 'Site shift',
    ar: 'وردية الموقع',
    start: '07:00',
    end: '15:00',
    breakMin: 30,
    days: ['sun', 'mon', 'tue', 'wed', 'thu'],
    ramadanStart: '08:00',
    ramadanEnd: '14:00'
  },
  {
    id: 'SH-FM',
    en: 'FM shift (tower)',
    ar: 'وردية المرافق (برج)',
    start: '08:00',
    end: '17:00',
    breakMin: 60,
    days: ['sun', 'mon', 'tue', 'wed', 'thu'],
    ramadanStart: '09:00',
    ramadanEnd: '15:00'
  }
];

export const SITE_SHIFTS = [
  { site: 'ST-001', shift: 'SH-SITE' },
  { site: 'ST-002', shift: 'SH-SITE' },
  { site: 'ST-003', shift: 'SH-FM' }
];

export const RAMADAN_PERIODS = [
  { year: 2026, start: '2026-02-18', end: '2026-03-19', hijri: '1447' },
  { year: 2027, start: '2027-02-08', end: '2027-03-09', hijri: '1448' }
];

// Deterministic demo attendance: past 14 days for assigned workers.
function mulberry32(a) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildAttendance() {
  const rnd = mulberry32(42);
  const rows = [];
  const seen = new Set();
  const crew = [];
  for (const a of ASSIGNMENTS) {
    if (a.status !== 'active' || seen.has(a.emp)) {
      continue;
    }
    seen.add(a.emp);
    crew.push({ emp: a.emp, site: a.site, client: a.client });
  }
  const pad = n => String(n).padStart(2, '0');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let back = 13; back >= 0; back -= 1) {
    const d = new Date(today.getTime() - back * 86400000);
    if (WEEKEND_DAYS.includes(d.getDay())) {
      continue;
    }
    const iso = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    for (const w of crew) {
      const r = rnd();
      if (r < 0.02) {
        rows.push({
          id: `ATT-${iso}-${w.emp}`,
          emp: w.emp,
          site: w.site,
          client: w.client,
          date: iso,
          in: '',
          out: '',
          mins: 0,
          lateMin: 0,
          otMin: 0,
          status: 'absent'
        });
        continue;
      }
      const inMin = 7 * 60 + 52 + Math.floor(rnd() * 16);
      const late = inMin > 8 * 60 + 5;
      const outMin = 16 * 60 + 55 + Math.floor(rnd() * 18) + (rnd() < 0.12 ? 60 : 0);
      const worked = outMin - inMin - 60;
      rows.push({
        id: `ATT-${iso}-${w.emp}`,
        emp: w.emp,
        site: w.site,
        client: w.client,
        date: iso,
        in: `${pad(Math.floor(inMin / 60))}:${pad(inMin % 60)}`,
        out: `${pad(Math.floor(outMin / 60))}:${pad(outMin % 60)}`,
        mins: worked,
        lateMin: late ? inMin - (8 * 60 + 5) : 0,
        otMin: Math.max(0, worked - 480),
        status: late ? 'late' : 'present'
      });
    }
  }
  return rows;
}

export const ATTENDANCE = buildAttendance();

// Weekly site timesheets (supervisor view; approved = locked billing feed).
export const TIMESHEETS = [
  {
    id: 'TS-2026-W36-ST1',
    site: 'ST-001',
    weekStart: '2026-08-30',
    ramadan: false,
    status: 'submitted',
    step: 0,
    submittedBy: 'Site supervisor',
    submittedAt: '2026-09-05',
    history: [],
    lines: [
      { emp: 'EMP-0013', days: 5, regH: 40, otH: 2 },
      { emp: 'EMP-0014', days: 5, regH: 40, otH: 0 },
      { emp: 'EMP-0018', days: 5, regH: 40, otH: 3 },
      { emp: 'EMP-0020', days: 4, regH: 32, otH: 0 },
      { emp: 'EMP-0023', days: 5, regH: 40, otH: 1 }
    ]
  },
  {
    id: 'TS-2026-W36-ST2',
    site: 'ST-002',
    weekStart: '2026-08-30',
    ramadan: false,
    status: 'submitted',
    step: 0,
    submittedBy: 'Site supervisor',
    submittedAt: '2026-09-05',
    history: [],
    lines: [
      { emp: 'EMP-0015', days: 5, regH: 40, otH: 0 },
      { emp: 'EMP-0016', days: 5, regH: 40, otH: 4 },
      { emp: 'EMP-0019', days: 5, regH: 40, otH: 2 }
    ]
  },
  {
    id: 'TS-2026-W36-ST3',
    site: 'ST-003',
    weekStart: '2026-08-30',
    ramadan: false,
    status: 'approved',
    step: 2,
    submittedBy: 'Site supervisor',
    submittedAt: '2026-09-05',
    approvedAt: '2026-09-07',
    history: [
      { by: 'site-supervisor', at: '2026-09-06', decision: 'approved', note: '' },
      { by: 'ops', at: '2026-09-07', decision: 'approved', note: '' }
    ],
    lines: [
      { emp: 'EMP-0006', days: 5, regH: 40, otH: 0 },
      { emp: 'EMP-0007', days: 5, regH: 40, otH: 1 },
      { emp: 'EMP-0009', days: 5, regH: 40, otH: 0 },
      { emp: 'EMP-0010', days: 5, regH: 40, otH: 0 },
      { emp: 'EMP-0011', days: 4, regH: 32, otH: 0 },
      { emp: 'EMP-0022', days: 5, regH: 40, otH: 2 }
    ]
  },
  {
    id: 'TS-2026-W37-ST1',
    site: 'ST-001',
    weekStart: '2026-09-06',
    ramadan: false,
    status: 'draft',
    step: 0,
    submittedBy: '',
    submittedAt: '',
    history: [],
    lines: [
      { emp: 'EMP-0013', days: 4, regH: 32, otH: 1 },
      { emp: 'EMP-0014', days: 4, regH: 32, otH: 0 },
      { emp: 'EMP-0018', days: 4, regH: 32, otH: 0 },
      { emp: 'EMP-0020', days: 4, regH: 32, otH: 0 },
      { emp: 'EMP-0023', days: 4, regH: 32, otH: 0 }
    ]
  }
];

// Leave requests. status: pending | approved | rejected | cancelled. Historical
// approved annual requests are already counted in employee.annualUsed.
export const LEAVE_REQUESTS = [
  {
    id: 'LV-2026-031',
    emp: 'EMP-0009',
    type: 'annual',
    from: '2026-09-20',
    to: '2026-10-04',
    days: 11,
    status: 'pending',
    step: 0,
    note: 'Family visit',
    history: []
  },
  {
    id: 'LV-2026-030',
    emp: 'EMP-0015',
    type: 'sick',
    from: '2026-09-06',
    to: '2026-09-08',
    days: 3,
    cert: true,
    status: 'approved',
    step: 2,
    note: 'Flu',
    history: [
      { by: 'manager', at: '2026-09-06', decision: 'approved', note: '' },
      { by: 'hr', at: '2026-09-07', decision: 'approved', note: '' }
    ]
  },
  {
    id: 'LV-2026-029',
    emp: 'EMP-0006',
    type: 'annual',
    from: '2026-07-05',
    to: '2026-07-16',
    days: 10,
    returnedAt: '2026-07-16',
    returnStatus: 'on-time',
    status: 'approved',
    step: 2,
    note: '',
    history: []
  },
  {
    id: 'LV-2026-028',
    emp: 'EMP-0022',
    type: 'paternity',
    from: '2026-08-10',
    to: '2026-08-12',
    days: 3,
    status: 'approved',
    step: 2,
    note: 'Newborn',
    history: []
  },
  {
    id: 'LV-2026-027',
    emp: 'EMP-0010',
    type: 'unpaid',
    from: '2026-08-20',
    to: '2026-08-23',
    days: 2,
    status: 'rejected',
    step: 0,
    note: '',
    history: [{ by: 'manager', at: '2026-08-21', decision: 'rejected', note: 'Site coverage' }]
  },
  {
    id: 'LV-2026-032',
    emp: 'EMP-0014',
    type: 'annual',
    from: '2026-09-05',
    to: '2026-09-19',
    days: 11,
    status: 'approved',
    step: 2,
    note: 'Annual vacation',
    history: [
      { by: 'manager', at: '2026-08-28', decision: 'approved', note: '' },
      { by: 'hr', at: '2026-08-29', decision: 'approved', note: '' }
    ]
  },
  {
    id: 'LV-2026-033',
    emp: 'EMP-0016',
    type: 'annual',
    from: '2026-09-20',
    to: '2026-10-04',
    days: 11,
    status: 'approved',
    step: 2,
    note: 'Annual vacation',
    history: [
      { by: 'manager', at: '2026-09-02', decision: 'approved', note: '' },
      { by: 'hr', at: '2026-09-03', decision: 'approved', note: '' }
    ]
  },
  {
    id: 'LV-2026-034',
    emp: 'EMP-0019',
    type: 'annual',
    from: '2026-08-24',
    to: '2026-09-14',
    days: 16,
    status: 'approved',
    step: 2,
    note: 'Annual vacation',
    history: [
      { by: 'manager', at: '2026-08-10', decision: 'approved', note: '' },
      { by: 'hr', at: '2026-08-11', decision: 'approved', note: '' }
    ]
  },
  {
    id: 'LV-2026-026',
    emp: 'EMP-0011',
    type: 'annual',
    from: '2026-06-01',
    to: '2026-06-21',
    days: 15,
    status: 'approved',
    step: 2,
    returnedAt: '2026-06-21',
    returnStatus: 'on-time',
    note: '',
    history: []
  },
  {
    id: 'LV-2026-025',
    emp: 'EMP-0013',
    type: 'annual',
    from: '2026-05-03',
    to: '2026-05-24',
    days: 15,
    status: 'approved',
    step: 2,
    returnedAt: '2026-05-24',
    returnStatus: 'on-time',
    note: '',
    history: []
  },
  {
    id: 'LV-2026-024',
    emp: 'EMP-0023',
    type: 'annual',
    from: '2026-07-10',
    to: '2026-07-31',
    days: 15,
    status: 'approved',
    step: 2,
    returnedAt: '2026-08-05',
    returnStatus: 'overdue',
    delayReason: 'flight',
    note: '',
    history: []
  },
  {
    id: 'LV-2026-023',
    emp: 'EMP-0010',
    type: 'annual',
    from: '2026-04-05',
    to: '2026-04-26',
    days: 15,
    status: 'approved',
    step: 2,
    returnedAt: '2026-04-29',
    returnStatus: 'overdue',
    delayReason: 'emergency',
    note: '',
    history: []
  }
];

// Approval chains v1 (flows → ordered roles). Admin may act at any step.
export const APPROVAL_CHAINS = [
  { flow: 'leave', steps: ['manager', 'hr'] },
  { flow: 'timesheet', steps: ['site-supervisor', 'ops'] }
];

export const ACTOR_ROLES = ['manager', 'site-supervisor', 'hr', 'ops', 'admin'];

// — P3: Ajeer permits (one e-contract per deployment; Decision 60339) —
function _aj(no, asn, emp, client, site, prof, service, issued, exp, history) {
  return {
    no,
    asn,
    emp,
    client,
    site,
    prof,
    service,
    issued,
    exp,
    status: 'active',
    history: history || [{ at: issued, event: 'issued', by: 'PRO' }]
  };
}

export const AJEER_PERMITS = [
  _aj(
    'AJ-2026-101',
    'ASN-2026-001',
    'EMP-0006',
    'CL-002',
    'ST-003',
    'driver',
    'labour',
    '2025-12-28',
    '2026-12-31'
  ),
  _aj(
    'AJ-2026-102',
    'ASN-2026-002',
    'EMP-0007',
    'CL-002',
    'ST-003',
    'driver',
    'labour',
    '2025-12-28',
    '2026-12-31'
  ),
  _aj(
    'AJ-2026-103',
    'ASN-2026-003',
    'EMP-0009',
    'CL-002',
    'ST-003',
    'cleaner',
    'labour',
    '2026-01-25',
    '2027-01-31'
  ),
  _aj(
    'AJ-2026-104',
    'ASN-2026-004',
    'EMP-0010',
    'CL-002',
    'ST-003',
    'cleaner',
    'labour',
    '2026-01-25',
    '2027-01-31'
  ),
  _aj(
    'AJ-2026-105',
    'ASN-2026-005',
    'EMP-0011',
    'CL-002',
    'ST-003',
    'cleaner',
    'labour',
    '2026-02-22',
    '2027-02-28'
  ),
  _aj(
    'AJ-2026-106',
    'ASN-2026-006',
    'EMP-0013',
    'CL-001',
    'ST-001',
    'construction',
    'labour',
    '2026-01-05',
    '2026-12-31',
    [
      { at: '2026-01-05', event: 'issued', by: 'PRO' },
      { at: '2026-07-02', event: 'profession-verified', by: 'PRO' }
    ]
  ),
  _aj(
    'AJ-2026-107',
    'ASN-2026-007',
    'EMP-0014',
    'CL-001',
    'ST-001',
    'construction',
    'labour',
    '2026-01-05',
    '2026-12-31'
  ),
  _aj(
    'AJ-2026-108',
    'ASN-2026-008',
    'EMP-0015',
    'CL-001',
    'ST-002',
    'construction',
    'labour',
    '2026-03-25',
    '2027-03-31'
  ),
  _aj(
    'AJ-2026-110',
    'ASN-2026-010',
    'EMP-0018',
    'CL-001',
    'ST-001',
    'mason',
    'labour',
    '2026-01-05',
    '2026-12-31'
  ),
  _aj(
    'AJ-2026-111',
    'ASN-2026-011',
    'EMP-0019',
    'CL-001',
    'ST-002',
    'mason',
    'labour',
    '2026-05-25',
    '2026-09-25'
  ),
  _aj(
    'AJ-2026-112',
    'ASN-2026-012',
    'EMP-0020',
    'CL-001',
    'ST-001',
    'electrician',
    'labour',
    '2026-02-03',
    '2027-02-09'
  ),
  _aj(
    'AJ-2026-113',
    'ASN-2026-013',
    'EMP-0022',
    'CL-002',
    'ST-003',
    'plumber',
    'labour',
    '2026-03-03',
    '2027-03-09'
  ),
  _aj(
    'AJ-2026-114',
    'ASN-2026-014',
    'EMP-0023',
    'CL-001',
    'ST-001',
    'foreman',
    'labour',
    '2026-02-03',
    '2027-02-09'
  ),
  {
    no: 'AJ-2025-318',
    asn: '',
    emp: 'EMP-0016',
    client: 'CL-002',
    site: 'ST-003',
    prof: 'construction',
    service: 'labour',
    issued: '2025-08-01',
    exp: '2026-07-31',
    status: 'returned',
    history: [
      { at: '2025-08-01', event: 'issued', by: 'PRO' },
      { at: '2026-07-30', event: 'returned', by: 'CL-002' }
    ]
  },
  _aj(
    'AJ-2026-201',
    'ASN-2026-015',
    'EMP-0008',
    'CL-001',
    'ST-004',
    'driver',
    'labour',
    '2026-07-01',
    '2027-06-30'
  ),
  _aj(
    'AJ-2026-202',
    'ASN-2026-016',
    'EMP-0017',
    'CL-002',
    'ST-005',
    'construction',
    'labour',
    '2026-08-01',
    '2027-07-31'
  ),
  _aj(
    'AJ-2026-203',
    'ASN-2026-017',
    'EMP-0021',
    'CL-001',
    'ST-004',
    'electrician',
    'labour',
    '2026-08-15',
    '2027-08-14'
  ),
  _aj(
    'AJ-2026-204',
    'ASN-2026-018',
    'EMP-0024',
    'CL-001',
    'ST-006',
    'office',
    'labour',
    '2026-09-01',
    '2027-02-28'
  )
];

// — P3: invoices (inputs only; amounts computed by the engine) —
export const INVOICES = [
  {
    id: 'INV-2026-08-CL-001',
    client: 'CL-001',
    month: '2026-08',
    status: 'issued',
    issuedAt: '2026-09-03',
    dueAt: '2026-09-05',
    paidAt: '',
    lines: [
      { emp: 'EMP-0013', site: 'ST-001', days: 22, regH: 176, otH: 4, rate: 3200, sheet: '' },
      { emp: 'EMP-0018', site: 'ST-001', days: 22, regH: 176, otH: 8, rate: 4200, sheet: '' }
    ]
  },
  {
    id: 'INV-2026-08-CL-002',
    client: 'CL-002',
    month: '2026-08',
    status: 'paid',
    issuedAt: '2026-09-05',
    dueAt: '2026-09-10',
    paidAt: '2026-09-08',
    lines: [
      {
        emp: 'EMP-0006',
        site: 'ST-003',
        days: 22,
        regH: 176,
        otH: 6,
        rate: 3500,
        sheet: 'TS-2026-W36-ST3'
      },
      {
        emp: 'EMP-0007',
        site: 'ST-003',
        days: 22,
        regH: 176,
        otH: 2,
        rate: 3500,
        sheet: 'TS-2026-W36-ST3'
      },
      {
        emp: 'EMP-0009',
        site: 'ST-003',
        days: 22,
        regH: 176,
        otH: 0,
        rate: 2800,
        sheet: 'TS-2026-W36-ST3'
      }
    ]
  }
];

// ── P4: payroll, expenses, advances ────────────────────────────────────────
// Pay-run lines are computed live from employees + adjustments via calcPayLine
// (hr-statutory.js) so seed math can never drift; the UI locks approved/paid
// runs. The backend replaces this with snapshotted lines (see httpAdapter).

export const SEED_EOSB = {
  basis: 'basic', // 'basic' | 'basic+housing' — wage basis for Art. 84 (counsel sets)
  capMonths: 0, // 0 = no cap; sources cite 12 vs 18 — verify, then set here
  payDaysEmployer: 7, // pay within 1 week on employer termination
  payDaysResign: 14 // …within 2 weeks on resignation
};

export const PAY_RUNS = [
  {
    id: 'PR-2026-08',
    month: '2026-08',
    status: 'paid',
    paidOn: '2026-09-02',
    wps: 'paid',
    wpsAt: '2026-09-01T10:00:00',
    adjustments: {
      'EMP-0006': { otH: 12 },
      'EMP-0007': { otH: 8 },
      'EMP-0003': { extras: 300, extrasLabel: 'Site allowance' },
      'EMP-0010': {
        deductions: [
          {
            label: 'Salary advance settlement',
            labelAr: 'سداد سلفة راتب',
            cat: 'advance',
            amount: 500
          }
        ]
      }
    }
  },
  {
    id: 'PR-2026-09',
    month: '2026-09',
    status: 'draft',
    paidOn: null,
    wps: 'draft',
    wpsAt: null,
    adjustments: {
      'EMP-0009': { otH: 4 }
    }
  }
];

export const EXPENSES = [
  {
    id: 'EXP-2026-011',
    emp: 'EMP-0006',
    date: '2026-09-03',
    cat: 'fuel',
    amount: 420,
    vat: 63,
    receipt: true,
    desc: 'Diesel for site generator',
    descAr: 'ديزل لمولد الموقع',
    status: 'submitted',
    billable: true,
    client: 'CL-002',
    history: [{ at: '2026-09-03', by: 'EMP-0006', action: 'submitted' }]
  },
  {
    id: 'EXP-2026-012',
    emp: 'EMP-0003',
    date: '2026-09-01',
    cat: 'travel',
    amount: 1800,
    vat: 270,
    receipt: true,
    desc: 'Client site visit — Dammam',
    descAr: 'زيارة موقع العميل — الدمام',
    status: 'approved',
    billable: false,
    client: null,
    history: [
      { at: '2026-09-01', by: 'EMP-0003', action: 'submitted' },
      { at: '2026-09-04', by: 'EMP-0001', action: 'approved' }
    ]
  },
  {
    id: 'EXP-2026-013',
    emp: 'EMP-0010',
    date: '2026-08-28',
    cat: 'supplies',
    amount: 950,
    vat: 142.5,
    receipt: true,
    desc: 'Safety gloves + cleaning stock',
    descAr: 'قفازات سلامة ومواد تنظيف',
    status: 'paid',
    paidAt: '2026-09-04',
    billable: false,
    client: null,
    history: [
      { at: '2026-08-28', by: 'EMP-0010', action: 'submitted' },
      { at: '2026-08-30', by: 'EMP-0001', action: 'approved' },
      { at: '2026-09-04', by: 'EMP-0002', action: 'paid' }
    ]
  },
  {
    id: 'EXP-2026-014',
    emp: 'EMP-0007',
    date: '2026-09-05',
    cat: 'fuel',
    amount: 620,
    vat: 93,
    receipt: true,
    desc: 'Diesel — two site trips',
    descAr: 'ديزل — رحلتان للموقع',
    status: 'submitted',
    billable: false,
    client: null,
    history: [{ at: '2026-09-05', by: 'EMP-0007', action: 'submitted' }]
  },
  {
    id: 'EXP-2026-015',
    emp: 'EMP-0012',
    date: '2026-09-06',
    cat: 'perdiem',
    amount: 300,
    vat: 0,
    receipt: false,
    desc: 'Per diem — Jubail day trip',
    descAr: 'بدل يومي — رحلة الجبيل',
    status: 'draft',
    billable: false,
    client: null,
    history: []
  },
  {
    id: 'EXP-2026-016',
    emp: 'EMP-0008',
    date: '2026-08-20',
    cat: 'medical',
    amount: 800,
    vat: 120,
    receipt: false,
    desc: 'Clinic visit + prescription',
    descAr: 'زيارة عيادة ووصفة',
    status: 'submitted',
    billable: false,
    client: null,
    history: [{ at: '2026-08-20', by: 'EMP-0008', action: 'submitted' }]
  },
  {
    id: 'EXP-2026-017',
    emp: 'EMP-0009',
    date: '2026-09-02',
    cat: 'govt',
    amount: 2500,
    vat: 0,
    receipt: true,
    desc: 'Traffic fine',
    descAr: 'مخالفة مرورية',
    status: 'rejected',
    billable: false,
    client: null,
    history: [
      { at: '2026-09-02', by: 'EMP-0009', action: 'submitted' },
      {
        at: '2026-09-03',
        by: 'EMP-0001',
        action: 'rejected',
        note: 'Personal fine — not reimbursable'
      }
    ]
  }
];

export const ADVANCES = [
  {
    id: 'ADV-2026-004',
    emp: 'EMP-0010',
    date: '2026-08-10',
    amount: 500,
    purpose: 'Family emergency',
    purposeAr: 'ظرف عائلي طارئ',
    status: 'settled',
    settled: [{ ref: 'PR-2026-08', at: '2026-09-02', amount: 500 }]
  },
  {
    id: 'ADV-2026-005',
    emp: 'EMP-0006',
    date: '2026-09-01',
    amount: 800,
    purpose: 'School fees',
    purposeAr: 'رسوم مدرسية',
    status: 'open',
    settled: []
  }
];

// ── P5: contract templates + registers + hiring ────────────────────────────
// Template bodies are bilingual with {{placeholders}} (see KNOWN_PLACEHOLDERS).
// Fields with `source` auto-fill from the picked party; the rest are manual.

export const TEMPLATES = [
  {
    code: 'E1',
    cat: 'E',
    en: 'Indefinite-term employment',
    ar: 'عقد عمل غير محدد المدة',
    version: 3,
    updatedAt: '2026-08-01',
    party: 'employee',
    fields: [
      {
        key: 'probation_days',
        en: 'Probation days (≤180)',
        ar: 'أيام التجربة (≤180)',
        kind: 'number',
        def: 90
      },
      { key: 'notice_days', en: 'Notice days', ar: 'أيام الإشعار', kind: 'number', def: 60 }
    ],
    bodyEn: `INDEFINITE-TERM EMPLOYMENT CONTRACT
Between {{company_en}} (CR {{company_cr}}) — the Employer — and {{worker_name}} (ID {{id_no}}, {{nationality}}) — the Employee.
1. Job: {{job_title}}. Start date: {{start_date}}.
2. Monthly wage: basic {{wage_basic}}, housing {{wage_housing}}, transport {{wage_transport}} (total {{wage_total}} SAR), paid electronically via WPS.
3. Probation: {{probation_days}} days, stated here as required; either party may end the contract during probation per this contract.
4. Notice: {{notice_days}} days for indefinite termination; resignation is deemed accepted if the employer does not reply within 30 days.
5. The Employee consents to assignment to client sites under Ajeer-compliant outsourcing during employment.
6. This contract is documented electronically via Qiwa.`,
    bodyAr: `عقد عمل غير محدد المدة
بين {{company_ar}} (س.ت {{company_cr}}) — صاحب العمل — و{{worker_name_ar}} (هوية {{id_no}}، {{nationality}}) — الموظف.
1. المهنة: {{job_title_ar}}. تاريخ البدء: {{start_date}}.
2. الأجر الشهري: أساسي {{wage_basic}}، سكن {{wage_housing}}، نقل {{wage_transport}} (الإجمالي {{wage_total}} ر.س)، يُدفع إلكترونيًا عبر حماية الأجور.
3. فترة التجربة: {{probation_days}} يومًا، منصوص عليها هنا كما يشترط النظام؛ ويجوز لأي طرف إنهاء العقد خلالها وفق هذا العقد.
4. الإشعار: {{notice_days}} يومًا لإنهاء العقد غير المحدد؛ وتُعد الاستقالة مقبولة إذا لم يرد صاحب العمل خلال 30 يومًا.
5. يوافق الموظف على إعارته لمواقع العملاء ضمن إسناد متوافق مع أجير أثناء سريان العقد.
6. يوثق هذا العقد إلكترونيًا عبر قوى.`
  },
  {
    code: 'E2',
    cat: 'E',
    en: 'Fixed-term employment',
    ar: 'عقد عمل محدد المدة',
    version: 3,
    updatedAt: '2026-08-01',
    party: 'employee',
    fields: [
      {
        key: 'duration_months',
        en: 'Duration (months)',
        ar: 'المدة (أشهر)',
        kind: 'number',
        def: 12
      },
      { key: 'end_date', en: 'End date', ar: 'تاريخ الانتهاء', kind: 'date' },
      {
        key: 'probation_days',
        en: 'Probation days (≤180)',
        ar: 'أيام التجربة (≤180)',
        kind: 'number',
        def: 90
      },
      {
        key: 'notice_days',
        en: 'Non-renewal notice days',
        ar: 'إشعار عدم التجديد',
        kind: 'number',
        def: 60
      }
    ],
    bodyEn: `FIXED-TERM EMPLOYMENT CONTRACT
Between {{company_en}} (CR {{company_cr}}) and {{worker_name}} (ID {{id_no}}, {{nationality}}).
1. Job: {{job_title}}. Term: {{start_date}} to {{end_date}} ({{duration_months}} months).
2. Monthly wage: basic {{wage_basic}}, housing {{wage_housing}}, transport {{wage_transport}} (total {{wage_total}} SAR) via WPS.
3. Probation: {{probation_days}} days. Renewal requires written agreement; non-renewal notice is {{notice_days}} days.
4. Fixed-term resignation follows Art. 85 (2026: haircut applies to fixed-term resignation only).
5. Documented electronically via Qiwa.`,
    bodyAr: `عقد عمل محدد المدة
بين {{company_ar}} (س.ت {{company_cr}}) و{{worker_name_ar}} (هوية {{id_no}}، {{nationality}}).
1. المهنة: {{job_title_ar}}. المدة: من {{start_date}} إلى {{end_date}} ({{duration_months}} شهرًا).
2. الأجر الشهري: أساسي {{wage_basic}}، سكن {{wage_housing}}، نقل {{wage_transport}} (الإجمالي {{wage_total}} ر.س) عبر حماية الأجور.
3. التجربة: {{probation_days}} يومًا. يتطلب التجديد اتفاقًا كتابيًا؛ وإشعار عدم التجديد {{notice_days}} يومًا.
4. تخضع استقالة محدد المدة للمادة 85 (2026: الحسم للاستقالة محددة المدة فقط).
5. يوثق إلكترونيًا عبر قوى.`
  },
  {
    code: 'E3',
    cat: 'E',
    en: 'Expat fixed-term employment',
    ar: 'عقد عمل غير سعودي',
    version: 4,
    updatedAt: '2026-08-15',
    party: 'employee',
    fields: [
      {
        key: 'duration_months',
        en: 'Duration (months)',
        ar: 'المدة (أشهر)',
        kind: 'number',
        def: 24
      },
      { key: 'end_date', en: 'End date', ar: 'تاريخ الانتهاء', kind: 'date' },
      {
        key: 'probation_days',
        en: 'Probation days (≤180)',
        ar: 'أيام التجربة (≤180)',
        kind: 'number',
        def: 90
      },
      {
        key: 'ticket_note',
        en: 'Ticket / repatriation note',
        ar: 'بند التذاكر',
        kind: 'text',
        def: 'Annual economy ticket plus end-of-service repatriation at employer cost.'
      }
    ],
    bodyEn: `EXPATRIATE FIXED-TERM EMPLOYMENT CONTRACT
Between {{company_en}} (CR {{company_cr}}) and {{worker_name}} (Iqama {{id_no}}, {{nationality}}).
1. Job: {{job_title}} — must match the profession on the work permit/Iqama. Term: {{start_date}} to {{end_date}} ({{duration_months}} months).
2. Monthly wage: basic {{wage_basic}}, housing {{wage_housing}}, transport {{wage_transport}} (total {{wage_total}} SAR) via WPS.
3. Probation: {{probation_days}} days. The employer bears recruitment, Iqama and renewal costs (Art. 40) — never deducted from wage.
4. Tickets: {{ticket_note}}
5. The Employee consents to Ajeer-compliant assignment to client sites. Exit/re-entry follows mutual agreement and the law.
6. Documented electronically via Qiwa; expiry is linked to Iqama validity.`,
    bodyAr: `عقد عمل غير سعودي محدد المدة
بين {{company_ar}} (س.ت {{company_cr}}) و{{worker_name_ar}} (إقامة {{id_no}}، {{nationality}}).
1. المهنة: {{job_title_ar}} — يجب أن تطابق المهنة في رخصة العمل/الإقامة. المدة: من {{start_date}} إلى {{end_date}} ({{duration_months}} شهرًا).
2. الأجر الشهري: أساسي {{wage_basic}}، سكن {{wage_housing}}، نقل {{wage_transport}} (الإجمالي {{wage_total}} ر.س) عبر حماية الأجور.
3. التجربة: {{probation_days}} يومًا. يتحمل صاحب العمل تكاليف الاستقدام والإقامة والتجديد (مادة 40) — ولا تُستقطع من الأجر أبدًا.
4. التذاكر: {{ticket_note}}
5. يوافق الموظف على الإعارة لمواقع العملاء وفق أجير. وتخضع تأشيرات الخروج والعودة للاتفاق والنظام.
6. يوثق إلكترونيًا عبر قوى؛ ويرتبط الانتهاء بصلاحية الإقامة.`
  },
  {
    code: 'E4',
    cat: 'E',
    en: 'Part-time employment',
    ar: 'عقد عمل بدوام جزئي',
    version: 2,
    updatedAt: '2026-07-01',
    party: 'employee',
    fields: [
      {
        key: 'hours_note',
        en: 'Working hours note',
        ar: 'بند ساعات العمل',
        kind: 'text',
        def: '20 hours per week, scheduled by the direct manager.'
      },
      { key: 'notice_days', en: 'Notice days', ar: 'أيام الإشعار', kind: 'number', def: 30 }
    ],
    bodyEn: `PART-TIME EMPLOYMENT CONTRACT
Between {{company_en}} (CR {{company_cr}}) and {{worker_name}} (ID {{id_no}}).
1. Job: {{job_title}}. Monthly wage {{wage_total}} SAR (basic {{wage_basic}}, housing {{wage_housing}}, transport {{wage_transport}}) via WPS.
2. Hours: {{hours_note}} Any regular extra hours are compensated per the Labor Law.
3. Notice: {{notice_days}} days. Saudi part-timers at SAR 3,000+ count as one-third toward Nitaqat.
4. Documented electronically via Qiwa.`,
    bodyAr: `عقد عمل بدوام جزئي
بين {{company_ar}} (س.ت {{company_cr}}) و{{worker_name_ar}} (هوية {{id_no}}).
1. المهنة: {{job_title_ar}}. الأجر الشهري {{wage_total}} ر.س (أساسي {{wage_basic}}، سكن {{wage_housing}}، نقل {{wage_transport}}) عبر حماية الأجور.
2. الساعات: {{hours_note}} وأي ساعات إضافية منتظمة تُعوض وفق نظام العمل.
3. الإشعار: {{notice_days}} يومًا. السعودي بدوام جزئي بأجر 3000+ ر.س يُحتسب ثلثًا في نطاقات.
4. يوثق إلكترونيًا عبر قوى.`
  },
  {
    code: 'E5',
    cat: 'E',
    en: 'Flexible / hourly work',
    ar: 'عقد العمل المرن',
    version: 1,
    updatedAt: '2026-06-01',
    party: 'employee',
    fields: [
      {
        key: 'hours_note',
        en: 'Hourly terms',
        ar: 'شروط الساعات',
        kind: 'text',
        def: 'Hourly wage per timesheet, capped at the statutory flexible-work ceiling.'
      },
      { key: 'notice_days', en: 'Notice days', ar: 'أيام الإشعار', kind: 'number', def: 15 }
    ],
    bodyEn: `FLEXIBLE / HOURLY WORK CONTRACT
Between {{company_en}} (CR {{company_cr}}) and {{worker_name}} (ID {{id_no}}).
1. Job: {{job_title}}. Terms: {{hours_note}}
2. GOSI treatment follows the flexible-work regulations in force — confirm with counsel before issuing.
3. Notice: {{notice_days}} days. Documented electronically via Qiwa.`,
    bodyAr: `عقد العمل المرن
بين {{company_ar}} (س.ت {{company_cr}}) و{{worker_name_ar}} (هوية {{id_no}}).
1. المهنة: {{job_title_ar}}. الشروط: {{hours_note}}
2. تخضع معاملة التأمينات للائحة العمل المرن السارية — أكّد مع المستشار قبل الإصدار.
3. الإشعار: {{notice_days}} يومًا. يوثق إلكترونيًا عبر قوى.`
  },
  {
    code: 'E6',
    cat: 'E',
    en: 'Temporary / seasonal work',
    ar: 'عقد عمل مؤقت–موسمي',
    version: 1,
    updatedAt: '2026-06-01',
    party: 'employee',
    fields: [
      { key: 'end_date', en: 'End date', ar: 'تاريخ الانتهاء', kind: 'date' },
      { key: 'site_name', en: 'Work site', ar: 'موقع العمل', kind: 'text' }
    ],
    bodyEn: `TEMPORARY / SEASONAL WORK CONTRACT
Between {{company_en}} (CR {{company_cr}}) and {{worker_name}} (ID {{id_no}}).
1. Job: {{job_title}} at {{site_name}}. Term: {{start_date}} to {{end_date}}.
2. Monthly wage {{wage_total}} SAR via WPS. The contract ends automatically on {{end_date}} with clearance.
3. Documented electronically via Qiwa.`,
    bodyAr: `عقد عمل مؤقت–موسمي
بين {{company_ar}} (س.ت {{company_cr}}) و{{worker_name_ar}} (هوية {{id_no}}).
1. المهنة: {{job_title_ar}} في {{site_name}}. المدة: من {{start_date}} إلى {{end_date}}.
2. الأجر الشهري {{wage_total}} ر.س عبر حماية الأجور. ينتهي العقد تلقائيًا بتاريخ {{end_date}} مع إخلاء الطرف.
3. يوثق إلكترونيًا عبر قوى.`
  },
  {
    code: 'E7',
    cat: 'E',
    en: 'Remote work',
    ar: 'عقد العمل عن بعد',
    version: 1,
    updatedAt: '2026-06-01',
    party: 'employee',
    fields: [
      {
        key: 'work_location',
        en: 'Work location',
        ar: 'مكان العمل',
        kind: 'text',
        def: 'From home within Saudi Arabia.'
      },
      {
        key: 'equipment_note',
        en: 'Equipment note',
        ar: 'بند الأجهزة',
        kind: 'text',
        def: 'Laptop and connectivity allowance provided by the employer.'
      },
      {
        key: 'sla_note',
        en: 'Communication SLA',
        ar: 'اتفاقية التواصل',
        kind: 'text',
        def: 'Reachable during working hours; daily async update.'
      },
      { key: 'notice_days', en: 'Notice days', ar: 'أيام الإشعار', kind: 'number', def: 60 }
    ],
    bodyEn: `REMOTE WORK CONTRACT
Between {{company_en}} (CR {{company_cr}}) and {{worker_name}} (ID {{id_no}}).
1. Job: {{job_title}}. Location: {{work_location}}
2. Equipment: {{equipment_note}}
3. Communication: {{sla_note}}
4. Monthly wage {{wage_total}} SAR via WPS. Notice {{notice_days}} days. Documented via Qiwa.`,
    bodyAr: `عقد العمل عن بعد
بين {{company_ar}} (س.ت {{company_cr}}) و{{worker_name_ar}} (هوية {{id_no}}).
1. المهنة: {{job_title_ar}}. المكان: {{work_location}}
2. الأجهزة: {{equipment_note}}
3. التواصل: {{sla_note}}
4. الأجر الشهري {{wage_total}} ر.س عبر حماية الأجور. الإشعار {{notice_days}} يومًا. يوثق عبر قوى.`
  },
  {
    code: 'E8',
    cat: 'E',
    en: 'Management / executive',
    ar: 'عقد إداري / تنفيذي',
    version: 2,
    updatedAt: '2026-07-15',
    party: 'employee',
    fields: [
      {
        key: 'probation_days',
        en: 'Probation days (≤180)',
        ar: 'أيام التجربة (≤180)',
        kind: 'number',
        def: 180
      },
      { key: 'notice_days', en: 'Notice days', ar: 'أيام الإشعار', kind: 'number', def: 90 },
      {
        key: 'bonus_note',
        en: 'Bonus terms',
        ar: 'شروط المكافآت',
        kind: 'text',
        def: 'Annual performance bonus per company policy.'
      }
    ],
    bodyEn: `MANAGEMENT / EXECUTIVE CONTRACT (counsel-reviewed template)
Between {{company_en}} (CR {{company_cr}}) and {{worker_name}} (ID {{id_no}}).
1. Role: {{job_title}}. Start: {{start_date}}. Probation {{probation_days}} days; notice {{notice_days}} days.
2. Monthly wage {{wage_total}} SAR via WPS. Bonus: {{bonus_note}}
3. Confidentiality survives termination; any non-compete applies only within enforceable legal limits.
4. Documented electronically via Qiwa.`,
    bodyAr: `عقد إداري / تنفيذي (قالب معتمد من المستشار)
بين {{company_ar}} (س.ت {{company_cr}}) و{{worker_name_ar}} (هوية {{id_no}}).
1. المنصب: {{job_title_ar}}. البدء: {{start_date}}. التجربة {{probation_days}} يومًا؛ الإشعار {{notice_days}} يومًا.
2. الأجر الشهري {{wage_total}} ر.س عبر حماية الأجور. المكافآت: {{bonus_note}}
3. تبقى السرية بعد الإنهاء؛ ولا يسري عدم المنافسة إلا ضمن الحدود النظامية الواجبة النفاذ.
4. يوثق إلكترونيًا عبر قوى.`
  },
  {
    code: 'A1',
    cat: 'A',
    en: 'Assignment / outsourcing consent',
    ar: 'موافقة الإعارة',
    version: 2,
    updatedAt: '2026-07-01',
    party: 'assignment',
    fields: [{ key: 'period_text', en: 'Assignment period', ar: 'فترة الإعارة', kind: 'text' }],
    bodyEn: `ASSIGNMENT / OUTSOURCING CONSENT
I, {{worker_name}} (ID {{id_no}}), employed by {{company_en}}, consent to assignment to {{client_name}} at {{site_name}} for {{period_text}} (ref {{assignment_ref}}).
- My profession of record ({{job_title}}) is unchanged; out-of-profession work is refused and reported.
- Wage continuity: my salary, GOSI and EOSB remain with {{company_en}} during the assignment.
- Ajeer documentation ({{ajeer_ref}}) must be in place before work starts.`,
    bodyAr: `موافقة الإعارة
أنا {{worker_name_ar}} (هوية {{id_no}})، الموظف لدى {{company_ar}}، أوافق على إعارتي إلى {{client_name}} في {{site_name}} لمدة {{period_text}} (مرجع {{assignment_ref}}).
- مهنتي المسجلة ({{job_title_ar}}) لا تتغير؛ وأرفض العمل خارج المهنة وأبلغ عنه.
- استمرارية الأجر: يبقى راتبي وتأميناتي ومكافأتي لدى {{company_ar}} أثناء الإعارة.
- يجب أن يكون توثيق أجير ({{ajeer_ref}}) ساريًا قبل بدء العمل.`
  },
  {
    code: 'A2',
    cat: 'A',
    en: 'Deployment letter',
    ar: 'خطاب تكليف',
    version: 2,
    updatedAt: '2026-07-01',
    party: 'assignment',
    fields: [
      { key: 'start_date', en: 'Reporting date', ar: 'تاريخ المباشرة', kind: 'date' },
      { key: 'period_text', en: 'Assignment period', ar: 'فترة التكليف', kind: 'text' }
    ],
    bodyEn: `DEPLOYMENT LETTER
To: {{worker_name}} (ID {{id_no}}).
You are assigned to {{client_name}} — {{site_name}} starting {{start_date}}, for {{period_text}} (ref {{assignment_ref}}).
Report to the site supervisor on arrival. Your employment, wage and benefits remain with {{company_en}}. Ajeer: {{ajeer_ref}}.
Issued {{today_date}} by {{issuer_name}}, {{issuer_title}}.`,
    bodyAr: `خطاب تكليف
إلى: {{worker_name_ar}} (هوية {{id_no}}).
كُلفت بالعمل لدى {{client_name}} — {{site_name}} اعتبارًا من {{start_date}}، لمدة {{period_text}} (مرجع {{assignment_ref}}).
راجع مشرف الموقع عند الوصول. تبقى علاقتك وأجرك ومزاياك لدى {{company_ar}}. أجير: {{ajeer_ref}}.
صدر بتاريخ {{today_date}} من {{issuer_name}}، {{issuer_title}}.`
  },
  {
    code: 'A3',
    cat: 'A',
    en: 'Ajeer cover record',
    ar: 'سجل تغطية أجير',
    version: 1,
    updatedAt: '2026-06-01',
    party: 'assignment',
    fields: [{ key: 'period_text', en: 'Permit period', ar: 'فترة التصريح', kind: 'text' }],
    bodyEn: `AJEER COVER RECORD (internal ops file)
Assignment {{assignment_ref}} — {{worker_name}} to {{client_name}} / {{site_name}}.
Ajeer ref: {{ajeer_ref}}. Period: {{period_text}}.
Renewal alerts at 60/30/14 days; revocation triggers a 1-working-day recall.`,
    bodyAr: `سجل تغطية أجير (ملف تشغيلي داخلي)
التكليف {{assignment_ref}} — {{worker_name_ar}} إلى {{client_name}} / {{site_name}}.
مرجع أجير: {{ajeer_ref}}. الفترة: {{period_text}}.
تنبيهات التجديد قبل 60/30/14 يومًا؛ والإلغاء يستوجب الاستدعاء خلال يوم عمل واحد.`
  },
  {
    code: 'A4',
    cat: 'A',
    en: 'Recall / completion notice',
    ar: 'إشعار استدعاء / إنجاز',
    version: 1,
    updatedAt: '2026-06-01',
    party: 'assignment',
    fields: [
      { key: 'end_date', en: 'Last working day', ar: 'آخر يوم عمل', kind: 'date' },
      {
        key: 'reason_text',
        en: 'End reason',
        ar: 'سبب الإنهاء',
        kind: 'text',
        def: 'Assignment completed.'
      }
    ],
    bodyEn: `RECALL / COMPLETION NOTICE
To {{client_name}} and {{worker_name}} (ref {{assignment_ref}}).
The assignment at {{site_name}} ends on {{end_date}}. Reason: {{reason_text}}
The worker returns to {{company_en}} bench; handover must complete by the last day. Tracker status updates automatically.`,
    bodyAr: `إشعار استدعاء / إنجاز
إلى {{client_name}} و{{worker_name_ar}} (مرجع {{assignment_ref}}).
ينتهي التكليف في {{site_name}} بتاريخ {{end_date}}. السبب: {{reason_text}}
يعود العامل إلى قائمة الانتظار لدى {{company_ar}}؛ ويجب إتمام التسليم بحلول اليوم الأخير. تتحدث حالة المتتبع تلقائيًا.`
  },
  {
    code: 'C1',
    cat: 'C',
    en: 'Manpower-supply framework (MSA)',
    ar: 'اتفاقية توريد عمالة إطارية',
    version: 3,
    updatedAt: '2026-08-01',
    party: 'client',
    fields: [
      {
        key: 'service_type',
        en: 'Service vs labour outsourcing',
        ar: 'خدمة أم توريد عمالة',
        kind: 'text',
        def: 'service'
      },
      { key: 'professions', en: 'Professions in scope', ar: 'المهن المشمولة', kind: 'text' },
      {
        key: 'rate_monthly',
        en: 'Rate methodology',
        ar: 'منهجية الأجور',
        kind: 'text',
        def: 'Monthly rate per head per attached work order; OT at 1.5x.'
      },
      {
        key: 'payment_terms',
        en: 'Payment terms',
        ar: 'شروط الدفع',
        kind: 'text',
        def: '30 days from invoice; 15% VAT applies.'
      },
      { key: 'start_date', en: 'Start date', ar: 'تاريخ البدء', kind: 'date' },
      {
        key: 'duration_months',
        en: 'Duration (months)',
        ar: 'المدة (أشهر)',
        kind: 'number',
        def: 12
      }
    ],
    bodyEn: `MANPOWER-SUPPLY FRAMEWORK AGREEMENT
Between {{company_en}} (CR {{company_cr}}) — the Provider — and {{client_name}} (CR {{client_cr}}) — the Client.
1. Scope: {{service_type}} outsourcing for {{professions}}.
2. Rates: {{rate_monthly}} Payment: {{payment_terms}}
3. Term: {{start_date}} for {{duration_months}} months. Work orders attach hereunder.
4. Ajeer duties: the Provider issues and renews permits before any work; the Client assigns in-profession work only and returns workers within 1 working day of revocation.
5. Both parties maintain valid CR, WPS compliance and Nitaqat standing. Liability and termination per attached schedule.`,
    bodyAr: `اتفاقية توريد عمالة إطارية
بين {{company_ar}} (س.ت {{company_cr}}) — المورد — و{{client_name}} (س.ت {{client_cr}}) — العميل.
1. النطاق: إسناد {{service_type}} لمهن {{professions}}.
2. الأجور: {{rate_monthly}} الدفع: {{payment_terms}}
3. المدة: اعتبارًا من {{start_date}} لمدة {{duration_months}} شهرًا. وتُلحق أوامر العمل بهذه الاتفاقية.
4. التزامات أجير: يصدر المورد التصاريح ويجددها قبل أي عمل؛ ويسند العميل عملًا ضمن المهنة فقط ويعيد العمال خلال يوم عمل واحد من الإلغاء.
5. يلتزم الطرفان بسجل ساري والتزام بالأجور ونطاقات. والمسؤولية والإنهاء وفق الملحق.`
  },
  {
    code: 'C2',
    cat: 'C',
    en: 'Work order / deployment schedule',
    ar: 'أمر عمل / جدول إسناد',
    version: 2,
    updatedAt: '2026-07-01',
    party: 'client',
    fields: [
      { key: 'site_name', en: 'Site', ar: 'الموقع', kind: 'text' },
      { key: 'professions', en: 'Profession x headcount', ar: 'المهنة × العدد', kind: 'text' },
      { key: 'rate_monthly', en: 'Monthly rate per head', ar: 'الأجر الشهري للفرد', kind: 'text' },
      { key: 'start_date', en: 'Start date', ar: 'تاريخ البدء', kind: 'date' },
      {
        key: 'duration_months',
        en: 'Duration (months)',
        ar: 'المدة (أشهر)',
        kind: 'number',
        def: 6
      },
      { key: 'request_ref', en: 'Request ref', ar: 'مرجع الطلب', kind: 'text' }
    ],
    bodyEn: `WORK ORDER (under the framework agreement)
Client: {{client_name}} (CR {{client_cr}}). Site: {{site_name}}. Request: {{request_ref}}.
Requirement: {{professions}} starting {{start_date}} for {{duration_months}} months.
Rate: {{rate_monthly}} SAR per head per month; OT billed at 1.5x the hourly slice; 15% VAT applies.
Deployments under this order require Ajeer documentation before work starts.`,
    bodyAr: `أمر عمل (بموجب الاتفاقية الإطارية)
العميل: {{client_name}} (س.ت {{client_cr}}). الموقع: {{site_name}}. الطلب: {{request_ref}}.
المطلوب: {{professions}} اعتبارًا من {{start_date}} لمدة {{duration_months}} أشهر.
الأجر: {{rate_monthly}} ر.س للفرد شهريًا؛ والإضافي بـ1.5 ضعف أجر الساعة؛ وتطبق ضريبة 15%.
يتطلب الإسناد بموجب هذا الأمر توثيق أجير قبل بدء العمل.`
  },
  {
    code: 'C3',
    cat: 'C',
    en: 'Quotation / rate offer',
    ar: 'عرض سعر',
    version: 2,
    updatedAt: '2026-07-01',
    party: 'client',
    fields: [
      { key: 'request_ref', en: 'Request ref', ar: 'مرجع الطلب', kind: 'text' },
      {
        key: 'professions',
        en: 'Proposed professions/rates',
        ar: 'المهن والأجور المقترحة',
        kind: 'text'
      },
      { key: 'validity_date', en: 'Valid until', ar: 'صالح حتى', kind: 'date' }
    ],
    bodyEn: `QUOTATION
To {{client_name}} (CR {{client_cr}}) — ref {{request_ref}}, dated {{today_date}}.
{{company_en}} proposes: {{professions}}
Valid until {{validity_date}}. On client confirmation this quotation converts to a work order. 15% VAT applies.`,
    bodyAr: `عرض سعر
إلى {{client_name}} (س.ت {{client_cr}}) — مرجع {{request_ref}}، بتاريخ {{today_date}}.
تقترح {{company_ar}}: {{professions}}
صالح حتى {{validity_date}}. وعند قبول العميل يتحول العرض إلى أمر عمل. تطبق ضريبة 15%.`
  },
  {
    code: 'C4',
    cat: 'C',
    en: 'NDA (mutual)',
    ar: 'اتفاقية سرية (متبادلة)',
    version: 1,
    updatedAt: '2026-06-01',
    party: 'client',
    fields: [
      {
        key: 'period_text',
        en: 'Confidentiality period',
        ar: 'مدة السرية',
        kind: 'text',
        def: '3 years from signature.'
      },
      { key: 'sign_date', en: 'Effective date', ar: 'تاريخ النفاذ', kind: 'date' }
    ],
    bodyEn: `MUTUAL NON-DISCLOSURE AGREEMENT
Between {{company_en}} (CR {{company_cr}}) and {{client_name}} (CR {{client_cr}}), effective {{sign_date}}.
Each party keeps the other's workforce, rate and operational information confidential for {{period_text}}
Breach remedies follow the governing law. Optional per client engagement.`,
    bodyAr: `اتفاقية سرية متبادلة
بين {{company_ar}} (س.ت {{company_cr}}) و{{client_name}} (س.ت {{client_cr}})، اعتبارًا من {{sign_date}}.
يحافظ كل طرف على سرية معلومات القوى العاملة والأجور والتشغيل الخاصة بالآخر لمدة {{period_text}}
وتخضع جزاءات الإخلال للنظام الحاكم. اختيارية حسب التعاقد.`
  },
  {
    code: 'C5',
    cat: 'C',
    en: 'Service completion certificate',
    ar: 'شهادة إنجاز خدمة',
    version: 1,
    updatedAt: '2026-06-01',
    party: 'client',
    fields: [
      { key: 'period_text', en: 'Service period', ar: 'فترة الخدمة', kind: 'text' },
      { key: 'professions', en: 'Headcount delivered', ar: 'الأعداد المسلّمة', kind: 'text' },
      { key: 'sign_date', en: 'Sign date', ar: 'تاريخ التوقيع', kind: 'date' }
    ],
    bodyEn: `SERVICE COMPLETION / HANDOVER CERTIFICATE
{{client_name}} confirms that {{company_en}} delivered {{professions}} for {{period_text}} at agreed service levels.
Issued {{sign_date}} in support of monthly billing. Client signature and stamp below.`,
    bodyAr: `شهادة إنجاز / تسليم خدمة
يؤكد {{client_name}} أن {{company_ar}} سلّم {{professions}} عن {{period_text}} بمستويات الخدمة المتفق عليها.
صدرت بتاريخ {{sign_date}} دعمًا للفوترة الشهرية. توقيع العميل وختمه أدناه.`
  },
  {
    code: 'L1',
    cat: 'L',
    en: 'Job offer',
    ar: 'عرض وظيفي',
    version: 3,
    updatedAt: '2026-08-01',
    party: 'candidate',
    fields: [
      { key: 'wage_basic', en: 'Basic', ar: 'الأساسي', kind: 'number' },
      { key: 'wage_housing', en: 'Housing', ar: 'السكن', kind: 'number' },
      { key: 'wage_transport', en: 'Transport', ar: 'النقل', kind: 'number' },
      { key: 'start_date', en: 'Expected start', ar: 'البدء المتوقع', kind: 'date' },
      { key: 'validity_date', en: 'Offer valid until', ar: 'العرض صالح حتى', kind: 'date' }
    ],
    bodyEn: `JOB OFFER
To {{worker_name}} — {{nationality}}.
{{company_en}} is pleased to offer you the position of {{job_title}}: basic {{wage_basic}}, housing {{wage_housing}}, transport {{wage_transport}} SAR per month (total {{wage_total}}).
Expected start: {{start_date}}. This offer is valid until {{validity_date}} and converts to an employment contract on acceptance.`,
    bodyAr: `عرض وظيفي
إلى {{worker_name_ar}} — {{nationality}}.
يسر {{company_ar}} أن تعرض عليك وظيفة {{job_title_ar}}: أساسي {{wage_basic}}، سكن {{wage_housing}}، نقل {{wage_transport}} ر.س شهريًا (الإجمالي {{wage_total}}).
البدء المتوقع: {{start_date}}. هذا العرض صالح حتى {{validity_date}} ويتحول إلى عقد عمل عند القبول.`
  },
  {
    code: 'L2',
    cat: 'L',
    en: 'Salary certificate',
    ar: 'تعريف بالراتب',
    version: 2,
    updatedAt: '2026-07-01',
    party: 'employee',
    fields: [],
    bodyEn: `SALARY CERTIFICATE (to whom it may concern)
{{company_en}} (CR {{company_cr}}) certifies that {{worker_name}} (ID {{id_no}}) works with us as {{job_title}} since {{start_date}}, with a current total monthly salary of {{salary_total}} SAR.
Issued {{today_date}} on employee request for official use.`,
    bodyAr: `تعريف بالراتب (إلى من يهمه الأمر)
تشهد {{company_ar}} (س.ت {{company_cr}}) بأن {{worker_name_ar}} (هوية {{id_no}}) يعمل لدينا بمهنة {{job_title_ar}} منذ {{start_date}}، بإجمالي راتب شهري حالي {{salary_total}} ر.س.
صدر بتاريخ {{today_date}} بناء على طلب الموظف للاستخدام الرسمي.`
  },
  {
    code: 'L3',
    cat: 'L',
    en: 'Experience certificate',
    ar: 'شهادة خبرة',
    version: 2,
    updatedAt: '2026-07-01',
    party: 'employee',
    fields: [
      { key: 'tenure_text', en: 'Tenure text', ar: 'نص المدة', kind: 'text' },
      {
        key: 'last_role',
        en: 'Last role',
        ar: 'آخر منصب',
        kind: 'text',
        source: 'employee.titleEn'
      }
    ],
    bodyEn: `EXPERIENCE CERTIFICATE
{{company_en}} (CR {{company_cr}}) certifies that {{worker_name}} (ID {{id_no}}) worked with us {{tenure_text}}, last serving as {{last_role}}.
Issued {{today_date}} per the employer's duty on exit. We wish them success.`,
    bodyAr: `شهادة خبرة
تشهد {{company_ar}} (س.ت {{company_cr}}) بأن {{worker_name_ar}} (هوية {{id_no}}) عمل لدينا {{tenure_text}}، وكان آخر منصب {{last_role}}.
صدرت بتاريخ {{today_date}} وفق واجب صاحب العمل عند الخروج. نتمنى له التوفيق.`
  },
  {
    code: 'L4',
    cat: 'L',
    en: 'First written warning',
    ar: 'إنذار كتابي أول',
    version: 1,
    updatedAt: '2026-06-01',
    party: 'employee',
    fields: [
      { key: 'reason_text', en: 'Violation', ar: 'المخالفة', kind: 'text' },
      {
        key: 'appeal_note',
        en: 'Appeal note',
        ar: 'بند التظلم',
        kind: 'text',
        def: 'You may appeal in writing within 7 days under the internal appeals procedure.'
      }
    ],
    bodyEn: `FIRST WRITTEN WARNING
To {{worker_name}} (ID {{id_no}}), {{job_title}}.
Violation recorded on {{today_date}}: {{reason_text}}
This is a first warning. Repetition escalates per policy. {{appeal_note}}`,
    bodyAr: `إنذار كتابي أول
إلى {{worker_name_ar}} (هوية {{id_no}})، {{job_title_ar}}.
سُجلت بتاريخ {{today_date}} المخالفة: {{reason_text}}
وهذا إنذار أول. والتكرار يصعّد وفق السياسة. {{appeal_note}}`
  },
  {
    code: 'L5',
    cat: 'L',
    en: 'Second written warning',
    ar: 'إنذار كتابي ثانٍ',
    version: 1,
    updatedAt: '2026-06-01',
    party: 'employee',
    fields: [
      { key: 'reason_text', en: 'Violation', ar: 'المخالفة', kind: 'text' },
      {
        key: 'appeal_note',
        en: 'Appeal note',
        ar: 'بند التظلم',
        kind: 'text',
        def: 'You may appeal in writing within 7 days under the internal appeals procedure.'
      }
    ],
    bodyEn: `SECOND WRITTEN WARNING
To {{worker_name}} (ID {{id_no}}), {{job_title}}.
Further violation recorded on {{today_date}}: {{reason_text}}
This is a second warning; a further breach may lead to a final warning or lawful termination. {{appeal_note}}`,
    bodyAr: `إنذار كتابي ثانٍ
إلى {{worker_name_ar}} (هوية {{id_no}})، {{job_title_ar}}.
سُجلت بتاريخ {{today_date}} مخالفة جديدة: {{reason_text}}
وهذا إنذار ثانٍ؛ وأي إخلال لاحق قد يؤدي لإنذار نهائي أو إنهاء نظامي. {{appeal_note}}`
  },
  {
    code: 'L6',
    cat: 'L',
    en: 'Final warning',
    ar: 'إنذار نهائي',
    version: 1,
    updatedAt: '2026-06-01',
    party: 'employee',
    fields: [
      { key: 'reason_text', en: 'Violation', ar: 'المخالفة', kind: 'text' },
      {
        key: 'appeal_note',
        en: 'Appeal note',
        ar: 'بند التظلم',
        kind: 'text',
        def: 'You may appeal in writing within 7 days under the internal appeals procedure.'
      }
    ],
    bodyEn: `FINAL WARNING
To {{worker_name}} (ID {{id_no}}), {{job_title}}.
Final violation recorded on {{today_date}}: {{reason_text}}
Any further breach exposes you to lawful termination, including Art. 80 where its conditions are met. {{appeal_note}}`,
    bodyAr: `إنذار نهائي
إلى {{worker_name_ar}} (هوية {{id_no}})، {{job_title_ar}}.
سُجلت بتاريخ {{today_date}} مخالفة نهائية: {{reason_text}}
وأي إخلال لاحق يعرضك للإنهاء النظامي، بما فيه المادة 80 عند تحقق شروطها. {{appeal_note}}`
  },
  {
    code: 'L7',
    cat: 'L',
    en: 'Termination notice',
    ar: 'إشعار إنهاء',
    version: 2,
    updatedAt: '2026-07-01',
    party: 'employee',
    fields: [
      { key: 'reason_text', en: 'Termination reason', ar: 'سبب الإنهاء', kind: 'text' },
      { key: 'end_date', en: 'Last working day', ar: 'آخر يوم عمل', kind: 'date' }
    ],
    bodyEn: `TERMINATION NOTICE
To {{worker_name}} (ID {{id_no}}), {{job_title}}.
Your employment with {{company_en}} ends on {{end_date}}. Reason: {{reason_text}}
EOSB and settlement follow the reason branch (Art. 80 forfeits EOSB; Art. 81 keeps it in full plus compensation). Handover and clearance apply.`,
    bodyAr: `إشعار إنهاء
إلى {{worker_name_ar}} (هوية {{id_no}})، {{job_title_ar}}.
تنتهي خدمتك لدى {{company_ar}} بتاريخ {{end_date}}. السبب: {{reason_text}}
تتبع المكافأة والتسوية فرع السبب (المادة 80 تسقط المكافأة؛ والمادة 81 تبقيها كاملة مع التعويض). ويسري التسليم وإخلاء الطرف.`
  },
  {
    code: 'L8',
    cat: 'L',
    en: 'Resignation acceptance',
    ar: 'قبول استقالة',
    version: 1,
    updatedAt: '2026-06-01',
    party: 'employee',
    fields: [{ key: 'end_date', en: 'Last working day', ar: 'آخر يوم عمل', kind: 'date' }],
    bodyEn: `RESIGNATION ACCEPTANCE
To {{worker_name}} (ID {{id_no}}), {{job_title}}.
Your resignation is accepted; your last working day is {{end_date}}.
The notice clock and handover start now. (A resignation is deemed accepted if the employer does not reply within 30 days.)`,
    bodyAr: `قبول استقالة
إلى {{worker_name_ar}} (هوية {{id_no}})، {{job_title_ar}}.
قُبلت استقالتك؛ وآخر يوم عمل هو {{end_date}}.
يبدأ الآن احتساب الإشعار والتسليم. (تُعد الاستقالة مقبولة إذا لم يرد صاحب العمل خلال 30 يومًا.)`
  },
  {
    code: 'L9',
    cat: 'L',
    en: 'Clearance & handover',
    ar: 'إخلاء طرف وتسليم',
    version: 1,
    updatedAt: '2026-06-01',
    party: 'employee',
    fields: [
      { key: 'end_date', en: 'Clearance date', ar: 'تاريخ الإخلاء', kind: 'date' },
      {
        key: 'period_text',
        en: 'Clearance scope',
        ar: 'نطاق الإخلاء',
        kind: 'text',
        def: 'Assets, advances, housing and client handover.'
      }
    ],
    bodyEn: `CLEARANCE & HANDOVER
{{worker_name}} (ID {{id_no}}), {{job_title}} — cleared on {{end_date}}.
Scope: {{period_text}} All dues feed the final settlement. Signed by HR, finance and the direct manager.`,
    bodyAr: `إخلاء طرف وتسليم
{{worker_name_ar}} (هوية {{id_no}})، {{job_title_ar}} — أُخلي طرفه بتاريخ {{end_date}}.
النطاق: {{period_text}} وتُرحل جميع المستحقات إلى التسوية النهائية. يوقعه الموارد البشرية والمالية والمدير المباشر.`
  },
  {
    code: 'L10',
    cat: 'L',
    en: 'Final settlement statement',
    ar: 'مخالصة نهائية',
    version: 1,
    updatedAt: '2026-06-01',
    party: 'employee',
    fields: [
      {
        key: 'settlement_total',
        en: 'Settlement total (SAR)',
        ar: 'إجمالي التسوية (ر.س)',
        kind: 'number'
      },
      { key: 'sign_date', en: 'Sign date', ar: 'تاريخ التوقيع', kind: 'date' }
    ],
    bodyEn: `FINAL SETTLEMENT STATEMENT
{{worker_name}} (ID {{id_no}}) received a total final settlement of {{settlement_total}} SAR (EOSB + leave + salary + ticket) from {{company_en}} on {{sign_date}}.
EOSB is tax-free in KSA; the destination country may tax it. No further claims between the parties.`,
    bodyAr: `مخالصة نهائية
استلم {{worker_name_ar}} (هوية {{id_no}}) إجمالي تسوية نهائية {{settlement_total}} ر.س (مكافأة + إجازات + راتب + تذكرة) من {{company_ar}} بتاريخ {{sign_date}}.
مكافأة نهاية الخدمة معفاة من الضريبة في السعودية؛ وقد تخضع للضريبة في بلد الوجهة. ولا مطالبات لاحقة بين الطرفين.`
  }
];

export const CONTRACTS = [
  {
    id: 'CT-2026-001',
    type: 'E3',
    partyKind: 'employee',
    party: 'EMP-0006',
    start: '2025-06-10',
    end: '2027-06-09',
    status: 'active',
    sign: 'signed',
    signedAt: '2025-06-08',
    templateVer: 4,
    qiwa: 'authenticated',
    filed: true,
    values: {
      duration_months: 24,
      probation_days: 90,
      ticket_note: 'Annual economy ticket plus end-of-service repatriation at employer cost.'
    }
  },
  {
    id: 'CT-2026-002',
    type: 'E1',
    partyKind: 'employee',
    party: 'EMP-0001',
    start: '2022-03-01',
    end: '',
    status: 'active',
    sign: 'signed',
    signedAt: '2022-02-27',
    templateVer: 3,
    qiwa: 'authenticated',
    filed: true,
    values: { probation_days: 90, notice_days: 60 }
  },
  {
    id: 'CT-2026-003',
    type: 'C1',
    partyKind: 'client',
    party: 'CL-001',
    start: '2026-01-01',
    end: '2027-12-31',
    status: 'active',
    sign: 'signed',
    signedAt: '2025-12-28',
    templateVer: 3,
    qiwa: '',
    filed: true,
    values: {
      service_type: 'labour',
      professions: 'Drivers, cleaners, masons',
      duration_months: 24,
      rate_monthly: 'Monthly rate per head per attached work order; OT at 1.5x.',
      payment_terms: '30 days from invoice; 15% VAT applies.'
    }
  },
  {
    id: 'CT-2026-004',
    type: 'C2',
    partyKind: 'client',
    party: 'CL-001',
    start: '2026-07-01',
    end: '2026-12-31',
    status: 'active',
    sign: 'signed',
    signedAt: '2026-06-29',
    templateVer: 2,
    qiwa: '',
    filed: true,
    values: {
      site_name: 'North Ring Site',
      professions: 'Mason x 6',
      rate_monthly: '2,800',
      duration_months: 6,
      request_ref: 'REQ-2026-010'
    }
  },
  {
    id: 'CT-2026-005',
    type: 'E3',
    partyKind: 'employee',
    party: 'EMP-0018',
    start: '2024-10-16',
    end: '2026-10-15',
    status: 'active',
    sign: 'signed',
    signedAt: '2024-10-14',
    templateVer: 4,
    qiwa: 'authenticated',
    filed: true,
    values: {
      duration_months: 24,
      probation_days: 90,
      ticket_note: 'Annual economy ticket plus end-of-service repatriation at employer cost.'
    }
  },
  {
    id: 'CT-2026-006',
    type: 'L2',
    partyKind: 'employee',
    party: 'EMP-0003',
    start: '2026-09-02',
    end: '',
    status: 'issued',
    sign: 'acknowledged',
    signedAt: '',
    templateVer: 2,
    qiwa: '',
    filed: false,
    values: {}
  },
  {
    id: 'CT-2026-007',
    type: 'E4',
    partyKind: 'employee',
    party: 'EMP-0005',
    start: '2025-06-01',
    end: '',
    status: 'active',
    sign: 'signed',
    signedAt: '2025-05-29',
    templateVer: 2,
    qiwa: 'authenticated',
    filed: true,
    values: { hours_note: '20 hours per week, scheduled by the direct manager.', notice_days: 30 }
  },
  {
    id: 'CT-2026-008',
    type: 'A2',
    partyKind: 'assignment',
    party: 'ASN-2026-001',
    start: '2026-08-01',
    end: '',
    status: 'issued',
    sign: 'acknowledged',
    signedAt: '',
    templateVer: 2,
    qiwa: '',
    filed: false,
    values: { start_date: '2026-08-03', period_text: '6 months' }
  },
  {
    id: 'CT-2026-009',
    type: 'E3',
    partyKind: 'employee',
    party: 'EMP-0022',
    start: '',
    end: '',
    status: 'draft',
    sign: 'unsigned',
    signedAt: '',
    templateVer: 4,
    qiwa: '',
    filed: false,
    values: {}
  }
];

export const JOBS = [
  {
    id: 'J-2026-01',
    titleEn: 'Driver',
    titleAr: 'سائق',
    prof: 'driver',
    headcount: 10,
    hired: 2,
    basic: 1800,
    housing: 500,
    transport: 300,
    site: 'ST-003',
    status: 'open',
    note: 'Client CL-002 pipeline'
  },
  {
    id: 'J-2026-02',
    titleEn: 'Mason',
    titleAr: 'بناء',
    prof: 'mason',
    headcount: 6,
    hired: 0,
    basic: 2200,
    housing: 550,
    transport: 300,
    site: 'ST-001',
    status: 'open',
    note: 'Work order REQ-2026-010'
  },
  {
    id: 'J-2026-03',
    titleEn: 'Cleaner',
    titleAr: 'عامل نظافة',
    prof: 'cleaner',
    headcount: 4,
    hired: 4,
    basic: 1500,
    housing: 400,
    transport: 250,
    site: 'ST-002',
    status: 'filled',
    note: ''
  },
  {
    id: 'J-2026-04',
    titleEn: 'Security guard',
    titleAr: 'حارس أمن',
    prof: 'guard',
    headcount: 2,
    hired: 0,
    basic: 3500,
    housing: 800,
    transport: 400,
    site: '',
    status: 'draft',
    note: 'Saudization-friendly post'
  }
];

export const CANDIDATES = [
  {
    id: 'CD-2026-001',
    job: 'J-2026-01',
    nameEn: 'Suresh Yadav',
    nameAr: 'سوريش ياداف',
    nat: 'India',
    saudi: false,
    prof: 'driver',
    source: 'AG-01',
    phone: '+91 98000 00001',
    passport: 'N100001',
    stage: 'new'
  },
  {
    id: 'CD-2026-002',
    job: 'J-2026-01',
    nameEn: 'Bilal Ahmed',
    nameAr: 'بلال أحمد',
    nat: 'Pakistan',
    saudi: false,
    prof: 'driver',
    source: 'AG-02',
    phone: '+92 300 000002',
    passport: 'P200002',
    stage: 'screening'
  },
  {
    id: 'CD-2026-003',
    job: 'J-2026-01',
    nameEn: 'Deepak Singh',
    nameAr: 'ديباك سينغ',
    nat: 'India',
    saudi: false,
    prof: 'driver',
    source: 'AG-01',
    phone: '+91 98000 00003',
    passport: 'N100003',
    stage: 'interview'
  },
  {
    id: 'CD-2026-004',
    job: 'J-2026-02',
    nameEn: 'Karim Hassan',
    nameAr: 'كريم حسن',
    nat: 'Egypt',
    saudi: false,
    prof: 'mason',
    source: 'AG-02',
    phone: '+20 100 000004',
    passport: 'E300004',
    stage: 'interview'
  },
  {
    id: 'CD-2026-005',
    job: 'J-2026-02',
    nameEn: 'Omar Farouk',
    nameAr: 'عمر فاروق',
    nat: 'Egypt',
    saudi: false,
    prof: 'mason',
    source: 'AG-02',
    phone: '+20 100 000005',
    passport: 'E300005',
    stage: 'offer'
  },
  {
    id: 'CD-2026-006',
    job: 'J-2026-01',
    nameEn: 'Ravi Patel',
    nameAr: 'رافي باتيل',
    nat: 'India',
    saudi: false,
    prof: 'driver',
    source: 'AG-01',
    phone: '+91 98000 00006',
    passport: 'N100006',
    stage: 'rejected'
  },
  {
    id: 'CD-2026-007',
    job: 'J-2026-04',
    nameEn: 'Fahad Al-Harbi',
    nameAr: 'فهد الحربي',
    nat: 'Saudi',
    saudi: true,
    prof: 'guard',
    source: 'referral',
    phone: '+966 555 010 031',
    passport: '',
    stage: 'offer'
  },
  {
    id: 'CD-2026-008',
    job: 'J-2026-01',
    nameEn: 'Amit Verma',
    nameAr: 'أميت فيرما',
    nat: 'India',
    saudi: false,
    prof: 'driver',
    source: 'AG-01',
    phone: '+91 98000 00008',
    passport: 'N100008',
    stage: 'hired'
  }
];

export const INTERVIEWS = [
  {
    id: 'IV-2026-011',
    candidate: 'CD-2026-003',
    at: '2026-09-12T10:00',
    interviewer: 'EMP-0001',
    kind: 'onsite',
    result: 'scheduled',
    notes: ''
  },
  {
    id: 'IV-2026-012',
    candidate: 'CD-2026-004',
    at: '2026-09-11T14:00',
    interviewer: 'EMP-0001',
    kind: 'video',
    result: 'passed',
    notes: 'Strong trade test.'
  },
  {
    id: 'IV-2026-013',
    candidate: 'CD-2026-006',
    at: '2026-09-05T11:00',
    interviewer: 'EMP-0002',
    kind: 'phone',
    result: 'failed',
    notes: 'No driving experience.'
  },
  {
    id: 'IV-2026-014',
    candidate: 'CD-2026-007',
    at: '2026-09-09T09:30',
    interviewer: 'EMP-0001',
    kind: 'onsite',
    result: 'passed',
    notes: 'Ex-military, documents ready.'
  }
];

export const OFFERS = [
  {
    id: 'OF-2026-001',
    candidate: 'CD-2026-005',
    job: 'J-2026-02',
    basic: 2200,
    housing: 550,
    transport: 300,
    start: '2026-10-01',
    validUntil: '2026-09-20',
    status: 'sent',
    templateVer: 3
  },
  {
    id: 'OF-2026-002',
    candidate: 'CD-2026-007',
    job: 'J-2026-04',
    basic: 3500,
    housing: 800,
    transport: 400,
    start: '2026-10-01',
    validUntil: '2026-09-25',
    status: 'draft',
    templateVer: 3
  },
  {
    id: 'OF-2026-003',
    candidate: 'CD-2026-008',
    job: 'J-2026-01',
    basic: 1800,
    housing: 500,
    transport: 300,
    start: '2026-09-01',
    validUntil: '2026-08-25',
    status: 'accepted',
    templateVer: 3
  }
];

// ── P6: performance, training, org, audit, broadcasts ──────────────────────

export const GOALS = [
  {
    id: 'G-2026-01',
    owner: 'EMP-0006',
    titleEn: 'Site attendance rate',
    titleAr: 'نسبة الحضور الموقعي',
    metric: '%',
    target: 98,
    current: 96.5,
    due: '2026-12-31',
    status: 'active'
  },
  {
    id: 'G-2026-02',
    owner: 'EMP-0003',
    titleEn: 'Saudization pipeline',
    titleAr: 'مسار السعودة',
    metric: 'Saudi hires',
    target: 6,
    current: 2,
    due: '2026-12-31',
    status: 'at-risk'
  },
  {
    id: 'G-2026-03',
    owner: 'EMP-0010',
    titleEn: 'Trade certification',
    titleAr: 'شهادة مهنية',
    metric: 'certificates',
    target: 1,
    current: 1,
    due: '2026-09-30',
    status: 'done'
  },
  {
    id: 'G-2026-04',
    owner: 'EMP-0001',
    titleEn: 'Qiwa documentation rate',
    titleAr: 'نسبة توثيق قوى',
    metric: '% authenticated',
    target: 100,
    current: 92,
    due: '2026-12-31',
    status: 'active'
  },
  {
    id: 'G-2026-05',
    owner: 'EMP-0007',
    titleEn: 'Defensive-driving course',
    titleAr: 'دورة القيادة الوقائية',
    metric: 'courses',
    target: 1,
    current: 0,
    due: '2026-11-30',
    status: 'draft'
  }
];

export const REVIEWS = [
  {
    id: 'RV-2026-001',
    emp: 'EMP-0006',
    cycle: '2026-H1',
    status: 'published',
    selfRating: 4,
    selfNotes: 'Strong attendance, one late arrival in May.',
    mgrRating: 4,
    mgrNotes: 'Reliable driver; recommend advanced course.',
    finalRating: 4,
    publishedAt: '2026-07-10',
    ackedAt: ''
  },
  {
    id: 'RV-2026-002',
    emp: 'EMP-0003',
    cycle: '2026-H2',
    status: 'manager',
    selfRating: 5,
    selfNotes: 'Delivered 2 Saudi hires against a tough market.',
    mgrRating: 0,
    mgrNotes: '',
    finalRating: 0,
    publishedAt: '',
    ackedAt: ''
  },
  {
    id: 'RV-2026-003',
    emp: 'EMP-0010',
    cycle: '2026-H2',
    status: 'self',
    selfRating: 0,
    selfNotes: '',
    mgrRating: 0,
    mgrNotes: '',
    finalRating: 0,
    publishedAt: '',
    ackedAt: ''
  },
  {
    id: 'RV-2026-004',
    emp: 'EMP-0001',
    cycle: '2026-H2',
    status: 'draft',
    selfRating: 0,
    selfNotes: '',
    mgrRating: 0,
    mgrNotes: '',
    finalRating: 0,
    publishedAt: '',
    ackedAt: ''
  }
];

export const FEEDBACK = [
  {
    id: 'FB-2026-011',
    from: 'EMP-0001',
    to: 'EMP-0006',
    kind: 'praise',
    date: '2026-09-02',
    textEn: 'Covered a second site run on short notice — thank you.',
    textAr: 'غطى رحلة موقع ثانية في وقت قصير — شكرًا لك.'
  },
  {
    id: 'FB-2026-012',
    from: 'EMP-0003',
    to: 'EMP-0010',
    kind: 'praise',
    date: '2026-08-28',
    textEn: 'Trade test passed first attempt.',
    textAr: 'اجتاز اختبار المهنة من أول محاولة.'
  },
  {
    id: 'FB-2026-013',
    from: 'EMP-0001',
    to: 'EMP-0007',
    kind: 'coaching',
    date: '2026-08-20',
    textEn: 'Log trip sheets daily — two were filed late.',
    textAr: 'سجّل كشوف الرحلات يوميًا — تأخر اثنان.'
  },
  {
    id: 'FB-2026-014',
    from: 'EMP-0002',
    to: 'EMP-0003',
    kind: 'praise',
    date: '2026-08-15',
    textEn: 'Expense reports are consistently clean.',
    textAr: 'تقارير المصروفات سليمة باستمرار.'
  },
  {
    id: 'FB-2026-015',
    from: 'EMP-0004',
    to: 'EMP-0001',
    kind: 'coaching',
    date: '2026-08-10',
    textEn: 'Qiwa renewals need a weekly checklist, not monthly.',
    textAr: 'تجديدات قوى تحتاج قائمة أسبوعية لا شهرية.'
  }
];

export const TRAININGS = [
  {
    id: 'T-2026-01',
    titleEn: 'Site safety induction',
    titleAr: 'التعريف بالسلامة الموقعية',
    provider: 'Internal HSE',
    date: '2026-08-18',
    hours: 4,
    cost: 0,
    status: 'done',
    attendees: [
      'EMP-0006',
      'EMP-0007',
      'EMP-0008',
      'EMP-0009',
      'EMP-0010',
      'EMP-0011',
      'EMP-0012',
      'EMP-0013'
    ]
  },
  {
    id: 'T-2026-02',
    titleEn: 'Defensive driving',
    titleAr: 'القيادة الوقائية',
    provider: 'Dallah Driving',
    date: '2026-10-05',
    hours: 8,
    cost: 2400,
    status: 'planned',
    attendees: ['EMP-0006', 'EMP-0007']
  },
  {
    id: 'T-2026-03',
    titleEn: 'First aid basics',
    titleAr: 'أساسيات الإسعافات',
    provider: 'Saudi Red Crescent',
    date: '2026-07-22',
    hours: 6,
    cost: 1800,
    status: 'done',
    attendees: ['EMP-0003', 'EMP-0004', 'EMP-0010']
  }
];

// RBAC roles (seed-mode UX only — the server enforces). Rank: lower = stronger.
export const ROLES = [
  { code: 'admin', en: 'Administrator', ar: 'مدير النظام', rank: 1 },
  { code: 'hr', en: 'HR Officer', ar: 'موظف موارد بشرية', rank: 2 },
  { code: 'ops', en: 'Operations Coordinator', ar: 'منسق التشغيل', rank: 3 },
  { code: 'payroll', en: 'Payroll Officer', ar: 'موظف الرواتب', rank: 4 },
  { code: 'pro', en: 'PRO', ar: 'المعقب', rank: 5 },
  { code: 'finance', en: 'Finance (read)', ar: 'المالية (قراءة)', rank: 6 },
  { code: 'manager', en: 'Manager', ar: 'مدير', rank: 7 },
  { code: 'site-supervisor', en: 'Site Supervisor', ar: 'مشرف موقع', rank: 8 },
  { code: 'employee', en: 'Employee', ar: 'موظف', rank: 9 }
];

// Module scopes per role ('*' = all). Keys match sidebar data-page keys.
export const ROLE_SCOPES = {
  admin: ['*'],
  hr: [
    'hr-dashboard',
    'hr-employees',
    'hr-sa-compliance',
    'hr-my-space',
    'hr-onboarding',
    'hr-visas',
    'hr-residency',
    'hr-tracker',
    'hr-documents',
    'hr-org',
    'hr-attendance',
    'hr-shifts',
    'hr-timesheets',
    'hr-leave',
    'hr-holidays',
    'hr-leave-calendar',
    'hr-approvals',
    'hr-my-team',
    'hr-clients',
    'hr-requests',
    'hr-assignments',
    'hr-ajeer',
    'hr-invoices',
    'hr-payroll',
    'hr-gosi',
    'hr-wps',
    'hr-eosb',
    'hr-expenses',
    'hr-contracts',
    'hr-templates',
    'hr-jobs',
    'hr-candidates',
    'hr-pipeline',
    'hr-interviews',
    'hr-offers',
    'hr-goals',
    'hr-reviews',
    'hr-feedback',
    'hr-trainings',
    'hr-departments',
    'hr-announcements',
    'hr-reports',
    'hr-settings'
  ],
  ops: [
    'hr-dashboard',
    'hr-tracker',
    'hr-requests',
    'hr-assignments',
    'hr-ajeer',
    'hr-clients',
    'hr-attendance',
    'hr-timesheets',
    'hr-shifts',
    'hr-leave',
    'hr-approvals',
    'hr-documents',
    'hr-contracts',
    'hr-announcements',
    'hr-my-space'
  ],
  payroll: [
    'hr-dashboard',
    'hr-employees',
    'hr-payroll',
    'hr-gosi',
    'hr-wps',
    'hr-eosb',
    'hr-expenses',
    'hr-reports',
    'hr-announcements',
    'hr-my-space'
  ],
  pro: [
    'hr-dashboard',
    'hr-employees',
    'hr-visas',
    'hr-residency',
    'hr-onboarding',
    'hr-documents',
    'hr-announcements',
    'hr-my-space'
  ],
  finance: [
    'hr-dashboard',
    'hr-invoices',
    'hr-payroll',
    'hr-gosi',
    'hr-expenses',
    'hr-eosb',
    'hr-reports',
    'hr-announcements',
    'hr-my-space'
  ],
  manager: [
    'hr-dashboard',
    'hr-my-team',
    'hr-approvals',
    'hr-goals',
    'hr-reviews',
    'hr-feedback',
    'hr-leave',
    'hr-trainings',
    'hr-announcements',
    'hr-my-space'
  ],
  'site-supervisor': [
    'hr-dashboard',
    'hr-attendance',
    'hr-timesheets',
    'hr-my-team',
    'hr-announcements',
    'hr-my-space'
  ],
  employee: [
    'hr-my-space',
    'hr-leave',
    'hr-expenses',
    'hr-feedback',
    'hr-announcements',
    'hr-trainings'
  ]
};

export const AUDIT_LOG = [
  {
    id: 'AU-2026-091',
    at: '2026-09-09T11:20:00',
    actor: 'EMP-0001',
    action: 'offer.accept',
    entity: 'OF-2026-003',
    detail: 'Candidate CD-2026-008 hired'
  },
  {
    id: 'AU-2026-092',
    at: '2026-09-08T15:02:00',
    actor: 'EMP-0002',
    action: 'invoice.pay',
    entity: 'INV-2026-08-CL-002',
    detail: 'Marked paid'
  },
  {
    id: 'AU-2026-093',
    at: '2026-09-08T09:41:00',
    actor: 'EMP-0001',
    action: 'expense.approve',
    entity: 'EXP-2026-012',
    detail: 'SAR 2,070 approved'
  },
  {
    id: 'AU-2026-094',
    at: '2026-09-04T13:15:00',
    actor: 'EMP-0002',
    action: 'expense.pay',
    entity: 'EXP-2026-013',
    detail: 'SAR 1,092.50 paid'
  },
  {
    id: 'AU-2026-095',
    at: '2026-09-03T10:05:00',
    actor: 'EMP-0001',
    action: 'expense.reject',
    entity: 'EXP-2026-017',
    detail: 'Personal fine — not reimbursable'
  },
  {
    id: 'AU-2026-096',
    at: '2026-09-02T12:30:00',
    actor: 'EMP-0002',
    action: 'payrun.pay',
    entity: 'PR-2026-08',
    detail: 'August run paid'
  },
  {
    id: 'AU-2026-097',
    at: '2026-09-01T10:00:00',
    actor: 'EMP-0002',
    action: 'wps.submit',
    entity: 'PR-2026-08',
    detail: 'SIF accepted by Mudad'
  },
  {
    id: 'AU-2026-098',
    at: '2026-08-30T14:22:00',
    actor: 'EMP-0001',
    action: 'contract.issue',
    entity: 'CT-2026-006',
    detail: 'Salary certificate issued'
  },
  {
    id: 'AU-2026-099',
    at: '2026-08-28T09:12:00',
    actor: 'EMP-0001',
    action: 'candidate.reject',
    entity: 'CD-2026-006',
    detail: 'No driving experience'
  },
  {
    id: 'AU-2026-100',
    at: '2026-08-25T16:44:00',
    actor: 'EMP-0001',
    action: 'settings.save',
    entity: 'hr:settings:v1',
    detail: 'Nitaqat target updated'
  }
];

export const ANNOUNCEMENTS = [
  {
    id: 'AN-2026-011',
    audience: 'all',
    date: '2026-09-08',
    expires: '2026-10-08',
    status: 'published',
    reads: ['EMP-0001', 'EMP-0002'],
    titleEn: 'National Day holiday — Sep 23',
    titleAr: 'إجازة اليوم الوطني — 23 سبتمبر',
    bodyEn:
      'Wednesday Sep 23 is a paid public holiday. Site rosters will be adjusted by supervisors.',
    bodyAr: 'الأربعاء 23 سبتمبر إجازة رسمية مدفوعة. سيعدّل المشرفون جداول المواقع.'
  },
  {
    id: 'AN-2026-012',
    audience: 'site',
    date: '2026-09-05',
    expires: '2026-09-30',
    status: 'published',
    reads: [],
    titleEn: 'Heat-stress protocol remains in force',
    titleAr: 'بروتوكول الإجهاد الحراري سارٍ',
    bodyEn:
      'Midday outdoor work restrictions continue through September. Water stations must be stocked.',
    bodyAr: 'تستمر قيود العمل الخارجي وقت الظهيرة خلال سبتمبر. يجب تجهيز محطات المياه.'
  },
  {
    id: 'AN-2026-013',
    audience: 'managers',
    date: '2026-09-01',
    expires: '2026-09-20',
    status: 'published',
    reads: ['EMP-0001'],
    titleEn: 'H2 reviews open — self-assessments due Sep 25',
    titleAr: 'تقييمات النصف الثاني — التقييم الذاتي حتى 25 سبتمبر',
    bodyEn: 'Managers: release H2 review forms to your teams this week.',
    bodyAr: 'المدراء: أتيحوا نماذج تقييم النصف الثاني لفرقكم هذا الأسبوع.'
  },
  {
    id: 'AN-2026-014',
    audience: 'all',
    date: '2026-09-09',
    expires: '2026-12-31',
    status: 'draft',
    reads: [],
    titleEn: 'New expense limits (draft)',
    titleAr: 'حدود المصروفات الجديدة (مسودة)',
    bodyEn: 'Draft — pending finance sign-off.',
    bodyAr: 'مسودة — بانتظار اعتماد المالية.'
  }
];
