const db = require('../../models');
const { isSuperAdmin, normalizeAction } = require('../utils/rbacHelper');
const SidebarService = require('../services/sidebarService');

module.exports = async (req, res, next) => {
  try {
    if (!req.session.user?.id) {
      req.permissions = [];
      req.sidebarModules = [];
      res.locals.sidebarMenu = [];
      res.locals.sidebarModules = [];
      return next();
    }

    const userWithRoles = await db.User.findByPk(req.session.user.id, {
      include: [{
        model: db.Role,
        as: 'roles',
        include: [{
          model: db.Permission,
          as: 'permissions',
          include: [{
            model: db.Module,
            as: 'module'
          }],
          through: { attributes: [] }
        }]
      }]
    });

    if (!userWithRoles) {
      req.permissions = [];
      req.sidebarModules = [];
      res.locals.sidebarMenu = [];
      res.locals.sidebarModules = [];
      return next();
    }

    const permissions = [];
    for (const role of userWithRoles.roles || []) {
      for (const permission of role.permissions || []) {
        permissions.push({
          id: permission.id,
          name: permission.name,
          action: normalizeAction(permission.action),
          moduleKey: permission.module?.key || permission.resource,
          moduleName: permission.module?.name || permission.resource,
          moduleRoute: permission.module?.route || null,
          moduleIcon: permission.module?.icon || null,
          roleId: role.id
        });
      }
    }

    req.permissions = permissions;

    const modules = await db.Module.findAll({ order: [['order', 'ASC']] });
    const hasSystemManage = permissions.some(p => p.moduleKey === 'system' && p.action === 'manage');
    const isSuper = isSuperAdmin(req.session.user, userWithRoles);

    const viewable = (isSuper || hasSystemManage)
      ? modules
      : modules.filter(module =>
          permissions.some(p => p.moduleKey === module.key && p.action === 'view')
        );

    req.sidebarModules = viewable;
    res.locals.sidebarModules = viewable;
    res.locals.sidebarMenu = SidebarService.getFilteredMenu(userWithRoles);
    next();
  } catch (error) {
    console.error('Load permissions middleware error:', error);
    req.permissions = [];
    req.sidebarModules = [];
    res.locals.sidebarMenu = [];
    res.locals.sidebarModules = [];
    next();
  }
};
