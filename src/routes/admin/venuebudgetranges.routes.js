const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../../middlewares/auth');
const VenueReferenceController = require('../../controllers/admin/VenueReference.controller');

const controller = new VenueReferenceController('VenueBudgetRange', 'admin/venue-budget-ranges', 'Budget Ranges');

router.use(isAuthenticated);

router.get('/', controller.index.bind(controller));
router.get('/create', controller.create.bind(controller));
router.post('/store', controller.store.bind(controller));
router.get('/edit/:id', controller.edit.bind(controller));
router.post('/update/:id', controller.update.bind(controller));
router.delete('/delete/:id', controller.delete.bind(controller));
router.post('/toggle-status/:id', controller.toggleStatus.bind(controller));

module.exports = router;