'use strict';

const DEFAULT_ACTIONS = ['view', 'create', 'edit', 'delete', 'manage'];
const IGNORED_TABLES = new Set(['sequelizemeta', 'sequelizedata', 'sessions']);

const SYSTEM_MODULES = [
  { name: 'Dashboard', key: 'dashboard', icon: 'speedometer-outline', route: '/admin/dashboard', order: 0, isSystem: true },
  { name: 'Users', key: 'users', icon: 'people-outline', route: '/admin/users', order: 1, isSystem: true },
  { name: 'Roles', key: 'roles', icon: 'shield-check-outline', route: '/admin/roles', order: 2, isSystem: true },
  { name: 'Permissions', key: 'permissions', icon: 'key-outline', route: '/admin/permissions', order: 3, isSystem: true },
  { name: 'Settings', key: 'settings', icon: 'settings-outline', route: '/admin/settings', order: 4, isSystem: true }
];

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      const now = new Date();

      // Ensure base modules exist
      const existingModules = await queryInterface.sequelize.query(
        'SELECT id, `key`, name FROM modules;',
        { type: Sequelize.QueryTypes.SELECT }
      );

      const existingModuleKeys = new Set(existingModules.map(m => m.key));
      const modulesToInsert = SYSTEM_MODULES
        .filter(m => !existingModuleKeys.has(m.key))
        .map(m => ({
          ...m,
          createdAt: now,
          updatedAt: now
        }));

      if (modulesToInsert.length > 0) {
        await queryInterface.bulkInsert('modules', modulesToInsert);
      }

      const modules = await queryInterface.sequelize.query(
        'SELECT id, `key`, name FROM modules;',
        { type: Sequelize.QueryTypes.SELECT }
      );

      const moduleIdByKey = new Map(modules.map(m => [m.key, m.id]));

      const tables = await queryInterface.sequelize.query(
        `SELECT TABLE_NAME AS name
         FROM information_schema.tables
         WHERE TABLE_SCHEMA = DATABASE() AND TABLE_TYPE = 'BASE TABLE';`,
        { type: Sequelize.QueryTypes.SELECT }
      );

      const tableNames = (tables || [])
        .map(t => t.name)
        .filter(Boolean)
        .filter(name => !IGNORED_TABLES.has(String(name).toLowerCase()));

      const resources = new Set([
        ...modules.map(m => m.key),
        ...tableNames
      ]);

      // Build permissions for each resource
      const permissions = [];
      for (const resource of Array.from(resources).sort()) {
        for (const action of DEFAULT_ACTIONS) {
          permissions.push({
            name: `${action}_${resource}`,
            resource,
            action,
            description: `Can ${action} ${resource}`,
            isSystem: true,
            moduleId: moduleIdByKey.get(resource) || null,
            createdAt: now,
            updatedAt: now
          });
        }
      }

      permissions.push({
        name: 'manage_all',
        resource: 'system',
        action: 'manage',
        description: 'Can manage all system resources',
        isSystem: true,
        moduleId: null,
        createdAt: now,
        updatedAt: now
      });

      const existingPermissions = await queryInterface.sequelize.query(
        'SELECT name FROM permissions;',
        { type: Sequelize.QueryTypes.SELECT }
      );
      const existingPermissionNames = new Set(existingPermissions.map(p => p.name));

      const permissionsToInsert = permissions.filter(p => !existingPermissionNames.has(p.name));

      if (permissionsToInsert.length > 0) {
        await queryInterface.bulkInsert('permissions', permissionsToInsert);
      }

      console.log(`Permissions seeded. Inserted: ${permissionsToInsert.length}, Skipped: ${permissions.length - permissionsToInsert.length}`);
    } catch (error) {
      console.error('Error seeding permissions:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    const existingModules = await queryInterface.sequelize.query(
      'SELECT `key` FROM modules;',
      { type: Sequelize.QueryTypes.SELECT }
    );

    const tables = await queryInterface.sequelize.query(
      `SELECT TABLE_NAME AS name
       FROM information_schema.tables
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_TYPE = 'BASE TABLE';`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    const tableNames = (tables || [])
      .map(t => t.name)
      .filter(Boolean)
      .filter(name => !IGNORED_TABLES.has(String(name).toLowerCase()));

    const resources = new Set([
      ...existingModules.map(m => m.key),
      ...tableNames
    ]);

    const permissionNames = [];
    for (const resource of Array.from(resources)) {
      for (const action of DEFAULT_ACTIONS) {
        permissionNames.push(`${action}_${resource}`);
      }
    }
    permissionNames.push('manage_all');

    await queryInterface.bulkDelete('permissions', { name: permissionNames });
  }
};
