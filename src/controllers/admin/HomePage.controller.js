const db = require("../../../models");
const fs = require("fs");
const path = require("path");
const findOrCreatePage = require('../../utils/faqHelper');

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

const HomePageController = {
  async ensureHomePage() {
    let home = await db.HomePage.findByPk(1);
    if (!home) {
      home = await db.HomePage.create({
        banner_heading: '',
        banner_description: '',
        banner_heading1: '',
        banner_heading2: '',
        banner_heading3: '',
        banner_content: '',
        banner_note: '',
        counters_heading: '',
        counters_rating: null,
        footer_heading: '',
        footer_description1: '',
        footer_description2: '',
      });
    }
    return home;
  },

  index: async (req, res) => {
    try {
      const home = await HomePageController.ensureHomePage();
      const fullHome = await db.HomePage.findByPk(home.id, {
        include: [{ model: db.HomePageCounterCard, as: 'counterCards', order: [['sort_order', 'ASC']] }],
      });
      res.render('admin/home/index', {
        title: 'Home Page',
        home: fullHome,
        errors: {},
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
      const home = await HomePageController.ensureHomePage();
      const files = groupFilesByFieldname(req.files);
      const body = req.body;

      const updateData = {
        banner_heading: body.banner_heading,
        banner_description: body.banner_description,
        banner_heading1: body.banner_heading1,
        banner_heading2: body.banner_heading2,
        banner_heading3: body.banner_heading3,
        banner_content: body.banner_content,
        banner_note: body.banner_note,
        counters_heading: body.counters_heading,
        counters_rating: body.counters_rating,
        footer_heading: body.footer_heading,
        footer_description1: body.footer_description1,
        footer_description2: body.footer_description2,
        isActive: body.isActive === 'on',
      };

      // Banner images (3 fields)
      const imageFields = ['banner_image1', 'banner_image2', 'banner_image3'];
      for (const field of imageFields) {
        if (files[field] && files[field][0]) {
          if (home[field]) {
            const oldPath = getImageAbsolutePath(home[field]);
            if (oldPath && fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
          }
          updateData[field] = `/uploads/home/${files[field][0].filename}`;
        } else if (body[field]) {
          updateData[field] = body[field];
        }
      }

      await home.update(updateData, { transaction });

      // Replace counter cards (3 items)
      await db.HomePageCounterCard.destroy({ where: { home_page_id: home.id }, transaction });
      if (body.counter_cards && Array.isArray(body.counter_cards)) {
        for (let i = 0; i < body.counter_cards.length; i++) {
          const card = body.counter_cards[i];
          const imageFile = files[`counter_cards[${i}][image]`]?.[0];
          await db.HomePageCounterCard.create({
            home_page_id: home.id,
            sort_order: i,
            count: card.count,
            description: card.description,
            image: imageFile ? `/uploads/home/${imageFile.filename}` : (card.image || null),
          }, { transaction });
        }
      }

      await findOrCreatePage(null, "Home Page", "home-page", "archive");

      await transaction.commit();
      req.flash('success', 'Home page updated successfully');
      res.redirect('/admin/home');
    } catch (error) {
      await transaction.rollback();
      console.error(error);
      req.flash('error', error.message || 'Failed to update home page');
      res.redirect('/admin/home');
    }
  },
};

module.exports = HomePageController;