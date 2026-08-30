const express = require('express');
const router = express.Router();
const complianceController = require('../controllers/compliance.controller');
const authenticate = require('../middleware/auth.middleware');

router.get('/', authenticate, complianceController.getCompliance);
router.get('/summary', authenticate, complianceController.getCompliance);
router.get('/risk-score', authenticate, complianceController.getRiskScore);
router.put('/:id', authenticate, complianceController.updateRecord);
router.post('/run-check', authenticate, complianceController.triggerCheck);

module.exports = router;
