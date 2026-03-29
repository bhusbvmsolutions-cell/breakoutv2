// controllers/admin/VirtualGameController.js
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

const VirtualGameController = {
  index: async (req, res) => {
    try {
      const games = await db.VirtualGame.findAll({
        order: [['createdAt', 'DESC']],
      });
      res.render('admin/virtual/game/index', {
        title: 'Virtual Games',
        games,
        success: req.flash('success'),
        error: req.flash('error'),
      });
    } catch (error) {
      console.error(error);
      req.flash('error', 'Failed to load games');
      res.redirect('/admin/dashboard');
    }
  },

  create: async (req, res) => {
    try {
      res.render('admin/virtual/game/create', { title: 'Add Virtual Game', game: null, errors: {} });
    } catch (error) {
      console.error(error);
      req.flash('error', 'Failed to load create form');
      res.redirect('/admin/virtual/game');
    }
  },

  store: async (req, res) => {
    const transaction = await db.sequelize.transaction();
    try {
      const files = groupFilesByFieldname(req.files);
      const body = req.body;

      if (!body.title) throw new Error('Title is required');
      let slug = body.slug || slugify(body.title, { lower: true, strict: true });
      const existingSlug = await db.VirtualGame.findOne({ where: { slug }, transaction });
      if (existingSlug) throw new Error('Slug already exists');

      const gameData = {
        title: body.title,
        slug,
        banner_heading: body.banner_heading,
        banner_description: body.banner_description,
        banner_content: body.banner_content,
        success_rate: body.success_rate,
        capacity: body.capacity,
        cta_label: body.cta_label,
        cta_link: body.cta_link,
        video_trailer: body.video_trailer,
        isActive: body.isActive === 'on',
      };
      if (files.banner_image && files.banner_image[0]) {
        gameData.banner_image = `/uploads/virtual/game/${files.banner_image[0].filename}`;
      } else if (body.banner_image) {
        gameData.banner_image = body.banner_image;
      }

      const game = await db.VirtualGame.create(gameData, { transaction });

      let faqslug = `vg:${game.slug}`;
      await findOrCreatePage(game.id, game.title, faqslug, 'virtualgame');

      await transaction.commit();
      req.flash('success', 'Game created successfully');
      res.redirect('/admin/virtual/game');
    } catch (error) {
      await transaction.rollback();
      console.error(error);
      req.flash('error', error.message || 'Failed to create game');
      res.redirect('/admin/virtual/game/create');
    }
  },

  edit: async (req, res) => {
    try {
      const game = await db.VirtualGame.findByPk(req.params.id);
      if (!game) {
        req.flash('error', 'Game not found');
        return res.redirect('/admin/virtual/game');
      }
      res.render('admin/virtual/game/edit', { title: 'Edit Virtual Game', game, errors: {} });
    } catch (error) {
      console.error(error);
      req.flash('error', 'Failed to load edit form');
      res.redirect('/admin/virtual/game');
    }
  },

  update: async (req, res) => {
    const transaction = await db.sequelize.transaction();
    try {
      const game = await db.VirtualGame.findByPk(req.params.id, { transaction });
      if (!game) {
        await transaction.rollback();
        req.flash('error', 'Game not found');
        return res.redirect('/admin/virtual/game');
      }

      const files = groupFilesByFieldname(req.files);
      const body = req.body;

      const updateData = {
        title: body.title,
        slug: body.slug || slugify(body.title, { lower: true, strict: true }),
        banner_heading: body.banner_heading,
        banner_description: body.banner_description,
        banner_content: body.banner_content,
        success_rate: body.success_rate,
        capacity: body.capacity,
        cta_label: body.cta_label,
        cta_link: body.cta_link,
        video_trailer: body.video_trailer,
        isActive: body.isActive === 'on',
      };

      if (files.banner_image && files.banner_image[0]) {
        if (game.banner_image) {
          const oldPath = getImageAbsolutePath(game.banner_image);
          if (oldPath && fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        }
        updateData.banner_image = `/uploads/virtual/game/${files.banner_image[0].filename}`;
      } else if (body.banner_image) {
        updateData.banner_image = body.banner_image;
      }

      if (updateData.slug !== game.slug) {
        const existing = await db.VirtualGame.findOne({ where: { slug: updateData.slug, id: { [db.Sequelize.Op.ne]: game.id } }, transaction });
        if (existing) throw new Error('Slug already exists');
      }

      await game.update(updateData, { transaction });

      let faqslug = `vg:${game.slug}`;
      await findOrCreatePage(game.id, game.title, faqslug, 'virtualgame');


      await transaction.commit();
      req.flash('success', 'Game updated successfully');
      res.redirect('/admin/virtual/game');
    } catch (error) {
      await transaction.rollback();
      console.error(error);
      req.flash('error', error.message || 'Failed to update game');
      res.redirect(`/admin/virtual/game/edit/${req.params.id}`);
    }
  },

  view: async (req, res) => {
    try {
      const game = await db.VirtualGame.findByPk(req.params.id);
      if (!game) {
        req.flash('error', 'Game not found');
        return res.redirect('/admin/virtual/game');
      }
      res.render('admin/virtual/game/show', { title: game.title, game });
    } catch (error) {
      console.error(error);
      req.flash('error', 'Failed to load game');
      res.redirect('/admin/virtual/game');
    }
  },

  delete: async (req, res) => {
    const transaction = await db.sequelize.transaction();
    try {
      const game = await db.VirtualGame.findByPk(req.params.id, { transaction });
      if (!game) {
        await transaction.rollback();
        return res.status(404).json({ success: false, message: 'Game not found' });
      }

      if (game.banner_image) {
        const bannerPath = getImageAbsolutePath(game.banner_image);
        if (bannerPath && fs.existsSync(bannerPath)) fs.unlinkSync(bannerPath);
      }

      await game.destroy({ transaction });

      let faqslug = `vg:${game.slug}`;
      await DeleteFaqPage(game.id, game.title, faqslug, 'virtualgame');

      await transaction.commit();

      if (req.xhr || req.headers.accept?.includes('json')) {
        return res.json({ success: true, message: 'Game deleted successfully' });
      }
      req.flash('success', 'Game deleted successfully');
      res.redirect('/admin/virtual/game');
    } catch (error) {
      await transaction.rollback();
      console.error(error);
      if (req.xhr || req.headers.accept?.includes('json')) {
        return res.status(500).json({ success: false, message: 'Failed to delete game' });
      }
      req.flash('error', 'Failed to delete game');
      res.redirect('/admin/virtual/game');
    }
  },

  toggleStatus: async (req, res) => {
    try {
      const game = await db.VirtualGame.findByPk(req.params.id);
      if (!game) return res.status(404).json({ success: false, message: 'Game not found' });
      game.isActive = !game.isActive;
      await game.save();
      res.json({ success: true, isActive: game.isActive });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Failed to toggle status' });
    }
  },
};

module.exports = VirtualGameController;