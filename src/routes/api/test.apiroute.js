const express = require('express');
const router = express.Router();
const testController = require('../../controllers/api/testController');
const { isAuthenticated, isAdmin } = require('../../middlewares/auth');

// Public test endpoints
router.get('/public', testController.publicTest);
router.get('/health', testController.health);

// Protected test endpoints
router.get('/protected', isAuthenticated, testController.protectedTest);

// Admin test endpoints
router.get('/admin', isAuthenticated, isAdmin, testController.adminTest);

module.exports = router;