const db = require('../../../models');
const { Op } = require('sequelize');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

// Configure multer for logo upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../../public/uploads/logos');
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueName = uuidv4() + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

const fileFilter = (req, file, cb) => {
  // Accept images only
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
  if (!allowedTypes.includes(file.mimetype)) {
    req.fileValidationError = 'Only image files are allowed (JPEG, PNG, GIF, WEBP, SVG)!';
    return cb(new Error('Only image files are allowed!'), false);
  }
  cb(null, true);
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 2 * 1024 * 1024 // 2MB limit
  },
  fileFilter: fileFilter
}).single('image');

const logoController = {
  // List all logos
  listLogos: async (req, res) => {
    try {
      const type = req.query.type || 'all';
      const where = {};

      if (type !== 'all') {
        where.type = type;
      }

      const logos = await db.Logo.findAll({
        where,
        order: [
          ['type', 'ASC'],
          ['order', 'ASC'],
          ['createdAt', 'DESC'],
        ],
      });

      // Separate counts for dashboard
      const newsCount = await db.Logo.count({ where: { type: 'news' } });
      const brandsCount = await db.Logo.count({ where: { type: 'brands' } });
      const activeCount = await db.Logo.count({ where: { status: true } });
      const inactiveCount = await db.Logo.count({ where: { status: false } });

      res.render('admin/logos/index', {
        title: 'Logo Management',
        logos,
        currentType: type,
        stats: {
          news: newsCount,
          brands: brandsCount,
          active: activeCount,
          inactive: inactiveCount,
          total: newsCount + brandsCount,
        },
        user: req.session.user,
        success: req.flash('success'),
        error: req.flash('error'),
      });
    } catch (error) {
      console.error('List Logos Error:', error);
      req.flash('error', 'Failed to load logos');
      res.redirect('/admin/dashboard');
    }
  },

  // Show upload form
  showUploadForm: (req, res) => {
    res.render('admin/logos/upload', {
      title: 'Upload Logo',
      user: req.session.user,
      error: req.flash('error'),
    });
  },

  // Upload logo
  uploadLogo: async (req, res) => {
    upload(req, res, async function(err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          req.flash('error', 'File too large. Maximum size is 2MB');
        } else {
          req.flash('error', err.message);
        }
        return res.redirect('/admin/logos/upload');
      } else if (err) {
        req.flash('error', err.message);
        return res.redirect('/admin/logos/upload');
      }

      if (req.fileValidationError) {
        req.flash('error', req.fileValidationError);
        return res.redirect('/admin/logos/upload');
      }

      if (!req.file) {
        req.flash('error', 'Please select an image to upload');
        return res.redirect('/admin/logos/upload');
      }

      try {
        const { type, link, title, order } = req.body;

        // Validate type
        if (!type || !['news', 'brands'].includes(type)) {
          req.flash('error', 'Invalid logo type');
          // Delete uploaded file
          fs.unlinkSync(req.file.path);
          return res.redirect('/admin/logos/upload');
        }

        // Validate link
        if (!link) {
          req.flash('error', 'Link is required');
          fs.unlinkSync(req.file.path);
          return res.redirect('/admin/logos/upload');
        }

        await db.Logo.create({
          type,
          image: req.file.filename,
          link: link,
          title: title || null,
          order: parseInt(order) || 0,
          status: true,
        });

        req.flash('success', 'Logo uploaded successfully');
        res.redirect('/admin/logos');
      } catch (error) {
        console.error('Upload Error:', error);
        // Delete uploaded file if database save fails
        if (req.file && req.file.path) {
          fs.unlinkSync(req.file.path);
        }
        req.flash('error', 'Failed to save logo information');
        res.redirect('/admin/logos/upload');
      }
    });
  },

  // Edit logo form
  editLogoForm: async (req, res) => {
    try {
      const logo = await db.Logo.findByPk(req.params.id);

      if (!logo) {
        req.flash('error', 'Logo not found');
        return res.redirect('/admin/logos');
      }

      res.render('admin/logos/edit', {
        title: 'Edit Logo',
        logo,
        user: req.session.user,
        error: req.flash('error'),
      });
    } catch (error) {
      console.error('Edit Logo Error:', error);
      req.flash('error', 'Failed to load logo');
      res.redirect('/admin/logos');
    }
  },

  // Update logo
  updateLogo: async (req, res) => {
    try {
      const { type, link, title, order, status } = req.body;
      const logo = await db.Logo.findByPk(req.params.id);

      if (!logo) {
        if (req.xhr || req.headers.accept.indexOf('json') > -1) {
          return res.status(404).json({ success: false, error: 'Logo not found' });
        }
        req.flash('error', 'Logo not found');
        return res.redirect('/admin/logos');
      }

      // Validate link
      if (!link) {
        if (req.xhr || req.headers.accept.indexOf('json') > -1) {
          return res.status(400).json({ success: false, error: 'Link is required' });
        }
        req.flash('error', 'Link is required');
        return res.redirect(`/admin/logos/${req.params.id}/edit`);
      }

      await logo.update({
        type: type || logo.type,
        link: link,
        title: title || logo.title,
        order: parseInt(order) || logo.order,
        status: status === 'on' || status === 'true' || status === true,
      });

      if (req.xhr || req.headers.accept.indexOf('json') > -1) {
        return res.json({ success: true, message: 'Logo updated successfully' });
      }

      req.flash('success', 'Logo updated successfully');
      res.redirect('/admin/logos');
    } catch (error) {
      console.error('Update Logo Error:', error);
      if (req.xhr || req.headers.accept.indexOf('json') > -1) {
        return res.status(500).json({ success: false, error: 'Failed to update logo' });
      }
      req.flash('error', 'Failed to update logo');
      res.redirect(`/admin/logos/${req.params.id}/edit`);
    }
  },

  // Delete logo
  deleteLogo: async (req, res) => {
    try {
      const logo = await db.Logo.findByPk(req.params.id);

      if (!logo) {
        if (req.xhr || req.headers.accept.indexOf('json') > -1) {
          return res.status(404).json({ success: false, error: 'Logo not found' });
        }
        req.flash('error', 'Logo not found');
        return res.redirect('/admin/logos');
      }

      // Delete image file
      const imagePath = path.join(__dirname, '../../public/uploads/logos', logo.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }

      await logo.destroy();

      if (req.xhr || req.headers.accept.indexOf('json') > -1) {
        return res.json({ success: true, message: 'Logo deleted successfully' });
      }

      req.flash('success', 'Logo deleted successfully');
      res.redirect('/admin/logos');
    } catch (error) {
      console.error('Delete Logo Error:', error);
      if (req.xhr || req.headers.accept.indexOf('json') > -1) {
        return res.status(500).json({ success: false, error: 'Failed to delete logo' });
      }
      req.flash('error', 'Failed to delete logo');
      res.redirect('/admin/logos');
    }
  },

  // Toggle status (AJAX)
  toggleStatus: async (req, res) => {
    try {
      const logo = await db.Logo.findByPk(req.params.id);

      if (!logo) {
        return res.status(404).json({ success: false, error: 'Logo not found' });
      }

      await logo.update({ status: !logo.status });

      res.json({
        success: true,
        status: logo.status,
        message: `Logo ${logo.status ? 'activated' : 'deactivated'} successfully`,
      });
    } catch (error) {
      console.error('Toggle Status Error:', error);
      res.status(500).json({ success: false, error: 'Failed to toggle status' });
    }
  },

  // Update order (for drag & drop sorting)
  updateOrder: async (req, res) => {
    try {
      const { items } = req.body; // array of { id, order }

      if (!Array.isArray(items)) {
        return res.status(400).json({ success: false, error: 'Invalid data format' });
      }

      for (const item of items) {
        await db.Logo.update(
          { order: item.order },
          { where: { id: item.id } }
        );
      }

      res.json({ success: true, message: 'Order updated successfully' });
    } catch (error) {
      console.error('Update Order Error:', error);
      res.status(500).json({ success: false, error: 'Failed to update order' });
    }
  },

  // Bulk delete
  bulkDelete: async (req, res) => {
    try {
      const { ids } = req.body;

      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ success: false, error: 'No logos selected' });
      }

      const logos = await db.Logo.findAll({
        where: {
          id: { [Op.in]: ids }
        }
      });

      // Delete image files
      for (const logo of logos) {
        const imagePath = path.join(__dirname, '../../public/uploads/logos', logo.image);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      }

      await db.Logo.destroy({
        where: {
          id: { [Op.in]: ids }
        }
      });

      res.json({ success: true, message: `${logos.length} logos deleted successfully` });
    } catch (error) {
      console.error('Bulk Delete Error:', error);
      res.status(500).json({ success: false, error: 'Failed to delete logos' });
    }
  },

  // Bulk update status
  bulkUpdateStatus: async (req, res) => {
    try {
      const { ids, status } = req.body;

      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ success: false, error: 'No logos selected' });
      }

      await db.Logo.update(
        { status: status === 'true' || status === true },
        {
          where: {
            id: { [Op.in]: ids }
          }
        }
      );

      res.json({ success: true, message: `${ids.length} logos updated successfully` });
    } catch (error) {
      console.error('Bulk Update Error:', error);
      res.status(500).json({ success: false, error: 'Failed to update logos' });
    }
  },
};

module.exports = logoController;