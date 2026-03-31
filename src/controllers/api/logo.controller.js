const db = require('../../../models');

const logoApiController = {
  // GET /api/logos/:type
  getLogosByType: async (req, res) => {
    try {
      const { type } = req.params;
      const baseUrl = `${req.protocol}://${req.get("host")}`;

      // validate type
      if (!['news', 'brands'].includes(type)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid type. Allowed: news, brands',
        });
      }

      const logos = await db.Logo.findAll({
        where: {
          type: type,
          status: true, // only active
        },
        order: [
          ['order', 'ASC'],
          ['createdAt', 'DESC'],
        ],
      });

      const formatted = logos.map((logo) => ({
        id: logo.id,
        title: logo.title,
        link: logo.link,
        image: logo.image ? baseUrl + logo.image : null,
        type: logo.type,
      }));

      return res.json({
        success: true,
        count: formatted.length,
        data: formatted,
      });
    } catch (error) {
      console.error('Public Logo API Error:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch logos',
      });
    }
  },
};

module.exports = logoApiController;