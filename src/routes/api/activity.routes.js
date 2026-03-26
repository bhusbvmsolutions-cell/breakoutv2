const express = require('express');
const router = express.Router();
const activityApiController = require('../../controllers/api/activity.controller');

/**
 * @swagger
 * tags:
 *   name: Activities
 *   description: Activity management endpoints
 */

/**
 * @swagger
 * /api/activities:
 *   get:
 *     summary: Get list of all active activities
 *     tags: [Activities]
 *     description: Returns a list of all active activities with basic information (title, slug, banner image)
 *     responses:
 *       200:
 *         description: Successfully retrieved activities list
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       title:
 *                         type: string
 *                         example: "Team Building Challenge"
 *                       slug:
 *                         type: string
 *                         example: "team-building-challenge"
 *                       banner_image:
 *                         type: string
 *                         format: uri
 *                         example: "https://yourdomain.com/uploads/activity/banner1.jpg"
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       example: 25
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 10
 *                     totalPages:
 *                       type: integer
 *                       example: 3
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
 *                   example: "Failed to fetch activities"
 *                 error:
 *                   type: string
 *                   example: "Database connection error"
 */
router.get('/', activityApiController.list);

/**
 * @swagger
 * /api/activities/{slug}:
 *   get:
 *     summary: Get activity details by slug
 *     tags: [Activities]
 *     description: Returns complete activity details including image cards and associated escape rooms
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: Unique slug identifier of the activity
 *         example: "team-building-challenge"
 *     responses:
 *       200:
 *         description: Successfully retrieved activity details
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
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     title:
 *                       type: string
 *                       example: "Team Building Challenge"
 *                     slug:
 *                       type: string
 *                       example: "team-building-challenge"
 *                     banner_heading:
 *                       type: string
 *                       example: "Exciting Challenge"
 *                     banner_image:
 *                       type: string
 *                       format: uri
 *                       example: "https://yourdomain.com/uploads/activity/banner1.jpg"
 *                     banner_description:
 *                       type: string
 *                       example: "A great team experience"
 *                     banner_content:
 *                       type: string
 *                       example: "<p>Detailed content here...</p>"
 *                     challenge_level:
 *                       type: string
 *                       example: "Hard"
 *                     competitive_activity:
 *                       type: string
 *                       example: "Yes"
 *                     immersive_rating:
 *                       type: string
 *                       example: "5"
 *                     capacity:
 *                       type: string
 *                       example: "20"
 *                     duration:
 *                       type: string
 *                       example: "2 hours"
 *                     virtual_compatibility:
 *                       type: string
 *                       example: "Yes"
 *                     cta_label:
 *                       type: string
 *                       example: "Book Now"
 *                     cta_link:
 *                       type: string
 *                       example: "/book"
 *                     video_trailer:
 *                       type: string
 *                       format: uri
 *                       example: "https://youtube.com/watch?v=..."
 *                     content_heading:
 *                       type: string
 *                       example: "Details"
 *                     content_content:
 *                       type: string
 *                       example: "<p>Content here...</p>"
 *                     image_card_section_heading:
 *                       type: string
 *                       example: "Gallery"
 *                     image1:
 *                       type: string
 *                       format: uri
 *                       example: "https://yourdomain.com/uploads/activity/img1.jpg"
 *                     image2:
 *                       type: string
 *                       format: uri
 *                       nullable: true
 *                       example: null
 *                     image3:
 *                       type: string
 *                       format: uri
 *                       nullable: true
 *                       example: null
 *                     imageCards:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 1
 *                           sort_order:
 *                             type: integer
 *                             example: 0
 *                           heading:
 *                             type: string
 *                             example: "Fun Moments"
 *                           image:
 *                             type: string
 *                             format: uri
 *                             example: "https://yourdomain.com/uploads/activity/card1.jpg"
 *                     escaperooms:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                             example: 5
 *                           title:
 *                             type: string
 *                             example: "The Lost Temple"
 *                           slug:
 *                             type: string
 *                             example: "lost-temple"
 *                           type:
 *                             type: string
 *                             enum: [physical, virtual]
 *                             example: "physical"
 *                           sort_order:
 *                             type: integer
 *                             example: 0
 *                           banner_image:
 *                             type: string
 *                             format: uri
 *                             example: "https://yourdomain.com/uploads/rooms/temple.jpg"
 *                           banner_heading:
 *                             type: string
 *                             example: "Adventure awaits!"
 *                           banner_description:
 *                             type: string
 *                             example: "Enter the mysterious temple..."
 *                           banner_duration:
 *                             type: string
 *                             example: "60 mins"
 *                           banner_min_team:
 *                             type: string
 *                             example: "2-6"
 *                           banner_success_rate:
 *                             type: string
 *                             example: "45%"
 *                           banner_scare_factor:
 *                             type: string
 *                             example: "Low"
 *                           banner_age_group:
 *                             type: string
 *                             example: "12+"
 *                           banner_character:
 *                             type: string
 *                             example: "Explorers"
 *       404:
 *         description: Activity not found
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
 *                   example: "Activity not found"
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
 *                   example: "Failed to fetch activity details"
 *                 error:
 *                   type: string
 *                   example: "Database connection error"
 */
router.get('/:slug', activityApiController.details);

module.exports = router;