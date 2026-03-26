const db = require("../../../models");
const { Op } = require("sequelize");

// Helper to convert relative image paths to absolute URLs using req.baseUrl
const toAbsoluteUrl = (path, baseUrl) => {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
};

/**
 * GET /api/activities
 * List all active activities (only title, slug, banner_image)
 */
exports.list = async (req, res) => {
  try {
    const activities = await db.Activity.findAll({
      where: { isActive: true },
      order: [['createdAt', 'DESC']],
      attributes: ['title', 'slug', 'banner_image']
    });

    const baseUrl = `${req.protocol}://${req.get('host')}`;

    // Convert banner_image to absolute URL using req.baseUrl (attached by middleware)
    const transformed = activities.map(activity => ({
      title: activity.title,
      slug: activity.slug,
      banner_image: toAbsoluteUrl(activity.banner_image, baseUrl)
    }));

    res.json({
      success: true,
      data: transformed
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to fetch activities', error: error.message });
  }
};

/**
 * GET /api/activities/:slug
 * Get full activity details by slug (includes image cards and escape rooms)
 */
exports.details = async (req, res) => {
  try {
    const { slug } = req.params;

    // Find the activity with its image cards and junction records
    const activity = await db.Activity.findOne({
      where: { slug, isActive: true },
      include: [
        {
          model: db.ActivityImageCard,
          as: 'imageCards',
          order: [['sort_order', 'ASC']],
          attributes: ['id', 'sort_order', 'heading', 'image']
        },
        {
          model: db.ActivityEscapeRoom,
          as: 'escaperooms',
          attributes: ['id', 'escaperoom_type', 'escaperoom_id', 'sort_order']
        }
      ]
    });

    if (!activity) {
      return res.status(404).json({ success: false, message: 'Activity not found' });
    }
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    // Convert main image fields (banner_image, image1, image2, image3) to absolute URLs
    const activityData = activity.toJSON();
    const imageFields = ['banner_image', 'image1', 'image2', 'image3'];
    for (const field of imageFields) {
      if (activityData[field]) {
        activityData[field] = toAbsoluteUrl(activityData[field], baseUrl);
      }
    }

    // Convert image cards images to absolute URLs
    if (activityData.imageCards && Array.isArray(activityData.imageCards)) {
      activityData.imageCards = activityData.imageCards.map(card => ({
        ...card,
        image: toAbsoluteUrl(card.image, baseUrl)
      }));
    }

    // Now fetch the actual escape room details from EscapeRoom and VirtualGame tables
    const physicalIds = [];
    const virtualIds = [];
    if (activityData.escaperooms && Array.isArray(activityData.escaperooms)) {
      for (const junction of activityData.escaperooms) {
        if (junction.escaperoom_type === 'physical') {
          physicalIds.push(junction.escaperoom_id);
        } else if (junction.escaperoom_type === 'virtual') {
          virtualIds.push(junction.escaperoom_id);
        }
      }
    }

    let physicalRooms = [];
    let virtualRooms = [];

    if (physicalIds.length) {
      physicalRooms = await db.EscapeRoom.findAll({
        where: { id: physicalIds, isActive: true },
        attributes: ['id', 'title', 'slug', 'banner_image', 'banner_heading', 'banner_description', 'banner_duration', 'banner_min_team', 'banner_success_rate', 'banner_scare_factor', 'banner_age_group', 'banner_character'] // select needed fields
      });
      physicalRooms = physicalRooms.map(room => ({
        ...room.toJSON(),
        banner_image: toAbsoluteUrl(room.banner_image, baseUrl)
      }));
    }

    if (virtualIds.length) {
      virtualRooms = await db.VirtualGame.findAll({
        where: { id: virtualIds, isActive: true },
        attributes: ['id', 'title', 'slug', 'banner_image', 'banner_heading', 'banner_description', 'capacity', 'success_rate', 'video_trailer']
      });
      virtualRooms = virtualRooms.map(room => ({
        ...room.toJSON(),
        banner_image: toAbsoluteUrl(room.banner_image, baseUrl)
      }));
    }

    // Combine rooms with their sort order from the junction records
    const detailedRooms = [
      ...physicalRooms.map(room => ({ ...room, type: 'physical' })),
      ...virtualRooms.map(room => ({ ...room, type: 'virtual' }))
    ];

    const sortedRooms = [];
    if (activityData.escaperooms) {
      for (const junction of activityData.escaperooms) {
        const room = detailedRooms.find(r => r.id === junction.escaperoom_id && r.type === junction.escaperoom_type);
        if (room) {
          sortedRooms.push({
            ...room,
            sort_order: junction.sort_order
          });
        }
      }
    }

    // Replace the raw junction records with the detailed rooms
    activityData.escaperooms = sortedRooms;

    res.json({
      success: true,
      data: activityData
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to fetch activity details', error: error.message });
  }
};