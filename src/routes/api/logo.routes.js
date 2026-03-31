const express = require('express');
const router = express.Router();

const logoApiController = require('../../controllers/api/logo.controller');

/**
 * @swagger
 * tags:
 *   name: Logos
 *   description: Public Logos API
 */

/**
 * @swagger
 * /api/logos/{type}:
 *   get:
 *     summary: Get logos by type
 *     description: Fetch all active logos filtered by type (news or brands)
 *     tags: [Logos]
 *     parameters:
 *       - in: path
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [news, brands]
 *         description: Type of logos to fetch
 *     responses:
 *       200:
 *         description: Logos fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 count:
 *                   type: integer
 *                   example: 2
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       title:
 *                         type: string
 *                         example: BBC
 *                       link:
 *                         type: string
 *                         example: https://bbc.com
 *                       image:
 *                         type: string
 *                         example: https://yourdomain.com/uploads/logos/logo.png
 *                       type:
 *                         type: string
 *                         example: news
 *       400:
 *         description: Invalid type supplied
 *       500:
 *         description: Server error
 */

// Public Logos API
router.get('/:type', logoApiController.getLogosByType);

module.exports = router;