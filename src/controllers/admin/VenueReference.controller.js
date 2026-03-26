const db = require("../../../models");
const slugify = require("slugify");

class VenueReferenceController {
  constructor(modelName, viewPath, title) {
    this.modelName = modelName;
    this.viewPath = viewPath;
    this.title = title;
  }

  async index(req, res) {
    try {
      const items = await db[this.modelName].findAll({ 
        order: [['name', 'ASC']] 
      });
      res.render(`${this.viewPath}/index`, {
        title: this.title,
        items,
        success: req.flash('success'),
        error: req.flash('error'),
      });
    } catch (error) {
      console.error(error);
      req.flash('error', `Failed to load ${this.title}`);
      res.redirect('/admin/dashboard');
    }
  }

  async create(req, res) {
    try {
      res.render(`${this.viewPath}/create`, { 
        title: `Add ${this.title}`, 
        item: null, 
        errors: {} 
      });
    } catch (error) {
      console.error(error);
      req.flash('error', `Failed to load create form`);
      res.redirect(`/${this.viewPath}`);
    }
  }

  async store(req, res) {
    const transaction = await db.sequelize.transaction();
    try {
      const { name, description, isActive } = req.body;
      let slug = req.body.slug || slugify(name, { lower: true, strict: true });
      
      const existing = await db[this.modelName].findOne({ 
        where: { slug }, 
        transaction 
      });
      if (existing) throw new Error('Slug already exists');

      await db[this.modelName].create({
        name,
        slug,
        description,
        isActive: isActive === 'on',
      }, { transaction });

      await transaction.commit();
      req.flash('success', `${this.title} created successfully`);
      res.redirect(`/${this.viewPath}`);
    } catch (error) {
      await transaction.rollback();
      console.error(error);
      req.flash('error', error.message || `Failed to create ${this.title}`);
      res.redirect(`/${this.viewPath}/create`);
    }
  }

  async edit(req, res) {
    try {
      const item = await db[this.modelName].findByPk(req.params.id);
      if (!item) {
        req.flash('error', `${this.title} not found`);
        return res.redirect(`/${this.viewPath}`);
      }
      res.render(`${this.viewPath}/edit`, { 
        title: `Edit ${this.title}`, 
        item, 
        errors: {} 
      });
    } catch (error) {
      console.error(error);
      req.flash('error', `Failed to load edit form`);
      res.redirect(`/${this.viewPath}`);
    }
  }

  async update(req, res) {
    const transaction = await db.sequelize.transaction();
    try {
      const item = await db[this.modelName].findByPk(req.params.id, { transaction });
      if (!item) throw new Error(`${this.title} not found`);

      const { name, description, isActive } = req.body;
      let slug = req.body.slug || slugify(name, { lower: true, strict: true });
      
      if (slug !== item.slug) {
        const existing = await db[this.modelName].findOne({ 
          where: { 
            slug, 
            id: { [db.Sequelize.Op.ne]: item.id } 
          }, 
          transaction 
        });
        if (existing) throw new Error('Slug already exists');
      }

      await item.update({
        name,
        slug,
        description,
        isActive: isActive === 'on',
      }, { transaction });

      await transaction.commit();
      req.flash('success', `${this.title} updated successfully`);
      res.redirect(`/${this.viewPath}`);
    } catch (error) {
      await transaction.rollback();
      console.error(error);
      req.flash('error', error.message || `Failed to update ${this.title}`);
      res.redirect(`/${this.viewPath}/edit/${req.params.id}`);
    }
  }

  async delete(req, res) {
    const transaction = await db.sequelize.transaction();
    try {
      const item = await db[this.modelName].findByPk(req.params.id, { transaction });
      if (!item) throw new Error(`${this.title} not found`);
      await item.destroy({ transaction });
      await transaction.commit();
      res.json({ success: true, message: `${this.title} deleted successfully` });
    } catch (error) {
      await transaction.rollback();
      console.error(error);
      res.status(500).json({ success: false, message: error.message || `Failed to delete ${this.title}` });
    }
  }

  async toggleStatus(req, res) {
    try {
      const item = await db[this.modelName].findByPk(req.params.id);
      if (!item) return res.status(404).json({ success: false, message: `${this.title} not found` });
      item.isActive = !item.isActive;
      await item.save();
      res.json({ success: true, isActive: item.isActive });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Failed to toggle status' });
    }
  }
}

module.exports = VenueReferenceController;