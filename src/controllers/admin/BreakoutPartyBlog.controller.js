const db = require("../../../models");
const fs = require("fs");
const path = require("path");
const slugify = require("slugify");
const { Op } = require("sequelize");

function getImageAbsolutePath(storedPath) {
  if (!storedPath) return null;
  const projectRoot = path.join(__dirname, '../../../');
  if (storedPath.startsWith('/')) {
    return path.join(projectRoot, 'public', storedPath);
  }
  return path.join(projectRoot, storedPath);
}

function groupFilesByFieldname(files) {
  const grouped = {};
  if (files && files.length) {
    files.forEach(file => {
      if (!grouped[file.fieldname]) grouped[file.fieldname] = [];
      grouped[file.fieldname].push(file);
    });
  }
  return grouped;
}

/**
 * Converts flat form data with bracket notation into a nested object/array structure.
 * e.g. content_sections[0][heading] => { content_sections: [ { heading: ... } ] }
 */
function parseNestedObject(obj) {
  const result = {};
  for (const key in obj) {
    // Split by brackets, remove empty strings
    const parts = key.split(/[\[\]]+/).filter(p => p !== '');
    if (parts.length === 0) continue;
    let current = result;
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isIndex = /^\d+$/.test(part);
      const nextIsIndex = i + 1 < parts.length && /^\d+$/.test(parts[i + 1]);
      if (i === parts.length - 1) {
        // Last part – set the value
        current[part] = obj[key];
      } else {
        if (nextIsIndex) {
          // The next part is an index – we need to ensure an array exists
          if (!current[part]) current[part] = [];
          current = current[part];
        } else {
          // The next part is a key – ensure an object exists
          if (!current[part]) current[part] = {};
          current = current[part];
        }
      }
    }
  }
  // Convert objects with numeric keys to arrays where appropriate
  function convertArrays(obj) {
    if (Array.isArray(obj)) {
      obj.forEach((item, idx) => {
        convertArrays(item);
      });
      return;
    }
    for (const key in obj) {
      const value = obj[key];
      if (Array.isArray(value)) {
        value.forEach(item => convertArrays(item));
      } else if (typeof value === 'object' && value !== null) {
        // If all keys are numeric and sequential, convert to array
        const keys = Object.keys(value);
        if (keys.length > 0 && keys.every(k => /^\d+$/.test(k))) {
          const arr = [];
          for (let i = 0; i < keys.length; i++) {
            if (value[i] !== undefined) arr[i] = value[i];
          }
          obj[key] = arr;
          convertArrays(obj[key]);
        } else {
          convertArrays(value);
        }
      }
    }
  }
  convertArrays(result);
  return result;
}

const BreakoutPartyBlogController = {
  index: async (req, res) => {
    try {
      const blogs = await db.BreakoutPartyBlog.findAll({
        order: [['createdAt', 'DESC']],
      });
      res.render('admin/breakout-party-blog/index', {
        title: 'Breakout Party Blogs',
        blogs,
        success: req.flash('success'),
        error: req.flash('error'),
      });
    } catch (error) {
      console.error(error);
      req.flash('error', 'Failed to load blogs');
      res.redirect('/admin/dashboard');
    }
  },

  create: async (req, res) => {
    try {
      const videos = await db.Video.findAll({ where: { status: 'active' }, order: [['title', 'ASC']] });
      res.render('admin/breakout-party-blog/create', { title: 'Add Breakout Party Blog', blog: null, videos, errors: {} });
    } catch (error) {
      console.error(error);
      req.flash('error', 'Failed to load create form');
      res.redirect('/admin/breakout-party-blog');
    }
  },

  store: async (req, res) => {
    const transaction = await db.sequelize.transaction();
    try {
      const files = groupFilesByFieldname(req.files);
      const body = req.body;

      if (!body.title) throw new Error('Title is required');
      let slug = body.slug || slugify(body.title, { lower: true, strict: true });
      const existingSlug = await db.BreakoutPartyBlog.findOne({ where: { slug }, transaction });
      if (existingSlug) throw new Error('Slug already exists');

      // Main blog data
      const blogData = {
        title: body.title,
        slug,
        banner_heading: body.banner_heading,
        banner_description: body.banner_description,
        banner_video_id: body.banner_video_id || null,
        banner_content: body.banner_content,
        meta_title: body.meta_title,
        meta_description: body.meta_description,
        meta_keywords: body.meta_keywords,
        og_title: body.og_title,
        og_description: body.og_description,
        isActive: body.isActive === 'on',
      };

      // Featured image
      if (files.featured_image && files.featured_image[0]) {
        blogData.featured_image = `/uploads/breakout-party-blog/${files.featured_image[0].filename}`;
      } else if (body.featured_image) {
        blogData.featured_image = body.featured_image;
      }

      const blog = await db.BreakoutPartyBlog.create(blogData, { transaction });

      // Parse nested form data
      const parsed = parseNestedObject(body);
      const contentSections = parsed.content_sections || [];

      for (let i = 0; i < contentSections.length; i++) {
        const section = contentSections[i];
        const sectionData = {
          blog_id: blog.id,
          heading: section.heading || null,
          description: section.description || null,
          sort_order: i,
          isActive: section.isActive === 'on',
        };
        const createdSection = await db.BreakoutPartyBlogContentSection.create(sectionData, { transaction });

        // Content images
        const contentImages = section.content_images || [];
        for (let j = 0; j < contentImages.length; j++) {
          const img = contentImages[j];
          let imagePath = img.image || '';
          const fileKey = `content_sections[${i}][content_images][${j}][image_file]`;
          const uploadedFile = files[fileKey]?.[0];
          if (uploadedFile) {
            if (imagePath) {
              const oldPath = getImageAbsolutePath(imagePath);
              if (oldPath && fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
            }
            imagePath = `/uploads/breakout-party-blog/${uploadedFile.filename}`;
          }
          await db.BreakoutPartyBlogContentImage.create({
            content_section_id: createdSection.id,
            image: imagePath,
            title: img.title || null,
            link: img.link || null,
            sort_order: j,
            isActive: img.isActive === 'on',
          }, { transaction });
        }

        // Gallery images
        const galleryImages = section.gallery_images || [];
        for (let j = 0; j < galleryImages.length; j++) {
          const gal = galleryImages[j];
          let imagePath = gal.image || '';
          const fileKey = `content_sections[${i}][gallery_images][${j}][image_file]`;
          const uploadedFile = files[fileKey]?.[0];
          if (uploadedFile) {
            if (imagePath) {
              const oldPath = getImageAbsolutePath(imagePath);
              if (oldPath && fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
            }
            imagePath = `/uploads/breakout-party-blog/${uploadedFile.filename}`;
          }
          await db.BreakoutPartyBlogContentGalleryImage.create({
            content_section_id: createdSection.id,
            image: imagePath,
            sort_order: j,
            isActive: gal.isActive === 'on',
          }, { transaction });
        }
      }

      await transaction.commit();
      req.flash('success', 'Blog created successfully');
      res.redirect('/admin/breakout-party-blog');
    } catch (error) {
      await transaction.rollback();
      console.error(error);
      req.flash('error', error.message || 'Failed to create blog');
      res.redirect('/admin/breakout-party-blog/create');
    }
  },

  edit: async (req, res) => {
    try {
      const blog = await db.BreakoutPartyBlog.findByPk(req.params.id, {
        include: [
          { model: db.BreakoutPartyBlogContentSection, as: 'contentSections', order: [['sort_order', 'ASC']],
            include: [
              { model: db.BreakoutPartyBlogContentImage, as: 'contentImages', order: [['sort_order', 'ASC']] },
              { model: db.BreakoutPartyBlogContentGalleryImage, as: 'galleryImages', order: [['sort_order', 'ASC']] },
            ]
          },
          { model: db.Video, as: 'bannerVideo' },
        ],
      });
      if (!blog) {
        req.flash('error', 'Blog not found');
        return res.redirect('/admin/breakout-party-blog');
      }
      const videos = await db.Video.findAll({ where: { status: 'active' }, order: [['title', 'ASC']] });
      res.render('admin/breakout-party-blog/edit', {
        title: 'Edit Breakout Party Blog',
        blog,
        videos,
        errors: {},
      });
    } catch (error) {
      console.error(error);
      req.flash('error', 'Failed to load edit form');
      res.redirect('/admin/breakout-party-blog');
    }
  },

  update: async (req, res) => {
    const transaction = await db.sequelize.transaction();
    try {
      const blog = await db.BreakoutPartyBlog.findByPk(req.params.id, { transaction });
      if (!blog) throw new Error('Blog not found');

      const files = groupFilesByFieldname(req.files);
      const body = req.body;

      const updateData = {
        title: body.title,
        slug: body.slug || slugify(body.title, { lower: true, strict: true }),
        banner_heading: body.banner_heading,
        banner_description: body.banner_description,
        banner_video_id: body.banner_video_id || null,
        banner_content: body.banner_content,
        meta_title: body.meta_title,
        meta_description: body.meta_description,
        meta_keywords: body.meta_keywords,
        og_title: body.og_title,
        og_description: body.og_description,
        isActive: body.isActive === 'on',
      };

      // Featured image
      if (files.featured_image && files.featured_image[0]) {
        if (blog.featured_image) {
          const oldPath = getImageAbsolutePath(blog.featured_image);
          if (oldPath && fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        }
        updateData.featured_image = `/uploads/breakout-party-blog/${files.featured_image[0].filename}`;
      } else if (body.featured_image) {
        updateData.featured_image = body.featured_image;
      }

      if (updateData.slug !== blog.slug) {
        const existing = await db.BreakoutPartyBlog.findOne({ where: { slug: updateData.slug, id: { [Op.ne]: blog.id } }, transaction });
        if (existing) throw new Error('Slug already exists');
      }

      await blog.update(updateData, { transaction });

      // Delete all existing content sections and their nested items
      await db.BreakoutPartyBlogContentSection.destroy({ where: { blog_id: blog.id }, transaction });

      // Parse nested form data
      const parsed = parseNestedObject(body);
      const contentSections = parsed.content_sections || [];

      for (let i = 0; i < contentSections.length; i++) {
        const section = contentSections[i];
        const sectionData = {
          blog_id: blog.id,
          heading: section.heading || null,
          description: section.description || null,
          sort_order: i,
          isActive: section.isActive === 'on',
        };
        const createdSection = await db.BreakoutPartyBlogContentSection.create(sectionData, { transaction });

        // Content images
        const contentImages = section.content_images || [];
        for (let j = 0; j < contentImages.length; j++) {
          const img = contentImages[j];
          let imagePath = img.image || '';
          const fileKey = `content_sections[${i}][content_images][${j}][image_file]`;
          const uploadedFile = files[fileKey]?.[0];
          if (uploadedFile) {
            if (imagePath) {
              const oldPath = getImageAbsolutePath(imagePath);
              if (oldPath && fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
            }
            imagePath = `/uploads/breakout-party-blog/${uploadedFile.filename}`;
          }
          await db.BreakoutPartyBlogContentImage.create({
            content_section_id: createdSection.id,
            image: imagePath,
            title: img.title || null,
            link: img.link || null,
            sort_order: j,
            isActive: img.isActive === 'on',
          }, { transaction });
        }

        // Gallery images
        const galleryImages = section.gallery_images || [];
        for (let j = 0; j < galleryImages.length; j++) {
          const gal = galleryImages[j];
          let imagePath = gal.image || '';
          const fileKey = `content_sections[${i}][gallery_images][${j}][image_file]`;
          const uploadedFile = files[fileKey]?.[0];
          if (uploadedFile) {
            if (imagePath) {
              const oldPath = getImageAbsolutePath(imagePath);
              if (oldPath && fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
            }
            imagePath = `/uploads/breakout-party-blog/${uploadedFile.filename}`;
          }
          await db.BreakoutPartyBlogContentGalleryImage.create({
            content_section_id: createdSection.id,
            image: imagePath,
            sort_order: j,
            isActive: gal.isActive === 'on',
          }, { transaction });
        }
      }

      await transaction.commit();
      req.flash('success', 'Blog updated successfully');
      res.redirect('/admin/breakout-party-blog');
    } catch (error) {
      await transaction.rollback();
      console.error(error);
      req.flash('error', error.message || 'Failed to update blog');
      res.redirect(`/admin/breakout-party-blog/edit/${req.params.id}`);
    }
  },

  view: async (req, res) => {
    try {
      const blog = await db.BreakoutPartyBlog.findByPk(req.params.id, {
        include: [
          { model: db.BreakoutPartyBlogContentSection, as: 'contentSections', order: [['sort_order', 'ASC']],
            include: [
              { model: db.BreakoutPartyBlogContentImage, as: 'contentImages', order: [['sort_order', 'ASC']] },
              { model: db.BreakoutPartyBlogContentGalleryImage, as: 'galleryImages', order: [['sort_order', 'ASC']] },
            ]
          },
          { model: db.Video, as: 'bannerVideo' },
        ],
      });
      if (!blog) {
        req.flash('error', 'Blog not found');
        return res.redirect('/admin/breakout-party-blog');
      }
      res.render('admin/breakout-party-blog/show', { title: blog.title, blog });
    } catch (error) {
      console.error(error);
      req.flash('error', 'Failed to load blog');
      res.redirect('/admin/breakout-party-blog');
    }
  },

  delete: async (req, res) => {
    const transaction = await db.sequelize.transaction();
    try {
      const blog = await db.BreakoutPartyBlog.findByPk(req.params.id, { transaction });
      if (!blog) throw new Error('Blog not found');

      if (blog.featured_image) {
        const featuredPath = getImageAbsolutePath(blog.featured_image);
        if (featuredPath && fs.existsSync(featuredPath)) fs.unlinkSync(featuredPath);
      }

      // All related images will be cascade-deleted, but we need to delete physical files
      const sections = await db.BreakoutPartyBlogContentSection.findAll({ where: { blog_id: blog.id }, transaction });
      for (const section of sections) {
        const images = await db.BreakoutPartyBlogContentImage.findAll({ where: { content_section_id: section.id }, transaction });
        for (const img of images) {
          if (img.image) {
            const imgPath = getImageAbsolutePath(img.image);
            if (imgPath && fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
          }
        }
        const gallery = await db.BreakoutPartyBlogContentGalleryImage.findAll({ where: { content_section_id: section.id }, transaction });
        for (const gal of gallery) {
          if (gal.image) {
            const imgPath = getImageAbsolutePath(gal.image);
            if (imgPath && fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
          }
        }
      }

      await blog.destroy({ transaction });
      await transaction.commit();
      res.json({ success: true, message: 'Blog deleted successfully' });
    } catch (error) {
      await transaction.rollback();
      console.error(error);
      res.status(500).json({ success: false, message: error.message || 'Failed to delete blog' });
    }
  },

  toggleStatus: async (req, res) => {
    try {
      const blog = await db.BreakoutPartyBlog.findByPk(req.params.id);
      if (!blog) return res.status(404).json({ success: false, message: 'Blog not found' });
      blog.isActive = !blog.isActive;
      await blog.save();
      res.json({ success: true, isActive: blog.isActive });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Failed to toggle status' });
    }
  },
};

module.exports = BreakoutPartyBlogController;