const db = require('../../../models');

const dashboardController = {

  // Main dashboard
  index: async (req, res) => {
    try {

      const userId = req.session?.user?.id;
      if (!userId) {
        return res.redirect('/admin/login');
      }

      // Dashboard stats
      const stats = {
        totalUsers: await db.User.count(),
        totalVideos: await db.Video.count(),
        totalImages: await db.Image.count(),
        totalEscapeRooms: await db.EscapeRoom.count(),
        totalRoles: await db.Role.count(),
        totalPermissions: await db.Permission.count(),

        recentUsers: await db.User.findAll({
          limit: 5,
          order: [['createdAt', 'DESC']],
          attributes: ['id', 'firstName', 'lastName', 'email', 'createdAt']
        })
      };

      // Get logged in user with roles
      const userWithRoles = await db.User.findByPk(userId, {
        include: [{
          model: db.Role,
          as: 'roles',
          attributes: ['id', 'name', 'displayName', 'level'],
          through: { attributes: [] }
        }]
      });

      res.render('admin/dashboard', {
        title: 'Dashboard',
        stats,
        userRoles: userWithRoles?.roles || [],
        layout: 'layouts/admin'
      });

    } catch (error) {
      console.error('Dashboard error:', error);

      res.status(500).render('error', {
        title: 'Error',
        message: 'Failed to load dashboard',
        error: process.env.NODE_ENV === 'development' ? error : {},
        layout: false
      });
    }
  },

  // Profile page
  profile: async (req, res) => {
    try {

      const user = await db.User.findByPk(req.session.user.id, {
        include: [{
          model: db.Role,
          as: 'roles',
          attributes: ['id', 'name', 'displayName', 'level'],
          through: { attributes: [] }
        }],
        attributes: { exclude: ['password'] }
      });

      if (!user) {
        return res.redirect('/admin/logout');
      }

      res.render('admin/profile', {
        title: 'My Profile',
        user,
        layout: 'layouts/admin'
      });

    } catch (error) {
      console.error('Profile error:', error);
      res.redirect('/admin/dashboard');
    }
  },

  // Update profile
  updateProfile: async (req, res) => {
    try {

      const { firstName, lastName, phone, bio } = req.body;

      await db.User.update(
        { firstName, lastName, phone, bio },
        { where: { id: req.session.user.id } }
      );

      // update session
      req.session.user.firstName = firstName;
      req.session.user.lastName = lastName;

      req.session.save(() => {
        res.redirect('/admin/profile?success=Profile updated successfully');
      });

    } catch (error) {
      console.error('Update profile error:', error);
      res.redirect('/admin/profile?error=Failed to update profile');
    }
  },

  // Change password
  changePassword: async (req, res) => {
    try {

      const { currentPassword, newPassword, confirmPassword } = req.body;

      if (newPassword !== confirmPassword) {
        return res.redirect('/admin/profile?error=Passwords do not match');
      }

      const user = await db.User.findByPk(req.session.user.id);

      if (!user) {
        return res.redirect('/admin/logout');
      }

      const isValidPassword = await user.comparePassword(currentPassword);

      if (!isValidPassword) {
        return res.redirect('/admin/profile?error=Current password incorrect');
      }

      user.password = newPassword;
      await user.save();

      res.redirect('/admin/profile?success=Password changed successfully');

    } catch (error) {
      console.error('Change password error:', error);
      res.redirect('/admin/profile?error=Failed to change password');
    }
  },

  // Settings
  settings: (req, res) => {

    res.render('admin/settings', {
      title: 'Settings',
      layout: 'layouts/admin'
    });

  }

};

module.exports = dashboardController;