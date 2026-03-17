const express = require('express');
const router = express.Router();
const BlogController = require('../../controllers/admin/blogController');
const { isAuthenticated } = require('../../middlewares/auth');



router.use(isAuthenticated);


router.get('/', BlogController.bloglist);

module.exports = router;