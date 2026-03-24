const db = require("../../../models");
const fs = require("fs");
const path = require("path");
const slugify = require("slugify");

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

const CorporateLdInnerPageController = {
  // List all pages
  index: async (req, res) => {
    try {
      const pages = await db.CorporateLdInnerPage.findAll({
        order: [['createdAt', 'DESC']],
        include: [{ model: db.Video, as: 'videos', through: { attributes: [] } }],
      });
      res.render('admin/corporate/ld/inner/index', {
        title: 'Corporate L&D Inner Pages',
        pages,
        success: req.flash('success'),
        error: req.flash('error'),
      });
    } catch (error) {
      console.error(error);
      req.flash('error', 'Failed to load pages');
      res.redirect('/admin/dashboard');
    }
  },

  // Show create form
  create: async (req, res) => {
    try {
      const videos = await db.Video.findAll({ where: { status: 'active' }, order: [['title', 'ASC']] });
      res.render('admin/corporate/ld/inner/create', { title: 'Add Corporate L&D Inner Page', videos, page: null, errors: {} });
    } catch (error) {
      console.error(error);
      req.flash('error', 'Failed to load create form');
      res.redirect('/admin/corporate/ld/inner');
    }
  },

  // Store new page
  store: async (req, res) => {
    const transaction = await db.sequelize.transaction();
    try {
      const files = groupFilesByFieldname(req.files);
      const body = req.body;

      if (!body.title) throw new Error('Title is required');
      let slug = body.slug || slugify(body.title, { lower: true, strict: true });
      const existingSlug = await db.CorporateLdInnerPage.findOne({ where: { slug }, transaction });
      if (existingSlug) throw new Error('Slug already exists');

      const pageData = {
        title: body.title,
        slug,
        banner_heading: body.banner_heading,
        banner_description: body.banner_description,
        content: body.content,
        image_card_heading: body.image_card_heading,
        image_card_description: body.image_card_description,
        points_heading: body.points_heading,
        points_description: body.points_description,
        key_resources_heading: body.key_resources_heading,
        isActive: body.isActive === 'on',
      };

      if (files.banner_image && files.banner_image[0]) {
        pageData.banner_image = `/uploads/corporate-ld-inner/${files.banner_image[0].filename}`;
      } else if (body.banner_image) {
        pageData.banner_image = body.banner_image;
      }

      const page = await db.CorporateLdInnerPage.create(pageData, { transaction });

      async function replaceCollection(model, items, fieldMap, fileMap) {
        await model.destroy({ where: { page_id: page.id }, transaction });
        if (items && Array.isArray(items)) {
          for (let i = 0; i < items.length; i++) {
            const data = { page_id: page.id, sort_order: i };
            for (const [src, dest] of Object.entries(fieldMap)) {
              data[dest] = items[i][src];
            }
            if (fileMap && fileMap.field) {
              const fileKey = `${fileMap.prefix}[${i}][${fileMap.field}]`;
              const file = files[fileKey]?.[0];
              if (file) {
                data[fileMap.dest] = `/uploads/corporate-ld-inner/${file.filename}`;
              } else if (items[i][fileMap.dest]) {
                data[fileMap.dest] = items[i][fileMap.dest];
              }
            }
            await model.create(data, { transaction });
          }
        }
      }

      // Image cards
      await replaceCollection(
        db.CorporateLdInnerImageCard,
        body.image_cards,
        { heading: 'heading' },
        { prefix: 'image_cards', field: 'image', dest: 'image' }
      );

      // Points
      await replaceCollection(
        db.CorporateLdInnerPoint,
        body.points,
        { heading: 'heading', description: 'description' },
        { prefix: 'points', field: 'image', dest: 'image' }
      );

      // Key resources
      await replaceCollection(
        db.CorporateLdInnerKeyResource,
        body.key_resources,
        { heading: 'heading' },
        { prefix: 'key_resources', field: 'image', dest: 'image' }
      );

      // Video testimonials
      await db.CorporateLdInnerVideo.destroy({ where: { page_id: page.id }, transaction });
      if (body.video_ids && Array.isArray(body.video_ids)) {
        for (let i = 0; i < body.video_ids.length; i++) {
          const videoId = body.video_ids[i];
          const customTitle = body[`video_title_${videoId}`] || '';
          await db.CorporateLdInnerVideo.create({
            page_id: page.id,
            video_id: videoId,
            custom_title: customTitle,
            sort_order: i,
          }, { transaction });
        }
      }

      await transaction.commit();
      req.flash('success', 'Page created successfully');
      res.redirect('/admin/corporate/ld/inner');
    } catch (error) {
      await transaction.rollback();
      console.error(error);
      req.flash('error', error.message || 'Failed to create page');
      res.redirect('/admin/corporate/ld/inner/create');
    }
  },

  // Show edit form
  edit: async (req, res) => {
    try {
      const page = await db.CorporateLdInnerPage.findByPk(req.params.id, {
        include: [
          { model: db.CorporateLdInnerImageCard, as: 'imageCards', order: [['sort_order', 'ASC']] },
          { model: db.CorporateLdInnerPoint, as: 'points', order: [['sort_order', 'ASC']] },
          { model: db.CorporateLdInnerKeyResource, as: 'keyResources', order: [['sort_order', 'ASC']] },
          { model: db.Video, as: 'videos', through: { attributes: ['custom_title'] }, order: [['sort_order', 'ASC']] },
        ],
      });
      if (!page) {
        req.flash('error', 'Page not found');
        return res.redirect('/admin/corporate/ld/inner');
      }
      const videos = await db.Video.findAll({ where: { status: 'active' }, order: [['title', 'ASC']] });
      res.render('admin/corporate/ld/inner/edit', { title: 'Edit Corporate L&D Inner Page', page, videos, errors: {} });
    } catch (error) {
      console.error(error);
      req.flash('error', 'Failed to load edit form');
      res.redirect('/admin/corporate/ld/inner');
    }
  },

  // Update page
  update: async (req, res) => {
    const transaction = await db.sequelize.transaction();
    try {
      const page = await db.CorporateLdInnerPage.findByPk(req.params.id, { transaction });
      if (!page) {
        await transaction.rollback();
        req.flash('error', 'Page not found');
        return res.redirect('/admin/corporate/ld/inner');
      }

      const files = groupFilesByFieldname(req.files);
      const body = req.body;

      const updateData = {
        title: body.title,
        slug: body.slug || slugify(body.title, { lower: true, strict: true }),
        banner_heading: body.banner_heading,
        banner_description: body.banner_description,
        content: body.content,
        image_card_heading: body.image_card_heading,
        image_card_description: body.image_card_description,
        points_heading: body.points_heading,
        points_description: body.points_description,
        key_resources_heading: body.key_resources_heading,
        isActive: body.isActive === 'on',
      };

      if (files.banner_image && files.banner_image[0]) {
        if (page.banner_image) {
          const oldPath = getImageAbsolutePath(page.banner_image);
          if (oldPath && fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        }
        updateData.banner_image = `/uploads/corporate-ld-inner/${files.banner_image[0].filename}`;
      } else if (body.banner_image) {
        updateData.banner_image = body.banner_image;
      }

      if (updateData.slug !== page.slug) {
        const existing = await db.CorporateLdInnerPage.findOne({ where: { slug: updateData.slug, id: { [db.Sequelize.Op.ne]: page.id } }, transaction });
        if (existing) throw new Error('Slug already exists');
      }

      await page.update(updateData, { transaction });

      async function replaceCollection(model, items, fieldMap, fileMap) {
        await model.destroy({ where: { page_id: page.id }, transaction });
        if (items && Array.isArray(items)) {
          for (let i = 0; i < items.length; i++) {
            const data = { page_id: page.id, sort_order: i };
            for (const [src, dest] of Object.entries(fieldMap)) {
              data[dest] = items[i][src];
            }
            if (fileMap && fileMap.field) {
              const fileKey = `${fileMap.prefix}[${i}][${fileMap.field}]`;
              const file = files[fileKey]?.[0];
              if (file) {
                data[fileMap.dest] = `/uploads/corporate-ld-inner/${file.filename}`;
              } else if (items[i][fileMap.dest]) {
                data[fileMap.dest] = items[i][fileMap.dest];
              }
            }
            await model.create(data, { transaction });
          }
        }
      }

      await replaceCollection(
        db.CorporateLdInnerImageCard,
        body.image_cards,
        { heading: 'heading' },
        { prefix: 'image_cards', field: 'image', dest: 'image' }
      );
      await replaceCollection(
        db.CorporateLdInnerPoint,
        body.points,
        { heading: 'heading', description: 'description' },
        { prefix: 'points', field: 'image', dest: 'image' }
      );
      await replaceCollection(
        db.CorporateLdInnerKeyResource,
        body.key_resources,
        { heading: 'heading' },
        { prefix: 'key_resources', field: 'image', dest: 'image' }
      );

      await db.CorporateLdInnerVideo.destroy({ where: { page_id: page.id }, transaction });
      if (body.video_ids && Array.isArray(body.video_ids)) {
        for (let i = 0; i < body.video_ids.length; i++) {
          const videoId = body.video_ids[i];
          const customTitle = body[`video_title_${videoId}`] || '';
          await db.CorporateLdInnerVideo.create({
            page_id: page.id,
            video_id: videoId,
            custom_title: customTitle,
            sort_order: i,
          }, { transaction });
        }
      }

      await transaction.commit();
      req.flash('success', 'Page updated successfully');
      res.redirect('/admin/corporate/ld/inner');
    } catch (error) {
      await transaction.rollback();
      console.error(error);
      req.flash('error', error.message || 'Failed to update page');
      res.redirect(`/admin/corporate/ld/inner/edit/${req.params.id}`);
    }
  },

  // View single page
  view: async (req, res) => {
    try {
      const page = await db.CorporateLdInnerPage.findByPk(req.params.id, {
        include: [
          { model: db.CorporateLdInnerImageCard, as: 'imageCards', order: [['sort_order', 'ASC']] },
          { model: db.CorporateLdInnerPoint, as: 'points', order: [['sort_order', 'ASC']] },
          { model: db.CorporateLdInnerKeyResource, as: 'keyResources', order: [['sort_order', 'ASC']] },
          { model: db.Video, as: 'videos', through: { attributes: ['custom_title'] }, order: [['sort_order', 'ASC']] },
        ],
      });
      if (!page) {
        req.flash('error', 'Page not found');
        return res.redirect('/admin/corporate/ld/inner');
      }
      res.render('admin/corporate/ld/inner/show', { title: page.title, page });
    } catch (error) {
      console.error(error);
      req.flash('error', 'Failed to load page');
      res.redirect('/admin/corporate/ld/inner');
    }
  },

  // Delete page
  delete: async (req, res) => {
    const transaction = await db.sequelize.transaction();
    try {
      const page = await db.CorporateLdInnerPage.findByPk(req.params.id, { transaction });
      if (!page) {
        await transaction.rollback();
        return res.status(404).json({ success: false, message: 'Page not found' });
      }

      if (page.banner_image) {
        const bannerPath = getImageAbsolutePath(page.banner_image);
        if (bannerPath && fs.existsSync(bannerPath)) fs.unlinkSync(bannerPath);
      }

      const modelsToClean = [
        db.CorporateLdInnerImageCard,
        db.CorporateLdInnerPoint,
        db.CorporateLdInnerKeyResource,
        db.CorporateLdInnerVideo,
      ];
      for (const model of modelsToClean) {
        const items = await model.findAll({ where: { page_id: page.id }, transaction });
        for (const item of items) {
          if (item.image) {
            const imgPath = getImageAbsolutePath(item.image);
            if (imgPath && fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
          }
        }
        await model.destroy({ where: { page_id: page.id }, transaction });
      }

      await page.destroy({ transaction });
      await transaction.commit();

      if (req.xhr || req.headers.accept?.includes('json')) {
        return res.json({ success: true, message: 'Page deleted successfully' });
      }
      req.flash('success', 'Page deleted successfully');
      res.redirect('/admin/corporate/ld/inner');
    } catch (error) {
      await transaction.rollback();
      console.error(error);
      if (req.xhr || req.headers.accept?.includes('json')) {
        return res.status(500).json({ success: false, message: 'Failed to delete page' });
      }
      req.flash('error', 'Failed to delete page');
      res.redirect('/admin/corporate/ld/inner');
    }
  },

  // Toggle status
  toggleStatus: async (req, res) => {
    try {
      const page = await db.CorporateLdInnerPage.findByPk(req.params.id);
      if (!page) return res.status(404).json({ success: false, message: 'Page not found' });
      page.isActive = !page.isActive;
      await page.save();
      res.json({ success: true, isActive: page.isActive });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Failed to toggle status' });
    }
  },
};

module.exports = CorporateLdInnerPageController;