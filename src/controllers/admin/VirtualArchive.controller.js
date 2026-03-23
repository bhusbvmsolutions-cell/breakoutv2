// controllers/admin/VirtualArchiveController.js
const db = require("../../../models");
const fs = require("fs");
const path = require("path");

// Helper to get absolute file path
function getImageAbsolutePath(storedPath) {
  if (!storedPath) return null;
  const projectRoot = path.join(__dirname, '../../../');
  if (storedPath.startsWith('/')) {
    return path.join(projectRoot, 'public', storedPath);
  } else {
    return path.join(projectRoot, storedPath);
  }
}

// Group files by fieldname (multer.any() returns an array)
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

const VirtualArchiveController = {
  // Ensure the single archive exists (id = 1)
  async ensureArchive() {
    let archive = await db.VirtualArchive.findByPk(1);
    if (!archive) {
      archive = await db.VirtualArchive.create({
        banner_heading: '',
        banner_description: '',
        banner_video_id: null,
        content_section_content: '',
        content_section_note: '',
        counters_heading: '',
        counters_counter_heading: '',
        counters_counter_rating: null,
        icons_heading: '',
        addons_heading: '',
        packages_heading: '',
        footer_heading: '',
        footer_description1: '',
        footer_description2: '',
      });
    }
    return archive;
  },

  // Show the form (create/update)
  index: async (req, res) => {
    try {
      // Ensure archive exists (id=1)
      const archive = await VirtualArchiveController.ensureArchive();

      // Load all related data
      const fullArchive = await db.VirtualArchive.findByPk(archive.id, {
        include: [
          { model: db.VirtualArchiveCounterCard, as: 'counterCards', order: [['sort_order', 'ASC']] },
          { model: db.VirtualArchiveIconItem, as: 'iconItems', order: [['sort_order', 'ASC']] },
          { model: db.VirtualArchiveAddonItem, as: 'addonItems', order: [['sort_order', 'ASC']] },
          { model: db.VirtualArchiveGalleryImage, as: 'galleryImages', order: [['sort_order', 'ASC']] },
          {
            model: db.VirtualArchivePackageColumn,
            as: 'packageColumns',
            order: [['sort_order', 'ASC']],
            include: [{ model: db.VirtualArchivePackageCell, as: 'cells' }]
          },
          {
            model: db.VirtualArchivePackageRow,
            as: 'packageRows',
            order: [['sort_order', 'ASC']],
            include: [{ model: db.VirtualArchivePackageCell, as: 'cells' }]
          },
          { model: db.Video, as: 'videos', through: { attributes: ['custom_title'] }, order: [['sort_order', 'ASC']] }
        ]
      });

      const videos = await db.Video.findAll({ where: { status: 'active' }, order: [['title', 'ASC']] });
      res.render('admin/virtual/archive/index', {
        title: 'Virtual Escape Room Archive',
        archive: fullArchive,
        videos,
        errors: {}
      });
    } catch (error) {
      console.error(error);
      req.flash('error', 'Failed to load form');
      res.redirect('/admin/dashboard');
    }
  },

  // Update the single archive (id=1)
  update: async (req, res) => {
    const transaction = await db.sequelize.transaction();
    try {
      const archive = await VirtualArchiveController.ensureArchive();
      const files = groupFilesByFieldname(req.files);
      const body = req.body;

      // Update main fields
      const updateData = {
        banner_heading: body.banner_heading,
        banner_description: body.banner_description,
        banner_video_id: body.banner_video_id || null,
        content_section_content: body.content_section_content,
        content_section_note: body.content_section_note,
        counters_heading: body.counters_heading,
        counters_counter_heading: body.counters_counter_heading,
        counters_counter_rating: body.counters_counter_rating,
        icons_heading: body.icons_heading,
        addons_heading: body.addons_heading,
        packages_heading: body.packages_heading,
        footer_heading: body.footer_heading,
        footer_description1: body.footer_description1,
        footer_description2: body.footer_description2,
      };

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
                data[fileMap.dest] = `/uploads/virtual/archive/${file.filename}`;
              } else if (items[i][fileMap.dest]) {
                data[fileMap.dest] = items[i][fileMap.dest];
              }
            }
            await model.create(data, { transaction });
          }
        }
      }

      // 1. Counter cards (3 items)
      await replaceCollection(
        db.VirtualArchiveCounterCard,
        body.counter_cards,
        { count: 'count', description: 'description' },
        { prefix: 'counter_cards', field: 'image', dest: 'image' }
      );

      // 2. Icon items (repeater)
      await replaceCollection(
        db.VirtualArchiveIconItem,
        body.icon_items,
        { heading: 'heading' },
        { prefix: 'icon_items', field: 'image', dest: 'image' }
      );

      // 3. Add‑on items (repeater)
      await replaceCollection(
        db.VirtualArchiveAddonItem,
        body.addon_items,
        { heading: 'heading', link: 'link' },
        { prefix: 'addon_items', field: 'image', dest: 'image' }
      );

      // 4. Gallery images (repeater)
      await replaceCollection(
        db.VirtualArchiveGalleryImage,
        body.gallery_items,
        {}, // no extra fields besides image
        { prefix: 'gallery_items', field: 'image_file', dest: 'image' }
      );

      // 5. Package columns
      await db.VirtualArchivePackageColumn.destroy({ where: { archive_id: archive.id }, transaction });
      const createdColumns = [];
      if (body.package_columns && Array.isArray(body.package_columns)) {
        for (let i = 0; i < body.package_columns.length; i++) {
          const col = body.package_columns[i];
          const imageFile = files[`package_columns[${i}][image]`]?.[0];
          const column = await db.VirtualArchivePackageColumn.create({
            archive_id: archive.id,
            sort_order: i,
            title: col.title,
            duration: col.duration,
            image: imageFile ? `/uploads/virtual/archive/${imageFile.filename}` : (col.image || null),
          }, { transaction });
          createdColumns.push(column);
        }
      }

      // 6. Package rows & cells
      await db.VirtualArchivePackageRow.destroy({ where: { archive_id: archive.id }, transaction });
      if (body.package_rows && Array.isArray(body.package_rows)) {
        for (let i = 0; i < body.package_rows.length; i++) {
          const row = body.package_rows[i];
          const dbRow = await db.VirtualArchivePackageRow.create({
            archive_id: archive.id,
            sort_order: i,
            feature: row.feature,
          }, { transaction });

          for (let j = 0; j < createdColumns.length; j++) {
            const cellValue = row[`col${j}`] || 'No';
            await db.VirtualArchivePackageCell.create({
              row_id: dbRow.id,
              column_id: createdColumns[j].id,
              value: cellValue,
            }, { transaction });
          }
        }
      }

      // 7. Video testimonials
      await db.VirtualArchiveVideo.destroy({ where: { archive_id: archive.id }, transaction });
      if (body.video_ids && Array.isArray(body.video_ids)) {
        for (let i = 0; i < body.video_ids.length; i++) {
          const videoId = body.video_ids[i];
          const customTitle = body[`video_title_${videoId}`] || '';
          await db.VirtualArchiveVideo.create({
            archive_id: archive.id,
            video_id: videoId,
            custom_title: customTitle,
            sort_order: i,
          }, { transaction });
        }
      }

      await transaction.commit();
      req.flash('success', 'Archive updated successfully');
      res.redirect('/admin/virtual/archive');
    } catch (error) {
      await transaction.rollback();
      console.error(error);
      req.flash('error', error.message || 'Failed to update archive');
      res.redirect('/admin/virtual/archive');
    }
  },
};

module.exports = VirtualArchiveController;