// controllers/admin/BirthdayInnerPageController.js
const db = require("../../../models");
const fs = require("fs");
const path = require("path");
const slugify = require("slugify");

const { DeleteFaqPage, findOrCreatePage} = require("../../utils/faqHelper");

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

const BirthdayInnerPageController = {
  // List all pages
  index: async (req, res) => {
    try {
      const pages = await db.BirthdayInnerPage.findAll({
        order: [['createdAt', 'DESC']],
        include: [{ model: db.Video, as: 'videos', through: { attributes: [] } }],
      });
      res.render('admin/party/birthday/inner/index', {
        title: 'Birthday Inner Pages',
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
      res.render('admin/party/birthday/inner/create', { title: 'Add Birthday Inner Page', videos, page: null, errors: {} });
    } catch (error) {
      console.error(error);
      req.flash('error', 'Failed to load create form');
      res.redirect('/admin/party/birthday');
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
      const existingSlug = await db.BirthdayInnerPage.findOne({ where: { slug }, transaction });
      if (existingSlug) throw new Error('Slug already exists');

      const pageData = {
        title: body.title,
        slug,
        banner_heading: body.banner_heading,
        banner_description: body.banner_description,
        banner_video_id: body.banner_video_id || null,
        counters_heading: body.counters_heading,
        counters_content: body.counters_content,
        counters_note: body.counters_note,
        counters_counter_heading: body.counters_counter_heading,
        counters_rating: body.counters_rating,
        image_card_heading: body.image_card_heading,
        party_inclusions_heading: body.party_inclusions_heading,
        party_inclusions_note: body.party_inclusions_note,
        slider_heading: body.slider_heading,
        slider_description: body.slider_description,
        footer_heading: body.footer_heading,
        footer_content: body.footer_content,
        isActive: body.isActive === 'on',
      };

      // Main image
      if (files.image && files.image[0]) {
        pageData.image = `/uploads/birthday-inner/${files.image[0].filename}`;
      } else if (body.image) {
        pageData.image = body.image;
      }
      // Images 1,2,3
      const imageFields = ['image1', 'image2', 'image3'];
      for (const field of imageFields) {
        if (files[field] && files[field][0]) {
          pageData[field] = `/uploads/birthday-inner/${files[field][0].filename}`;
        } else if (body[field]) {
          pageData[field] = body[field];
        }
      }

      const page = await db.BirthdayInnerPage.create(pageData, { transaction });

      // Helper to replace a child collection
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
                data[fileMap.dest] = `/uploads/birthday-inner/${file.filename}`;
              } else if (items[i][fileMap.dest]) {
                data[fileMap.dest] = items[i][fileMap.dest];
              }
            }
            await model.create(data, { transaction });
          }
        }
      }

      // Counter cards (3 fixed)
      await replaceCollection(
        db.BirthdayInnerCounterCard,
        body.counter_cards,
        { count: 'count', description: 'description' },
        { prefix: 'counter_cards', field: 'image', dest: 'image' }
      );

      // Image cards
      await replaceCollection(
        db.BirthdayInnerImageCard,
        body.image_cards,
        { heading: 'heading' },
        { prefix: 'image_cards', field: 'image', dest: 'image' }
      );

      // Inclusion items
      await replaceCollection(
        db.BirthdayInnerInclusionItem,
        body.inclusion_items,
        { heading: 'heading', link: 'link' },
        { prefix: 'inclusion_items', field: 'image', dest: 'image' }
      );

      // Slider items
      await replaceCollection(
        db.BirthdayInnerSliderItem,
        body.slider_items,
        { heading: 'heading', description: 'description' },
        { prefix: 'slider_items', field: 'image', dest: 'image' }
      );

      // Package columns
      await db.BirthdayInnerPackageColumn.destroy({ where: { page_id: page.id }, transaction });
      const createdColumns = [];
      if (body.package_columns && Array.isArray(body.package_columns)) {
        for (let i = 0; i < body.package_columns.length; i++) {
          const col = body.package_columns[i];
          const imageFile = files[`package_columns[${i}][image]`]?.[0];
          const column = await db.BirthdayInnerPackageColumn.create({
            page_id: page.id,
            sort_order: i,
            title: col.title,
            duration: col.duration,
            image: imageFile ? `/uploads/birthday-inner/${imageFile.filename}` : (col.image || null),
          }, { transaction });
          createdColumns.push(column);
        }
      }

      // Package rows & cells
      await db.BirthdayInnerPackageRow.destroy({ where: { page_id: page.id }, transaction });
      if (body.package_rows && Array.isArray(body.package_rows)) {
        for (let i = 0; i < body.package_rows.length; i++) {
          const row = body.package_rows[i];
          const dbRow = await db.BirthdayInnerPackageRow.create({
            page_id: page.id,
            sort_order: i,
            feature: row.feature,
          }, { transaction });

          for (let j = 0; j < createdColumns.length; j++) {
            const cellValue = row[`col${j}`] || 'No';
            await db.BirthdayInnerPackageCell.create({
              row_id: dbRow.id,
              column_id: createdColumns[j].id,
              value: cellValue,
            }, { transaction });
          }
        }
      }

      // Video testimonials
      await db.BirthdayInnerVideo.destroy({ where: { page_id: page.id }, transaction });
      if (body.video_ids && Array.isArray(body.video_ids)) {
        for (let i = 0; i < body.video_ids.length; i++) {
          const videoId = body.video_ids[i];
          const customTitle = body[`video_title_${videoId}`] || '';
          await db.BirthdayInnerVideo.create({
            page_id: page.id,
            video_id: videoId,
            custom_title: customTitle,
            sort_order: i,
          }, { transaction });
        }
      }

      await findOrCreatePage(page.id, page.title, page.slug, 'birthdayinner');

      await transaction.commit();
      req.flash('success', 'Birthday inner page created successfully');
      res.redirect('/admin/party/birthday');
    } catch (error) {
      await transaction.rollback();
      console.error(error);
      req.flash('error', error.message || 'Failed to create page');
      res.redirect('/admin/party/birthday/create');
    }
  },

  // Show edit form
  edit: async (req, res) => {
    try {
      const page = await db.BirthdayInnerPage.findByPk(req.params.id, {
        include: [
          { model: db.BirthdayInnerCounterCard, as: 'counterCards', order: [['sort_order', 'ASC']] },
          { model: db.BirthdayInnerImageCard, as: 'imageCards', order: [['sort_order', 'ASC']] },
          { model: db.BirthdayInnerInclusionItem, as: 'inclusionItems', order: [['sort_order', 'ASC']] },
          { model: db.BirthdayInnerSliderItem, as: 'sliderItems', order: [['sort_order', 'ASC']] },
          { model: db.BirthdayInnerPackageColumn, as: 'packageColumns', order: [['sort_order', 'ASC']] },
          { model: db.BirthdayInnerPackageRow, as: 'packageRows', order: [['sort_order', 'ASC']] },
          { model: db.Video, as: 'videos', through: { attributes: ['custom_title'] }, order: [['sort_order', 'ASC']] },
        ],
      });
      if (!page) {
        req.flash('error', 'Page not found');
        return res.redirect('/admin/party/birthday');
      }
      const videos = await db.Video.findAll({ where: { status: 'active' }, order: [['title', 'ASC']] });
      res.render('admin/party/birthday/inner/edit', { title: 'Edit Birthday Inner Page', page, videos, errors: {} });
    } catch (error) {
      console.error(error);
      req.flash('error', 'Failed to load edit form');
      res.redirect('/admin/party/birthday');
    }
  },

  // Update page
  update: async (req, res) => {
    const transaction = await db.sequelize.transaction();
    try {
      const page = await db.BirthdayInnerPage.findByPk(req.params.id, { transaction });
      if (!page) {
        await transaction.rollback();
        req.flash('error', 'Page not found');
        return res.redirect('/admin/party/birthday');
      }

      const files = groupFilesByFieldname(req.files);
      const body = req.body;

      const updateData = {
        title: body.title,
        slug: body.slug || slugify(body.title, { lower: true, strict: true }),
        banner_heading: body.banner_heading,
        banner_description: body.banner_description,
        banner_video_id: body.banner_video_id || null,
        counters_heading: body.counters_heading,
        counters_content: body.counters_content,
        counters_note: body.counters_note,
        counters_counter_heading: body.counters_counter_heading,
        counters_rating: body.counters_rating,
        image_card_heading: body.image_card_heading,
        party_inclusions_heading: body.party_inclusions_heading,
        party_inclusions_note: body.party_inclusions_note,
        slider_heading: body.slider_heading,
        slider_description: body.slider_description,
        footer_heading: body.footer_heading,
        footer_content: body.footer_content,
        isActive: body.isActive === 'on',
      };

      // Main image
      if (files.image && files.image[0]) {
        if (page.image) {
          const oldPath = getImageAbsolutePath(page.image);
          if (oldPath && fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        }
        updateData.image = `/uploads/birthday-inner/${files.image[0].filename}`;
      } else if (body.image) {
        updateData.image = body.image;
      }

      // Images 1,2,3
      const imageFields = ['image1', 'image2', 'image3'];
      for (const field of imageFields) {
        if (files[field] && files[field][0]) {
          if (page[field]) {
            const oldPath = getImageAbsolutePath(page[field]);
            if (oldPath && fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
          }
          updateData[field] = `/uploads/birthday-inner/${files[field][0].filename}`;
        } else if (body[field]) {
          updateData[field] = body[field];
        }
      }

      // Check slug uniqueness if changed
      if (updateData.slug !== page.slug) {
        const existing = await db.BirthdayInnerPage.findOne({ where: { slug: updateData.slug, id: { [db.Sequelize.Op.ne]: page.id } }, transaction });
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
                data[fileMap.dest] = `/uploads/birthday-inner/${file.filename}`;
              } else if (items[i][fileMap.dest]) {
                data[fileMap.dest] = items[i][fileMap.dest];
              }
            }
            await model.create(data, { transaction });
          }
        }
      }

      // Replace all child collections
      await replaceCollection(
        db.BirthdayInnerCounterCard,
        body.counter_cards,
        { count: 'count', description: 'description' },
        { prefix: 'counter_cards', field: 'image', dest: 'image' }
      );
      await replaceCollection(
        db.BirthdayInnerImageCard,
        body.image_cards,
        { heading: 'heading' },
        { prefix: 'image_cards', field: 'image', dest: 'image' }
      );
      await replaceCollection(
        db.BirthdayInnerInclusionItem,
        body.inclusion_items,
        { heading: 'heading', link: 'link' },
        { prefix: 'inclusion_items', field: 'image', dest: 'image' }
      );
      await replaceCollection(
        db.BirthdayInnerSliderItem,
        body.slider_items,
        { heading: 'heading', description: 'description' },
        { prefix: 'slider_items', field: 'image', dest: 'image' }
      );

      // Package columns
      await db.BirthdayInnerPackageColumn.destroy({ where: { page_id: page.id }, transaction });
      const createdColumns = [];
      if (body.package_columns && Array.isArray(body.package_columns)) {
        for (let i = 0; i < body.package_columns.length; i++) {
          const col = body.package_columns[i];
          const imageFile = files[`package_columns[${i}][image]`]?.[0];
          const column = await db.BirthdayInnerPackageColumn.create({
            page_id: page.id,
            sort_order: i,
            title: col.title,
            duration: col.duration,
            image: imageFile ? `/uploads/birthday-inner/${imageFile.filename}` : (col.image || null),
          }, { transaction });
          createdColumns.push(column);
        }
      }

      // Package rows & cells
      await db.BirthdayInnerPackageRow.destroy({ where: { page_id: page.id }, transaction });
      if (body.package_rows && Array.isArray(body.package_rows)) {
        for (let i = 0; i < body.package_rows.length; i++) {
          const row = body.package_rows[i];
          const dbRow = await db.BirthdayInnerPackageRow.create({
            page_id: page.id,
            sort_order: i,
            feature: row.feature,
          }, { transaction });

          for (let j = 0; j < createdColumns.length; j++) {
            const cellValue = row[`col${j}`] || 'No';
            await db.BirthdayInnerPackageCell.create({
              row_id: dbRow.id,
              column_id: createdColumns[j].id,
              value: cellValue,
            }, { transaction });
          }
        }
      }

      // Video testimonials
      await db.BirthdayInnerVideo.destroy({ where: { page_id: page.id }, transaction });
      if (body.video_ids && Array.isArray(body.video_ids)) {
        for (let i = 0; i < body.video_ids.length; i++) {
          const videoId = body.video_ids[i];
          const customTitle = body[`video_title_${videoId}`] || '';
          await db.BirthdayInnerVideo.create({
            page_id: page.id,
            video_id: videoId,
            custom_title: customTitle,
            sort_order: i,
          }, { transaction });
        }
      }

      await findOrCreatePage(page.id, page.title, page.slug, 'birthdayinner');

      await transaction.commit();
      req.flash('success', 'Birthday inner page updated successfully');
      res.redirect('/admin/party/birthday');
    } catch (error) {
      await transaction.rollback();
      console.error(error);
      req.flash('error', error.message || 'Failed to update page');
      res.redirect(`/admin/party/birthday/edit/${req.params.id}`);
    }
  },

  // View single page
  view: async (req, res) => {
    try {
      const page = await db.BirthdayInnerPage.findByPk(req.params.id, {
        include: [
          { model: db.BirthdayInnerCounterCard, as: 'counterCards', order: [['sort_order', 'ASC']] },
          { model: db.BirthdayInnerImageCard, as: 'imageCards', order: [['sort_order', 'ASC']] },
          { model: db.BirthdayInnerInclusionItem, as: 'inclusionItems', order: [['sort_order', 'ASC']] },
          { model: db.BirthdayInnerSliderItem, as: 'sliderItems', order: [['sort_order', 'ASC']] },
          { model: db.BirthdayInnerPackageColumn, as: 'packageColumns', order: [['sort_order', 'ASC']] },
          { model: db.BirthdayInnerPackageRow, as: 'packageRows', order: [['sort_order', 'ASC']] },
          { model: db.Video, as: 'videos', through: { attributes: ['custom_title'] }, order: [['sort_order', 'ASC']] },
          { model: db.Video, as: 'bannerVideo' },
        ],
      });
      if (!page) {
        req.flash('error', 'Page not found');
        return res.redirect('/admin/party/birthday');
      }
      res.render('admin/party/birthday/inner/show', { title: page.title, page });
    } catch (error) {
      console.error(error);
      req.flash('error', 'Failed to load page');
      res.redirect('/admin/party/birthday');
    }
  },

  // Delete page
  delete: async (req, res) => {
    const transaction = await db.sequelize.transaction();
    try {
      const page = await db.BirthdayInnerPage.findByPk(req.params.id, { transaction });
      if (!page) {
        await transaction.rollback();
        return res.status(404).json({ success: false, message: 'Page not found' });
      }

      // Delete all associated images
      const imageFields = ['image', 'banner_image', 'image1', 'image2', 'image3'];
      for (const field of imageFields) {
        if (page[field]) {
          const imgPath = getImageAbsolutePath(page[field]);
          if (imgPath && fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
        }
      }

      const modelsToClean = [
        db.BirthdayInnerCounterCard,
        db.BirthdayInnerImageCard,
        db.BirthdayInnerInclusionItem,
        db.BirthdayInnerSliderItem,
        db.BirthdayInnerPackageColumn,
        db.BirthdayInnerPackageRow,
        db.BirthdayInnerVideo,
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


      await DeleteFaqPage(page.id, page.title, page.slug, 'birthdayinner');

      await transaction.commit();

      if (req.xhr || req.headers.accept?.includes('json')) {
        return res.json({ success: true, message: 'Page deleted successfully' });
      }
      req.flash('success', 'Page deleted successfully');
      res.redirect('/admin/party/birthday');
    } catch (error) {
      await transaction.rollback();
      console.error(error);
      if (req.xhr || req.headers.accept?.includes('json')) {
        return res.status(500).json({ success: false, message: 'Failed to delete page' });
      }
      req.flash('error', 'Failed to delete page');
      res.redirect('/admin/party/birthday');
    }
  },

  // Toggle status
  toggleStatus: async (req, res) => {
    try {
      const page = await db.BirthdayInnerPage.findByPk(req.params.id);
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

module.exports = BirthdayInnerPageController;