const express = require('express');
const router = express.Router();

// Import route modules
const adminAuthRoutes = require('./admin/auth.route');
const adminDashboardRoutes = require('./admin/dashboard.route');
const adminUserRoutes = require('./admin/users.route');
const adminRoleRoutes = require('./admin/roles.route');
const adminPermissionRoutes = require('./admin/permissions.route');
const adminImageRoutes = require('./admin/images.route'); 
const apiTestRoutes = require('./api/test.apiroute');

// Admin routes
router.use('/admin', adminAuthRoutes);
router.use('/admin', adminDashboardRoutes);
router.use('/admin/users', adminUserRoutes);
router.use('/admin/roles', adminRoleRoutes);
router.use('/admin/permissions', adminPermissionRoutes);
router.use('/admin/images', adminImageRoutes);  

// API routes
router.use('/api', apiTestRoutes);

// Home route
router.get('/', (req, res) => {
  if (req.session.user) {
    return res.redirect('/admin/dashboard');
  }
  res.redirect('/admin/login');
});


router.get('/test-flash', (req, res) => {
  req.flash('success', 'This is a test success message');
  req.flash('error', 'This is a test error message');
  res.redirect('/admin/roles');
});

module.exports = router;