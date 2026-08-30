const express = require('express');
const router = express.Router();
const companyController = require('../controllers/company.controller');
const authenticate = require('../middleware/auth.middleware');
const authorize = require('../middleware/role.middleware');

router.get('/profile', authenticate, companyController.getProfile);
router.put('/profile', authenticate, authorize('INDUSTRY', 'ADMIN'), companyController.updateProfile);
router.post('/onboarding', authenticate, companyController.onboarding);

module.exports = router;
