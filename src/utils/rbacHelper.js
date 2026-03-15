const ACTION_ALIASES = {
  read: 'view',
  view: 'view',
  update: 'edit',
  edit: 'edit'
};

const normalizeAction = (action) => {
  if (!action) return action;
  return ACTION_ALIASES[action] || action;
};

const getHighestRoleLevel = (roles = []) => {
  if (!roles || roles.length === 0) return 0;
  return Math.max(...roles.map(role => Number(role?.level || 0)));
};

const isSuperAdmin = (sessionUser, userWithRoles) => {
  const checkUser = (user) => {
    if (!user) return false;
    if (user.role === 'super_admin') return true;
    if (Array.isArray(user.roles) && user.roles.some(role => role.name === 'super_admin')) return true;
    return false;
  };

  return checkUser(sessionUser) || checkUser(userWithRoles);
};

const userHasPermission = (userWithRoles, resource, action) => {
  if (!userWithRoles) return false;

  const normalizedAction = normalizeAction(action);
  const roles = userWithRoles.roles || [];

  if (isSuperAdmin(null, userWithRoles)) {
    return true;
  }

  for (const role of roles) {
    const permissions = role.permissions || [];
    for (const permission of permissions) {
      const permissionResource = (permission.resource || permission.module?.key || '').toString();
      const permissionAction = normalizeAction(permission.action);

      if (permissionResource === 'system' && permissionAction === 'manage') {
        return true;
      }

      if (permissionResource === resource && (permissionAction === normalizedAction || permissionAction === 'manage')) {
        return true;
      }
    }
  }

  return false;
};

const normalizeIdArray = (value) => {
  if (!value) return [];
  const arr = Array.isArray(value) ? value : [value];
  return Array.from(new Set(arr.map(v => Number.parseInt(v, 10)).filter(Number.isInteger)));
};

const filterAssignableRoles = (roles = [], maxLevel, superAdmin) => {
  if (superAdmin) return roles;
  return roles.filter(role => Number(role.level || 0) < Number(maxLevel || 0));
};

module.exports = {
  getHighestRoleLevel,
  isSuperAdmin,
  userHasPermission,
  normalizeAction,
  normalizeIdArray,
  filterAssignableRoles
};
