const express = require('express');
const router = express.Router();
const schemeController = require('../controllers/scheme.controller');
const authenticate = require('../middleware/auth.middleware');

router.get('/', authenticate, schemeController.getSchemes);
router.get('/:id', authenticate, schemeController.getSchemeById);
router.post('/match', authenticate, schemeController.match);
router.post('/:id/save', authenticate, schemeController.saveScheme);
router.delete('/:id/save', authenticate, schemeController.unsaveScheme);

module.exports = router;
