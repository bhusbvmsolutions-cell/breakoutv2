const db = require("../../../models");
const { Op } = require("sequelize");

const BirthdayBlogVenueMappingController = {
  // List all venue mappings for a specific blog
  list: async (req, res) => {
    try {
      const blogId = req.params.blogId;
      const blog = await db.BirthdayBlog.findByPk(blogId);
      if (!blog) {
        req.flash('error', 'Blog not found');
        return res.redirect('/admin/birthday-blog');
      }

      const mappings = await db.BirthdayBlogVenueMapping.findAll({
        where: { blog_id: blogId },
        include: [{ model: db.Venue, as: 'Venue' }],
        order: [['sort_order', 'ASC']],
      });

      // Group mappings by title (since multiple venues can have same title)
      const groupedMappings = {};
      mappings.forEach(mapping => {
        if (!groupedMappings[mapping.title]) {
          groupedMappings[mapping.title] = {
            id: mapping.id,
            title: mapping.title,
            venues: [],
            isActive: mapping.isActive,
            sort_order: mapping.sort_order,
          };
        }
        groupedMappings[mapping.title].venues.push(mapping.Venue);
      });

      const mappingsArray = Object.values(groupedMappings);

      res.render('admin/birthday-blog/venue-mappings/list', {
        title: `Venue Mappings - ${blog.title}`,
        blog,
        mappings: mappingsArray,
        success: req.flash('success'),
        error: req.flash('error'),
      });
    } catch (error) {
      console.error(error);
      req.flash('error', 'Failed to load venue mappings');
      res.redirect('/admin/birthday-blog');
    }
  },

  // Show create mapping page
  create: async (req, res) => {
    try {
      const blogId = req.params.blogId;
      const blog = await db.BirthdayBlog.findByPk(blogId);
      if (!blog) {
        req.flash('error', 'Blog not found');
        return res.redirect('/admin/birthday-blog');
      }

      const venues = await db.Venue.findAll({ where: { isActive: true }, order: [['name', 'ASC']] });

      res.render('admin/birthday-blog/venue-mappings/create', {
        title: `Add Venue Mapping - ${blog.title}`,
        blog,
        venues,
        errors: {},
      });
    } catch (error) {
      console.error(error);
      req.flash('error', 'Failed to load create form');
      res.redirect(`/admin/birthday-blog/${req.params.blogId}/venue-mappings`);
    }
  },

  // Store new mapping
  store: async (req, res) => {
    const transaction = await db.sequelize.transaction();
    try {
      const { blog_id, title, venue_ids, isActive } = req.body;

      if (!title) throw new Error('Title is required');
      if (!venue_ids || !Array.isArray(venue_ids) || venue_ids.length === 0) {
        throw new Error('At least one venue must be selected');
      }

      // Get current max sort order
      const maxSort = await db.BirthdayBlogVenueMapping.max('sort_order', { 
        where: { blog_id }, 
        transaction 
      });
      const newSortOrder = (maxSort || 0) + 1;

      // Create mappings for each venue
      for (let i = 0; i < venue_ids.length; i++) {
        const venueId = venue_ids[i];
        await db.BirthdayBlogVenueMapping.create({
          blog_id,
          venue_id: venueId,
          title,
          sort_order: newSortOrder,
          isActive: isActive === 'on',
        }, { transaction });
      }

      await transaction.commit();
      req.flash('success', 'Venue mapping added successfully');
      res.redirect(`/admin/birthday-blog/${blog_id}/venue-mappings`);
    } catch (error) {
      await transaction.rollback();
      console.error(error);
      req.flash('error', error.message || 'Failed to add venue mapping');
      res.redirect(`/admin/birthday-blog/${req.body.blog_id}/venue-mappings/create`);
    }
  },

  // Show edit mapping page
  edit: async (req, res) => {
    try {
      const mappingId = req.params.id;
      const mapping = await db.BirthdayBlogVenueMapping.findOne({
        where: { id: mappingId },
        include: [{ model: db.Venue, as: 'Venue' }],
      });
      
      if (!mapping) {
        req.flash('error', 'Mapping not found');
        return res.redirect('/admin/birthday-blog');
      }

      // Get all venues for this mapping (same title)
      const allMappings = await db.BirthdayBlogVenueMapping.findAll({
        where: { 
          blog_id: mapping.blog_id, 
          title: mapping.title,
          sort_order: mapping.sort_order 
        },
        include: [{ model: db.Venue, as: 'Venue' }],
      });

      const selectedVenueIds = allMappings.map(m => m.venue_id);
      const venues = await db.Venue.findAll({ where: { isActive: true }, order: [['name', 'ASC']] });
      const blog = await db.BirthdayBlog.findByPk(mapping.blog_id);

      res.render('admin/birthday-blog/venue-mappings/edit', {
        title: 'Edit Venue Mapping',
        mapping: {
          id: mapping.id,
          title: mapping.title,
          venue_ids: selectedVenueIds,
          isActive: mapping.isActive,
          sort_order: mapping.sort_order,
          blog_id: mapping.blog_id,
        },
        blog,
        venues,
        selectedVenueIds,
        errors: {},
      });
    } catch (error) {
      console.error(error);
      req.flash('error', 'Failed to load edit form');
      res.redirect('/admin/birthday-blog');
    }
  },

  // Update mapping
  update: async (req, res) => {
    const transaction = await db.sequelize.transaction();
    try {
      const mappingId = req.params.id;
      const { title, venue_ids, isActive } = req.body;

      const existingMappings = await db.BirthdayBlogVenueMapping.findAll({
        where: { id: mappingId },
        transaction,
      });
      
      if (existingMappings.length === 0) throw new Error('Mapping not found');
      
      const blogId = existingMappings[0].blog_id;
      const sortOrder = existingMappings[0].sort_order;

      if (!title) throw new Error('Title is required');
      if (!venue_ids || !Array.isArray(venue_ids) || venue_ids.length === 0) {
        throw new Error('At least one venue must be selected');
      }

      // Delete all mappings with this title and sort_order
      await db.BirthdayBlogVenueMapping.destroy({
        where: { 
          blog_id: blogId, 
          sort_order: sortOrder 
        },
        transaction,
      });

      // Create new mappings for each selected venue
      for (let i = 0; i < venue_ids.length; i++) {
        const venueId = venue_ids[i];
        await db.BirthdayBlogVenueMapping.create({
          blog_id: blogId,
          venue_id: venueId,
          title,
          sort_order: sortOrder,
          isActive: isActive === 'on',
        }, { transaction });
      }

      await transaction.commit();
      req.flash('success', 'Venue mapping updated successfully');
      res.redirect(`/admin/birthday-blog/${blogId}/venue-mappings`);
    } catch (error) {
      await transaction.rollback();
      console.error(error);
      req.flash('error', error.message || 'Failed to update mapping');
      res.redirect(`/admin/birthday-blog/${req.params.id}/edit`);
    }
  },

  // Delete mapping
  delete: async (req, res) => {
    const transaction = await db.sequelize.transaction();
    try {
      const mappingId = req.params.id;
      const mapping = await db.BirthdayBlogVenueMapping.findByPk(mappingId, { transaction });
      if (!mapping) throw new Error('Mapping not found');

      // Delete all mappings with same title and sort_order
      await db.BirthdayBlogVenueMapping.destroy({
        where: { 
          blog_id: mapping.blog_id, 
          sort_order: mapping.sort_order 
        },
        transaction,
      });

      await transaction.commit();
      
      if (req.xhr || req.headers.accept?.includes('json')) {
        return res.json({ success: true, message: 'Mapping deleted successfully', blogId: mapping.blog_id });
      }
      
      req.flash('success', 'Mapping deleted successfully');
      res.redirect(`/admin/birthday-blog/${mapping.blog_id}/venue-mappings`);
    } catch (error) {
      await transaction.rollback();
      console.error(error);
      if (req.xhr || req.headers.accept?.includes('json')) {
        return res.status(500).json({ success: false, message: error.message || 'Failed to delete mapping' });
      }
      req.flash('error', 'Failed to delete mapping');
      res.redirect('/admin/birthday-blog');
    }
  },

  // Toggle status
  toggleStatus: async (req, res) => {
    try {
      const mappingId = req.params.id;
      const mapping = await db.BirthdayBlogVenueMapping.findOne({ where: { id: mappingId } });
      if (!mapping) return res.status(404).json({ success: false, message: 'Mapping not found' });

      // Update all mappings with same title and sort_order
      await db.BirthdayBlogVenueMapping.update(
        { isActive: !mapping.isActive },
        { 
          where: { 
            blog_id: mapping.blog_id, 
            sort_order: mapping.sort_order 
          } 
        }
      );

      res.json({ success: true, isActive: !mapping.isActive });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Failed to toggle status' });
    }
  },
};

module.exports = BirthdayBlogVenueMappingController;