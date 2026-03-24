const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../../middlewares/auth');
const PricingPackageController = require('../../controllers/admin/PricingPackage.controller');

router.use(isAuthenticated);

router.get('/', PricingPackageController.index);
router.get('/create', PricingPackageController.create);
router.post('/store', PricingPackageController.store);
router.get('/edit/:id', PricingPackageController.edit);
router.post('/update/:id', PricingPackageController.update);
router.delete('/delete/:id', PricingPackageController.delete);
router.post('/toggle-status/:id', PricingPackageController.toggleStatus);

module.exports = router;