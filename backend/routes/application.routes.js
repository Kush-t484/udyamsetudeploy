const express = require('express');
const router = express.Router();
const applicationController = require('../controllers/application.controller');
const authenticate = require('../middleware/auth.middleware');
const authorize = require('../middleware/role.middleware');

router.get('/', authenticate, applicationController.getApplications);
router.get('/:id', authenticate, applicationController.getApplicationById);
router.post('/', authenticate, authorize('INDUSTRY', 'ADMIN'), applicationController.createApplication);
router.put('/:id/status', authenticate, applicationController.updateStatus);
router.post('/:id/request-documents', authenticate, authorize('OFFICER', 'ADMIN'), applicationController.requestDocuments);

module.exports = router;
