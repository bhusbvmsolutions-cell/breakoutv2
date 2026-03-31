const express = require('express');
const router = express.Router();
const birthdayBlogController = require('../../controllers/api/birthdayBlog.controller');

/**
 * @swagger
 * tags:
 *   name: SEO Blogs
 *   description: SEO Blogs management endpoints
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     IconItem:
 *       type: object
 *       properties:
 *         sort_order:
 *           type: integer
 *           example: 0
 *         heading:
 *           type: string
 *           example: "Premium Decor"
 *         link:
 *           type: string
 *           example: "/decor"
 *         image:
 *           type: string
 *           example: "/uploads/birthday-blog/icon1.png"
 *
 *     Location:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *           example: "Downtown"
 *         slug:
 *           type: string
 *           example: "downtown"
 *         # add other fields from Location model as needed, excluding internal fields
 *
 *     GalleryImage:
 *       type: object
 *       properties:
 *         image:
 *           type: string
 *           example: "/uploads/venues/gallery1.jpg"
 *         sort_order:
 *           type: integer
 *           example: 0
 *
 *     ContentSection:
 *       type: object
 *       properties:
 *         heading:
 *           type: string
 *           example: "Amenities"
 *         content:
 *           type: string
 *           example: "<p>Free Wi-Fi, parking...</p>"
 *         sort_order:
 *           type: integer
 *           example: 0
 *
 *     VenuePublic:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           example: "Grand Hall"
 *         slug:
 *           type: string
 *           example: "grand-hall"
 *         cover_image:
 *           type: string
 *           example: "/uploads/venues/grand-hall.jpg"
 *         rating:
 *           type: number
 *           format: float
 *           example: 4.8
 *         price:
 *           type: integer
 *           example: 250
 *         capacity:
 *           type: integer
 *           example: 200
 *         address:
 *           type: string
 *           example: "123 Main St"
 *         google_map:
 *           type: string
 *           example: "https://maps.google.com/..."
 *         is_featured:
 *           type: boolean
 *           example: true
 *         locations:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Location'
 *         galleryImages:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/GalleryImage'
 *         contentSections:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ContentSection'
 *
 *     SEOBlog:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *           example: "Best Birthday Venues"
 *         slug:
 *           type: string
 *           example: "best-birthday-venues"
 *         featured_image:
 *           type: string
 *           example: "/uploads/birthday-blog/featured.jpg"
 *         banner_heading:
 *           type: string
 *           example: "Celebrate in Style"
 *         banner_description:
 *           type: string
 *           example: "Find the perfect venue..."
 *         banner_image:
 *           type: string
 *           example: "/uploads/birthday-blog/banner.jpg"
 *         banner_content:
 *           type: string
 *           example: "<p>Detailed content...</p>"
 *         glance_heading:
 *           type: string
 *           example: "At a Glance"
 *         glance_content:
 *           type: string
 *           example: "<ul><li>...</li></ul>"
 *         icons_heading:
 *           type: string
 *           example: "Why Choose Us"
 *         icons_description:
 *           type: string
 *           example: "We offer..."
 *         footer_heading:
 *           type: string
 *           example: "Book Now"
 *         footer_content:
 *           type: string
 *           example: "Contact us today!"
 *         meta_title:
 *           type: string
 *           example: "Best Birthday Venues - SEO Title"
 *         meta_description:
 *           type: string
 *           example: "Discover top birthday venues..."
 *         meta_keywords:
 *           type: string
 *           example: "birthday, venues, party"
 *         og_title:
 *           type: string
 *           example: "Best Birthday Venues"
 *         og_description:
 *           type: string
 *           example: "Open Graph description"
 *         iconItems:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/IconItem'
 *         mappedVenues:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/VenuePublic'
 *
 *     SEOBlogDetail:
 *       allOf:
 *         - $ref: '#/components/schemas/SEOBlog'
 *         - type: object
 *           # No extra fields – SEOBlog already includes mappedVenues
 */

/**
 * @swagger
 * /api/seo-blogs:
 *   get:
 *     summary: Get all active SEO blogs with their icon items and associated venues
 *     tags: [SEO Blogs]
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
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/SEOBlog'
 *       500:
 *         description: Server error
 */
router.get('/', birthdayBlogController.getPublicBlogs);

/**
 * @swagger
 * /api/seo-blogs/{slug}:
 *   get:
 *     summary: Get a single SEO blog by its slug, including icon items and mapped venues with full details (locations, gallery images, content sections)
 *     tags: [SEO Blogs]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: URL-friendly slug of the blog
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
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/SEOBlogDetail'
 *       404:
 *         description: Blog not found
 *       500:
 *         description: Server error
 */
router.get('/:slug', birthdayBlogController.getPublicBlogBySlug);

module.exports = router;