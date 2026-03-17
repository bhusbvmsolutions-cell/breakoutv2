const db = require('../../../models');
const { Op } = require('sequelize'); // Add this import

const BlogController = {
  // Main dashboard - Grid View
  bloglist: async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 12;
      const offset = (page - 1) * limit;
      const search = req.query.search || '';
      const status = req.query.status || '';
      const sort = req.query.sort || 'latest';
      
      const whereClause = {};
      if (search) {
        whereClause[Op.or] = [
          { title: { [Op.like]: `%${search}%` } },
          { excerpt: { [Op.like]: `%${search}%` } },
          { author: { [Op.like]: `%${search}%` } }
        ];
      }
      if (status) {
        whereClause.status = status;
      }
      
      // Simplified ordering
      let order = [['createdAt', 'DESC']];
      if (sort === 'oldest') {
        order = [['createdAt', 'ASC']];
      }
      
      const { count, rows: blogs } = await db.Blog.findAndCountAll({
        where: whereClause,
        include: [{
          model: db.BlogBlock,
          as: 'blocks',
          required: false,
          attributes: ['id']
        }],
        order,
        limit,
        offset,
        distinct: true
      });
      
      // Simple stats
      const totalBlogs = await db.Blog.count();
      const activeBlogs = await db.Blog.count({ where: { status: 'published' } });
      const totalBlocks = await db.BlogBlock.count();
      const draftBlogs = await db.Blog.count({ where: { status: 'draft' } });
      
      const recentBlogs = await db.Blog.findAll({
        limit: 5,
        order: [['updatedAt', 'DESC']],
        attributes: ['id', 'title', 'status', 'updatedAt']
      });
      
      const stats = {
        totalBlogs,
        activeBlogs,
        totalBlocks,
        draftBlogs,
        featuredBlogs: 0, // Placeholder
        totalViews: 0, // Placeholder
        recentBlogs,
        popularTags: [],
        imagesByType: []
      };
      
      res.render('admin/blogs/index', {
        title: 'Blog Management',
        stats,
        blogs,
        pagination: {
          page,
          limit,
          total: count,
          pages: Math.ceil(count / limit)
        },
        search,
        status,
        sort,
        query: req.query
      });
      
    } catch (error) {
      console.error('Error:', error);
      req.flash('error', 'Failed to load blogs');
      res.redirect('/admin/dashboard');
    }
  }

  
};

module.exports = BlogController;