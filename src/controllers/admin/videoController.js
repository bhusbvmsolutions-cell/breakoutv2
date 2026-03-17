const db = require('../../../models');
const { Op } = require('sequelize');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

// Configure multer for video upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../../public/uploads/videos');
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
  // Accept video files only
  const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime', 'video/x-msvideo'];
  if (!allowedTypes.includes(file.mimetype)) {
    req.fileValidationError = 'Only video files are allowed (MP4, WEBM, OGG, MOV, AVI)!';
    return cb(new Error('Only video files are allowed!'), false);
  }
  cb(null, true);
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 500 * 1024 * 1024 // 500MB limit
  },
  fileFilter: fileFilter
}).single('video');

const videoController = {
  // List all videos
  listVideos: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 12;
      const offset = (page - 1) * limit;
      const search = req.query.search || '';
      const status = req.query.status || '';

      const where = {};
      
      if (search) {
        where[Op.or] = [
          { filename: { [Op.like]: `%${search}%` } },
          { title: { [Op.like]: `%${search}%` } },
          { description: { [Op.like]: `%${search}%` } },
          { uniqueName: { [Op.like]: `%${search}%` } }
        ];
      }

      if (status) {
        where.status = status;
      }

      const { count, rows: videos } = await db.Video.findAndCountAll({
        where,
        order: [['createdAt', 'DESC']],
        limit,
        offset,
        distinct: true
      });

      // Get stats
      const totalVideos = await db.Video.count();
      const totalSize = await db.Video.sum('size');
      
      // Get status counts
      const statusCounts = await db.Video.findAll({
        attributes: [
          'status',
          [db.sequelize.fn('COUNT', db.sequelize.col('id')), 'count']
        ],
        group: ['status']
      });

      // Format bytes
      const formatBytes = (bytes, decimals = 2) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
      };

      res.render('admin/videos/index', {
        title: 'Video Management',
        videos,
        pagination: {
          page,
          limit,
          total: count,
          pages: Math.ceil(count / limit)
        },
        search,
        selectedStatus: status,
        statusCounts,
        stats: {
          totalVideos,
          totalSize: formatBytes(totalSize || 0),
        },
        user: req.session.user
      });

    } catch (error) {
      console.error('List Videos Error:', error);
      req.flash('error', 'Failed to load videos');
      res.redirect('/admin/dashboard');
    }
  },

  // Show upload form
  showUploadForm: (req, res) => {
    res.render('admin/videos/upload', {
      title: 'Upload Video',
      user: req.session.user
    });
  },

  // Upload video (SIMPLIFIED - no ffmpeg)
  uploadVideo: async (req, res) => {
    upload(req, res, async function(err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          req.flash('error', 'File too large. Maximum size is 500MB');
        } else {
          req.flash('error', err.message);
        }
        return res.redirect('/admin/videos/upload');
      } else if (err) {
        req.flash('error', err.message);
        return res.redirect('/admin/videos/upload');
      }

      if (req.fileValidationError) {
        req.flash('error', req.fileValidationError);
        return res.redirect('/admin/videos/upload');
      }

      if (!req.file) {
        req.flash('error', 'Please select a video to upload');
        return res.redirect('/admin/videos/upload');
      }

      try {
        const { title, description } = req.body;

        // SIMPLIFIED: Just save the video without processing
        await db.Video.create({
          filename: req.file.originalname,
          uniqueName: req.file.filename,
          path: req.file.path,
          url: '/uploads/videos/' + req.file.filename,
          thumbnail: null, // No thumbnail
          title: title || req.file.originalname,
          description: description || null,
          size: req.file.size,
          duration: null, // No duration
          format: null, // No format
          mimeType: req.file.mimetype,
          width: null, // No dimensions
          height: null,
          quality: null, // No quality
          status: 'active'
        });

        req.flash('success', 'Video uploaded successfully');
        res.redirect('/admin/videos');

      } catch (error) {
        console.error('Upload Error:', error);
        // Delete uploaded file if database save fails
        if (req.file && req.file.path) {
          fs.unlinkSync(req.file.path);
        }
        req.flash('error', 'Failed to save video information');
        res.redirect('/admin/videos/upload');
      }
    });
  },

  // View single video
  viewVideo: async (req, res) => {
    try {
      const video = await db.Video.findByPk(req.params.id);

      if (!video) {
        req.flash('error', 'Video not found');
        return res.redirect('/admin/videos');
      }

      res.render('admin/videos/view', {
        title: 'View Video',
        video,
        user: req.session.user
      });

    } catch (error) {
      console.error('View Video Error:', error);
      req.flash('error', 'Failed to load video');
      res.redirect('/admin/videos');
    }
  },

  // Update video details
  updateVideo: async (req, res) => {
    try {
      const { title, description, status } = req.body;
      const video = await db.Video.findByPk(req.params.id);

      if (!video) {
        if (req.xhr || req.headers.accept.indexOf('json') > -1) {
          return res.status(404).json({ 
            success: false, 
            error: 'Video not found' 
          });
        }
        req.flash('error', 'Video not found');
        return res.redirect('/admin/videos');
      }

      await video.update({
        title: title || video.title,
        description: description || video.description,
        status: status || video.status
      });

      if (req.xhr || req.headers.accept.indexOf('json') > -1) {
        return res.json({ 
          success: true, 
          message: 'Video updated successfully',
          video 
        });
      }

      req.flash('success', 'Video updated successfully');
      res.redirect(`/admin/videos/${video.id}`);

    } catch (error) {
      console.error('Update Video Error:', error);
      
      if (req.xhr || req.headers.accept.indexOf('json') > -1) {
        return res.status(500).json({ 
          success: false, 
          error: 'Failed to update video' 
        });
      }
      
      req.flash('error', 'Failed to update video');
      res.redirect(`/admin/videos/${req.params.id}`);
    }
  },

  // Delete video
  deleteVideo: async (req, res) => {
    try {
      const video = await db.Video.findByPk(req.params.id);

      if (!video) {
        if (req.xhr || req.headers.accept.indexOf('json') > -1) {
          return res.status(404).json({ 
            success: false, 
            error: 'Video not found' 
          });
        }
        req.flash('error', 'Video not found');
        return res.redirect('/admin/videos');
      }

      // Delete video file
      if (fs.existsSync(video.path)) {
        fs.unlinkSync(video.path);
      }

      // Delete from database
      await video.destroy();

      if (req.xhr || req.headers.accept.indexOf('json') > -1) {
        return res.json({ 
          success: true, 
          message: 'Video deleted successfully' 
        });
      }

      req.flash('success', 'Video deleted successfully');
      res.redirect('/admin/videos');

    } catch (error) {
      console.error('Delete Video Error:', error);
      
      if (req.xhr || req.headers.accept.indexOf('json') > -1) {
        return res.status(500).json({ 
          success: false, 
          error: 'Failed to delete video' 
        });
      }
      
      req.flash('error', 'Failed to delete video');
      res.redirect('/admin/videos');
    }
  },

  // Bulk delete videos
  bulkDelete: async (req, res) => {
    try {
      const { videoIds } = req.body;
      
      if (!videoIds || !Array.isArray(videoIds) || videoIds.length === 0) {
        return res.status(400).json({ 
          success: false, 
          error: 'No videos selected' 
        });
      }

      const videos = await db.Video.findAll({
        where: {
          id: { [Op.in]: videoIds }
        }
      });

      // Delete files from disk
      for (const video of videos) {
        if (fs.existsSync(video.path)) {
          fs.unlinkSync(video.path);
        }
      }

      // Delete from database
      await db.Video.destroy({
        where: {
          id: { [Op.in]: videoIds }
        }
      });

      res.json({ 
        success: true, 
        message: `${videos.length} videos deleted successfully` 
      });

    } catch (error) {
      console.error('Bulk Delete Error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to delete videos' 
      });
    }
  },

  // Bulk update status
  bulkUpdateStatus: async (req, res) => {
    try {
      const { videoIds, status } = req.body;
      
      if (!videoIds || !Array.isArray(videoIds) || videoIds.length === 0) {
        return res.status(400).json({ 
          success: false, 
          error: 'No videos selected' 
        });
      }

      if (!status || !['active', 'inactive'].includes(status)) {
        return res.status(400).json({ 
          success: false, 
          error: 'Invalid status' 
        });
      }

      await db.Video.update(
        { status },
        {
          where: {
            id: { [Op.in]: videoIds }
          }
        }
      );

      res.json({ 
        success: true, 
        message: `${videoIds.length} videos updated successfully` 
      });

    } catch (error) {
      console.error('Bulk Update Error:', error);
      res.status(500).json({ 
        success: false, 
        error: 'Failed to update videos' 
      });
    }
  },

  // Get recent videos (for dashboard/widgets)
  getRecentVideos: async (req, res) => {
    try {
      const limit = parseInt(req.query.limit) || 5;
      const videos = await db.Video.findAll({
        where: { status: 'active' },
        order: [['createdAt', 'DESC']],
        limit,
      });
      
      res.json({
        success: true,
        videos
      });

    } catch (error) {
      console.error('Get Recent Videos Error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get recent videos'
      });
    }
  }
};

module.exports = videoController;