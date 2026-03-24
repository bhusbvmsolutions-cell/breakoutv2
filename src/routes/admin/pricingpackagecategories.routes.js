const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../../middlewares/auth');
const PricingPackageCategoryController = require('../../controllers/admin/PricingPackageCategory.controller');

router.use(isAuthenticated);

router.get('/', PricingPackageCategoryController.index);
router.get('/create', PricingPackageCategoryController.create);
router.post('/store', PricingPackageCategoryController.store);
router.get('/edit/:id', PricingPackageCategoryController.edit);
router.post('/update/:id', PricingPackageCategoryController.update);
router.delete('/delete/:id', PricingPackageCategoryController.delete);
router.post('/toggle-status/:id', PricingPackageCategoryController.toggleStatus);

module.exports = router;