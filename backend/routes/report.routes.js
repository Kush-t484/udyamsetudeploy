const express = require('express');
const router = express.Router();
const reportController = require('../controllers/report.controller');
const authenticate = require('../middleware/auth.middleware');

router.get('/company', authenticate, reportController.getCompanySummaryReport);
router.get('/compliance', authenticate, reportController.getComplianceReport);

module.exports = router;
