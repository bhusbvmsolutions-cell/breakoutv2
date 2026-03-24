const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../../middlewares/auth');
const StaticPageController = require('../../controllers/admin/StaticPage.controller');

router.use(isAuthenticated);

// Optional listing page
router.get('/', StaticPageController.index);

// Edit form for a specific slug
router.get('/:slug', StaticPageController.edit);

// Update page (using POST with _method=PUT)
router.post('/:slug', StaticPageController.update);

// Optional: delete and toggle
router.delete('/:id', StaticPageController.delete);
router.post('/toggle-status/:id', StaticPageController.toggleStatus);

module.exports = router;