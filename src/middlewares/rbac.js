const db = require('../../models');
const {
  getHighestRoleLevel,
  isSuperAdmin,
  userHasPermission
} = require('../utils/rbacHelper');

const hasPermission = (resource, action) => {
  return async (req, res, next) => {
    try {
      const userId = req.session.user?.id;
      if (!userId) {
        if (req.xhr || req.path.startsWith('/api')) {
          return res.status(401).json({ success: false, error: 'Authentication required' });
        }
        return res.redirect('/admin/login');
      }

      const sessionUser = req.session.user;

      const user = await db.User.findByPk(userId, {
        include: [{
          model: db.Role,
          as: 'roles',
          include: [{
            model: db.Permission,
            as: 'permissions',
            through: { attributes: [] }
          }]
        }]
      });

      if (!user) {
        if (req.xhr || req.path.startsWith('/api')) {
          return res.status(401).json({ success: false, error: 'User not found' });
        }
        return res.redirect('/admin/login');
      }

      if (isSuperAdmin(sessionUser, user)) {
        return next();
      }

      if (userHasPermission(user, resource, action)) {
        return next();
      }

      if (req.xhr || req.path.startsWith('/api')) {
        return res.status(403).json({ success: false, error: `You don't have permission to ${action} ${resource}` });
      }

      return res.status(403).render('error', {
        title: 'Access Denied',
        message: `You don't have permission to ${action} ${resource}`,
        error: { status: 403 }
      });
    } catch (error) {
      console.error('Permission check error:', error);
      next(error);
    }
  };
};

const hasRole = (roleNames) => {
  return async (req, res, next) => {
    try {
      const userId = req.session.user?.id;
      if (!userId) {
        if (req.xhr || req.path.startsWith('/api')) {
          return res.status(401).json({ success: false, error: 'Authentication required' });
        }
        return res.redirect('/admin/login');
      }

      const sessionUser = req.session.user;
      const user = await db.User.findByPk(userId, {
        include: [{ model: db.Role, as: 'roles' }]
      });

      if (!user) {
        if (req.xhr || req.path.startsWith('/api')) {
          return res.status(401).json({ success: false, error: 'User not found' });
        }
        return res.redirect('/admin/login');
      }

      if (isSuperAdmin(sessionUser, user)) {
        return next();
      }

      const roles = Array.isArray(roleNames) ? roleNames : [roleNames];
      const hasRequiredRole = user.roles.some(role => roles.includes(role.name));

      if (hasRequiredRole) {
        return next();
      }

      if (req.xhr || req.path.startsWith('/api')) {
        return res.status(403).json({ success: false, error: 'Insufficient role privileges' });
      }

      return res.status(403).render('error', {
        title: 'Access Denied',
        message: 'You need higher privileges to access this resource',
        error: { status: 403 }
      });
    } catch (error) {
      console.error('Role check error:', error);
      next(error);
    }
  };
};

const canManageUser = async (req, res, next) => {
  try {
    const currentUserId = req.session.user?.id;
    const targetUserId = parseInt(req.params.id || req.body.userId);

    if (!currentUserId) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    if (currentUserId === targetUserId) {
      return next();
    }

    const currentUser = await db.User.findByPk(currentUserId, {
      include: [{ model: db.Role, as: 'roles' }]
    });

    if (!currentUser) {
      return res.status(401).json({ success: false, error: 'User not found' });
    }

    const targetUser = await db.User.findByPk(targetUserId, {
      include: [{ model: db.Role, as: 'roles' }]
    });

    if (!targetUser) {
      return res.status(404).json({ success: false, error: 'Target user not found' });
    }

    const isSuper = isSuperAdmin(req.session.user, currentUser);
    if (isSuper) {
      return next();
    }

    const currentUserLevel = getHighestRoleLevel(currentUser.roles);
    const targetUserLevel = getHighestRoleLevel(targetUser.roles);

    if (currentUserLevel > targetUserLevel) {
      return next();
    }

    const message = 'You cannot manage users with equal or higher role level';
    if (req.xhr || req.path.startsWith('/api')) {
      return res.status(403).json({ success: false, error: message });
    }

    return res.status(403).render('error', { title: 'Access Denied', message, error: { status: 403 } });
  } catch (error) {
    console.error('Manage user check error:', error);
    next(error);
  }
};

module.exports = {
  hasPermission,
  hasRole,
  canManageUser
};
