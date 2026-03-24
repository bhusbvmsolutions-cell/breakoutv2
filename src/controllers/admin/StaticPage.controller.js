const db = require("../../../models");

// Define the list of static pages we want to manage
const STATIC_PAGES = [
  { slug: 'career', label: 'Career' },
  { slug: 'contact-us', label: 'Contact Us' },
  { slug: 'refund-policy', label: 'Refund Policy' },
  { slug: 'privacy-policy', label: 'Privacy Policy' },
  { slug: 'terms-services', label: 'Terms of Service' },
];

const StaticPageController = {
  // List all static pages
  index: async (req, res) => {
    try {
      // Ensure all pages exist in database (create if not)
      for (const pageInfo of STATIC_PAGES) {
        await db.StaticPage.findOrCreate({
          where: { slug: pageInfo.slug },
          defaults: { heading: '', content: '', isActive: true }
        });
      }
      const pages = await db.StaticPage.findAll({
        where: { slug: STATIC_PAGES.map(p => p.slug) },
        order: [['slug', 'ASC']]
      });
      res.render('admin/static/page/index', {
        title: 'Static Pages',
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

  // Show edit form for a specific static page
  edit: async (req, res) => {
    try {
      const slug = req.params.slug;
      // Ensure page exists (if slug is one of the predefined ones)
      let page = await db.StaticPage.findOne({ where: { slug } });
      if (!page) {
        // If not found, create it (in case someone manually adds a new page)
        page = await db.StaticPage.create({
          slug,
          heading: '',
          content: '',
          isActive: true,
        });
      }
      const pageInfo = STATIC_PAGES.find(p => p.slug === slug);
      const title = pageInfo ? pageInfo.label : slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      res.render('admin/static/page/edit', {
        title: `Edit ${title} Page`,
        page,
        slug,
        errors: {},
      });
    } catch (error) {
      console.error(error);
      req.flash('error', 'Failed to load page');
      res.redirect('/admin/static/pages');
    }
  },

  // Update a static page
  update: async (req, res) => {
    const transaction = await db.sequelize.transaction();
    try {
      const slug = req.params.slug;
      const body = req.body;
      let page = await db.StaticPage.findOne({ where: { slug }, transaction });
      if (!page) {
        page = await db.StaticPage.create({
          slug,
          heading: '',
          content: '',
          isActive: true,
        }, { transaction });
      }

      const updateData = {
        heading: body.heading,
        content: body.content,
        isActive: body.isActive === 'on',
      };

      await page.update(updateData, { transaction });
      await transaction.commit();

      req.flash('success', `${slug.replace(/-/g, ' ')} page updated successfully`);
      res.redirect(`/admin/static/pages`);
    } catch (error) {
      await transaction.rollback();
      console.error(error);
      req.flash('error', error.message || 'Failed to update page');
      res.redirect(`/admin/static/page/${req.params.slug}`);
    }
  },

  // Delete a page (if needed, but we may not use this for predefined pages)
  delete: async (req, res) => {
    const transaction = await db.sequelize.transaction();
    try {
      const page = await db.StaticPage.findByPk(req.params.id, { transaction });
      if (!page) {
        await transaction.rollback();
        return res.status(404).json({ success: false, message: 'Page not found' });
      }
      await page.destroy({ transaction });
      await transaction.commit();

      if (req.xhr || req.headers.accept?.includes('json')) {
        return res.json({ success: true, message: 'Page deleted successfully' });
      }
      req.flash('success', 'Page deleted successfully');
      res.redirect('/admin/static/pages');
    } catch (error) {
      await transaction.rollback();
      console.error(error);
      if (req.xhr || req.headers.accept?.includes('json')) {
        return res.status(500).json({ success: false, message: 'Failed to delete page' });
      }
      req.flash('error', 'Failed to delete page');
      res.redirect('/admin/static/pages');
    }
  },

  // Toggle status (optional)
  toggleStatus: async (req, res) => {
    try {
      const page = await db.StaticPage.findByPk(req.params.id);
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

module.exports = StaticPageController;