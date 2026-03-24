const express = require('express');
const router = express.Router();
const testController = require('../../controllers/api/testController');
const { isAuthenticated, isAdmin } = require('../../middlewares/auth');

/**
 * @swagger
 * tags:
 *   name: Health
 *   description: Health APIs
 */


/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Health check
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Server health status
 */
router.get('/health', testController.health);



module.exports = router;