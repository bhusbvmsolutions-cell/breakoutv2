const express = require('express');
const router = express.Router();

// Import controllers
const escapeRoomController = require('../../controllers/api/escapeRoom.controller');

/**
 * @swagger
 * tags:
 *   name: Escape Room
 *   description: Escape Room management APIs
 */

/**
 * @swagger
 * /api/escaperooms:
 *   get:
 *     summary: Get list of all escape rooms
 *     tags: [Escape Room]
 *     responses:
 *       200:
 *         description: Escape rooms retrieved successfully
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
 *                     rooms:
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
 *                           banner_success_rate:
 *                             type: string
 *                           banner_age_group:
 *                             type: string
 *                           banner_min_team:
 *                             type: string
 *                           banner_duration:
 *                             type: string
 *                           locations:
 *                             type: array
 *                           featured_image:
 *                             type: string
 *                             format: uri
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
 */
router.get('/', escapeRoomController.list);

/**
 * @swagger
 * /api/escaperooms/{slug}:
 *   get:
 *     summary: Get single escape room details by slug or ID
 *     tags: [Escape Room]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: Escape room slug
 *     responses:
 *       200:
 *         description: Escape room details retrieved successfully
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
 *                     tag:
 *                       type: array
 *                       items:
 *                         type: string
 *                     banner_heading:
 *                       type: string
 *                     banner_description:
 *                       type: string
 *                     banner_image:
 *                       type: string
 *                       format: uri
 *                     banner_success_rate:
 *                       type: string
 *                     banner_age_group:
 *                       type: string
 *                     banner_character:
 *                       type: string
 *                     banner_min_team:
 *                       type: string
 *                     banner_scare_factor:
 *                       type: string
 *                     banner_duration:
 *                       type: string
 *                     banner_cta_label:
 *                       type: string
 *                     banner_cta_link:
 *                       type: string
 *                     banner_important_note:
 *                       type: string
 *                     banner_video_trailer:
 *                       type: string
 *                     pricing_note:
 *                       type: string
 *                     pricing_heading:
 *                       type: string
 *                     locations:
 *                       type: array
 *                       items:
 *                         type: object
 *                     gallery:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           url:
 *                             type: string
 *                             format: uri
 *                           sort_order:
 *                             type: integer
 *                     pricing:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           day_range:
 *                             type: string
 *                           price_2_3_players:
 *                             type: string
 *                           price_4_6_players:
 *                             type: string
 *       404:
 *         description: Escape room not found
 *       500:
 *         description: Server error
 */
router.get('/:slug', escapeRoomController.details);

module.exports = router;