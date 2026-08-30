const express = require('express');
const router = express.Router();
const approvalController = require('../controllers/approval.controller');
const authenticate = require('../middleware/auth.middleware');

router.get('/', approvalController.getApprovals);
router.get('/:id', approvalController.getApprovalById);
router.post('/analyze', approvalController.analyze);

module.exports = router;
