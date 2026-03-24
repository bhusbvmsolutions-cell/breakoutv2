const db = require("../../../models");
const slugify = require("slugify");

const PricingPackageCategoryController = {
  index: async (req, res) => {
    try {
      const categories = await db.PricingPackageCategory.findAll({ order: [['name', 'ASC']] });
      res.render('admin/pricing/category/index', {
        title: 'Pricing Package Categories',
        categories,
        success: req.flash('success'),
        error: req.flash('error'),
      });
    } catch (error) {
      console.error(error);
      req.flash('error', 'Failed to load categories');
      res.redirect('/admin/dashboard');
    }
  },

  create: async (req, res) => {
    res.render('admin/pricing/category/create', { title: 'Add Category', category: null, errors: {} });
  },

  store: async (req, res) => {
    const transaction = await db.sequelize.transaction();
    try {
      const { name, description, isActive } = req.body;
      let slug = req.body.slug || slugify(name, { lower: true, strict: true });
      const existing = await db.PricingPackageCategory.findOne({ where: { slug }, transaction });
      if (existing) throw new Error('Slug already exists');

      await db.PricingPackageCategory.create({
        name,
        slug,
        description,
        isActive: isActive === 'on',
      }, { transaction });

      await transaction.commit();
      req.flash('success', 'Category created successfully');
      res.redirect('/admin/pricing/category');
    } catch (error) {
      await transaction.rollback();
      console.error(error);
      req.flash('error', error.message || 'Failed to create category');
      res.redirect('/admin/pricing/category/create');
    }
  },

  edit: async (req, res) => {
    try {
      const category = await db.PricingPackageCategory.findByPk(req.params.id);
      if (!category) {
        req.flash('error', 'Category not found');
        return res.redirect('/admin/pricing/category');
      }
      res.render('admin/pricing/category/edit', { title: 'Edit Category', category, errors: {} });
    } catch (error) {
      console.error(error);
      req.flash('error', 'Failed to load edit form');
      res.redirect('/admin/pricing/category');
    }
  },

  update: async (req, res) => {
    const transaction = await db.sequelize.transaction();
    try {
      const category = await db.PricingPackageCategory.findByPk(req.params.id, { transaction });
      if (!category) throw new Error('Category not found');

      const { name, description, isActive } = req.body;
      let slug = req.body.slug || slugify(name, { lower: true, strict: true });
      if (slug !== category.slug) {
        const existing = await db.PricingPackageCategory.findOne({ where: { slug, id: { [db.Sequelize.Op.ne]: category.id } }, transaction });
        if (existing) throw new Error('Slug already exists');
      }

      await category.update({
        name,
        slug,
        description,
        isActive: isActive === 'on',
      }, { transaction });

      await transaction.commit();
      req.flash('success', 'Category updated successfully');
      res.redirect('/admin/pricing/category');
    } catch (error) {
      await transaction.rollback();
      console.error(error);
      req.flash('error', error.message || 'Failed to update category');
      res.redirect(`/admin/pricing/category/edit/${req.params.id}`);
    }
  },

  delete: async (req, res) => {
    const transaction = await db.sequelize.transaction();
    try {
      const category = await db.PricingPackageCategory.findByPk(req.params.id, { transaction });
      if (!category) throw new Error('Category not found');
      await category.destroy({ transaction });
      await transaction.commit();
      res.json({ success: true, message: 'Category deleted successfully' });
    } catch (error) {
      await transaction.rollback();
      console.error(error);
      res.status(500).json({ success: false, message: error.message || 'Failed to delete category' });
    }
  },

  toggleStatus: async (req, res) => {
    try {
      const category = await db.PricingPackageCategory.findByPk(req.params.id);
      if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
      category.isActive = !category.isActive;
      await category.save();
      res.json({ success: true, isActive: category.isActive });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Failed to toggle status' });
    }
  },
};

module.exports = PricingPackageCategoryController;