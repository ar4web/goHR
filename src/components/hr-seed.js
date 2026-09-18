// HR + Operations — shared demo seed (goHR, Riyadh).
// Fictional data only (sequential fake IDs). Company profile / Nitaqat / licence
// are placeholders — the owner edits them in Settings (settings.html).
// In API mode (?api=1) these are replaced by /api/hr/* via hr-api.js.

export const SEED_COMPANY = {
  nameEn: 'goHR',
  nameAr: 'goHR',
  crNo: '1010XXXXXX',
  addressEn: 'Riyadh, Saudi Arabia',
  addressAr: 'الرياض، المملكة العربية السعودية',
  logoUrl: '',
  primary: '#f97316',
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

export const COMPANIES = [
  { code: 'co-1', nameEn: 'goHR', nameAr: 'goHR', crNo: '1010XXXXXX', taxNo: '310XXXXXX', addressEn: 'Riyadh, Saudi Arabia', addressAr: 'الرياض، المملكة العربية السعودية', phone: '+966 11 000 0000', email: 'info@example.com', website: '', isActive: true },
  { code: 'co-2', nameEn: 'GOSI', nameAr: 'التأمينات الاجتماعية', crNo: '', taxNo: '', addressEn: 'Riyadh, Saudi Arabia', addressAr: 'الرياض، المملكة العربية السعودية', phone: '+966 11 000 0001', email: 'info@gosi.sa', website: 'www.gosi.sa', isActive: true }
];

export const SALUTATIONS = [
  { code: 'mr', en: 'Mr.', ar: 'السيد' },
  { code: 'mrs', en: 'Mrs.', ar: 'السيدة' },
  { code: 'ms', en: 'Ms.', ar: 'السيدة' },
  { code: 'dr', en: 'Dr.', ar: 'دكتور' },
  { code: 'eng', en: 'Eng.', ar: 'مهندس' },
  { code: 'prof', en: 'Prof.', ar: 'أستاذ' }
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
    nameEn: 'goHR — HQ',
    nameAr: 'goHR — المركز الرئيسي',
    cr: '1010XXXXXX',
    city: 'Riyadh'
  },
  {
    id: 'BR-JED',
    nameEn: 'goHR — Jeddah Branch',
    nameAr: 'goHR — فرع جدة',
    cr: '4030XXXXXX',
    city: 'Jeddah'
  }
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
    link: 'employees.html'
  },
  {
    id: 'TSK-02',
    titleEn: 'Close huroob case file (EMP-0027)',
    titleAr: 'إغلاق ملف بلاغ الهروب (EMP-0027)',
    owner: 'hr',
    due: '2026-09-14',
    priority: 'high',
    done: false,
    link: 'employee-file.html?code=EMP-0027'
  },
  {
    id: 'TSK-06',
    titleEn: 'Photograph the new Jeddah site roster board',
    titleAr: 'تصوير لوحة كشف موقع جدة الجديد',
    owner: 'EMP-0002',
    due: '2026-09-18',
    priority: 'low',
    done: false,
    link: 'employees.html'
  },
  {
    id: 'TSK-07',
    titleEn: 'Confirm Nitaqat target with legal counsel',
    titleAr: 'تأكيد مستهدف نطاقات مع المستشار القانوني',
    owner: 'EMP-0001',
    due: '2026-09-20',
    priority: 'medium',
    done: false,
    link: 'settings.html'
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

// Demo date of birth where the HRIS value is not seeded yet. Deterministic
// per employee number (24–54 range) so the Age filter is stable across reloads.
EMPLOYEES.forEach((e, i) => {
  if (e.dob) {return;}
  const n = parseInt(String(e.code).replace(/\D/g, ''), 10) || i + 1;
  const age = 24 + ((n * 7) % 31);
  const month = String(((n * 3) % 12) + 1).padStart(2, '0');
  const day = String(((n * 5) % 28) + 1).padStart(2, '0');
  e.dob = `${2026 - age}-${month}-${day}`;
});

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

// Deduction categories payroll must REJECT when employer-borne (Art. 40).
export const BLOCKED_DEDUCTIONS = ['iqama', 'levy', 'insurance', 'recruitment'];

// ── P1: expat lifecycle + tracker ─────────────────────────────────────────
// Visa blocks & agents (overseas recruitment channel).
// Per-worker visas. status: used | awaiting | expired | cancelled.
// Onboarding pipeline (§4.7). type: overseas | transfer. stages: {n: dateISO}.
// Qiwa transfer cases (local-hire expats skip onboarding stages 2–5).
// Residency documents per expat (passport + medical insurance + traffic fines).
// Document vault. expires: '' = no expiry. Seeded rows are metadata records.
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
// Deterministic demo attendance: past 14 days for assigned workers.
// Weekly site timesheets (supervisor view; approved = locked billing feed).
// Leave requests. status: pending | approved | rejected | cancelled. Historical
// approved annual requests are already counted in employee.annualUsed.
// Approval chains v1 (flows → ordered roles). Admin may act at any step.
// — P3: Ajeer permits (one e-contract per deployment; Decision 60339) —
// — P3: invoices (inputs only; amounts computed by the engine) —
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

// ── P5: contract templates + registers + hiring ────────────────────────────
// Template bodies are bilingual with {{placeholders}} (see KNOWN_PLACEHOLDERS).
// Fields with `source` auto-fill from the picked party; the rest are manual.

// ── P6: performance, training, org, audit, broadcasts ──────────────────────

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
    'dashboard',
    'analytics',
    'employees',
    'employee-file',
    'my-space',
    'my-team',
    'org',
    'departments',
    'roles',
    'settings'
  ],
  ops: ['dashboard', 'analytics', 'employees', 'my-space', 'my-team'],
  payroll: ['dashboard', 'employees'],
  pro: ['dashboard', 'employees', 'my-space'],
  finance: ['dashboard', 'employees'],
  manager: ['dashboard', 'employees', 'my-team', 'my-space'],
  'site-supervisor': ['dashboard', 'employees', 'my-team', 'my-space'],
  employee: ['my-space']
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

// ── Attendance (attendance.html) ──
// Deterministic demo seed for the last 14 calendar days, working days only
// (Fri/Sat weekend). mulberry32 keeps the numbers stable across reloads so
// stats and charts don't jump. Exited employees are not scheduled; huroob is
// absent; on-leave employees carry leave days. `late` is minutes after the
// 08:00 shift start; `hours` exclude a 1-hour break.
export const SHIFT_START_MIN = 8 * 60; // 08:00
export const SHIFT_END_MIN = 17 * 60; // 17:00

function mulberry32(a) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pad2(n) {
  return String(n).padStart(2, '0');
}

function localIso(d) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function hhmm(min) {
  return `${pad2(Math.floor(min / 60))}:${pad2(min % 60)}`;
}

export const ATTENDANCE = (() => {
  const rnd = mulberry32(20260918);
  const days = [];
  const today = new Date();
  for (let back = 13; back >= 0; back -= 1) {
    const d = new Date(today);
    d.setDate(d.getDate() - back);
    const wd = d.getDay();
    if (wd === 5 || wd === 6) {
      continue; // Fri/Sat weekend — no expected attendance
    }
    days.push(localIso(d));
  }
  const rows = [];
  for (const day of days) {
    for (const e of EMPLOYEES) {
      if (e.st === 'exited') {
        continue; // off roster — not scheduled
      }
      const base = { id: `${e.code}@${day}`, code: e.code, dept: e.dept, date: day };
      if (e.st === 'huroob') {
        rows.push({ ...base, st: 'absent', cin: '', cout: '', hours: 0, late: 0 });
        continue;
      }
      if (e.st === 'on-leave') {
        rows.push({ ...base, st: 'leave', cin: '', cout: '', hours: 0, late: 0 });
        continue;
      }
      const r = rnd();
      if (r < 0.04) {
        rows.push({ ...base, st: 'leave', cin: '', cout: '', hours: 0, late: 0 });
      } else if (r < 0.07) {
        rows.push({ ...base, st: 'absent', cin: '', cout: '', hours: 0, late: 0 });
      } else if (r < 0.15) {
        const cinMin = SHIFT_START_MIN + 5 + Math.floor(rnd() * 80); // 08:05–09:25
        const coutMin = SHIFT_END_MIN + Math.floor(rnd() * 20);
        rows.push({
          ...base,
          st: 'late',
          cin: hhmm(cinMin),
          cout: hhmm(coutMin),
          hours: Math.round(((coutMin - cinMin - 60) / 60) * 10) / 10,
          late: cinMin - SHIFT_START_MIN
        });
      } else {
        const cinMin = SHIFT_START_MIN - Math.floor(rnd() * 20); // 07:40–08:00
        const coutMin = SHIFT_END_MIN + Math.floor(rnd() * 30);
        rows.push({
          ...base,
          st: 'present',
          cin: hhmm(cinMin),
          cout: hhmm(coutMin),
          hours: Math.round(((coutMin - cinMin - 60) / 60) * 10) / 10,
          late: 0
        });
      }
    }
  }
  return rows;
})();
