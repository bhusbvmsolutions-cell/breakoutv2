const db = require('../../../models');

const dashboardController = {
  // Main dashboard
  index: async (req, res) => {
    try {
      // Get statistics for dashboard
      const stats = {
        totalUsers: await db.User.count(),
        totalRoles: await db.Role.count(),
        totalPermissions: await db.Permission.count(),
        recentUsers: await db.User.findAll({
          limit: 5,
          order: [['createdAt', 'DESC']],
          attributes: ['id', 'firstName', 'lastName', 'email', 'createdAt']
        })
      };

      // Get user's role information
      const userWithRoles = await db.User.findByPk(req.session.user.id, {
        include: [{
          model: db.Role,
          as: 'roles',
          through: { attributes: [] }
        }]
      });

      res.render('admin/dashboard', {
        title: 'Dashboard',
        stats,
        userRoles: userWithRoles ? userWithRoles.roles : [],
        layout: 'layouts/admin'
      });

    } catch (error) {
      console.error('Dashboard error:', error);
      res.status(500).render('error', {
        title: 'Error',
        message: 'Failed to load dashboard',
        error: process.env.NODE_ENV === 'development' ? error : {}
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
          through: { attributes: [] }
        }],
        attributes: { exclude: ['password'] }
      });

      res.render('admin/profile', {
        title: 'My Profile',
        user: user,
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

      // Update session
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
        return res.redirect('/admin/profile?error=New passwords do not match');
      }

      const user = await db.User.findByPk(req.session.user.id);

      const isValidPassword = await user.comparePassword(currentPassword);
      if (!isValidPassword) {
        return res.redirect('/admin/profile?error=Current password is incorrect');
      }

      user.password = newPassword;
      await user.save();

      res.redirect('/admin/profile?success=Password changed successfully');

    } catch (error) {
      console.error('Change password error:', error);
      res.redirect('/admin/profile?error=Failed to change password');
    }
  },

  // Settings page
  settings: (req, res) => {
    res.render('admin/settings', {
      title: 'Settings',
      layout: 'layouts/admin'
    });
  }
};

module.exports = dashboardController;