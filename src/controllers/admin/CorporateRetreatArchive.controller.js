// controllers/admin/CorporateRetreatArchiveController.js
const db = require("../../../models");
const fs = require("fs");
const path = require("path");
const {findOrCreatePage} = require('../../utils/faqHelper');

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

const CorporateRetreatArchiveController = {
  async ensureArchive() {
    let archive = await db.CorporateRetreatArchive.findByPk(1);
    if (!archive) {
      archive = await db.CorporateRetreatArchive.create({
        banner_heading: '',
        banner_description: '',
        content_heading: '',
        content_content: '',
        content_note: '',
        content_footer: '',
        counters_heading: '',
        counters_rating: null,
        image_card_heading: '',
        choices_heading: '',
        ready_to_transform_heading: '',
        ready_to_transform_description: '',
        why_choose_us_heading: '',
        footer_heading: '',
        footer_content: '',
      });
    }
    return archive;
  },

  index: async (req, res) => {
    try {
      const archive = await CorporateRetreatArchiveController.ensureArchive();
      const fullArchive = await db.CorporateRetreatArchive.findByPk(archive.id, {
        include: [
          { model: db.CorporateRetreatCounterCard, as: 'counterCards', order: [['sort_order', 'ASC']] },
          { model: db.CorporateRetreatImageCard, as: 'imageCards', order: [['sort_order', 'ASC']] },
          { model: db.CorporateRetreatChoiceItem, as: 'choiceItems', order: [['sort_order', 'ASC']] },
          { model: db.CorporateRetreatWhyChooseUsItem, as: 'whyChooseUsItems', order: [['sort_order', 'ASC']] },
          { model: db.Video, as: 'videos', through: { attributes: ['custom_title'] }, order: [['sort_order', 'ASC']] },
        ],
      });
      const videos = await db.Video.findAll({ where: { status: 'active' }, order: [['title', 'ASC']] });
      res.render('admin/corporate/retreat/index', {
        title: 'Corporate Retreat Archive',
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
      const archive = await CorporateRetreatArchiveController.ensureArchive();
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
        choices_heading: body.choices_heading,
        ready_to_transform_heading: body.ready_to_transform_heading,
        ready_to_transform_description: body.ready_to_transform_description,
        why_choose_us_heading: body.why_choose_us_heading,
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
        updateData.banner_image = `/uploads/corporate-retreat/${files.banner_image[0].filename}`;
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
          updateData[field] = `/uploads/corporate-retreat/${files[field][0].filename}`;
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
                data[fileMap.dest] = `/uploads/corporate-retreat/${file.filename}`;
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
        db.CorporateRetreatCounterCard,
        body.counter_cards,
        { count: 'count', description: 'description' },
        { prefix: 'counter_cards', field: 'image', dest: 'image' }
      );

      // 2. Image cards (repeater)
      await replaceCollection(
        db.CorporateRetreatImageCard,
        body.image_cards,
        { heading: 'heading' },
        { prefix: 'image_cards', field: 'image', dest: 'image' }
      );

      // 3. Choice items (repeater)
      await replaceCollection(
        db.CorporateRetreatChoiceItem,
        body.choice_items,
        { heading: 'heading', game_link: 'game_link' },
        { prefix: 'choice_items', field: 'image', dest: 'image' }
      );

      // 4. Why Choose Us items (repeater)
      await replaceCollection(
        db.CorporateRetreatWhyChooseUsItem,
        body.why_choose_us_items,
        { heading: 'heading' },
        { prefix: 'why_choose_us_items', field: 'image', dest: 'image' }
      );

      // 5. Video testimonials
      await db.CorporateRetreatVideo.destroy({ where: { archive_id: archive.id }, transaction });
      if (body.video_ids && Array.isArray(body.video_ids)) {
        for (let i = 0; i < body.video_ids.length; i++) {
          const videoId = body.video_ids[i];
          const customTitle = body[`video_title_${videoId}`] || '';
          await db.CorporateRetreatVideo.create({
            archive_id: archive.id,
            video_id: videoId,
            custom_title: customTitle,
            sort_order: i,
          }, { transaction });
        }
      }

      await findOrCreatePage(null, "Corporate Retreat Archive", "corporate-retreat", "archive");

      await transaction.commit();
      req.flash('success', 'Corporate Retreat archive updated successfully');
      res.redirect('/admin/corporate/retreat/archive');
    } catch (error) {
      await transaction.rollback();
      console.error(error);
      req.flash('error', error.message || 'Failed to update archive');
      res.redirect('/admin/corporate/retreat/archive');
    }
  },
};

module.exports = CorporateRetreatArchiveController;