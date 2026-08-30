const express = require('express');
const router = express.Router();
const documentController = require('../controllers/document.controller');
const authenticate = require('../middleware/auth.middleware');
const authorize = require('../middleware/role.middleware');
const upload = require('../middleware/upload.middleware');

router.get('/', authenticate, documentController.getDocuments);
router.post('/upload', authenticate, upload.single('document'), documentController.uploadDocument);
router.get('/:id', authenticate, documentController.getDocumentById);
router.put('/:id/verify', authenticate, authorize('OFFICER', 'ADMIN'), documentController.verifyDocument);
router.delete('/:id', authenticate, documentController.deleteDocument);

module.exports = router;
