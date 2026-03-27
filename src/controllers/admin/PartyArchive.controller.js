// controllers/admin/PartyArchiveController.js
const db = require("../../../models");
const fs = require("fs");
const path = require("path");
const findOrCreatePage = require("../../utils/faqHelper");

// Helper: get absolute filesystem path from stored URL
function getImageAbsolutePath(storedPath) {
  if (!storedPath) return null;
  const projectRoot = path.join(__dirname, '../../../');
  if (storedPath.startsWith('/')) {
    return path.join(projectRoot, 'public', storedPath);
  }
  return path.join(projectRoot, storedPath);
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

const PartyArchiveController = {
  // Ensure the single archive exists (id = 1)
  async ensureArchive() {
    let archive = await db.PartyArchive.findByPk(1);
    if (!archive) {
      archive = await db.PartyArchive.create({
        banner_heading: '',
        banner_description: '',
        banner_content: '',
        banner_note: '',
        counters_heading: '',
        counters_rating: null,
        footer_heading: '',
        footer_description1: '',
        footer_description2: '',
      });
    }
    return archive;
  },

  // Show the form (GET)
  index: async (req, res) => {
    try {
      const archive = await PartyArchiveController.ensureArchive();
      const fullArchive = await db.PartyArchive.findByPk(archive.id, {
        include: [{ model: db.PartyArchiveCounterCard, as: 'counterCards', order: [['sort_order', 'ASC']] }],
      });
      res.render('admin/party/archive/index', {
        title: 'Party Archive',
        archive: fullArchive,
        errors: {},
        success: req.flash('success'),
        error: req.flash('error'),
      });
    } catch (error) {
      console.error(error);
      req.flash('error', 'Failed to load form');
      res.redirect('/admin/dashboard');
    }
  },

  // Update the single archive (POST)
  update: async (req, res) => {
    const transaction = await db.sequelize.transaction();
    try {
      const archive = await PartyArchiveController.ensureArchive();
      const files = groupFilesByFieldname(req.files);
      const body = req.body;

      // Prepare main data
      const updateData = {
        banner_heading: body.banner_heading,
        banner_description: body.banner_description,
        banner_content: body.banner_content,
        banner_note: body.banner_note,
        counters_heading: body.counters_heading,
        counters_rating: body.counters_rating,
        footer_heading: body.footer_heading,
        footer_description1: body.footer_description1,
        footer_description2: body.footer_description2,
        isActive: body.isActive === 'on',
      };

      // Handle the three banner images
      const bannerImageFields = ['banner_birthday_image', 'banner_bachelor_image', 'banner_farewell_image'];
      for (const field of bannerImageFields) {
        if (files[field] && files[field][0]) {
          // Delete old image if exists
          if (archive[field]) {
            const oldPath = getImageAbsolutePath(archive[field]);
            if (oldPath && fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
          }
          updateData[field] = `/uploads/party/${files[field][0].filename}`;
        } else if (body[field]) {
          updateData[field] = body[field];
        }
      }

      await archive.update(updateData, { transaction });

      // Replace counter cards (3 items)
      await db.PartyArchiveCounterCard.destroy({ where: { archive_id: archive.id }, transaction });
      if (body.counter_cards && Array.isArray(body.counter_cards)) {
        for (let i = 0; i < body.counter_cards.length; i++) {
          const card = body.counter_cards[i];
          const imageFile = files[`counter_cards[${i}][image]`]?.[0];
          await db.PartyArchiveCounterCard.create({
            archive_id: archive.id,
            sort_order: i,
            count: card.count,
            description: card.description,
            image: imageFile ? `/uploads/party/${imageFile.filename}` : (card.image || null),
          }, { transaction });
        }
      }
      await findOrCreatePage(null, "Party Archive", "party", "archive");
      

      await transaction.commit();
      req.flash('success', 'Party archive updated successfully');
      res.redirect('/admin/party/archive');
    } catch (error) {
      await transaction.rollback();
      console.error(error);
      req.flash('error', error.message || 'Failed to update archive');
      res.redirect('/admin/party/archive');
    }
  },
};

module.exports = PartyArchiveController;