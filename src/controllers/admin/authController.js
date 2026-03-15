const db = require('../../../models');
const bcrypt = require('bcryptjs');

const authController = {
  // Display login form
  loginForm: (req, res) => {
    res.render('admin/login', {
      title: 'Admin Login',
      error: null,
      message: null,  // Always pass message
      email: '',      // Always pass email
      layout: false
    });
  },

  // Handle login
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      // Find user with roles
      const user = await db.User.findOne({
        where: { email },
        include: [
          {
            model: db.Role,
            as: 'roles',
            through: { attributes: [] }
          }
        ]
      });

      // Check if user exists
      if (!user) {
        return res.render('admin/login', {
          title: 'Admin Login',
          error: 'Invalid email or password',
          message: null,
          email,
          layout: false
        });
      }

      // Check if user is active
      if (!user.isActive) {
        return res.render('admin/login', {
          title: 'Admin Login',
          error: 'Your account has been deactivated',
          message: null,
          email,
          layout: false
        });
      }

      // Verify password
      const isValidPassword = await user.comparePassword(password);
      if (!isValidPassword) {
        return res.render('admin/login', {
          title: 'Admin Login',
          error: 'Invalid email or password',
          message: null,
          email,
          layout: false
        });
      }

      // Check if user has admin role
      const hasAdminRole = user.role === 'admin' || 
                          user.role === 'super_admin' ||
                          (user.roles && user.roles.some(r => 
                            ['admin', 'super_admin'].includes(r.name)
                          ));

      if (!hasAdminRole) {
        return res.render('admin/login', {
          title: 'Admin Login',
          error: 'You do not have admin privileges',
          message: null,
          email,
          layout: false
        });
      }

      // Update last login
      await user.update({ lastLogin: new Date() });

      // Set session
      const highestRole = Array.isArray(user.roles) && user.roles.length > 0
        ? user.roles.reduce((max, role) => (role.level > (max?.level || -Infinity) ? role : max), null)
        : null;
      const sessionRoleName = highestRole?.name || user.role;

      req.session.user = {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: sessionRoleName,
        roles: user.roles ? user.roles.map(r => ({
          id: r.id,
          name: r.name,
          level: r.level
        })) : []
      };

      // Save session
      req.session.save((err) => {
        if (err) {
          console.error('Session save error:', err);
          return res.render('admin/login', {
            title: 'Admin Login',
            error: 'Login failed. Please try again.',
            message: null,
            email,
            layout: false
          });
        }
        
        res.redirect('/admin/dashboard');
      });

    } catch (error) {
      console.error('Login error:', error);
      res.render('admin/login', {
        title: 'Admin Login',
        error: 'An error occurred. Please try again.',
        message: null,
        email: req.body.email || '',
        layout: false
      });
    }
  },

  // Handle logout
  logout: (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error('Logout error:', err);
      }
      res.clearCookie('connect.sid');
      res.redirect('/admin/login');
    });
  },

  // Forgot password form
  forgotPasswordForm: (req, res) => {
    res.render('admin/forgot-password', {
      title: 'Forgot Password',
      message: null,
      error: null,
      email: '',
      layout: 'layouts/admin'
    });
  },

  // Handle forgot password
  forgotPassword: async (req, res) => {
    try {
      const { email } = req.body;

      const user = await db.User.findOne({ where: { email } });

      if (!user) {
        return res.render('admin/forgot-password', {
          title: 'Forgot Password',
          error: 'Email not found',
          message: null,
          email,
          layout: 'layouts/admin'
        });
      }

      // Generate reset token (in production, send email)
      const resetToken = Math.random().toString(36).substring(2, 15);
      const resetExpires = new Date(Date.now() + 3600000); // 1 hour

      await user.update({
        resetPasswordToken: resetToken,
        resetPasswordExpires: resetExpires
      });

      // In production, send email here
      console.log(`Password reset link: http://localhost:${process.env.PORT}/admin/reset-password/${resetToken}`);

      res.render('admin/forgot-password', {
        title: 'Forgot Password',
        message: 'Password reset instructions have been sent to your email',
        error: null,
        email: '',
        layout: 'layouts/admin'
      });

    } catch (error) {
      console.error('Forgot password error:', error);
      res.render('admin/forgot-password', {
        title: 'Forgot Password',
        error: 'An error occurred. Please try again.',
        message: null,
        email: req.body.email || '',
        layout: 'layouts/admin'
      });
    }
  },

  // Reset password form
  resetPasswordForm: async (req, res) => {
    try {
      const { token } = req.params;

      const user = await db.User.findOne({
        where: {
          resetPasswordToken: token,
          resetPasswordExpires: { [db.Sequelize.Op.gt]: new Date() }
        }
      });

      if (!user) {
        return res.render('admin/login', {
          title: 'Admin Login',
          error: 'Password reset link is invalid or has expired',
          message: null,
          email: '',
          layout: false
        });
      }

      res.render('admin/reset-password', {
        title: 'Reset Password',
        token,
        error: null,
        message: null,
        layout: 'layouts/admin'
      });

    } catch (error) {
      console.error('Reset password form error:', error);
      res.redirect('/admin/login');
    }
  },

  // Handle reset password
  resetPassword: async (req, res) => {
    try {
      const { token } = req.params;
      const { password, confirmPassword } = req.body;

      if (password !== confirmPassword) {
        return res.render('admin/reset-password', {
          title: 'Reset Password',
          token,
          error: 'Passwords do not match',
          message: null,
          layout: 'layouts/admin'
        });
      }

      const user = await db.User.findOne({
        where: {
          resetPasswordToken: token,
          resetPasswordExpires: { [db.Sequelize.Op.gt]: new Date() }
        }
      });

      if (!user) {
        return res.render('admin/login', {
          title: 'Admin Login',
          error: 'Password reset link is invalid or has expired',
          message: null,
          email: '',
          layout: false
        });
      }

      // Update password
      user.password = password;
      user.resetPasswordToken = null;
      user.resetPasswordExpires = null;
      await user.save();

      res.render('admin/login', {
        title: 'Admin Login',
        message: 'Password reset successful. Please login with your new password.',
        error: null,
        email: '',
        layout: false
      });

    } catch (error) {
      console.error('Reset password error:', error);
      res.render('admin/reset-password', {
        title: 'Reset Password',
        token: req.params.token,
        error: 'An error occurred. Please try again.',
        message: null,
        layout: 'layouts/admin'
      });
    }
  }
};

module.exports = authController;
