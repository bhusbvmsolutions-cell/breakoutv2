const db = require("../../../models");
const fs = require("fs");
const path = require("path");
const slugify = require("slugify");

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

const LocationController = {
  // List all locations
  index: async (req, res) => {
    try {
      const locations = await db.Location.findAll({
        order: [['createdAt', 'DESC']],
      });
      res.render('admin/location/index', {
        title: 'Locations',
        locations,
        success: req.flash('success'),
        error: req.flash('error'),
      });
    } catch (error) {
      console.error(error);
      req.flash('error', 'Failed to load locations');
      res.redirect('/admin/dashboard');
    }
  },

  // Show create form
  create: async (req, res) => {
    try {
      res.render('admin/location/create', { title: 'Add Location', location: null, errors: {} });
    } catch (error) {
      console.error(error);
      req.flash('error', 'Failed to load create form');
      res.redirect('/admin/location');
    }
  },

  // Store new location
  store: async (req, res) => {
    const transaction = await db.sequelize.transaction();
    try {
      const files = groupFilesByFieldname(req.files);
      const body = req.body;

      if (!body.title) throw new Error('Title is required');
      let slug = body.slug || slugify(body.title, { lower: true, strict: true });
      const existingSlug = await db.Location.findOne({ where: { slug }, transaction });
      if (existingSlug) throw new Error('Slug already exists');

      const locationData = {
        title: body.title,
        slug,
        description: body.description,
        meta_title: body.meta_title,
        meta_description: body.meta_description,
        meta_keywords: body.meta_keywords,
        isActive: body.isActive === 'on',
      };

      if (files.banner_image && files.banner_image[0]) {
        locationData.banner_image = `/uploads/location/${files.banner_image[0].filename}`;
      }

      await db.Location.create(locationData, { transaction });

      await transaction.commit();
      req.flash('success', 'Location created successfully');
      res.redirect('/admin/location');
    } catch (error) {
      await transaction.rollback();
      console.error(error);
      req.flash('error', error.message || 'Failed to create location');
      res.redirect('/admin/location/create');
    }
  },

  // Show edit form
  edit: async (req, res) => {
    try {
      const location = await db.Location.findByPk(req.params.id);
      if (!location) {
        req.flash('error', 'Location not found');
        return res.redirect('/admin/location');
      }
      res.render('admin/location/edit', { title: 'Edit Location', location, errors: {} });
    } catch (error) {
      console.error(error);
      req.flash('error', 'Failed to load edit form');
      res.redirect('/admin/location');
    }
  },

  // Update location
  update: async (req, res) => {
    const transaction = await db.sequelize.transaction();
    try {
      const location = await db.Location.findByPk(req.params.id, { transaction });
      if (!location) {
        await transaction.rollback();
        req.flash('error', 'Location not found');
        return res.redirect('/admin/location');
      }

      const files = groupFilesByFieldname(req.files);
      const body = req.body;

      const updateData = {
        title: body.title,
        slug: body.slug || slugify(body.title, { lower: true, strict: true }),
        description: body.description,
        meta_title: body.meta_title,
        meta_description: body.meta_description,
        meta_keywords: body.meta_keywords,
        isActive: body.isActive === 'on',
      };

      if (files.banner_image && files.banner_image[0]) {
        if (location.banner_image) {
          const oldPath = getImageAbsolutePath(location.banner_image);
          if (oldPath && fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        }
        updateData.banner_image = `/uploads/location/${files.banner_image[0].filename}`;
      } else if (body.banner_image) {
        updateData.banner_image = body.banner_image;
      }

      if (updateData.slug !== location.slug) {
        const existing = await db.Location.findOne({ where: { slug: updateData.slug, id: { [db.Sequelize.Op.ne]: location.id } }, transaction });
        if (existing) throw new Error('Slug already exists');
      }

      await location.update(updateData, { transaction });
      await transaction.commit();
      req.flash('success', 'Location updated successfully');
      res.redirect('/admin/location');
    } catch (error) {
      await transaction.rollback();
      console.error(error);
      req.flash('error', error.message || 'Failed to update location');
      res.redirect(`/admin/location/edit/${req.params.id}`);
    }
  },

  // View single location
  view: async (req, res) => {
    try {
      const location = await db.Location.findByPk(req.params.id);
      if (!location) {
        req.flash('error', 'Location not found');
        return res.redirect('/admin/location');
      }
      res.render('admin/location/show', { title: location.title, location });
    } catch (error) {
      console.error(error);
      req.flash('error', 'Failed to load location');
      res.redirect('/admin/location');
    }
  },

  // Delete location
  delete: async (req, res) => {
    const transaction = await db.sequelize.transaction();
    try {
      const location = await db.Location.findByPk(req.params.id, { transaction });
      if (!location) {
        await transaction.rollback();
        return res.status(404).json({ success: false, message: 'Location not found' });
      }

      if (location.banner_image) {
        const bannerPath = getImageAbsolutePath(location.banner_image);
        if (bannerPath && fs.existsSync(bannerPath)) fs.unlinkSync(bannerPath);
      }

      await location.destroy({ transaction });
      await transaction.commit();

      if (req.xhr || req.headers.accept?.includes('json')) {
        return res.json({ success: true, message: 'Location deleted successfully' });
      }
      req.flash('success', 'Location deleted successfully');
      res.redirect('/admin/location');
    } catch (error) {
      await transaction.rollback();
      console.error(error);
      if (req.xhr || req.headers.accept?.includes('json')) {
        return res.status(500).json({ success: false, message: 'Failed to delete location' });
      }
      req.flash('error', 'Failed to delete location');
      res.redirect('/admin/location');
    }
  },

  // Toggle status
  toggleStatus: async (req, res) => {
    try {
      const location = await db.Location.findByPk(req.params.id);
      if (!location) return res.status(404).json({ success: false, message: 'Location not found' });
      location.isActive = !location.isActive;
      await location.save();
      res.json({ success: true, isActive: location.isActive });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Failed to toggle status' });
    }
  },
};

module.exports = LocationController;