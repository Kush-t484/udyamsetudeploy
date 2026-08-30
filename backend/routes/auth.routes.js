const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const authenticate = require('../middleware/auth.middleware');
const validate = require('../middleware/validation.middleware');
const { registerValidator, loginValidator } = require('../utils/validators');

router.post('/register', registerValidator, validate, authController.register);
router.post('/login', loginValidator, validate, authController.login);
router.get('/me', authenticate, authController.getCurrentUser);

module.exports = router;
