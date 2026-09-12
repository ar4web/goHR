// Import-pass verification: static wiring audit + functional CSV/XLSX parse tests.
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { importFile, validateRows } from '../src/v4/import-export.js';

const R = new URL('..', import.meta.url).pathname.replace(/\/$/, '');
let n = 0;
const eq = (name, got, want) => {
  n += 1;
  const a = JSON.stringify(got);
  const b = JSON.stringify(want);
  console.log(`${a === b ? 'PASS' : 'FAIL'} ${name} (got ${a}, want ${b})`);
  if (a !== b) {process.exitCode = 1;}
};

// --- static wiring: 9 new + 2 pre-existing import buttons ---
const pairs = [
  ['residency', 'hr_residency', 'res-import'], ['onboarding', 'hr_onboarding', 'ob-import'],
  ['documents', 'hr_documents', 'doc-import'], ['org-chart', 'hr_org_chart', 'org-import'],
  ['attendance', 'hr_attendance', 'att-import'], ['shifts', 'hr_shifts', 'shift-import'],
  ['timesheets', 'hr_timesheets', 'ts-import'], ['leave', 'hr_leave', 'lv-import'],
  ['holidays', 'hr_holidays', 'hol-import'],
  ['employees', 'hr_employees', 'emp-import'], ['visas', 'hr_visas', 'visa-import']
];
for (const [mod, page, btn] of pairs) {
  const src = readFileSync(`${R}/src/v4/${mod}.js`, 'utf8');
  const html = readFileSync(`${R}/production/${page}.html`, 'utf8');
  eq(`wire-${mod}-btn`, html.includes(`id="${btn}"`), true);
  eq(`wire-${mod}-modal`, src.includes('mportModal') && src.includes(`'${btn}'`), true);
}
eq('helper-export', readFileSync(`${R}/src/v4/import-modal.js`, 'utf8').includes('export function openImportModal'), true);

// --- functional parse tests ---
const SCHEMA = [
  { key: 'emp', en: 'Employee code', ar: 'رقم الموظف', required: true },
  { key: 'date', en: 'Date (YYYY-MM-DD)', ar: 'التاريخ', required: true, type: 'date' },
  { key: 'fines', en: 'Fines (SAR)', ar: 'المخالفات', type: 'number' }
];
const fake = (name, text) => ({ name, text: async () => text });

let res = await importFile(fake('a.csv', 'Employee code,Date (YYYY-MM-DD),Fines (SAR)\nEMP-0006,2026-09-10,600\nEMP-0007,2026-09-10,\n'), SCHEMA);
eq('csv-rows', res.rows, [{ emp: 'EMP-0006', date: '2026-09-10', fines: '600' }, { emp: 'EMP-0007', date: '2026-09-10', fines: '' }]);
eq('csv-errors', res.errors, []);

res = await importFile(fake('a.csv', 'رقم الموظف,التاريخ,المخالفات\nEMP-0006,2026-09-10,0\n'), SCHEMA);
eq('csv-ar-headers', res.rows, [{ emp: 'EMP-0006', date: '2026-09-10', fines: '0' }]);

res = await importFile(fake('a.csv', 'Employee code,Date (YYYY-MM-DD)\n,2026-09-10\nEMP-1,09/10/2026\n'), SCHEMA);
eq('csv-req-err', res.errors, [{ row: 2, field: 'emp', message: 'required' }, { row: 3, field: 'date', message: 'date-must-be-YYYY-MM-DD' }]);

res = await importFile(fake('a.csv', 'Employee code,Date (YYYY-MM-DD),Fines (SAR)\nEMP-1,2026-09-10,many\n'), SCHEMA);
eq('csv-num-err', res.errors, [{ row: 2, field: 'fines', message: 'not-a-number' }]);

res = await importFile(fake('a.csv', 'Employee code,Date (YYYY-MM-DD)\n"EMP-1, JR",2026-09-10\n'), SCHEMA);
eq('csv-quoted-comma', res.rows, [{ emp: 'EMP-1, JR', date: '2026-09-10' }]);

res = await importFile(fake('a.csv', '\n  \n'), SCHEMA);
eq('csv-empty', res.errors, [{ row: 0, field: '-', message: 'empty-file' }]);

eq('validate-direct', validateRows([{ emp: '', date: 'x' }], SCHEMA).length, 2);

// XLSX end-to-end via real SheetJS
const require = createRequire(import.meta.url);
const XLSX = require('xlsx');
const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([
  ['Employee code', 'Date (YYYY-MM-DD)', 'Fines (SAR)'],
  ['EMP-0006', '2026-09-10', 600],
  ['سعود', '2026-09-11', 0]
]), 'Sheet1');
const buf = XLSX.write(wb, { type: 'array', bookType: 'xlsx' });
res = await importFile({ name: 'a.xlsx', arrayBuffer: async () => buf }, SCHEMA);
eq('xlsx-rows', res.rows.length, 2);
eq('xlsx-arabic-cell', res.rows[1].emp, 'سعود');
eq('xlsx-errors', res.errors, []);

console.log(`\nIMPORT TEST: ${n} assertions, ${process.exitCode ? 'FAILURES' : 'ALL PASS'}`);
