const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../../middlewares/auth');
const GoogleReviewsController = require('../../controllers/admin/GoogleReviews.controller');

router.use(isAuthenticated);




router.get('/page/:pageid', GoogleReviewsController.index);
router.get('/slug/:slug', GoogleReviewsController.slugindex);
router.post('/store', GoogleReviewsController.store);
router.post('/update/:id', GoogleReviewsController.update);
router.delete('/delete/:id', GoogleReviewsController.delete);
router.post('/toggle-status/:id', GoogleReviewsController.toggleStatus);
router.post('/reorder', GoogleReviewsController.reorder);


module.exports = router;