const express = require("express");
const router = express.Router();

const controller = require("../../controllers/api/StaticAndTnc.controller");

/**
 * @swagger
 * tags:
 *   name: Static Pages
 *   description: Static Pages & T&C APIs
 */


/**
 * @swagger
 * /api/static/pages:
 *   get:
 *     summary: Get all static pages
 *     tags: [Static Pages]
 *     responses:
 *       200:
 *         description: List of static pages
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
 *                       heading:
 *                         type: string
 *                         example: Privacy Policy
 *                       slug:
 *                         type: string
 *                         example: privacy-policy
 */
router.get("/pages", controller.getAllStaticPages);


/**
 * @swagger
 * /api/static/pages/{slug}:
 *   get:
 *     summary: Get static page by slug
 *     tags: [Static Pages]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         example: privacy-policy
 *     responses:
 *       200:
 *         description: Static page data
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
 *                     heading:
 *                       type: string
 *                       example: Privacy Policy
 *                     content:
 *                       type: string
 *                       example: "<p>HTML content...</p>"
 *                     slug:
 *                       type: string
 *                       example: privacy-policy
 *       404:
 *         description: Page not found
 */
router.get("/pages/:slug", controller.getStaticPage);


/**
 * @swagger
 * /api/static/tnc:
 *   get:
 *     summary: Get all T&C pages
 *     tags: [Static Pages]
 *     responses:
 *       200:
 *         description: List of T&C pages
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
 *                         example: Escaperooms
 *                       reference:
 *                         type: string
 *                         example: escaperooms
 */
router.get("/tnc", controller.getAllTncPages);


/**
 * @swagger
 * /api/static/tnc/{reference}:
 *   get:
 *     summary: Get T&C page by reference
 *     tags: [Static Pages]
 *     parameters:
 *       - in: path
 *         name: reference
 *         required: true
 *         schema:
 *           type: string
 *         example: escaperooms
 *     responses:
 *       200:
 *         description: T&C page data
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
 *                     title:
 *                       type: string
 *                       example: Escaperooms
 *                     content:
 *                       type: string
 *                       example: "<p>Terms and conditions...</p>"
 *                     reference:
 *                       type: string
 *                       example: escaperooms
 *       400:
 *         description: Invalid reference
 *       404:
 *         description: Page not found
 */
router.get("/tnc/:reference", controller.getTncPage);

module.exports = router;