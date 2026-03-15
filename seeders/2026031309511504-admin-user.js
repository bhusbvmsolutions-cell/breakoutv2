'use strict';
const bcrypt = require('bcryptjs');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const roles = await queryInterface.sequelize.query(
      `SELECT id FROM roles WHERE name = 'super_admin';`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    const superAdminRoleId = roles[0]?.id;

    if (!superAdminRoleId) {
      console.log('Super admin role not found. Run roles seeder first.');
      return;
    }

    const [existingUser] = await queryInterface.sequelize.query(
      `SELECT id, role FROM users WHERE email = 'admin@example.com' LIMIT 1;`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (!existingUser) {
      const hashedPassword = await bcrypt.hash('Admin@123', 10);

      await queryInterface.sequelize.query(
        `INSERT INTO users
        (firstName, lastName, username, email, password, phone, role, isActive, isEmailVerified, lastPasswordChange, createdAt, updatedAt)
        VALUES
        ('Super', 'Admin', 'superadmin', 'admin@example.com', ?, '+1234567890', 'super_admin', true, true, ?, NOW(), NOW())`,
        {
          replacements: [hashedPassword, new Date()],
          type: Sequelize.QueryTypes.INSERT
        }
      );
    } else if (existingUser.role !== 'super_admin') {
      await queryInterface.bulkUpdate('users', { role: 'super_admin' }, { id: existingUser.id });
    }

    const [adminUser] = await queryInterface.sequelize.query(
      `SELECT id FROM users WHERE email = 'admin@example.com' LIMIT 1;`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (adminUser) {
      const [userRole] = await queryInterface.sequelize.query(
        `SELECT id FROM user_roles WHERE userId = ? AND roleId = ? LIMIT 1;`,
        {
          replacements: [adminUser.id, superAdminRoleId],
          type: Sequelize.QueryTypes.SELECT
        }
      );

      if (!userRole) {
        await queryInterface.bulkInsert('user_roles', [{
          userId: adminUser.id,
          roleId: superAdminRoleId,
          assignedBy: null,
          assignedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date()
        }]);
      }
    }

    console.log('Super admin user ready');
    console.log('Email: admin@example.com');
    console.log('Password: Admin@123');
  },

  down: async (queryInterface, Sequelize) => {
    const user = await queryInterface.sequelize.query(
      `SELECT id FROM users WHERE email = 'admin@example.com';`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (user[0]?.id) {
      await queryInterface.bulkDelete('user_roles', {
        userId: user[0].id
      });
    }

    await queryInterface.bulkDelete('users', {
      email: 'admin@example.com'
    });
  }
};
