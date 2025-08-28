const express = require('express');
const { query, body } = require('express-validator');
const { summary, pivot, exportXlsx } = require('../controllers/analysisController');

const router = express.Router();

router.get('/summary', [
  query('file').isString().withMessage('file is required'),
  query('sheet').optional().isString(),
], summary);

router.get('/pivot', [
  query('file').isString(),
  query('sheet').optional().isString(),
  query('groupKey').isString(),
  query('aggKey').isString(),
  query('op').optional().isIn(['sum','mean','min','max','count'])
], pivot);

router.post('/export', [
  body('file').isString(),
  body('sheet').optional().isString(),
  body('rows').isArray()
], exportXlsx);

module.exports = router;
