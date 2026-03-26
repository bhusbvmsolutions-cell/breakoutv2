const express = require('express');
const router = express.Router();
const activityApiController = require('../../controllers/api/activity.controller');

router.get('/', activityApiController.list);
router.get('/:slug', activityApiController.details);

module.exports = router;