const express = require('express');
const router = express.Router();
const dashboardController = require('../../controllers/admin/dashboard.controller');
const { isAuthenticated, isAdmin } = require('../../middlewares/auth');

// All dashboard routes require authentication and admin role
router.use(isAuthenticated, isAdmin);

// Dashboard
router.get('/dashboard', dashboardController.index);

// Profile
router.get('/profile', dashboardController.profile);
router.post('/profile', dashboardController.updateProfile);
router.post('/profile/change-password', dashboardController.changePassword);

// Settings
router.get('/settings', dashboardController.settings);

// Redirect root admin to dashboard
router.get('/', (req, res) => {
  res.redirect('/admin/dashboard');
});

module.exports = router;