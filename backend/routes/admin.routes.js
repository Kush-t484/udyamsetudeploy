const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const approvalController = require('../controllers/approval.controller');
const schemeController = require('../controllers/scheme.controller');
const authenticate = require('../middleware/auth.middleware');
const authorize = require('../middleware/role.middleware');

router.use(authenticate);
router.use(authorize('ADMIN'));

router.get('/dashboard', adminController.getDashboardMetrics);
router.get('/users', adminController.getUsers);
router.get('/companies', adminController.getCompanies);
router.get('/approvals', approvalController.getApprovals);
router.get('/schemes', schemeController.getSchemes);
router.get('/audit-logs', adminController.getAuditLogs);

module.exports = router;
