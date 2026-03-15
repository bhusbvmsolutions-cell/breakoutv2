const db = require('../../models');

const DEFAULT_ACTIONS = ['view', 'create', 'edit', 'delete', 'manage'];
const EXTRA_RESOURCES = ['dashboard', 'settings'];
const IGNORED_TABLES = new Set(['sequelizemeta', 'sequelizedata', 'sessions']);

const normalizeTableName = (value) => {
  if (!value) return null;
  if (typeof value === 'string') return value;
  if (typeof value === 'object') {
    if (value.tableName) return value.tableName;
    if (value.name) return value.name;
  }
  return String(value);
};

const listResourcesFromDatabaseTables = async () => {
  const queryInterface = db.sequelize.getQueryInterface();
  const tablesRaw = await queryInterface.showAllTables();
  const tableNames = (tablesRaw || [])
    .map(normalizeTableName)
    .filter(Boolean)
    .filter(name => !IGNORED_TABLES.has(String(name).toLowerCase()));

  return new Set([...tableNames, ...EXTRA_RESOURCES]);
};

const listModuleIdsByKey = async () => {
  try {
    const modules = await db.Module.findAll({
      attributes: ['id', 'key'],
      order: [['order', 'ASC']]
    });

    return new Map(modules.map(m => [m.key, m.id]));
  } catch (error) {
    // Module linking is optional.
    return new Map();
  }
};

const generateAllPermissions = async () => {
  const resources = await listResourcesFromDatabaseTables();
  const moduleIdByKey = await listModuleIdsByKey();

  const permissions = [];

  for (const resource of Array.from(resources).sort()) {
    for (const action of DEFAULT_ACTIONS) {
      permissions.push({
        name: `${action}_${resource}`,
        resource,
        action,
        description: `Can ${action} ${resource}`,
        isSystem: true,
        moduleId: moduleIdByKey.get(resource) || null
      });
    }
  }

  permissions.push({
    name: 'manage_all',
    resource: 'system',
    action: 'manage',
    description: 'Can manage all system resources',
    isSystem: true,
    moduleId: null
  });

  return permissions;
};

const autoCreatePermissions = async () => {
  try {
    const queryInterface = db.sequelize.getQueryInterface();
    const tablesRaw = await queryInterface.showAllTables();
    const tableNames = (tablesRaw || []).map(normalizeTableName).filter(Boolean);

    // Skip noisy startup errors when DB isn't migrated yet.
    if (!tableNames.some(t => String(t).toLowerCase() === 'permissions')) {
      console.log('Permissions table not found; skipping auto permission generation.');
      return { created: 0, skipped: 0, skippedReason: 'permissions_table_missing' };
    }

    const permissions = await generateAllPermissions();
    let created = 0;
    let skipped = 0;

    for (const permData of permissions) {
      const [, createdFlag] = await db.Permission.findOrCreate({
        where: { name: permData.name },
        defaults: permData
      });
      if (createdFlag) created++; else skipped++;
    }

    console.log(`Permissions auto-created: ${created}, skipped: ${skipped}`);
    return { created, skipped };
  } catch (error) {
    console.error('Error auto-creating permissions:', error);
    throw error;
  }
};

const assignAllPermissionsToSuperAdmin = async () => {
  try {
    const superAdminRole = await db.Role.findOne({ where: { name: 'super_admin' } });
    if (!superAdminRole) return { assigned: 0, skipped: 0 };

    const allPermissions = await db.Permission.findAll();
    let assigned = 0;
    let skipped = 0;

    for (const permission of allPermissions) {
      const [, created] = await db.RolePermission.findOrCreate({
        where: { roleId: superAdminRole.id, permissionId: permission.id },
        defaults: { roleId: superAdminRole.id, permissionId: permission.id, grantedBy: null }
      });
      if (created) assigned++; else skipped++;
    }

    console.log(`Permissions assigned to super admin: ${assigned}, skipped: ${skipped}`);
    return { assigned, skipped };
  } catch (error) {
    console.error('Error assigning permissions to super admin:', error);
    throw error;
  }
};

const assignDefaultPermissionsToAdmin = async () => {
  try {
    const adminRole = await db.Role.findOne({ where: { name: 'admin' } });
    if (!adminRole) return { assigned: 0, skipped: 0 };

    const allPermissions = await db.Permission.findAll();
    const assignable = allPermissions.filter(p => !(p.resource === 'system' && p.action === 'manage'));
    let assigned = 0;
    let skipped = 0;

    for (const permission of assignable) {
      const [, created] = await db.RolePermission.findOrCreate({
        where: { roleId: adminRole.id, permissionId: permission.id },
        defaults: { roleId: adminRole.id, permissionId: permission.id, grantedBy: null }
      });
      if (created) assigned++; else skipped++;
    }

    console.log(`Permissions assigned to admin: ${assigned}, skipped: ${skipped}`);
    return { assigned, skipped };
  } catch (error) {
    console.error('Error assigning permissions to admin:', error);
    throw error;
  }
};

module.exports = {
  autoCreatePermissions,
  assignAllPermissionsToSuperAdmin,
  assignDefaultPermissionsToAdmin,
  DEFAULT_ACTIONS
};
