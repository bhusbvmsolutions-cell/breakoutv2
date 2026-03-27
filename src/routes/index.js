const express = require('express');
const router = express.Router();

// Import admin route modules
const adminAuthRoutes = require('./admin/auth.routes');
const adminDashboardRoutes = require('./admin/dashboard.routes');
const adminUserRoutes = require('./admin/users.routes');
const adminRoleRoutes = require('./admin/roles.routes');
const adminPermissionRoutes = require('./admin/permissions.routes');
const adminImageRoutes = require('./admin/images.routes');
const adminVideoRoutes = require('./admin/videos.routes'); 
const adminLogoRoutes = require('./admin/logos.routes'); 
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
const adminCorporateRetreatArchiveRoutes = require('./admin/corporateretreatarchive.routes'); 
const adminCorporateLdInnerRoutes = require('./admin/corporateldinner.routes'); 
const adminLocationRoutes = require('./admin/location.routes'); 
const adminActivityRoutes = require('./admin/activity.routes'); 
const adminHomePageRoutes = require('./admin/homepage.routes'); 
const adminAboutUsPageRoutes = require('./admin/aboutus.routes'); 
const adminStaticPageRoutes = require('./admin/staticpage.routes');
const adminTNCRoutes = require('./admin/tnc.routes');
const adminFounderMessageRoutes = require('./admin/foundermessage.routes');
const adminPricingPackageCategoryRoutes = require('./admin/pricingpackagecategories.routes');
const adminPricingPackageRoutes = require('./admin/pricingpackages.routes');
const adminVenueRoutes = require('./admin/venue.routes');
const venueCategoriesRoutes = require('./admin/venuecategories.routes');
const venueExperienceTypesRoutes = require('./admin/venueexperiencetypes.routes');
const venueLookingForRoutes = require('./admin/venuelookingfor.routes');
const venuePartyTypesRoutes = require('./admin/venuepartytypes.routes');
const venueSuitableTimesRoutes = require('./admin/venuesuitabletimes.routes');
const venueBudgetRangesRoutes = require('./admin/venuebudgetranges.routes');
const adminBirthdayBlogRoutes = require('./admin/birthdayblog.routes');
const adminBreakoutPartyBlogRoutes = require('./admin/breakoutpartyblog.routes');
const adminFaqsRoutes = require('./admin/faqs.routes');

// Admin routes
router.use('/admin', adminAuthRoutes);
router.use('/admin', adminDashboardRoutes);
router.use('/admin/users', adminUserRoutes);
router.use('/admin/roles', adminRoleRoutes);
router.use('/admin/permissions', adminPermissionRoutes);
router.use('/admin/images', adminImageRoutes); 
router.use('/admin/videos', adminVideoRoutes); 
router.use('/admin/logos', adminLogoRoutes); 
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
router.use('/admin/corporate/retreat/archive', adminCorporateRetreatArchiveRoutes); 
router.use('/admin/corporate/ld/inner', adminCorporateLdInnerRoutes); 
router.use('/admin/location', adminLocationRoutes); 
router.use('/admin/activity', adminActivityRoutes); 
router.use('/admin/home', adminHomePageRoutes); 
router.use('/admin/about', adminAboutUsPageRoutes); 
router.use('/admin/static/page', adminStaticPageRoutes);
router.use('/admin/tnc', adminTNCRoutes);
router.use('/admin/founder/message', adminFounderMessageRoutes);
router.use('/admin/pricing/packages', adminPricingPackageRoutes);
router.use('/admin/pricing/category', adminPricingPackageCategoryRoutes);
router.use('/admin/venues', adminVenueRoutes);
router.use('/admin/venue-categories', venueCategoriesRoutes);
router.use('/admin/venue-experience-types', venueExperienceTypesRoutes);
router.use('/admin/venue-looking-for', venueLookingForRoutes);
router.use('/admin/venue-party-types', venuePartyTypesRoutes);
router.use('/admin/venue-suitable-times', venueSuitableTimesRoutes);
router.use('/admin/venue-budget-ranges', venueBudgetRangesRoutes);
router.use('/admin/birthday-blog', adminBirthdayBlogRoutes);
router.use('/admin/breakout-party-blog', adminBreakoutPartyBlogRoutes);
router.use('/admin/faqs', adminFaqsRoutes);






// import API routes modules
const apiTestRoutes = require('./api/test.apiroutes');
const siteSettingsRoutes = require('./api/sitesettings.routes');
const activityApiRoutes = require('./api/activity.routes');



// API routes
router.use('/api', apiTestRoutes);
router.use('/api/sitesettings', siteSettingsRoutes);
router.use('/api/activities', activityApiRoutes);


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