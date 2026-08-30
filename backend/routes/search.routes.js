const express = require('express');
const router = express.Router();
const searchController = require('../controllers/search.controller');
const authenticate = require('../middleware/auth.middleware');

router.get('/', authenticate, searchController.globalSearch);

module.exports = router;
