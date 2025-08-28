const path = require('path');
const fs = require('fs/promises');
const { parseWorkbook, buildWorkbook } = require('../utils/excel');
const { summarizeColumn, autoInferTypes, groupByAggregate } = require('../utils/stats');

// Load an uploaded file buffer by ID/path (this assumes files are saved under uploads/ with their filename)
async function loadUploadBuffer(filename){
  const filePath = path.join(process.cwd(), 'uploads', filename);
  return fs.readFile(filePath);
}

async function getWorkbook(filename){
  const buf = await loadUploadBuffer(filename);
  return parseWorkbook(buf);
}

async function getSummary(filename, sheet){
  const wb = await getWorkbook(filename);
  const sheetName = sheet || wb.sheetNames[0];
  const rows = wb.sheets[sheetName] || [];
  const types = autoInferTypes(rows);
  const numericKeys = Object.keys(types).filter(k => types[k] === 'number');
  const summary = {};
  numericKeys.forEach(k => { summary[k] = summarizeColumn(rows, k); });
  return { sheetName, columns: Object.keys(types), types, summary, rowCount: rows.length };
}

async function getPivot(filename, sheet, groupKey, aggKey, op){
  const wb = await getWorkbook(filename);
  const sheetName = sheet || wb.sheetNames[0];
  const rows = wb.sheets[sheetName] || [];
  const data = groupByAggregate(rows, groupKey, aggKey, op);
  return { sheetName, groupKey, aggKey, op, data };
}

async function exportAsXlsx(filename, sheet, filteredRows){
  // filteredRows: array of objects (already filtered on client or by separate endpoint)
  const buf = buildWorkbook({ [sheet || 'Sheet1']: filteredRows });
  const out = path.join(process.cwd(), 'uploads', `export_${Date.now()}.xlsx`);
  await fs.writeFile(out, buf);
  return path.basename(out);
}

module.exports = { getSummary, getPivot, exportAsXlsx };
