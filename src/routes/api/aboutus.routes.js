const express = require('express');
const router = express.Router();

const controller = require("../../controllers/api/aboutus.controller");

/**
 * @swagger
 * tags:
 *   name: About Us
 *   description: About Us Page API
 */

/**
 * @swagger
 * /api/about-us:
 *   get:
 *     summary: Get complete About Us page data
 *     tags: [About Us]
 *     responses:
 *       200:
 *         description: About Us data fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     banner_heading:
 *                       type: string
 *                       example: Welcome to Our Company
 *                     banner_description:
 *                       type: string
 *                       example: We create amazing experiences
 *                     banner_image:
 *                       type: string
 *                       example: https://example.com/uploads/about-us/banner.jpg
 *
 *                     vision:
 *                       type: object
 *                       properties:
 *                         heading1:
 *                           type: string
 *                         description1:
 *                           type: string
 *                         heading2:
 *                           type: string
 *                         description2:
 *                           type: string
 *                         image:
 *                           type: string
 *
 *                     counters_heading:
 *                       type: string
 *                     counters_rating:
 *                       type: string
 *
 *                     content:
 *                       type: object
 *                       properties:
 *                         heading:
 *                           type: string
 *                         description:
 *                           type: string
 *
 *                     cards_heading:
 *                       type: string
 *
 *                     our_story:
 *                       type: object
 *                       properties:
 *                         heading:
 *                           type: string
 *                         description:
 *                           type: string
 *                         image:
 *                           type: string
 *
 *                     founder:
 *                       type: object
 *                       properties:
 *                         heading:
 *                           type: string
 *                         name:
 *                           type: string
 *                         designation:
 *                           type: string
 *                         description:
 *                           type: string
 *                         image:
 *                           type: string
 *                         social:
 *                           type: object
 *                           properties:
 *                             whatsapp:
 *                               type: string
 *                             instagram:
 *                               type: string
 *                             linkedin:
 *                               type: string
 *                             twitter:
 *                               type: string
 *                             gmail:
 *                               type: string
 *                             link:
 *                               type: string
 *
 *                     leaders:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                           designation:
 *                             type: string
 *                           description:
 *                             type: string
 *                           image:
 *                             type: string
 *
 *                     advisors:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           name:
 *                             type: string
 *                           designation:
 *                             type: string
 *                           description:
 *                             type: string
 *                           image:
 *                             type: string
 *
 *       404:
 *         description: About Us not found
 *       500:
 *         description: Failed to fetch About Us
 */
router.get("/", controller.getAboutUs);

module.exports = router;