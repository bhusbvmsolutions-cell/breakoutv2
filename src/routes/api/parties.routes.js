const express = require("express");
const router = express.Router();

const partiesController = require("../../controllers/api/parties.controller");

/**
 * @swagger
 * tags:
 *   name: Parties
 *   description: Parties management endpoints
 */

/**
 * @swagger
 * /api/parties/archive:
 *   get:
 *     summary: Get Party Archive data
 *     tags: [Parties]
 *     responses:
 *       200:
 *         description: Party archive fetched successfully
 */
router.get("/archive", partiesController.getPartyArchive);

/**
 * @swagger
 * /api/parties/birthday/archive:
 *   get:
 *     summary: Get Birthday Archive data
 *     tags: [Parties]
 *     responses:
 *       200:
 *         description: Birthday archive fetched successfully
 */
router.get("/birthday/archive", partiesController.getBirthdayArchive);

/**
 * @swagger
 * /api/parties/bachelor/archive:
 *   get:
 *     summary: Get Bachelor Archive data
 *     tags: [Parties]
 *     responses:
 *       200:
 *         description: Bachelor archive fetched successfully
 */
router.get("/bachelor/archive", partiesController.getBachelorArchive);

/**
 * @swagger
 * /api/parties/farewell/archive:
 *   get:
 *     summary: Get Farewell Archive data
 *     tags: [Parties]
 *     responses:
 *       200:
 *         description: Farewell archive fetched successfully
 */
router.get("/farewell/archive", partiesController.getFarewellArchive);

/**
 * @swagger
 * /api/parties/birthday/pages:
 *   get:
 *     summary: Get Birthday Pages data
 *     tags: [Parties]
 *     responses:
 *       200:
 *         description: Birthday pages fetched successfully
 */
router.get("/birthday/pages", partiesController.getBirthDayPageList);

/**
 * @swagger
 * /api/parties/birthday/pages/{slug}:
 *   get:
 *     summary: Get Birthday Page Detail data
 *     tags: [Parties]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *           description: Birthday Page slug
 *     responses:
 *       200:
 *         description: Birthday page Detail fetched successfully
 */
router.get("/birthday/pages/:slug", partiesController.getBirthDayPageDetails);

module.exports = router;
