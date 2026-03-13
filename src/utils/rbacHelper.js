const getHighestRoleLevel = (roles = []) => {
  if (!roles || roles.length === 0) return 0;
  return Math.max(...roles.map(role => role.level || 0));
};

const isSuperAdmin = (sessionUser, userWithRoles) => {
  if (sessionUser?.role === 'super_admin') return true;
  if (sessionUser?.roles?.some(role => role.name === 'super_admin')) return true;
  if (userWithRoles?.roles?.some(role => role.name === 'super_admin')) return true;
  return false;
};

const userHasPermission = (userWithRoles, resource, action) => {
  const roles = userWithRoles?.roles || [];

  for (const role of roles) {
    const permissions = role.permissions || [];

    for (const permission of permissions) {
      if (permission.resource === 'system' && permission.action === 'manage') {
        return true;
      }

      if (
        permission.resource === resource &&
        (permission.action === action || permission.action === 'manage')
      ) {
        return true;
      }
    }
  }

  return false;
};

const normalizeIdArray = (value) => {
  if (!value) return [];
  const array = Array.isArray(value) ? value : [value];
  const normalized = array
    .map(item => parseInt(item, 10))
    .filter(item => Number.isInteger(item));

  return Array.from(new Set(normalized));
};

const filterAssignableRoles = (roles = [], maxLevel, superAdmin) => {
  if (superAdmin) return roles;
  return roles.filter(role => (role.level || 0) < maxLevel);
};

module.exports = {
  getHighestRoleLevel,
  isSuperAdmin,
  userHasPermission,
  normalizeIdArray,
  filterAssignableRoles
};
