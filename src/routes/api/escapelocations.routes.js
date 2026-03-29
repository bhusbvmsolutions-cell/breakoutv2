const express = require('express');
const router = express.Router();


const escapeRoomLocationController = require('../../controllers/api/escapeRoomLocation.controller');





/**
 * @swagger
 * /api/escaperoomlocations:
 *   get:
 *     summary: Get all active escape room locations
 *     tags: [Escape Room]
 *     responses:
 *       200:
 *         description: Locations retrieved successfully
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
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       title:
 *                         type: string
 *                         example: "Jaipur Escape Room"
 *                       slug:
 *                         type: string
 *                         example: "jaipur-escape-room"
 *                       banner_featured_image:
 *                         type: string
 *                         format: uri
 *                         example: "http://localhost:3000/uploads/image.jpg"
 *       500:
 *         description: Server error
 */
router.get('/', escapeRoomLocationController.list);


/**
 * @swagger
 * /api/escaperoomlocations/{slug}:
 *   get:
 *     summary: Get single location details slug
 *     tags: [Escape Room]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: Location slug
 *     responses:
 *       200:
 *         description: Location details retrieved successfully
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
 *                     title:
 *                       type: string
 *                     slug:
 *                       type: string
 *                     banner_heading:
 *                       type: string
 *                     banner_description:
 *                       type: string
 *                     banner_featured_image:
 *                       type: string
 *                       format: uri
 *                     banner_video:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                         title:
 *                           type: string
 *                         thumbnail:
 *                           type: string
 *                         url:
 *                           type: string
 *                         duration:
 *                           type: string
 *                     banner_cta_label:
 *                       type: string
 *                     banner_cta_link:
 *                       type: string
 *                     trailor_video:
 *                       type: string
 *                     text_section_description:
 *                       type: string
 *                     pricing_section_heading:
 *                       type: string
 *                     pricing_section_note:
 *                       type: string
 *                     location_details:
 *                       type: object
 *                       properties:
 *                         city:
 *                           type: string
 *                         timings:
 *                           type: string
 *                         total_capacity:
 *                           type: integer
 *                         parking_info:
 *                           type: string
 *                         parking_video_link:
 *                           type: string
 *                         address:
 *                           type: string
 *                         map_url:
 *                           type: string
 *                     image_cards_heading:
 *                       type: string
 *                     footer_heading:
 *                       type: string
 *                     footer_description1:
 *                       type: string
 *                     footer_description2:
 *                       type: string
 *                     pricings:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           day_range:
 *                             type: string
 *                           price_23:
 *                             type: string
 *                           price_46:
 *                             type: string
 *                     event_spaces:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           space_name:
 *                             type: string
 *                           capacity:
 *                             type: integer
 *                           style:
 *                             type: string
 *                     image_cards:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           heading:
 *                             type: string
 *                           description:
 *                             type: string
 *                           image:
 *                             type: string
 *                             format: uri
 *                           cta_label:
 *                             type: string
 *                           cta_link:
 *                             type: string
 *                     videos:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           title:
 *                             type: string
 *                           video_id:
 *                             type: integer
 *                           thumbnail:
 *                             type: string
 *                           url:
 *                             type: string
 *                           duration:
 *                             type: string
 *                     escape_rooms:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           title:
 *                             type: string
 *                           slug:
 *                             type: string
 *                           banner_heading:
 *                             type: string
 *                           banner_description:
 *                             type: string
 *                           banner_image:
 *                             type: string
 *                             format: uri
 *       404:
 *         description: Location not found
 *       500:
 *         description: Server error
 */
router.get('/:slug', escapeRoomLocationController.details);

module.exports = router;