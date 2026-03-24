const db = require("../../../models");
const fs = require("fs");
const path = require("path");
const { Op } = require("sequelize");

const PAGES = ['Connect', 'birthday-party', 'home', 'couple'];

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

const FounderMessageController = {
  // List all founder messages (ensure they exist)
  list: async (req, res) => {
    try {
      // Ensure all pages exist
      for (const page of PAGES) {
        await db.FounderMessage.findOrCreate({
          where: { page },
          defaults: {
            heading: '',
            message_title: '',
            banner_video_id: null,
            content: '',
            video: '',
            isActive: true,
          }
        });
      }
      const messages = await db.FounderMessage.findAll({
        where: { page: PAGES },
        order: [['page', 'ASC']],
        include: [{ model: db.FounderMessageImage, as: 'images', order: [['sort_order', 'ASC']] }],
      });
      res.render('admin/foundermessage/list', {
        title: 'Founder Messages',
        messages,
        success: req.flash('success'),
        error: req.flash('error'),
      });
    } catch (error) {
      console.error(error);
      req.flash('error', 'Failed to load messages');
      res.redirect('/admin/dashboard');
    }
  },

  // Show edit form for a specific page
  edit: async (req, res) => {
    try {
      const page = req.params.page;
      if (!PAGES.includes(page)) {
        req.flash('error', 'Invalid page');
        return res.redirect('/admin/founder/message');
      }
      let message = await db.FounderMessage.findOne({
        where: { page },
        include: [{ model: db.FounderMessageImage, as: 'images', order: [['sort_order', 'ASC']] }],
      });
      if (!message) {
        message = await db.FounderMessage.create({
          page,
          heading: '',
          message_title: '',
          banner_video_id: null,
          content: '',
          video: '',
          isActive: true,
        });
      }
      const videos = await db.Video.findAll({ where: { status: 'active' }, order: [['title', 'ASC']] });
      res.render('admin/foundermessage/edit', {
        title: `Edit Founder Message: ${page}`,
        message,
        page,
        videos,
        errors: {},
      });
    } catch (error) {
      console.error(error);
      req.flash('error', 'Failed to load page');
      res.redirect('/admin/founder/message');
    }
  },

  // Update a founder message
  update: async (req, res) => {
    const transaction = await db.sequelize.transaction();
    try {
      const page = req.params.page;
      const message = await db.FounderMessage.findOne({ where: { page }, transaction });
      if (!message) {
        await transaction.rollback();
        return res.status(404).json({ success: false, message: 'Message not found' });
      }

      const files = groupFilesByFieldname(req.files);
      const body = req.body;

      const updateData = {
        heading: body.heading,
        message_title: body.message_title,
        content: body.content,
        video: body.video,
        banner_video_id: body.banner_video_id || null,
        isActive: body.isActive === 'on' ? true : false,
      };

      await message.update(updateData, { transaction });

      // Handle images: remove existing, then add new ones from form
      // The form will have fields like images[0][image_file] for each image, plus hidden for existing
      // We'll use a similar replaceCollection approach
      async function replaceImages(items, fileMap) {
        await db.FounderMessageImage.destroy({ where: { founder_message_id: message.id }, transaction });
        if (items && Array.isArray(items)) {
          for (let i = 0; i < items.length; i++) {
            const data = { founder_message_id: message.id, sort_order: i };
            const fileKey = `${fileMap.prefix}[${i}][${fileMap.field}]`;
            const file = files[fileKey]?.[0];
            if (file) {
              data.image = `/uploads/founder-message/${file.filename}`;
            } else if (items[i].image) {
              data.image = items[i].image;
            }
            if (data.image) {
              await db.FounderMessageImage.create(data, { transaction });
            }
          }
        }
      }

      await replaceImages(body.images, { prefix: 'images', field: 'image_file', dest: 'image' });

      await transaction.commit();
      res.json({ success: true, message: 'Message updated successfully' });
    } catch (error) {
      await transaction.rollback();
      console.error(error);
      res.status(500).json({ success: false, message: error.message || 'Update failed' });
    }
  },

  // Toggle status (optional)
  toggleStatus: async (req, res) => {
    try {
      const message = await db.FounderMessage.findByPk(req.params.id);
      if (!message) return res.status(404).json({ success: false, message: 'Message not found' });
      message.isActive = !message.isActive;
      await message.save();
      res.json({ success: true, isActive: message.isActive });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Failed to toggle status' });
    }
  },
};

module.exports = FounderMessageController;