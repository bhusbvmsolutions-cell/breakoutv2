const express = require("express");
const router = express.Router();

const virtualController = require("../../controllers/api/virtual.controller");


/**
 * @swagger
 * tags:
 *   name: Virtual
 *   description: Virtual management endpoints
 */



/**
 * @swagger
 * /api/virtual/archive:
 *   get:
 *     summary: Get Virtual Archive data
 *     tags: [Virtual]
 *     responses:
 *       200:
 *         description: Virtual archive fetched successfully
 */
router.get("/archive", virtualController.getArchive);




/**
 * @swagger
 * /api/virtual/rooms:
 *   get:
 *     summary: Get Virtual Rooms list
 *     tags: [Virtual]
 *     responses:
 *       200:
 *         description: Virtual rooms fetched successfully
 */
router.get("/rooms", virtualController.getRooms);



/**
 * @swagger
 * /api/virtual/room/{slug}:
 *   get:
 *     summary: Get Virtual Rooms data
 *     tags: [Virtual]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *           description: Virtual Room slug
 *     responses:
 *       200:
 *         description: Virtual rooms fetched successfully
 */
router.get("/room/:slug", virtualController.getRoomDetail);



module.exports = router;