const express = require('express');
const router = express.Router();

// Import route modules
const adminAuthRoutes = require('./admin/auth.routes');
const adminDashboardRoutes = require('./admin/dashboard.routes');
const adminUserRoutes = require('./admin/users.routes');
const adminRoleRoutes = require('./admin/roles.routes');
const adminPermissionRoutes = require('./admin/permissions.routes');
const adminImageRoutes = require('./admin/images.routes');
const adminVideoRoutes = require('./admin/videos.routes'); 
const adminLogoRoutes = require('./admin/logos.routes'); 
const adminBlogRoutes = require('./admin/blogs.routes'); 
const adminSiteSettingsRoutes = require('./admin/site_settings.routes'); 
const adminEscapeRoomArchiveRoutes = require('./admin/escaperoomarchive.routes'); 
const adminEscapeRoomLocationRoutes = require('./admin/escaperoomlocations.routes'); 
const adminEscapeRoomRoutes = require('./admin/escaperoom.routes'); 
const adminLandingRoutes = require('./admin/landing.routes'); 
const adminVirtualArchiveRoutes = require('./admin/virtualarchive.routes'); 
const adminVirtualGameRoutes = require('./admin/virtualgame.routes'); 
const adminPartyArchiveRoutes = require('./admin/partyarchive.routes'); 
const adminBirthdayArchiveRoutes = require('./admin/birthdayarchive.routes'); 
const adminBachelorFarewellRoutes = require('./admin/bachelorfarewell.routes'); 
const adminBirthdayInnerRoutes = require('./admin/birthdayinner.routes'); 
const adminCorporateArchiveRoutes = require('./admin/corporatearchive.routes'); 
const adminCorporateUnwindArchiveRoutes = require('./admin/corporateunwindarchive.routes'); 
const adminCorporateLdArchiveRoutes = require('./admin/corporateldarchive.routes'); 



// import API routes modules
const apiTestRoutes = require('./api/test.apiroute');

// Admin routes
router.use('/admin', adminAuthRoutes);
router.use('/admin', adminDashboardRoutes);
router.use('/admin/users', adminUserRoutes);
router.use('/admin/roles', adminRoleRoutes);
router.use('/admin/permissions', adminPermissionRoutes);
router.use('/admin/images', adminImageRoutes); 
router.use('/admin/videos', adminVideoRoutes); 
router.use('/admin/logos', adminLogoRoutes); 
router.use('/admin/blogs', adminBlogRoutes); 
router.use('/admin/site', adminSiteSettingsRoutes); 
router.use('/admin/escape', adminEscapeRoomArchiveRoutes); 
router.use('/admin/escape/locations', adminEscapeRoomLocationRoutes); 
router.use('/admin/escape/rooms', adminEscapeRoomRoutes); 
router.use('/admin/landing', adminLandingRoutes); 
router.use('/admin/virtual', adminVirtualArchiveRoutes); 
router.use('/admin/virtual/game', adminVirtualGameRoutes); 
router.use('/admin/party/archive', adminPartyArchiveRoutes); 
router.use('/admin/party/birthday/archive', adminBirthdayArchiveRoutes); 
router.use('/admin/party', adminBachelorFarewellRoutes); 
router.use('/admin/party/birthday', adminBirthdayInnerRoutes); 
router.use('/admin/corporate/archive', adminCorporateArchiveRoutes); 
router.use('/admin/corporate/unwind/archive', adminCorporateUnwindArchiveRoutes); 
router.use('/admin/corporate/ld/archive', adminCorporateLdArchiveRoutes); 

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