const express = require('express');
const router = express.Router();
const imageController = require('../../controllers/admin/image.controller');
const { isAuthenticated } = require('../../middlewares/auth');

// All routes require authentication
router.use(isAuthenticated);

// Image management routes
router.get('/', imageController.listImages);
router.get('/upload', imageController.showUploadForm);
router.post('/upload', imageController.uploadImage);
router.get('/:id', imageController.viewImage);
router.delete('/:id', imageController.deleteImage);
router.post('/bulk-delete', imageController.bulkDelete);

module.exports = router;