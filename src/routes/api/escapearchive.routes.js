const express = require('express');
const router = express.Router();


const escapeRoomArchiveController = require('../../controllers/api/escapeRoomArchive.controller');



/**
 * @swagger
 * /api/escaperoomarchive:
 *   get:
 *     summary: Get escape room archive data
 *     tags: [Escape Room]
 *     description: Returns all archive content including banner, icons, counters, gallery images, and videos
 *     responses:
 *       200:
 *         description: Archive data retrieved successfully
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
 *                     banner_heading:
 *                       type: string
 *                       example: "Escape Room Experience"
 *                     banner_description:
 *                       type: string
 *                       example: "Experience the thrill of our escape rooms"
 *                     banner_image:
 *                       type: string
 *                       format: uri
 *                       nullable: true
 *                     banner_cta_label1:
 *                       type: string
 *                     banner_cta_link1:
 *                       type: string
 *                     banner_cta_label2:
 *                       type: string
 *                     banner_cta_link2:
 *                       type: string
 *                     icon_heading:
 *                       type: string
 *                     icon_description:
 *                       type: string
 *                     counter_heading:
 *                       type: string
 *                     counter_rating:
 *                       type: number
 *                     footer_heading:
 *                       type: string
 *                     footer_description1:
 *                       type: string
 *                     footer_description2:
 *                       type: string
 *                     isActive:
 *                       type: boolean
 *                     icons:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           heading:
 *                             type: string
 *                           image:
 *                             type: string
 *                             format: uri
 *                     counters:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           count:
 *                             type: string
 *                           description:
 *                             type: string
 *                           image:
 *                             type: string
 *                             format: uri
 *                     gallery:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           image:
 *                             type: string
 *                             format: uri
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
 *       404:
 *         description: Archive not found
 *       500:
 *         description: Server error
 */
router.get('/', escapeRoomArchiveController.getArchive);


module.exports = router;