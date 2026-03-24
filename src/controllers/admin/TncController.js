const db = require("../../../models");

const REFERENCES = ['escaperooms', 'birthdays', 'corporate', 'virtualrooms'];

const TncController = {
  // List all T&C pages (ensure they exist)
  list: async (req, res) => {
    try {
      // Ensure all references exist in the database
      for (const ref of REFERENCES) {
        await db.TncPage.findOrCreate({
          where: { reference: ref },
          defaults: {
            title: ref.charAt(0).toUpperCase() + ref.slice(1),
            content: '',
            isActive: true,
          }
        });
      }
      const pages = await db.TncPage.findAll({
        where: { reference: REFERENCES },
        order: [['reference', 'ASC']]
      });
      res.render('admin/tnc/list', {
        title: 'Terms & Conditions',
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

  // Show edit form for a specific reference
  edit: async (req, res) => {
    try {
      const reference = req.params.reference;
      if (!REFERENCES.includes(reference)) {
        req.flash('error', 'Invalid reference');
        return res.redirect('/admin/tnc/list');
      }
      let page = await db.TncPage.findOne({ where: { reference } });
      if (!page) {
        // Create if missing
        page = await db.TncPage.create({
          reference,
          title: reference.charAt(0).toUpperCase() + reference.slice(1),
          content: '',
          isActive: true,
        });
      }
      res.render('admin/tnc/edit', {
        title: `Edit ${page.title}`,
        data: page,
        reference,
        success: req.flash('success'),
        error: req.flash('error'),
      });
    } catch (error) {
      console.error(error);
      req.flash('error', 'Failed to load page');
      res.redirect('/admin/tnc/list');
    }
  },

  // Update a T&C page
  update: async (req, res) => {
    const transaction = await db.sequelize.transaction();
    try {
      const reference = req.params.reference;
      const { title, content } = req.body;
      let page = await db.TncPage.findOne({ where: { reference }, transaction });
      if (!page) {
        await transaction.rollback();
        return res.status(404).json({ success: false, message: 'Page not found' });
      }
      await page.update({ title, content }, { transaction });
      await transaction.commit();
      res.json({ success: true, message: 'Page updated successfully' });
    } catch (error) {
      await transaction.rollback();
      console.error(error);
      res.status(500).json({ success: false, message: error.message || 'Update failed' });
    }
  },

  // Optional: toggle status
  toggleStatus: async (req, res) => {
    try {
      const page = await db.TncPage.findByPk(req.params.id);
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

module.exports = TncController;