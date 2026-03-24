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

const ActivityController = {
  index: async (req, res) => {
    try {
      const activities = await db.Activity.findAll({ order: [['createdAt', 'DESC']] });
      res.render('admin/activity/index', {
        title: 'Corporate Activities',
        activities,
        success: req.flash('success'),
        error: req.flash('error'),
      });
    } catch (error) {
      console.error(error);
      req.flash('error', 'Failed to load activities');
      res.redirect('/admin/dashboard');
    }
  },

  create: async (req, res) => {
    try {
      const physicalRooms = await db.EscapeRoom.findAll({ where: { isActive: true }, order: [['title', 'ASC']] });
      const virtualRooms = await db.VirtualGame.findAll({ where: { isActive: true }, order: [['title', 'ASC']] });
      res.render('admin/activity/create', {
        title: 'Add Activity',
        activity: null,
        physicalRooms,
        virtualRooms,
        errors: {},
      });
    } catch (error) {
      console.error(error);
      req.flash('error', 'Failed to load create form');
      res.redirect('/admin/activity');
    }
  },

  store: async (req, res) => {
    const transaction = await db.sequelize.transaction();
    try {
      const files = groupFilesByFieldname(req.files);
      const body = req.body;

      if (!body.title) throw new Error('Title is required');
      let slug = body.slug || slugify(body.title, { lower: true, strict: true });
      const existingSlug = await db.Activity.findOne({ where: { slug }, transaction });
      if (existingSlug) throw new Error('Slug already exists');

      // Map form fields to database fields – simple names now
      const activityData = {
        title: body.title,
        slug,
        banner_heading: body.banner_heading,
        banner_description: body.banner_description,
        banner_content: body.banner_content,
        challenge_level: body.challenge_level,
        competitive_activity: body.competitive_activity,
        immersive_rating: body.immersive_rating,
        capacity: body.capacity,
        duration: body.duration,
        virtual_compatibility: body.virtual_compatibility,
        cta_label: body.cta_label,
        cta_link: body.cta_link,
        video_trailer: body.video_trailer,
        content_heading: body.content_heading,
        content_content: body.content_content,
        image_card_section_heading: body.image_card_section_heading,
        isActive: body.isActive === 'on',
      };

      // Banner image
      if (files.banner_image && files.banner_image[0]) {
        activityData.banner_image = `/uploads/activity/${files.banner_image[0].filename}`;
      } else if (body.banner_image) {
        activityData.banner_image = body.banner_image;
      }

      // Fixed images 1,2,3
      for (let i = 1; i <= 3; i++) {
        const field = `image${i}`;   // file input names: image1, image2, image3
        if (files[field] && files[field][0]) {
          activityData[`image${i}`] = `/uploads/activity/${files[field][0].filename}`;
        } else if (body[field]) {
          activityData[`image${i}`] = body[field];
        }
      }

      const activity = await db.Activity.create(activityData, { transaction });

      // Helper to replace child collections
      async function replaceCollection(model, items, fieldMap, fileMap) {
        await model.destroy({ where: { activity_id: activity.id }, transaction });
        if (items && Array.isArray(items)) {
          for (let i = 0; i < items.length; i++) {
            const data = { activity_id: activity.id, sort_order: i };
            for (const [src, dest] of Object.entries(fieldMap)) {
              data[dest] = items[i][src];
            }
            if (fileMap && fileMap.field) {
              const fileKey = `${fileMap.prefix}[${i}][${fileMap.field}]`;
              const file = files[fileKey]?.[0];
              if (file) {
                data[fileMap.dest] = `/uploads/activity/${file.filename}`;
              } else if (items[i][fileMap.dest]) {
                data[fileMap.dest] = items[i][fileMap.dest];
              }
            }
            await model.create(data, { transaction });
          }
        }
      }

      // Image cards (repeater)
      await replaceCollection(
        db.ActivityImageCard,
        body.image_cards,
        { heading: 'heading' },
        { prefix: 'image_cards', field: 'image', dest: 'image' }
      );

      // Escape rooms (junction)
      await db.ActivityEscapeRoom.destroy({ where: { activity_id: activity.id }, transaction });
      if (body.selected_escaperooms && Array.isArray(body.selected_escaperooms)) {
        for (let i = 0; i < body.selected_escaperooms.length; i++) {
          const combinedId = body.selected_escaperooms[i];
          const [type, id] = combinedId.split('_');
          if (type && id && (type === 'physical' || type === 'virtual')) {
            await db.ActivityEscapeRoom.create({
              activity_id: activity.id,
              escaperoom_type: type,
              escaperoom_id: parseInt(id),
              sort_order: i,
            }, { transaction });
          }
        }
      }

      await transaction.commit();
      req.flash('success', 'Activity created successfully');
      res.redirect('/admin/activity');
    } catch (error) {
      await transaction.rollback();
      console.error(error);
      req.flash('error', error.message || 'Failed to create activity');
      res.redirect('/admin/activity/create');
    }
  },

  edit: async (req, res) => {
    try {
      const activity = await db.Activity.findByPk(req.params.id, {
        include: [
          { model: db.ActivityImageCard, as: 'imageCards', order: [['sort_order', 'ASC']] },
          { model: db.ActivityEscapeRoom, as: 'escaperooms', order: [['sort_order', 'ASC']] },
        ],
      });
      if (!activity) {
        req.flash('error', 'Activity not found');
        return res.redirect('/admin/activity');
      }
      const physicalRooms = await db.EscapeRoom.findAll({ where: { isActive: true }, order: [['title', 'ASC']] });
      const virtualRooms = await db.VirtualGame.findAll({ where: { isActive: true }, order: [['title', 'ASC']] });
      res.render('admin/activity/edit', {
        title: 'Edit Activity',
        activity,
        physicalRooms,
        virtualRooms,
        errors: {},
      });
    } catch (error) {
      console.error(error);
      req.flash('error', 'Failed to load edit form');
      res.redirect('/admin/activity');
    }
  },

  update: async (req, res) => {
    const transaction = await db.sequelize.transaction();
    try {
      const activity = await db.Activity.findByPk(req.params.id, { transaction });
      if (!activity) {
        await transaction.rollback();
        req.flash('error', 'Activity not found');
        return res.redirect('/admin/activity');
      }

      const files = groupFilesByFieldname(req.files);
      const body = req.body;

      const updateData = {
        title: body.title,
        slug: body.slug || slugify(body.title, { lower: true, strict: true }),
        banner_heading: body.banner_heading,
        banner_description: body.banner_description,
        banner_content: body.banner_content,
        challenge_level: body.challenge_level,
        competitive_activity: body.competitive_activity,
        immersive_rating: body.immersive_rating,
        capacity: body.capacity,
        duration: body.duration,
        virtual_compatibility: body.virtual_compatibility,
        cta_label: body.cta_label,
        cta_link: body.cta_link,
        video_trailer: body.video_trailer,
        content_heading: body.content_heading,
        content_content: body.content_content,
        image_card_section_heading: body.image_card_section_heading,
        isActive: body.isActive === 'on',
      };

      // Banner image
      if (files.banner_image && files.banner_image[0]) {
        if (activity.banner_image) {
          const oldPath = getImageAbsolutePath(activity.banner_image);
          if (oldPath && fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
        }
        updateData.banner_image = `/uploads/activity/${files.banner_image[0].filename}`;
      } else if (body.banner_image) {
        updateData.banner_image = body.banner_image;
      }

      // Fixed images
      for (let i = 1; i <= 3; i++) {
        const field = `image${i}`;
        if (files[field] && files[field][0]) {
          if (activity[`image${i}`]) {
            const oldPath = getImageAbsolutePath(activity[`image${i}`]);
            if (oldPath && fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
          }
          updateData[`image${i}`] = `/uploads/activity/${files[field][0].filename}`;
        } else if (body[field]) {
          updateData[`image${i}`] = body[field];
        }
      }

      if (updateData.slug !== activity.slug) {
        const existing = await db.Activity.findOne({ where: { slug: updateData.slug, id: { [db.Sequelize.Op.ne]: activity.id } }, transaction });
        if (existing) throw new Error('Slug already exists');
      }

      await activity.update(updateData, { transaction });

      async function replaceCollection(model, items, fieldMap, fileMap) {
        await model.destroy({ where: { activity_id: activity.id }, transaction });
        if (items && Array.isArray(items)) {
          for (let i = 0; i < items.length; i++) {
            const data = { activity_id: activity.id, sort_order: i };
            for (const [src, dest] of Object.entries(fieldMap)) {
              data[dest] = items[i][src];
            }
            if (fileMap && fileMap.field) {
              const fileKey = `${fileMap.prefix}[${i}][${fileMap.field}]`;
              const file = files[fileKey]?.[0];
              if (file) {
                data[fileMap.dest] = `/uploads/activity/${file.filename}`;
              } else if (items[i][fileMap.dest]) {
                data[fileMap.dest] = items[i][fileMap.dest];
              }
            }
            await model.create(data, { transaction });
          }
        }
      }

      // Image cards
      await replaceCollection(
        db.ActivityImageCard,
        body.image_cards,
        { heading: 'heading' },
        { prefix: 'image_cards', field: 'image', dest: 'image' }
      );

      // Escape rooms
      await db.ActivityEscapeRoom.destroy({ where: { activity_id: activity.id }, transaction });
      if (body.selected_escaperooms && Array.isArray(body.selected_escaperooms)) {
        for (let i = 0; i < body.selected_escaperooms.length; i++) {
          const combinedId = body.selected_escaperooms[i];
          const [type, id] = combinedId.split('_');
          if (type && id && (type === 'physical' || type === 'virtual')) {
            await db.ActivityEscapeRoom.create({
              activity_id: activity.id,
              escaperoom_type: type,
              escaperoom_id: parseInt(id),
              sort_order: i,
            }, { transaction });
          }
        }
      }

      await transaction.commit();
      req.flash('success', 'Activity updated successfully');
      res.redirect('/admin/activity');
    } catch (error) {
      await transaction.rollback();
      console.error(error);
      req.flash('error', error.message || 'Failed to update activity');
      res.redirect(`/admin/activity/edit/${req.params.id}`);
    }
  },

  view: async (req, res) => {
    try {
      const activity = await db.Activity.findByPk(req.params.id, {
        include: [
          { model: db.ActivityImageCard, as: 'imageCards', order: [['sort_order', 'ASC']] },
          { model: db.ActivityEscapeRoom, as: 'escaperooms', order: [['sort_order', 'ASC']] },
        ],
      });
      if (!activity) {
        req.flash('error', 'Activity not found');
        return res.redirect('/admin/activity');
      }

      // Fetch actual escape room objects
      const physicalIds = activity.escaperooms?.filter(e => e.escaperoom_type === 'physical').map(e => e.escaperoom_id) || [];
      const virtualIds = activity.escaperooms?.filter(e => e.escaperoom_type === 'virtual').map(e => e.escaperoom_id) || [];
      const physicalRooms = await db.EscapeRoom.findAll({ where: { id: physicalIds } });
      const virtualRooms = await db.VirtualGame.findAll({ where: { id: virtualIds } });

      res.render('admin/activity/show', {
        title: activity.title,
        activity,
        physicalRooms,
        virtualRooms,
      });
    } catch (error) {
      console.error(error);
      req.flash('error', 'Failed to load activity');
      res.redirect('/admin/activity');
    }
  },

  delete: async (req, res) => {
    const transaction = await db.sequelize.transaction();
    try {
      const activity = await db.Activity.findByPk(req.params.id, { transaction });
      if (!activity) {
        await transaction.rollback();
        return res.status(404).json({ success: false, message: 'Activity not found' });
      }

      // Delete main images
      if (activity.banner_image) {
        const bannerPath = getImageAbsolutePath(activity.banner_image);
        if (bannerPath && fs.existsSync(bannerPath)) fs.unlinkSync(bannerPath);
      }
      for (let i = 1; i <= 3; i++) {
        const imgField = `image${i}`;
        if (activity[imgField]) {
          const imgPath = getImageAbsolutePath(activity[imgField]);
          if (imgPath && fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
        }
      }

      // Delete image cards
      const imageCards = await db.ActivityImageCard.findAll({ where: { activity_id: activity.id }, transaction });
      for (const card of imageCards) {
        if (card.image) {
          const imgPath = getImageAbsolutePath(card.image);
          if (imgPath && fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
        }
      }
      await db.ActivityImageCard.destroy({ where: { activity_id: activity.id }, transaction });
      await db.ActivityEscapeRoom.destroy({ where: { activity_id: activity.id }, transaction });
      await activity.destroy({ transaction });

      await transaction.commit();

      if (req.xhr || req.headers.accept?.includes('json')) {
        return res.json({ success: true, message: 'Activity deleted successfully' });
      }
      req.flash('success', 'Activity deleted successfully');
      res.redirect('/admin/activity');
    } catch (error) {
      await transaction.rollback();
      console.error(error);
      if (req.xhr || req.headers.accept?.includes('json')) {
        return res.status(500).json({ success: false, message: 'Failed to delete activity' });
      }
      req.flash('error', 'Failed to delete activity');
      res.redirect('/admin/activity');
    }
  },

  toggleStatus: async (req, res) => {
    try {
      const activity = await db.Activity.findByPk(req.params.id);
      if (!activity) return res.status(404).json({ success: false, message: 'Activity not found' });
      activity.isActive = !activity.isActive;
      await activity.save();
      res.json({ success: true, isActive: activity.isActive });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Failed to toggle status' });
    }
  },
};

module.exports = ActivityController;