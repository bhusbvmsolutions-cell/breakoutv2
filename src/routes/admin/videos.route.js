const express = require('express');
const router = express.Router();
const videoController = require('../../controllers/admin/videoController');
const { isAuthenticated } = require('../../middlewares/auth');

// All routes require authentication
router.use(isAuthenticated);

// Video management routes
router.get('/', videoController.listVideos);
router.get('/upload', videoController.showUploadForm);
router.post('/upload', videoController.uploadVideo);
router.get('/:id', videoController.viewVideo);
router.put('/:id', videoController.updateVideo);
router.delete('/:id', videoController.deleteVideo);
router.post('/bulk-delete', videoController.bulkDelete);
router.post('/bulk-update-status', videoController.bulkUpdateStatus);

// API routes
router.get('/api/recent', videoController.getRecentVideos);

module.exports = router;