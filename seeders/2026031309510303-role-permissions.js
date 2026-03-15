'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      console.log('Starting role-permissions seeder...');

      const [superAdmin] = await queryInterface.sequelize.query(
        `SELECT id FROM roles WHERE name = 'super_admin' LIMIT 1;`,
        { type: Sequelize.QueryTypes.SELECT }
      );

      if (!superAdmin) {
        console.log('Super admin role not found');
        return;
      }

      const permissions = await queryInterface.sequelize.query(
        `SELECT id, resource, action FROM permissions;`,
        { type: Sequelize.QueryTypes.SELECT }
      );

      if (permissions.length === 0) {
        console.log('No permissions found');
        return;
      }

      console.log(`Found ${permissions.length} permissions to assign to super_admin`);

      let superInserted = 0;
      for (const permission of permissions) {
        await queryInterface.sequelize.query(
          `INSERT IGNORE INTO role_permissions (roleId, permissionId, createdAt, updatedAt)
           VALUES (?, ?, NOW(), NOW());`,
          {
            replacements: [superAdmin.id, permission.id],
            type: Sequelize.QueryTypes.INSERT
          }
        );
        superInserted++;
      }

      console.log(`Assigned ${superInserted} permissions to super_admin`);

      const [admin] = await queryInterface.sequelize.query(
        `SELECT id FROM roles WHERE name = 'admin' LIMIT 1;`,
        { type: Sequelize.QueryTypes.SELECT }
      );

      if (admin) {
        const adminPermissions = permissions.filter(p => !(p.resource === 'system' && p.action === 'manage'));
        let adminInserted = 0;

        for (const permission of adminPermissions) {
          await queryInterface.sequelize.query(
            `INSERT IGNORE INTO role_permissions (roleId, permissionId, createdAt, updatedAt)
             VALUES (?, ?, NOW(), NOW());`,
            {
              replacements: [admin.id, permission.id],
              type: Sequelize.QueryTypes.INSERT
            }
          );
          adminInserted++;
        }

        console.log(`Assigned ${adminInserted} permissions to admin`);
      }

      console.log('Role-permissions seeding completed');
    } catch (error) {
      console.error('Error in role-permissions seeder:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('role_permissions', null, {});
    console.log('Removed all role-permission assignments');
  }
};
