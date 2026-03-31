const db = require('../../../models');
const { BirthdayBlog, Venue } = db;

// Helper to prepend base URL from request
const withBaseUrl = (path, baseUrl) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
};

// Recursively add base URL to media fields in a plain object/array
const addBaseUrlToMedia = (data, baseUrl) => {
  if (!data) return data;
  if (Array.isArray(data)) {
    return data.map(item => addBaseUrlToMedia(item, baseUrl));
  }
  if (typeof data === 'object') {
    const result = { ...data };
    // Media fields that need base URL
    const mediaFields = [
      'featured_image', 'banner_image', 'image', 'cover_image',
      'icon', 'thumbnail', 'avatar', 'video_url', 'url'
    ];
    for (const key of Object.keys(result)) {
      if (mediaFields.includes(key) && typeof result[key] === 'string') {
        result[key] = withBaseUrl(result[key], baseUrl);
      } else if (typeof result[key] === 'object') {
        result[key] = addBaseUrlToMedia(result[key], baseUrl);
      }
    }
    return result;
  }
  return data;
};

// Fields to exclude from the main blog response
const blogExcludes = ['id', 'createdAt', 'updatedAt', 'isActive'];

// Fields to exclude from every Venue and its nested associations
const venueExcludes = ['createdAt', 'updatedAt', 'isActive', 'VenueId', 'venue_id'];

// Common Venue include configuration (reusable)
const venueIncludes = [
  {
    model: db.Location,
    as: 'locations',
    through: { attributes: [] },
    required: false,
    attributes: { exclude: venueExcludes }
  },
  {
    model: db.VenueImage,
    as: 'galleryImages',
    required: false,
    attributes: { exclude: venueExcludes }
  },
  {
    model: db.VenueContentSection,
    as: 'contentSections',
    required: false,
    attributes: { exclude: venueExcludes }
  }
];

exports.getPublicBlogs = async (req, res) => {
  try {
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const blogs = await BirthdayBlog.findAll({
      where: { isActive: true },
      attributes: { exclude: blogExcludes },
      include: [
        {
          model: db.BirthdayBlogIconItem,
          as: 'iconItems',
          required: false,
          attributes: { exclude: ['id', 'blog_id', 'createdAt', 'updatedAt'] }
        },
        {
          model: Venue,
          as: 'mappedVenues',
          through: { attributes: [] },
          required: false,
          attributes: { exclude: venueExcludes },
          include: venueIncludes
        }
      ],
      order: [['createdAt', 'DESC']],
    });

    // Convert to plain JSON and add base URL to media
    const plainBlogs = blogs.map(blog => blog.toJSON());
    const dataWithBaseUrl = addBaseUrlToMedia(plainBlogs, baseUrl);

    res.json({
      success: true,
      data: dataWithBaseUrl,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getPublicBlogBySlug = async (req, res) => {
  try {
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const { slug } = req.params;
    const blog = await BirthdayBlog.findOne({
      where: { slug, isActive: true },
      attributes: { exclude: blogExcludes },
      include: [
        {
          model: db.BirthdayBlogIconItem,
          as: 'iconItems',
          required: false,
          attributes: { exclude: ['id', 'blog_id', 'createdAt', 'updatedAt'] }
        },
        {
          model: Venue,
          as: 'mappedVenues',
          through: { attributes: [] },
          required: false,
          attributes: { exclude: venueExcludes },
          include: venueIncludes
        }
      ],
    });

    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }

    // Convert to plain JSON and add base URL
    const plainBlog = blog.toJSON();
    const dataWithBaseUrl = addBaseUrlToMedia(plainBlog, baseUrl);
    res.json({ success: true, data: dataWithBaseUrl });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};