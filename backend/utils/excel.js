const XLSX = require('xlsx');

// Parse an uploaded Excel/CSV file into a JS object: { sheets: {name: rows[]}, sheetNames: [] }
function parseWorkbook(buffer) {
  const wb = XLSX.read(buffer, { type: 'buffer' });
  const result = { sheets: {}, sheetNames: wb.SheetNames };
  wb.SheetNames.forEach((name) => {
    const ws = wb.Sheets[name];
    const rows = XLSX.utils.sheet_to_json(ws, { defval: null }); // [{col:value},...]
    result.sheets[name] = rows;
  });
  return result;
}

// Build a workbook from rows (array of objects) and return a Buffer
function buildWorkbook(sheets) {
  const wb = XLSX.utils.book_new();
  Object.entries(sheets).forEach(([name, rows]) => {
    const ws = XLSX.utils.json_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, name.substring(0,31));
  });
  return Buffer.from(XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }));
}

module.exports = { parseWorkbook, buildWorkbook };
