const express = require('express');
const router = express.Router();
const aiController = require('../controllers/ai.controller');
const authenticate = require('../middleware/auth.middleware');

router.post('/chat', authenticate, aiController.chat);
router.get('/conversations', authenticate, aiController.getConversations);
router.get('/conversations/:id', authenticate, aiController.getConversationById);

module.exports = router;
