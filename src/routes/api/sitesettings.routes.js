const express = require('express');
const router = express.Router();
const siteSettingsController = require('../../controllers/api/siteSettings.controller');


router.get('/', siteSettingsController.getSettings);


module.exports = router;