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

const BirthdayBlogController = {
  index: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 12;
      const offset = (page - 1) * limit;
      const search = req.query.search || "";
      const status = req.query.status || "";
      const sort = req.query.sort || "latest";

      const where = {};
      if (search) {
        where[Op.or] = [
          { title: { [Op.like]: `%${search}%` } },
          { slug: { [Op.like]: `%${search}%` } },
        ];
      }
      if (status === "active") {
        where.isActive = true;
      } else if (status === "inactive") {
        where.isActive = false;
      }

      let order = [["createdAt", "DESC"]];
      if (sort === "oldest") order = [["createdAt", "ASC"]];
      else if (sort === "title_asc") order = [["title", "ASC"]];
      else if (sort === "title_desc") order = [["title", "DESC"]];

      const { count, rows: blogs } = await db.BirthdayBlog.findAndCountAll({
        where,
        order,
        limit,
        offset,
        distinct: true,
      });

      const totalPages = Math.ceil(count / limit);

      res.render('admin/birthday-blog/index', {
        title: 'Birthday Blogs',
        blogs,
        pagination: {
          page,
          limit,
          totalPages,
          totalCount: count,
        },
        filters: { search, status, sort },
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
      res.render('admin/birthday-blog/create', { title: 'Add Birthday Blog', blog: null, errors: {} });
    } catch (error) {
      console.error(error);
      req.flash('error', 'Failed to load create form');
      res.redirect('/admin/birthday-blog');
    }
  },

  store: async (req, res) => {
    const transaction = await db.sequelize.transaction();
    try {
      const files = groupFilesByFieldname(req.files);
      const body = req.body;

      if (!body.title) throw new Error('Title is required');
      let slug = body.slug || slugify(body.title, { lower: true, strict: true });
      const existingSlug = await db.BirthdayBlog.findOne({ where: { slug }, transaction });
      if (existingSlug) throw new Error('Slug already exists');

      const blogData = {
        title: body.title,
        slug,
        banner_heading: body.banner_heading,
        banner_description: body.banner_description,
        banner_content: body.banner_content,
        glance_heading: body.glance_heading,
        glance_content: body.glance_content,
        icons_heading: body.icons_heading,
        icons_description: body.icons_description,
        footer_heading: body.footer_heading,
        footer_content: body.footer_content,
        meta_title: body.meta_title,
        meta_description: body.meta_description,
        meta_keywords: body.meta_keywords,
        og_title: body.og_title,
        og_description: body.og_description,
        isActive: body.isActive === 'on',
      };

      // Featured image
      if (files.featured_image && files.featured_image[0]) {
        blogData.featured_image = `/uploads/birthday-blog/${files.featured_image[0].filename}`;
      } else if (body.featured_image) {
        blogData.featured_image = body.featured_image;
      }

      // Banner image
      if (files.banner_image && files.banner_image[0]) {
        blogData.banner_image = `/uploads/birthday-blog/${files.banner_image[0].filename}`;
      } else if (body.banner_image) {
        blogData.banner_image = body.banner_image;
      }

      const blog = await db.BirthdayBlog.create(blogData, { transaction });

      // Icon items
      if (body.icon_items && Array.isArray(body.icon_items)) {
        for (let i = 0; i < body.icon_items.length; i++) {
          const item = body.icon_items[i];
          const imageFile = files[`icon_items[${i}][image]`]?.[0];
          let imagePath = item.image || '';
          if (imageFile) {
            if (imagePath) {
              const oldPath = getImageAbsolutePath(imagePath);
              if (oldPath && fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
            }
            imagePath = `/uploads/birthday-blog/${imageFile.filename}`;
          }
          await db.BirthdayBlogIconItem.create({
            blog_id: blog.id,
            sort_order: i,
            heading: item.heading,
            link: item.link,
            image: imagePath,
          }, { transaction });
        }
      }

      await transaction.commit();
      req.flash('success', 'Blog created successfully');
      res.redirect('/admin/birthday-blog');
    } catch (error) {
      await transaction.rollback();
      console.error(error);
      req.flash('error', error.message || 'Failed to create blog');
      res.redirect('/admin/birthday-blog/create');
    }
  },

  edit: async (req, res) => {
    try {
      const blog = await db.BirthdayBlog.findByPk(req.params.id, {
        include: [{ model: db.BirthdayBlogIconItem, as: 'iconItems', order: [['sort_order', 'ASC']] }],
      });
      if (!blog) {
        req.flash('error', 'Blog not found');
        return res.redirect('/admin/birthday-blog');
      }
      res.render('admin/birthday-blog/edit', { title: 'Edit Birthday Blog', blog, errors: {} });
    } catch (error) {
      console.error(error);
      req.flash('error', 'Failed to load edit form');
      res.redirect('/admin/birthday-blog');
    }
  },

  update: async (req, res) => {
    const transaction = await db.sequelize.transaction();
    try {
      const blog = await db.BirthdayBlog.findByPk(req.params.id, { transaction });
      if (!blog) throw new Error('Blog not found');

      const files = groupFilesByFieldname(req.files);
      const body = req.body;

      const updateData = {
        title: body.title,
        slug: body.slug || slugify(body.title, { lower: true, strict: true }),
        banner_heading: body.banner_heading,
        banner_description: body.banner_description,
        banner_content: body.banner_content,
        glance_heading: body.glance_heading,
        glance_content: body.glance_content,
        icons_heading: body.icons_heading,
        icons_description: body.icons_description,
        footer_heading: body.footer_heading,
        footer_content: body.footer_content,
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
        updateData.featured_image = `/uploads/birthday-blog/${files.featured_image[0].filename}`;
      } else if (body.featured_image) {
        updateData.featured_image = body.featured_image;
      }

      // Banner image
      if (files.banner_image && files.banner_image[0]) {
        if (blog.banner_image) {
          const oldPath = getImageAbsolutePath(blog.banner_image);
          if (oldPath && fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        }
        updateData.banner_image = `/uploads/birthday-blog/${files.banner_image[0].filename}`;
      } else if (body.banner_image) {
        updateData.banner_image = body.banner_image;
      }

      if (updateData.slug !== blog.slug) {
        const existing = await db.BirthdayBlog.findOne({ where: { slug: updateData.slug, id: { [Op.ne]: blog.id } }, transaction });
        if (existing) throw new Error('Slug already exists');
      }

      await blog.update(updateData, { transaction });

      // Update icon items
      await db.BirthdayBlogIconItem.destroy({ where: { blog_id: blog.id }, transaction });
      if (body.icon_items && Array.isArray(body.icon_items)) {
        for (let i = 0; i < body.icon_items.length; i++) {
          const item = body.icon_items[i];
          const imageFile = files[`icon_items[${i}][image]`]?.[0];
          let imagePath = item.image || '';
          if (imageFile) {
            if (imagePath) {
              const oldPath = getImageAbsolutePath(imagePath);
              if (oldPath && fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
            }
            imagePath = `/uploads/birthday-blog/${imageFile.filename}`;
          }
          await db.BirthdayBlogIconItem.create({
            blog_id: blog.id,
            sort_order: i,
            heading: item.heading,
            link: item.link,
            image: imagePath,
          }, { transaction });
        }
      }

      await transaction.commit();
      req.flash('success', 'Blog updated successfully');
      res.redirect('/admin/birthday-blog');
    } catch (error) {
      await transaction.rollback();
      console.error(error);
      req.flash('error', error.message || 'Failed to update blog');
      res.redirect(`/admin/birthday-blog/edit/${req.params.id}`);
    }
  },

  view: async (req, res) => {
    try {
      const blog = await db.BirthdayBlog.findByPk(req.params.id, {
        include: [{ model: db.BirthdayBlogIconItem, as: 'iconItems', order: [['sort_order', 'ASC']] }],
      });
      if (!blog) {
        req.flash('error', 'Blog not found');
        return res.redirect('/admin/birthday-blog');
      }
      res.render('admin/birthday-blog/show', { title: blog.title, blog });
    } catch (error) {
      console.error(error);
      req.flash('error', 'Failed to load blog');
      res.redirect('/admin/birthday-blog');
    }
  },

  delete: async (req, res) => {
    const transaction = await db.sequelize.transaction();
    try {
      const blog = await db.BirthdayBlog.findByPk(req.params.id, { transaction });
      if (!blog) throw new Error('Blog not found');

      if (blog.featured_image) {
        const featuredPath = getImageAbsolutePath(blog.featured_image);
        if (featuredPath && fs.existsSync(featuredPath)) fs.unlinkSync(featuredPath);
      }
      if (blog.banner_image) {
        const bannerPath = getImageAbsolutePath(blog.banner_image);
        if (bannerPath && fs.existsSync(bannerPath)) fs.unlinkSync(bannerPath);
      }

      const iconItems = await db.BirthdayBlogIconItem.findAll({ where: { blog_id: blog.id }, transaction });
      for (const item of iconItems) {
        if (item.image) {
          const imgPath = getImageAbsolutePath(item.image);
          if (imgPath && fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
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
      const blog = await db.BirthdayBlog.findByPk(req.params.id);
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

module.exports = BirthdayBlogController;