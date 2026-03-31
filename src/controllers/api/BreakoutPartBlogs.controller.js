const db = require('../../../models');
const { BreakoutPartyBlog } = db;

// Helper to prepend base URL from request
const withBaseUrl = (path, baseUrl) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  return `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
};

// Recursively convert all image/video fields in a plain object or array (no circular refs)
const addBaseUrlToMedia = (data, baseUrl) => {
  if (!data) return data;
  if (Array.isArray(data)) {
    return data.map(item => addBaseUrlToMedia(item, baseUrl));
  }
  if (typeof data === 'object') {
    const result = { ...data };
    // Fields that contain media URLs
    const mediaFields = [
      'featured_image', 'image', 'cover_image', 'banner_image',
      'banner_video', 'video', 'thumbnail', 'avatar', 'url'
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

// Fields to exclude from main blog
const blogExcludes = ['id', 'createdAt', 'updatedAt', 'isActive'];

// Fields to exclude from sections and images
const sectionExcludes = ['id', 'blog_id', 'createdAt', 'updatedAt', 'isActive'];
const imageExcludes = ['id', 'content_section_id', 'createdAt', 'updatedAt', 'isActive'];

// Common include for content sections with nested images
const contentIncludes = [
  {
    model: db.BreakoutPartyBlogContentSection,
    as: 'contentSections',
    required: false,
    attributes: { exclude: sectionExcludes },
    include: [
      {
        model: db.BreakoutPartyBlogContentImage,
        as: 'contentImages',
        required: false,
        attributes: { exclude: imageExcludes }
      },
      {
        model: db.BreakoutPartyBlogContentGalleryImage,
        as: 'galleryImages',
        required: false,
        attributes: { exclude: imageExcludes }
      }
    ]
  },
  {
    model: db.Video,
    as: 'bannerVideo',
    required: false,
    attributes: { exclude: ['id', 'createdAt', 'updatedAt', 'status'] }
  }
];

exports.getPublicBlogs = async (req, res) => {
  try {
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const blogs = await BreakoutPartyBlog.findAll({
      where: { isActive: true },
      attributes: { exclude: blogExcludes },
      include: contentIncludes,
      order: [['createdAt', 'DESC']]
    });

    // Convert Sequelize instances to plain JSON to avoid circular references
    const plainBlogs = blogs.map(blog => blog.toJSON());
    const dataWithBaseUrl = addBaseUrlToMedia(plainBlogs, baseUrl);

    res.json({
      success: true,
      data: dataWithBaseUrl
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
    const blog = await BreakoutPartyBlog.findOne({
      where: { slug, isActive: true },
      attributes: { exclude: blogExcludes },
      include: contentIncludes
    });

    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }

    // Convert to plain JSON
    const plainBlog = blog.toJSON();
    const dataWithBaseUrl = addBaseUrlToMedia(plainBlog, baseUrl);
    res.json({ success: true, data: dataWithBaseUrl });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};