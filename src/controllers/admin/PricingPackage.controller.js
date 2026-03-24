const db = require("../../../models");

const PricingPackageController = {
  // List all packages
  index: async (req, res) => {
    try {
      const packages = await db.PricingPackage.findAll({
        include: [
          { model: db.PricingPackageCategory, as: 'categories' },
          { model: db.PricingPackageAttribute, as: 'attributes', order: [['sort_order', 'ASC']] },
        ],
        order: [['createdAt', 'DESC']],
      });
      res.render('admin/pricing/packages/index', {
        title: 'Pricing Packages',
        packages,
        success: req.flash('success'),
        error: req.flash('error'),
      });
    } catch (error) {
      console.error(error);
      req.flash('error', 'Failed to load packages');
      res.redirect('/admin/dashboard');
    }
  },

  // Show create form
  create: async (req, res) => {
    try {
      const categories = await db.PricingPackageCategory.findAll({ where: { isActive: true }, order: [['name', 'ASC']] });
      res.render('admin/pricing/packages/create', {
        title: 'Add Pricing Package',
        package: null,
        categories,
        errors: {},
      });
    } catch (error) {
      console.error(error);
      req.flash('error', 'Failed to load create form');
      res.redirect('/admin/pricing/packages');
    }
  },

  // Store new package
  store: async (req, res) => {
    const transaction = await db.sequelize.transaction();
    try {
      const { name, mincapacity, maxcapacity, categories, attributes, isActive } = req.body;

      console.log("bodydata: ==================================================================/n",req.body);

      const packageData = {
        name:name,
        min_capacity: mincapacity,
        max_capacity: maxcapacity,
        isActive: isActive === 'on',
      };

      const pkg = await db.PricingPackage.create(packageData, { transaction });

      // Link categories (many-to-many)
      if (categories && Array.isArray(categories)) {
        const categoryMappings = categories.map(categoryId => ({
          package_id: pkg.id,
          category_id: categoryId,
        }));
        await db.PricingPackageCategoryMapping.bulkCreate(categoryMappings, { transaction });
      }

      // Add attributes
      if (attributes && Array.isArray(attributes)) {
        for (let i = 0; i < attributes.length; i++) {
          const attr = attributes[i];
          await db.PricingPackageAttribute.create({
            package_id: pkg.id,
            name: attr.name,
            type: attr.type,
            price: attr.price,
            sort_order: i,
          }, { transaction });
        }
      }

      await transaction.commit();
      req.flash('success', 'Package created successfully');
      res.redirect('/admin/pricing/packages');
    } catch (error) {
      await transaction.rollback();
      console.error(error);
      req.flash('error', error.message || 'Failed to create package');
      res.redirect('/admin/pricing/packages/create');
    }
  },

  // Show edit form
  edit: async (req, res) => {
    try {
      const pkg = await db.PricingPackage.findByPk(req.params.id, {
        include: [
          { model: db.PricingPackageCategory, as: 'categories' },
          { model: db.PricingPackageAttribute, as: 'attributes', order: [['sort_order', 'ASC']] },
        ],
      });
      if (!pkg) {
        req.flash('error', 'Package not found');
        return res.redirect('/admin/pricing/packages');
      }
      const categories = await db.PricingPackageCategory.findAll({ where: { isActive: true }, order: [['name', 'ASC']] });
      res.render('admin/pricing/packages/edit', {
        title: 'Edit Pricing Package',
        package: pkg,
        categories,
        errors: {},
      });
    } catch (error) {
      console.error(error);
      req.flash('error', 'Failed to load edit form');
      res.redirect('/admin/pricing/packages');
    }
  },

  // Update package
  update: async (req, res) => {
    const transaction = await db.sequelize.transaction();
    try {
      const pkg = await db.PricingPackage.findByPk(req.params.id, { transaction });
      if (!pkg) throw new Error('Package not found');

      const { name, mincapacity, maxcapacity, categories, attributes, isActive } = req.body;

      await pkg.update({
        name,
        min_capacity: mincapacity,
        max_capacity: maxcapacity,
        isActive: isActive === 'on',
      }, { transaction });

      // Update categories (many-to-many)
      await db.PricingPackageCategoryMapping.destroy({ where: { package_id: pkg.id }, transaction });
      if (categories && Array.isArray(categories) && categories.length) {
        const categoryMappings = categories.map(categoryId => ({
          package_id: pkg.id,
          category_id: categoryId,
        }));
        await db.PricingPackageCategoryMapping.bulkCreate(categoryMappings, { transaction });
      }

      // Update attributes
      await db.PricingPackageAttribute.destroy({ where: { package_id: pkg.id }, transaction });
      if (attributes && Array.isArray(attributes)) {
        for (let i = 0; i < attributes.length; i++) {
          const attr = attributes[i];
          await db.PricingPackageAttribute.create({
            package_id: pkg.id,
            name: attr.name,
            type: attr.type,
            price: attr.price,
            sort_order: i,
          }, { transaction });
        }
      }

      await transaction.commit();
      req.flash('success', 'Package updated successfully');
      res.redirect('/admin/pricing/packages');
    } catch (error) {
      await transaction.rollback();
      console.error(error);
      req.flash('error', error.message || 'Failed to update package');
      res.redirect(`/admin/pricing/packages/edit/${req.params.id}`);
    }
  },

  // Delete package
  delete: async (req, res) => {
    const transaction = await db.sequelize.transaction();
    try {
      const pkg = await db.PricingPackage.findByPk(req.params.id, { transaction });
      if (!pkg) throw new Error('Package not found');
      await pkg.destroy({ transaction });
      await transaction.commit();
      res.json({ success: true, message: 'Package deleted successfully' });
    } catch (error) {
      await transaction.rollback();
      console.error(error);
      res.status(500).json({ success: false, message: error.message || 'Failed to delete package' });
    }
  },

  // Toggle status
  toggleStatus: async (req, res) => {
    try {
      const pkg = await db.PricingPackage.findByPk(req.params.id);
      if (!pkg) return res.status(404).json({ success: false, message: 'Package not found' });
      pkg.isActive = !pkg.isActive;
      await pkg.save();
      res.json({ success: true, isActive: pkg.isActive });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Failed to toggle status' });
    }
  },
};

module.exports = PricingPackageController;