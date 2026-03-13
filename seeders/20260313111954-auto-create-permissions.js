'use strict';
const { autoCreatePermissions, assignAllPermissionsToSuperAdmin } = require('../src/utils/permissionGenerator');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    console.log('🚀 Auto-creating permissions...');
    
    try {
      // Auto-create permissions
      const result = await autoCreatePermissions();
      
      // Assign all permissions to super admin
      const assignResult = await assignAllPermissionsToSuperAdmin();
      
      console.log(`✅ Permissions created: ${result.created}`);
      console.log(`✅ Permissions assigned to super admin: ${assignResult.assigned}`);
      
    } catch (error) {
      console.error('❌ Error in permission seeder:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Don't delete permissions on down - they are system critical
    console.log('⚠️ Skipping permission deletion');
  }
};