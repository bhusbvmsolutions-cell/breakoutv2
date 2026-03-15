'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const existingRoles = await queryInterface.sequelize.query(
      `SELECT name FROM roles WHERE name IN ('super_admin', 'admin', 'editor', 'contributor', 'viewer');`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    const existingRoleNames = new Set(existingRoles.map(role => role.name));
    const now = new Date();
    const rolesToInsert = [
      {
        name: 'super_admin',
        displayName: 'Super Admin',
        description: 'Has complete control over the system with all permissions',
        level: 999,
        isSystem: true,
        createdBy: null,
        createdAt: now,
        updatedAt: now
      },
      {
        name: 'admin',
        displayName: 'Administrator',
        description: 'Can manage most resources with some restrictions',
        level: 100,
        isSystem: true,
        createdBy: null,
        createdAt: now,
        updatedAt: now
      },
      {
        name: 'editor',
        displayName: 'Editor',
        description: 'Can create and edit content but cannot manage users',
        level: 50,
        isSystem: true,
        createdBy: null,
        createdAt: now,
        updatedAt: now
      },
      {
        name: 'contributor',
        displayName: 'Contributor',
        description: 'Can create content but cannot publish or edit others content',
        level: 30,
        isSystem: true,
        createdBy: null,
        createdAt: now,
        updatedAt: now
      },
      {
        name: 'viewer',
        displayName: 'Viewer',
        description: 'Read-only access to content',
        level: 10,
        isSystem: true,
        createdBy: null,
        createdAt: now,
        updatedAt: now
      }
    ].filter(role => !existingRoleNames.has(role.name));

    if (rolesToInsert.length > 0) {
      await queryInterface.bulkInsert('roles', rolesToInsert);
      console.log('System roles seeded');
    } else {
      console.log('System roles already exist');
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('roles', {
      name: ['super_admin', 'admin', 'editor', 'contributor', 'viewer']
    });
  }
};
