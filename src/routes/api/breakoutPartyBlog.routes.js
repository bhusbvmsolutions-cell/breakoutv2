const express = require('express');
const router = express.Router();
const breakoutPartyBlogController = require('../../controllers/api/BreakoutPartBlogs.controller');

/**
 * @swagger
 * tags:
 *   name: Breakout Party Blogs
 *   description: Public Breakout Party Blog endpoints
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     BreakoutPartyBlogImage:
 *       type: object
 *       properties:
 *         image:
 *           type: string
 *           example: "https://yourdomain.com/uploads/breakout-party-blog/img.jpg"
 *         title:
 *           type: string
 *           example: "Image title"
 *         link:
 *           type: string
 *           example: "https://example.com"
 *         sort_order:
 *           type: integer
 *
 *     BreakoutPartyBlogGalleryImage:
 *       type: object
 *       properties:
 *         image:
 *           type: string
 *         sort_order:
 *           type: integer
 *
 *     BreakoutPartyBlogContentSection:
 *       type: object
 *       properties:
 *         heading:
 *           type: string
 *         description:
 *           type: string
 *         sort_order:
 *           type: integer
 *         contentImages:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/BreakoutPartyBlogImage'
 *         galleryImages:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/BreakoutPartyBlogGalleryImage'
 *
 *     BreakoutPartyBlogVideo:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *         video_url:
 *           type: string
 *         thumbnail:
 *           type: string
 *         duration:
 *           type: string
 *
 *     BreakoutPartyBlog:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *         slug:
 *           type: string
 *         featured_image:
 *           type: string
 *         banner_heading:
 *           type: string
 *         banner_description:
 *           type: string
 *         banner_video:
 *           $ref: '#/components/schemas/BreakoutPartyBlogVideo'
 *         banner_content:
 *           type: string
 *         meta_title:
 *           type: string
 *         meta_description:
 *           type: string
 *         meta_keywords:
 *           type: string
 *         og_title:
 *           type: string
 *         og_description:
 *           type: string
 *         contentSections:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/BreakoutPartyBlogContentSection'
 */

/**
 * @swagger
 * /api/breakout-party-blogs:
 *   get:
 *     summary: Get all active Breakout Party Blogs with content sections and images
 *     tags: [Breakout Party Blogs]
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/BreakoutPartyBlog'
 *       500:
 *         description: Server error
 */
router.get('/', breakoutPartyBlogController.getPublicBlogs);

/**
 * @swagger
 * /api/breakout-party-blogs/{slug}:
 *   get:
 *     summary: Get a single Breakout Party Blog by slug
 *     tags: [Breakout Party Blogs]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: URL slug of the blog
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/BreakoutPartyBlog'
 *       404:
 *         description: Blog not found
 *       500:
 *         description: Server error
 */
router.get('/:slug', breakoutPartyBlogController.getPublicBlogBySlug);

module.exports = router;