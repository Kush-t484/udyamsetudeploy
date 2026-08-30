const express = require('express');
const router = express.Router();
const officerController = require('../controllers/officer.controller');
const applicationController = require('../controllers/application.controller');
const authenticate = require('../middleware/auth.middleware');
const authorize = require('../middleware/role.middleware');

router.use(authenticate);
router.use(authorize('OFFICER', 'ADMIN'));

router.get('/dashboard', officerController.getDashboardMetrics);
router.get('/applications', officerController.getOfficerApplications);
router.get('/applications/:id', applicationController.getApplicationById);
router.put('/applications/:id/status', applicationController.updateStatus);
router.post('/applications/:id/remarks', officerController.addRemarks);

module.exports = router;
