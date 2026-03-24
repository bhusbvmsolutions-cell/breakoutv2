const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../../middlewares/auth');
const TncController = require('../../controllers/admin/TncController');

router.use(isAuthenticated);

// List all T&C pages
router.get('/list', TncController.list);

// Edit form for a specific reference
router.get('/:reference', TncController.edit);

// Update a page
router.put('/:reference', TncController.update);

// Optional: toggle status
router.post('/toggle-status/:id', TncController.toggleStatus);

module.exports = router;