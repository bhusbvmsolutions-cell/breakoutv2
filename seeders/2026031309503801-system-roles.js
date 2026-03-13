'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if roles already exist
    const existingRoles = await queryInterface.sequelize.query(
      `SELECT id FROM roles WHERE name IN ('super_admin', 'admin', 'editor', 'contributor', 'viewer');`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (existingRoles.length === 0) {
      await queryInterface.bulkInsert('roles', [
        {
          name: 'super_admin',
          displayName: 'Super Admin',
          description: 'Has complete control over the system with all permissions',
          level: 999,
          isSystem: true,
          createdBy: null,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: 'admin',
          displayName: 'Administrator',
          description: 'Can manage most resources with some restrictions',
          level: 100,
          isSystem: true,
          createdBy: null,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: 'editor',
          displayName: 'Editor',
          description: 'Can create and edit content but cannot manage users',
          level: 50,
          isSystem: true,
          createdBy: null,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: 'contributor',
          displayName: 'Contributor',
          description: 'Can create content but cannot publish or edit others content',
          level: 30,
          isSystem: true,
          createdBy: null,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          name: 'viewer',
          displayName: 'Viewer',
          description: 'Read-only access to content',
          level: 10,
          isSystem: true,
          createdBy: null,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]);

      console.log('✅ System roles seeded');
    } else {
      console.log('ℹ️ System roles already exist');
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('roles', {
      name: ['super_admin', 'admin', 'editor', 'contributor', 'viewer']
    });
  }
};