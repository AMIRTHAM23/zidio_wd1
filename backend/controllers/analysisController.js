const asyncHandler = require('express-async-handler');
const { validationResult, query, body } = require('express-validator');
const path = require('path');
const fs = require('fs/promises');
const { getSummary, getPivot, exportAsXlsx } = require('../services/analysisService');

const validate = (req) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const err = new Error('Validation error');
    err.status = 400;
    err.details = errors.array();
    throw err;
  }
};

// GET /api/analysis/summary?file=<filename>&sheet=<sheetName>
const summary = asyncHandler(async (req, res) => {
  validate(req);
  const { file, sheet } = req.query;
  const result = await getSummary(file, sheet);
  res.json(result);
});

// GET /api/analysis/pivot?file=<filename>&sheet=<sheet>&groupKey=ColA&aggKey=ColB&op=sum
const pivot = asyncHandler(async (req, res) => {
  validate(req);
  const { file, sheet, groupKey, aggKey, op } = req.query;
  const result = await getPivot(file, sheet, groupKey, aggKey, op || 'sum');
  res.json(result);
});

// POST /api/analysis/export
// body: { file, sheet, rows }  -> returns { download: "/uploads/<name>" }
const exportXlsx = asyncHandler(async (req, res) => {
  validate(req);
  const { file, sheet, rows } = req.body;
  const name = await exportAsXlsx(file, sheet, rows || []);
  res.json({ download: `/uploads/${name}` });
});

module.exports = { summary, pivot, exportXlsx };
