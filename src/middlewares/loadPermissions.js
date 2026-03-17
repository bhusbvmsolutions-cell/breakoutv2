const db = require('../../models');

module.exports = async (req, res, next) => {
  try {
    const userId = req.session?.user?.id;

    if (!userId) {
      req.permissions = [];
      res.locals.permissions = [];
      return next();
    }

    const user = await db.User.findByPk(userId, {
      include: [
        {
          model: db.Role,
          as: 'roles',
          include: [
            {
              model: db.Permission,
              as: 'permissions',
              through: { attributes: [] }
            }
          ]
        }
      ]
    });

    if (!user) {
      req.permissions = [];
      res.locals.permissions = [];
      return next();
    }

    const permissions = [];

    for (const role of user.roles || []) {
      for (const permission of role.permissions || []) {

        permissions.push({
          module: permission.module,
          action: permission.action
        });

      }
    }

    req.permissions = permissions;
    res.locals.permissions = permissions;

    next();

  } catch (err) {
    console.error('Load permissions error:', err);
    next();
  }
};