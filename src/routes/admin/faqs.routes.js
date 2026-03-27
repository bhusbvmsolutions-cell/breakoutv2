const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../../middlewares/auth');
const FaqsController = require('../../controllers/admin/Faqs.controller');

router.use(isAuthenticated);

// Routes
router.get('/:pageid', FaqsController.index);
router.post('/store', FaqsController.store);
router.post('/update/:id', FaqsController.update);
router.delete('/delete/:id', FaqsController.delete);
router.post('/toggle-status/:id', FaqsController.toggleStatus);
router.post('/reorder', FaqsController.reorder);

module.exports = router;