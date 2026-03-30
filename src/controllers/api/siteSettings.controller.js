const db = require("../../../models");


/**
 * Get the site settings.
 * Since only one settings record should exist, we fetch the first row.
 * If none exists, we create a default one.
*/
exports.getSettings = async (req, res) => {
  try {
    let settings = await db.SiteSettings.findOne({
      attributes: { exclude: ['id', 'isActive', 'createdAt', 'updatedAt'] }
    });
    
    // If no settings exist, create default ones
    if (!settings) {
      settings = await db.SiteSettings.create({});
    }
    
    let data = settings.toJSON();
    const baseUrl = `${req.protocol}://${req.get('host')}`;

    // Append full URL to siteLogo
    if (data.siteLogo) {
      data.siteLogo = `${baseUrl}${data.siteLogo}`;
    }
    
    if (data.siteFavicon) {
      data.siteFavicon = `${baseUrl}${data.siteFavicon}`;
    }

    return res.status(200).json({
      success: true,
      data: data,
    });
  } catch (error) {
    console.error('Error fetching site settings:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve site settings',
      error: error.message,
    });
  }
};