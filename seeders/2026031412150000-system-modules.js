'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const modules = [
      { name: 'Users', key: 'users', icon: 'people-outline', route: '/admin/users', order: 1, isSystem: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Roles', key: 'roles', icon: 'shield-check-outline', route: '/admin/roles', order: 2, isSystem: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Permissions', key: 'permissions', icon: 'key-outline', route: '/admin/permissions', order: 3, isSystem: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Dashboard', key: 'dashboard', icon: 'speedometer-outline', route: '/admin/dashboard', order: 0, isSystem: true, createdAt: new Date(), updatedAt: new Date() },
      { name: 'Settings', key: 'settings', icon: 'settings-outline', route: '/admin/settings', order: 4, isSystem: true, createdAt: new Date(), updatedAt: new Date() }
    ];
    const existingModules = await queryInterface.sequelize.query(
      'SELECT `key` FROM modules;',
      { type: Sequelize.QueryTypes.SELECT }
    );
    const existingKeys = new Set(existingModules.map(m => m.key));
    const missingModules = modules.filter(m => !existingKeys.has(m.key));

    if (missingModules.length > 0) {
      await queryInterface.bulkInsert('modules', missingModules, {});
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('modules', { key: ['users', 'roles', 'permissions', 'dashboard', 'settings'] }, {});
  }
};
