const db = require("../../models");

const hasPermission = (resource, action) => {
  return async (req, res, next) => {
    try {
      const userId = req.session?.user?.id;

      if (!userId) {
        return res.redirect("/admin/login");
      }

      const user = await db.User.findByPk(userId, {
        include: [
          {
            model: db.Role,
            as: "roles",
            include: [
              {
                model: db.Permission,
                as: "permissions",
                through: { attributes: [] },
              },
            ],
          },
        ],
      });

      if (!user) {
        return res.redirect("/admin/login");
      }

      // Super admin bypass - check both role field and roles array
      const isSuperAdmin = user.role === "super_admin" || 
        (user.roles && user.roles.some(r => r.name === "super_admin"));
      
      if (isSuperAdmin) {
        return next();
      }

      // Check permission
      let allowed = false;
      
      if (user.roles && user.roles.length > 0) {
        for (const role of user.roles) {
          if (role.permissions && role.permissions.length > 0) {
            const hasPerm = role.permissions.some(p => 
              p.module === resource && p.action === action
            );
            if (hasPerm) {
              allowed = true;
              break;
            }
          }
        }
      }

      if (allowed) {
        return next();
      }

      return res.status(403).render("error", {
        title: "Access Denied",
        message: `You don't have permission to ${action} ${resource}`,
        error: { status: 403 },
      });
    } catch (err) {
      console.error("Permission middleware error:", err);
      next(err);
    }
  };
};

const hasRole = (roles) => {
  return async (req, res, next) => {
    try {
      const userId = req.session?.user?.id;

      if (!userId) {
        return res.redirect("/admin/login");
      }

      const user = await db.User.findByPk(userId, {
        include: [
          {
            model: db.Role,
            as: "roles",
          },
        ],
      });

      if (!user) {
        return res.redirect("/admin/login");
      }

      const roleArray = Array.isArray(roles) ? roles : [roles];
      
      // Check if user has any of the required roles
      const hasRequiredRole = user.role && roleArray.includes(user.role) ||
        (user.roles && user.roles.some(role => roleArray.includes(role.name)));

      if (hasRequiredRole) {
        return next();
      }

      return res.status(403).render("error", {
        title: "Access Denied",
        message: "Insufficient role privileges",
        error: { status: 403 },
      });
    } catch (err) {
      console.error("Role middleware error:", err);
      next(err);
    }
  };
};

const canManageUser = async (req, res, next) => {
  try {
    const currentUserId = req.session?.user?.id;
    const targetUserId = parseInt(req.params.id || req.body.userId);

    const currentUser = await db.User.findByPk(currentUserId, {
      include: [{ model: db.Role, as: "roles" }],
    });

    const targetUser = await db.User.findByPk(targetUserId, {
      include: [{ model: db.Role, as: "roles" }],
    });

    if (!currentUser || !targetUser) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    // Get highest role levels
    const getHighestLevel = (user) => {
      if (!user.roles || user.roles.length === 0) return 0;
      return Math.max(...user.roles.map(r => r.level || 0));
    };

    const currentLevel = getHighestLevel(currentUser);
    const targetLevel = getHighestLevel(targetUser);

    if (currentLevel > targetLevel) {
      return next();
    }

    return res.status(403).render("error", {
      title: "Access Denied",
      message: "You cannot manage users with equal or higher role level",
      error: { status: 403 },
    });
  } catch (err) {
    console.error('Can manage user error:', err);
    next(err);
  }
};

module.exports = {
  hasPermission,
  hasRole,
  canManageUser,
};