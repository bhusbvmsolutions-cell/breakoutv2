'use strict';

const bcrypt = require('bcryptjs');

module.exports = {
  async up(queryInterface, Sequelize) {

    const now = new Date();
    const hashedPassword = await bcrypt.hash('admin123', 10);

    // 🔹 Check if role exists
    const [existingRole] = await queryInterface.sequelize.query(
      `SELECT id FROM roles WHERE name = 'super_admin' LIMIT 1`
    );

    let roleId;

    if (existingRole.length === 0) {
      await queryInterface.bulkInsert('roles', [
        {
          name: 'super_admin',
          displayName: 'Super Admin',
          description: 'System Super Administrator with full access',
          level: 100,
          isSystem: true,
          createdBy: null,
          createdAt: now,
          updatedAt: now
        }
      ]);

      const [roles] = await queryInterface.sequelize.query(
        `SELECT id FROM roles WHERE name = 'super_admin' LIMIT 1`
      );

      roleId = roles[0].id;
    } else {
      roleId = existingRole[0].id;
    }

    // 🔹 Check if user exists
    const [existingUser] = await queryInterface.sequelize.query(
      `SELECT id FROM users WHERE email = 'admin@example.com' LIMIT 1`
    );

    let userId;

    if (existingUser.length === 0) {
      await queryInterface.bulkInsert('users', [
        {
          firstName: 'Super',
          lastName: 'Admin',
          username: 'superadmin',
          email: 'admin@example.com',
          phone: null,
          avatar: null,
          bio: 'System Super Administrator',
          password: hashedPassword,
          role: 'super_admin',
          isActive: true,
          isEmailVerified: true,
          lastLogin: null,
          lastPasswordChange: now,
          createdAt: now,
          updatedAt: now
        }
      ]);

      const [users] = await queryInterface.sequelize.query(
        `SELECT id FROM users WHERE email = 'admin@example.com' LIMIT 1`
      );

      userId = users[0].id;
    } else {
      userId = existingUser[0].id;
    }

    // 🔹 Assign role if not assigned
    const [existingAssignment] = await queryInterface.sequelize.query(
      `SELECT id FROM user_roles WHERE userId = ${userId} AND roleId = ${roleId} LIMIT 1`
    );

    if (existingAssignment.length === 0) {
      await queryInterface.bulkInsert('user_roles', [
        {
          userId: userId,
          roleId: roleId,
          assignedBy: null,
          assignedAt: now,
          createdAt: now,
          updatedAt: now
        }
      ]);
    }
  },

  async down(queryInterface, Sequelize) {

    await queryInterface.bulkDelete('user_roles', null, {});
    await queryInterface.bulkDelete('users', { email: 'admin@example.com' }, {});
    await queryInterface.bulkDelete('roles', { name: 'super_admin' }, {});
  }
};