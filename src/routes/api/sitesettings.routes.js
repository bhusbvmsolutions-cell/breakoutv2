const express = require('express');
const router = express.Router();
const siteSettingsController = require('../../controllers/api/siteSettings.controller');








/**
 * @swagger
 * tags:
 *   name: SiteSettings
 *   description: Site configuration and settings management
 */

/**
 * @swagger
 * /api/sitesettings:
 *   get:
 *     summary: Get site settings
 *     tags: [SiteSettings]
 *     description: Returns the current site configuration including contact details, social media links, logos, and maintenance settings
 *     responses:
 *       200:
 *         description: Successfully retrieved site settings
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
 *                     siteName:
 *                       type: string
 *                       example: "Adventure Escape Rooms"
 *                       nullable: true
 *                     siteTagline:
 *                       type: string
 *                       example: "Unlock the Adventure"
 *                       nullable: true
 *                     siteDescription:
 *                       type: string
 *                       example: "Experience the thrill of escape rooms and team building activities"
 *                       nullable: true
 *                     siteLogo:
 *                       type: string
 *                       format: uri
 *                       example: "https://yourdomain.com/uploads/logo.png"
 *                       nullable: true
 *                     siteFavicon:
 *                       type: string
 *                       format: uri
 *                       example: "https://yourdomain.com/uploads/favicon.ico"
 *                       nullable: true
 *                     contactEmail:
 *                       type: string
 *                       format: email
 *                       example: "info@adventureescape.com"
 *                       nullable: true
 *                     contactPhone:
 *                       type: string
 *                       example: "+1 (555) 123-4567"
 *                       nullable: true
 *                     alternatePhone:
 *                       type: string
 *                       example: "+1 (555) 987-6543"
 *                       nullable: true
 *                     whatsappNumber:
 *                       type: string
 *                       example: "+1 (555) 123-4567"
 *                       nullable: true
 *                     address:
 *                       type: string
 *                       example: "123 Adventure St, Entertainment City, EC 12345"
 *                       nullable: true
 *                     facebookUrl:
 *                       type: string
 *                       format: uri
 *                       example: "https://facebook.com/adventureescape"
 *                       nullable: true
 *                     twitterUrl:
 *                       type: string
 *                       format: uri
 *                       example: "https://twitter.com/adventureescape"
 *                       nullable: true
 *                     instagramUrl:
 *                       type: string
 *                       format: uri
 *                       example: "https://instagram.com/adventureescape"
 *                       nullable: true
 *                     linkedinUrl:
 *                       type: string
 *                       format: uri
 *                       example: "https://linkedin.com/company/adventureescape"
 *                       nullable: true
 *                     youtubeUrl:
 *                       type: string
 *                       format: uri
 *                       example: "https://youtube.com/@adventureescape"
 *                       nullable: true
 *                     maintenanceMode:
 *                       type: boolean
 *                       example: false
 *                       description: "Whether the site is in maintenance mode"
 *                     maintenanceMessage:
 *                       type: string
 *                       example: "We're currently upgrading our experience. Back in 2 hours!"
 *                       nullable: true
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-01-01T00:00:00.000Z"
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-03-15T10:30:00.000Z"
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
 *                   example: "Failed to retrieve site settings"
 *                 error:
 *                   type: string
 *                   example: "Database connection error"
 */
router.get('/', siteSettingsController.getSettings);


module.exports = router;