const db = require('../../../models');
const { Op } = require('sequelize');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

// Configure multer for image upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../../public/uploads/images');
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
  if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF|webp|WEBP|svg|SVG)$/)) {
    req.fileValidationError = 'Only image files are allowed!';
    return cb(new Error('Only image files are allowed!'), false);
  }
  cb(null, true);
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: fileFilter
}).single('image');

const imageController = {
  // List all images
  listImages: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 12;
      const offset = (page - 1) * limit;
      const search = req.query.search || '';

      const where = {};
      
      if (search) {
        where[Op.or] = [
          { filename: { [Op.like]: `%${search}%` } },
          { title: { [Op.like]: `%${search}%` } },
          { altText: { [Op.like]: `%${search}%` } }
        ];
      }

      const { count, rows: images } = await db.Image.findAndCountAll({
        where,
        order: [['createdAt', 'DESC']],
        limit,
        offset,
        distinct: true
      });

      // Get total size and count for stats
      const totalImages = await db.Image.count();
      const totalSize = await db.Image.sum('size');
      
      // Format bytes to human readable
      const formatBytes = (bytes, decimals = 2) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
      };

      // Group by file type
      const imagesByType = await db.Image.findAll({
        attributes: [
          'mimeType',
          [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'count']
        ],
        group: ['mimeType']
      });

      res.render('admin/images/index', {
        title: 'Image Management',
        images,
        pagination: {
          page,
          limit,
          total: count,
          pages: Math.ceil(count / limit)
        },
        search,
        stats: {
          totalImages,
          totalSize: formatBytes(totalSize),
          imagesByType
        },
        user: req.session.user
      });

    } catch (error) {
      console.error('List Images Error:', error);
      req.flash('error', 'Failed to load images');
      res.redirect('/admin/dashboard');
    }
  },

  // Show upload form
  showUploadForm: (req, res) => {
    res.render('admin/images/upload', {
      title: 'Upload Image',
      user: req.session.user
    });
  },

  // Upload image
  uploadImage: async (req, res) => {
    upload(req, res, async function(err) {
      if (err instanceof multer.MulterError) {
        // A Multer error occurred when uploading
        if (err.code === 'LIMIT_FILE_SIZE') {
          req.flash('error', 'File too large. Maximum size is 5MB');
        } else {
          req.flash('error', err.message);
        }
        return res.redirect('/admin/images/upload');
      } else if (err) {
        // An unknown error occurred
        req.flash('error', err.message);
        return res.redirect('/admin/images/upload');
      }

      // Check file validation error from our custom filter
      if (req.fileValidationError) {
        req.flash('error', req.fileValidationError);
        return res.redirect('/admin/images/upload');
      }

      // Check if file was uploaded
      if (!req.file) {
        req.flash('error', 'Please select an image to upload');
        return res.redirect('/admin/images/upload');
      }

      try {
        const { title, altText } = req.body;
        
        // Get image dimensions
        const sharp = require('sharp');
        const metadata = await sharp(req.file.path).metadata();

        // Create image record in database
        await db.Image.create({
          filename: req.file.originalname,
          uniqueName: req.file.filename,
          path: req.file.path,
          url: '/uploads/images/' + req.file.filename,
          title: title || req.file.originalname,
          altText: altText || title || req.file.originalname,
          size: req.file.size,
          mimeType: req.file.mimetype,
          width: metadata.width,
          height: metadata.height
        });

        req.flash('success', 'Image uploaded successfully');
        res.redirect('/admin/images');

      } catch (error) {
        console.error('Upload Error:', error);
        // Delete uploaded file if database save fails
        if (req.file && req.file.path) {
          fs.unlinkSync(req.file.path);
        }
        req.flash('error', 'Failed to save image information');
        res.redirect('/admin/images/upload');
      }
    });
  },

  // View single image
  viewImage: async (req, res) => {
    try {
      const image = await db.Image.findByPk(req.params.id);

      if (!image) {
        req.flash('error', 'Image not found');
        return res.redirect('/admin/images');
      }

      res.render('admin/images/view', {
        title: 'View Image',
        image,
        user: req.session.user
      });

    } catch (error) {
      console.error('View Image Error:', error);
      req.flash('error', 'Failed to load image');
      res.redirect('/admin/images');
    }
  },

  // Delete image
  deleteImage: async (req, res) => {
    try {
      const image = await db.Image.findByPk(req.params.id);

      if (!image) {
        if (req.xhr || req.headers.accept.indexOf('json') > -1) {
          return res.status(404).json({ 
            success: false, 
            error: 'Image not found' 
          });
        }
        req.flash('error', 'Image not found');
        return res.redirect('/admin/images');
      }

      // Delete file from disk
      if (fs.existsSync(image.path)) {
        fs.unlinkSync(image.path);
      }

      // Delete from database
      await image.destroy();

      // Check if AJAX request
      if (req.xhr || req.headers.accept.indexOf('json') > -1) {
        return res.json({ 
          success: true, 
          message: 'Image deleted successfully' 
        });
      }

      req.flash('success', 'Image deleted successfully');
      res.redirect('/admin/images');

    } catch (error) {
      console.error('Delete Image Error:', error);
      
      if (req.xhr || req.headers.accept.indexOf('json') > -1) {
        return res.status(500).json({ 
          success: false, 
          error: 'Failed to delete image' 
        });
      }
      
      req.flash('error', 'Failed to delete image');
      res.redirect('/admin/images');
    }
  },

  // Bulk delete images
  bulkDelete: async (req, res) => {
    try {
      const { imageIds } = req.body;
      
      if (!imageIds || !Array.isArray(imageIds) || imageIds.length === 0) {
        return res.status(400).json({ 
          success: false, 
          error: 'No images selected' 
        });
      }

      const images = await db.Image.findAll({
        where: {
          id: { [Op.in]: imageIds }
        }
      });

      // Delete files from disk
      for (const image of images) {
        if (fs.existsSync(image.path)) {
          fs.unlinkSync(image.path);
        }
      }

      // Delete from database
      await db.Image.destroy({
        where: {
          id: { [Op.in]: imageIds }
        }
      });

      res.json({ 
        success: true, 
        message: `${images.length} images deleted successfully` 
      });

    } catch (error) {
      console.error('Bulk Delete Error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to delete images' 
      });
    }
  }
};

module.exports = imageController;