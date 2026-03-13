'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    try {
      console.log('🚀 Starting role-permissions seeder...');
      
      // Get super admin role
      const [superAdmin] = await queryInterface.sequelize.query(
        `SELECT id FROM roles WHERE name = 'super_admin' LIMIT 1;`,
        { type: Sequelize.QueryTypes.SELECT }
      );
      
      if (!superAdmin) {
        console.log('⚠️ Super admin role not found');
        return;
      }

      // Get all permissions
      const permissions = await queryInterface.sequelize.query(
        `SELECT id FROM permissions;`,
        { type: Sequelize.QueryTypes.SELECT }
      );

      if (permissions.length === 0) {
        console.log('⚠️ No permissions found');
        return;
      }

      console.log(`📊 Found ${permissions.length} permissions to assign to super_admin`);

      // Clear existing super admin permissions
      await queryInterface.sequelize.query(
        `DELETE FROM role_permissions WHERE roleId = ?;`,
        {
          replacements: [superAdmin.id],
          type: Sequelize.QueryTypes.DELETE
        }
      );

      // Insert all permissions for super admin
      let inserted = 0;
      for (const permission of permissions) {
        try {
          await queryInterface.sequelize.query(
            `INSERT INTO role_permissions (roleId, permissionId, createdAt, updatedAt) 
             VALUES (?, ?, NOW(), NOW());`,
            {
              replacements: [superAdmin.id, permission.id],
              type: Sequelize.QueryTypes.INSERT
            }
          );
          inserted++;
        } catch (err) {
          // Ignore duplicate errors
          if (!err.message.includes('Duplicate entry')) {
            console.error(`Error inserting permission ${permission.id}:`, err.message);
          }
        }
      }

      console.log(`✅ Successfully assigned ${inserted} permissions to super_admin`);

      // Similarly handle other roles if needed
      const [admin] = await queryInterface.sequelize.query(
        `SELECT id FROM roles WHERE name = 'admin' LIMIT 1;`,
        { type: Sequelize.QueryTypes.SELECT }
      );

      if (admin) {
        // Get all non-system permissions for admin
        const adminPermissions = await queryInterface.sequelize.query(
          `SELECT id FROM permissions WHERE resource != 'system' LIMIT 10;`,
          { type: Sequelize.QueryTypes.SELECT }
        );

        for (const permission of adminPermissions) {
          try {
            await queryInterface.sequelize.query(
              `INSERT IGNORE INTO role_permissions (roleId, permissionId, createdAt, updatedAt) 
               VALUES (?, ?, NOW(), NOW());`,
              {
                replacements: [admin.id, permission.id],
                type: Sequelize.QueryTypes.INSERT
              }
            );
          } catch (err) {
            // Ignore errors
          }
        }
        console.log(`✅ Assigned limited permissions to admin`);
      }

      console.log('✅ Role-permissions seeding completed');
      
    } catch (error) {
      console.error('❌ Error in role-permissions seeder:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('role_permissions', null, {});
    console.log('✅ Removed all role-permission assignments');
  }
};