'use strict';
const bcrypt = require('bcryptjs');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const roles = await queryInterface.sequelize.query(
      `SELECT id, name FROM roles;`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    const roleByName = new Map(roles.map(role => [role.name, role.id]));

    const demoUsers = [
      {
        firstName: 'John',
        lastName: 'Doe',
        username: 'johndoe',
        email: 'john@example.com',
        password: 'Password123',
        phone: '+1234567891',
        role: 'admin'
      },
      {
        firstName: 'Jane',
        lastName: 'Smith',
        username: 'janesmith',
        email: 'jane@example.com',
        password: 'Password123',
        phone: '+1234567892',
        role: 'editor'
      },
      {
        firstName: 'Bob',
        lastName: 'Johnson',
        username: 'bobjohnson',
        email: 'bob@example.com',
        password: 'Password123',
        phone: '+1234567893',
        role: 'contributor'
      },
      {
        firstName: 'Alice',
        lastName: 'Williams',
        username: 'alicew',
        email: 'alice@example.com',
        password: 'Password123',
        phone: '+1234567894',
        role: 'viewer'
      }
    ];

    const demoEmails = demoUsers.map(u => u.email);

    const existingUsers = await queryInterface.sequelize.query(
      `SELECT id, email FROM users WHERE email IN (${demoEmails.map(e => `'${e}'`).join(',')});`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    const existingEmailSet = new Set(existingUsers.map(u => u.email));
    const now = new Date();

    const usersToInsert = [];
    for (const user of demoUsers) {
      if (!existingEmailSet.has(user.email)) {
        usersToInsert.push({
          firstName: user.firstName,
          lastName: user.lastName,
          username: user.username,
          email: user.email,
          password: await bcrypt.hash(user.password, 10),
          phone: user.phone,
          role: user.role,
          isActive: true,
          isEmailVerified: true,
          lastPasswordChange: now,
          createdAt: now,
          updatedAt: now
        });
      }
    }

    if (usersToInsert.length > 0) {
      await queryInterface.bulkInsert('users', usersToInsert);
    }

    // Ensure role column is correct for demo users
    for (const user of demoUsers) {
      await queryInterface.bulkUpdate('users', { role: user.role }, { email: user.email });
    }

    const allDemoUsers = await queryInterface.sequelize.query(
      `SELECT id, email FROM users WHERE email IN (${demoEmails.map(e => `'${e}'`).join(',')});`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    const userIdByEmail = new Map(allDemoUsers.map(u => [u.email, u.id]));
    const userIds = allDemoUsers.map(u => u.id);

    const existingUserRoles = userIds.length > 0
      ? await queryInterface.sequelize.query(
          `SELECT userId, roleId FROM user_roles WHERE userId IN (${userIds.join(',')});`,
          { type: Sequelize.QueryTypes.SELECT }
        )
      : [];

    const existingUserRoleSet = new Set(existingUserRoles.map(r => `${r.userId}:${r.roleId}`));

    const userRolesToInsert = [];
    for (const user of demoUsers) {
      const userId = userIdByEmail.get(user.email);
      const roleId = roleByName.get(user.role);

      if (userId && roleId) {
        const key = `${userId}:${roleId}`;
        if (!existingUserRoleSet.has(key)) {
          userRolesToInsert.push({
            userId,
            roleId,
            assignedBy: null,
            assignedAt: now,
            createdAt: now,
            updatedAt: now
          });
        }
      }
    }

    if (userRolesToInsert.length > 0) {
      await queryInterface.bulkInsert('user_roles', userRolesToInsert);
    }

    if (usersToInsert.length > 0) {
      console.log(`${usersToInsert.length} demo users created`);
    } else {
      console.log('Demo users already exist');
    }
  },

  down: async (queryInterface, Sequelize) => {
    const demoEmails = ['john@example.com', 'jane@example.com', 'bob@example.com', 'alice@example.com'];

    const users = await queryInterface.sequelize.query(
      `SELECT id FROM users WHERE email IN (${demoEmails.map(e => `'${e}'`).join(',')});`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    const userIds = users.map(u => u.id);

    if (userIds.length > 0) {
      await queryInterface.bulkDelete('user_roles', {
        userId: userIds
      });

      await queryInterface.bulkDelete('users', {
        email: demoEmails
      });
    }
  }
};
