'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if permissions already exist
    const existingPermissions = await queryInterface.sequelize.query(
      `SELECT id FROM permissions LIMIT 1;`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (existingPermissions.length === 0) {
      const resources = [
        'users',
        'roles',
        'permissions',
        'products',
        'orders',
        'categories',
        'settings',
        'reports',
        'analytics',
        'dashboard'
      ];
      
      const actions = ['create', 'read', 'update', 'delete', 'manage', 'export', 'import'];
      const permissions = [];
      
      // Generate all possible permission combinations
      resources.forEach(resource => {
        actions.forEach(action => {
          // Skip invalid combinations
          if (
            (resource === 'dashboard' && !['read', 'manage'].includes(action)) ||
            (resource === 'settings' && !['read', 'update', 'manage'].includes(action)) ||
            (resource === 'reports' && !['read', 'export', 'manage'].includes(action))
          ) {
            return;
          }

          permissions.push({
            name: `${action}_${resource}`,
            resource,
            action,
            description: `Can ${action} ${resource}`,
            isSystem: true,
            createdAt: new Date(),
            updatedAt: new Date()
          });
        });
      });
      
      // Add special permissions
      const specialPermissions = [
        {
          name: 'manage_all',
          resource: 'system',
          action: 'manage',
          description: 'Can manage all system resources',
          isSystem: true
        },
        {
          name: 'view_reports',
          resource: 'reports',
          action: 'read',
          description: 'Can view reports',
          isSystem: true
        },
        {
          name: 'export_data',
          resource: 'data',
          action: 'export',
          description: 'Can export data from the system',
          isSystem: true
        }
      ];

      specialPermissions.forEach(perm => {
        permissions.push({
          ...perm,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      });
      
      await queryInterface.bulkInsert('permissions', permissions);
      console.log(`✅ ${permissions.length} system permissions seeded`);
    } else {
      console.log('ℹ️ System permissions already exist');
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('permissions', null, {});
  }
};