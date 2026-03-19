const express = require('express');
const router = express.Router();
const logoController = require('../../controllers/admin/logo.controller');
const { isAuthenticated } = require('../../middlewares/auth');

// All routes require authentication
router.use(isAuthenticated);

// Logo management routes
router.get('/', logoController.listLogos);
router.get('/upload', logoController.showUploadForm);
router.post('/upload', logoController.uploadLogo);
router.get('/:id/edit', logoController.editLogoForm);
router.post('/:id', logoController.updateLogo);
router.delete('/:id', logoController.deleteLogo);

// AJAX routes
router.post('/:id/toggle-status', logoController.toggleStatus);
router.post('/update-order', logoController.updateOrder);
router.post('/bulk-delete', logoController.bulkDelete);
router.post('/bulk-update-status', logoController.bulkUpdateStatus);

module.exports = router;