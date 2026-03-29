const express = require('express');
const router = express.Router();
const HomePageController = require('../../controllers/api/HomePage.controller');



/**
 * @swagger
 * tags:
 *   name: Homepage
 *   description: Homepage management endpoints
 */

 /**
   * @swagger
   * /api/home:
   *   get:
   *     summary: Get homepage data
   *     description: Returns all homepage content including banners, text sections, and counter cards.
   *     tags: [Homepage]
   *     responses:
   *       200:
   *         description: Homepage data retrieved successfully
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
   *                       example: "Welcome to Our Site"
   *                     banner_description:
   *                       type: string
   *                       example: "We provide the best services"
   *                     banner_heading1:
   *                       type: string
   *                       example: "Quality"
   *                     banner_heading2:
   *                       type: string
   *                       example: "Trust"
   *                     banner_heading3:
   *                       type: string
   *                       example: "Support"
   *                     banner_content:
   *                       type: string
   *                       example: "<p>Detailed content here...</p>"
   *                     banner_note:
   *                       type: string
   *                       example: "Limited time offer"
   *                     counters_heading:
   *                       type: string
   *                       example: "Our Achievements"
   *                     counters_rating:
   *                       type: number
   *                       format: float
   *                       example: 4.8
   *                     footer_heading:
   *                       type: string
   *                       example: "Contact Us"
   *                     footer_description1:
   *                       type: string
   *                       example: "Email: info@example.com"
   *                     footer_description2:
   *                       type: string
   *                       example: "Phone: +123456789"
   *                     isActive:
   *                       type: boolean
   *                       example: true
   *                     banner_image1:
   *                       type: string
   *                       format: uri
   *                       example: "https://yourdomain.com/uploads/home/banner1.jpg"
   *                       nullable: true
   *                     banner_image2:
   *                       type: string
   *                       format: uri
   *                       nullable: true
   *                     banner_image3:
   *                       type: string
   *                       format: uri
   *                       nullable: true
   *                     counterCards:
   *                       type: array
   *                       items:
   *                         type: object
   *                         properties:
   *                           id:
   *                             type: integer
   *                             example: 1
   *                           count:
   *                             type: string
   *                             example: "150+"
   *                           description:
   *                             type: string
   *                             example: "Happy Clients"
   *                           image:
   *                             type: string
   *                             format: uri
   *                             nullable: true
   *                           sort_order:
   *                             type: integer
   *                             example: 0
   *       404:
   *         description: Homepage not found
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: false
   *                 message:
   *                   type: string
   *                   example: "Home page not found"
   *       500:
   *         description: Server error
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                   example: false
   *                 message:
   *                   type: string
   *                   example: "Failed to fetch home page data"
   */
router.get('/', HomePageController.index);

module.exports = router;