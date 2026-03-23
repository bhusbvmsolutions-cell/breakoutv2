// controllers/admin/CorporateUnwindArchiveController.js
const db = require("../../../models");
const fs = require("fs");
const path = require("path");

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

const CorporateUnwindArchiveController = {
  async ensureArchive() {
    let archive = await db.CorporateUnwindArchive.findByPk(1);
    if (!archive) {
      archive = await db.CorporateUnwindArchive.create({
        banner_heading: '',
        banner_description: '',
        content_heading: '',
        content_content: '',
        content_note: '',
        content_footer: '',
        counters_heading: '',
        counters_rating: null,
        image_card_heading: '',
        addons_heading: '',
        why_us_heading: '',
        compare_heading: '',
        compare_left_heading: '',
        compare_right_heading: '',
        footer_heading: '',
        footer_content: '',
      });
    }
    return archive;
  },

  index: async (req, res) => {
    try {
      const archive = await CorporateUnwindArchiveController.ensureArchive();
      const fullArchive = await db.CorporateUnwindArchive.findByPk(archive.id, {
        include: [
          { model: db.CorporateUnwindCounterCard, as: 'counterCards', order: [['sort_order', 'ASC']] },
          { model: db.CorporateUnwindImageCard, as: 'imageCards', order: [['sort_order', 'ASC']] },
          { model: db.CorporateUnwindAddonItem, as: 'addonItems', order: [['sort_order', 'ASC']] },
          { model: db.CorporateUnwindWhyUsItem, as: 'whyUsItems', order: [['sort_order', 'ASC']] },
          { model: db.CorporateUnwindCompareItem, as: 'compareItems', order: [['sort_order', 'ASC']] },
          { model: db.CorporateUnwindPackageColumn, as: 'packageColumns', order: [['sort_order', 'ASC']] },
          { model: db.CorporateUnwindPackageRow, as: 'packageRows', order: [['sort_order', 'ASC']] },
          { model: db.Video, as: 'videos', through: { attributes: ['custom_title'] }, order: [['sort_order', 'ASC']] },
        ],
      });
      const videos = await db.Video.findAll({ where: { status: 'active' }, order: [['title', 'ASC']] });
      res.render('admin/corporate/unwind/index', {
        title: 'Corporate Unwind Archive',
        archive: fullArchive,
        videos,
      });
    } catch (error) {
      console.error(error);
      req.flash('error', 'Failed to load form');
      res.redirect('/admin/dashboard');
    }
  },

  update: async (req, res) => {
    const transaction = await db.sequelize.transaction();
    try {
      const archive = await CorporateUnwindArchiveController.ensureArchive();
      const files = groupFilesByFieldname(req.files);
      const body = req.body;

      const updateData = {
        banner_heading: body.banner_heading,
        banner_description: body.banner_description,
        content_heading: body.content_heading,
        content_content: body.content_content,
        content_note: body.content_note,
        content_footer: body.content_footer,
        counters_heading: body.counters_heading,
        counters_rating: body.counters_rating,
        image_card_heading: body.image_card_heading,
        addons_heading: body.addons_heading,
        why_us_heading: body.why_us_heading,
        compare_heading: body.compare_heading,
        compare_left_heading: body.compare_left_heading,
        compare_right_heading: body.compare_right_heading,
        footer_heading: body.footer_heading,
        footer_content: body.footer_content,
        isActive: body.isActive === 'on',
      };

      // Banner image
      if (files.banner_image && files.banner_image[0]) {
        if (archive.banner_image) {
          const oldPath = getImageAbsolutePath(archive.banner_image);
          if (oldPath && fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        }
        updateData.banner_image = `/uploads/corporate-unwind/${files.banner_image[0].filename}`;
      } else if (body.banner_image) {
        updateData.banner_image = body.banner_image;
      }

      // Images 1,2,3
      const imageFields = ['image1', 'image2', 'image3'];
      for (const field of imageFields) {
        if (files[field] && files[field][0]) {
          if (archive[field]) {
            const oldPath = getImageAbsolutePath(archive[field]);
            if (oldPath && fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
          }
          updateData[field] = `/uploads/corporate-unwind/${files[field][0].filename}`;
        } else if (body[field]) {
          updateData[field] = body[field];
        }
      }

      await archive.update(updateData, { transaction });

      // Helper to replace a child collection
      async function replaceCollection(model, items, fieldMap, fileMap) {
        await model.destroy({ where: { archive_id: archive.id }, transaction });
        if (items && Array.isArray(items)) {
          for (let i = 0; i < items.length; i++) {
            const data = { archive_id: archive.id, sort_order: i };
            for (const [src, dest] of Object.entries(fieldMap)) {
              data[dest] = items[i][src];
            }
            if (fileMap && fileMap.field) {
              const fileKey = `${fileMap.prefix}[${i}][${fileMap.field}]`;
              const file = files[fileKey]?.[0];
              if (file) {
                data[fileMap.dest] = `/uploads/corporate-unwind/${file.filename}`;
              } else if (items[i][fileMap.dest]) {
                data[fileMap.dest] = items[i][fileMap.dest];
              }
            }
            await model.create(data, { transaction });
          }
        }
      }

      // 1. Counter cards (3 fixed)
      await replaceCollection(
        db.CorporateUnwindCounterCard,
        body.counter_cards,
        { count: 'count', description: 'description' },
        { prefix: 'counter_cards', field: 'image', dest: 'image' }
      );

      // 2. Image cards (repeater)
      await replaceCollection(
        db.CorporateUnwindImageCard,
        body.image_cards,
        { heading: 'heading', game_link: 'game_link' },
        { prefix: 'image_cards', field: 'image', dest: 'image' }
      );

      // 3. Addon items (repeater)
      await replaceCollection(
        db.CorporateUnwindAddonItem,
        body.addon_items,
        { heading: 'heading', blog_link: 'blog_link' },
        { prefix: 'addon_items', field: 'image', dest: 'image' }
      );

      // 4. Why Us items (repeater)
      await replaceCollection(
        db.CorporateUnwindWhyUsItem,
        body.why_us_items,
        { heading: 'heading' },
        { prefix: 'why_us_items', field: 'image', dest: 'image' }
      );

      // 5. Compare items (repeater)
      await replaceCollection(
        db.CorporateUnwindCompareItem,
        body.compare_items,
        { left_point: 'left_point', right_point: 'right_point' },
        { prefix: 'compare_items', field: 'right_image', dest: 'right_image' }
      );

      // 6. Package columns
      await db.CorporateUnwindPackageColumn.destroy({ where: { archive_id: archive.id }, transaction });
      const createdColumns = [];
      if (body.package_columns && Array.isArray(body.package_columns)) {
        for (let i = 0; i < body.package_columns.length; i++) {
          const col = body.package_columns[i];
          const imageFile = files[`package_columns[${i}][image]`]?.[0];
          const column = await db.CorporateUnwindPackageColumn.create({
            archive_id: archive.id,
            sort_order: i,
            title: col.title,
            duration: col.duration,
            image: imageFile ? `/uploads/corporate-unwind/${imageFile.filename}` : (col.image || null),
          }, { transaction });
          createdColumns.push(column);
        }
      }

      // 7. Package rows & cells
      await db.CorporateUnwindPackageRow.destroy({ where: { archive_id: archive.id }, transaction });
      if (body.package_rows && Array.isArray(body.package_rows)) {
        for (let i = 0; i < body.package_rows.length; i++) {
          const row = body.package_rows[i];
          const dbRow = await db.CorporateUnwindPackageRow.create({
            archive_id: archive.id,
            sort_order: i,
            feature: row.feature,
          }, { transaction });

          for (let j = 0; j < createdColumns.length; j++) {
            const cellValue = row[`col${j}`] || 'No';
            await db.CorporateUnwindPackageCell.create({
              row_id: dbRow.id,
              column_id: createdColumns[j].id,
              value: cellValue,
            }, { transaction });
          }
        }
      }

      // 8. Video testimonials
      await db.CorporateUnwindVideo.destroy({ where: { archive_id: archive.id }, transaction });
      if (body.video_ids && Array.isArray(body.video_ids)) {
        for (let i = 0; i < body.video_ids.length; i++) {
          const videoId = body.video_ids[i];
          const customTitle = body[`video_title_${videoId}`] || '';
          await db.CorporateUnwindVideo.create({
            archive_id: archive.id,
            video_id: videoId,
            custom_title: customTitle,
            sort_order: i,
          }, { transaction });
        }
      }

      await transaction.commit();
      req.flash('success', 'Corporate Unwind archive updated successfully');
      res.redirect('/admin/corporate/unwind/archive');
    } catch (error) {
      await transaction.rollback();
      console.error(error);
      req.flash('error', error.message || 'Failed to update archive');
      res.redirect('/admin/corporate/unwind/archive');
    }
  },
};

module.exports = CorporateUnwindArchiveController;