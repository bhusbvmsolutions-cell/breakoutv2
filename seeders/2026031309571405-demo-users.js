'use strict';
const bcrypt = require('bcryptjs');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Get role IDs
    const roles = await queryInterface.sequelize.query(
      `SELECT id, name FROM roles;`,
      { type: Sequelize.QueryTypes.SELECT }
    );
    
    const adminRoleId = roles.find(r => r.name === 'admin')?.id;
    const editorRoleId = roles.find(r => r.name === 'editor')?.id;
    const contributorRoleId = roles.find(r => r.name === 'contributor')?.id;
    const viewerRoleId = roles.find(r => r.name === 'viewer')?.id;

    // Check if demo users already exist
    const demoEmails = ['john@example.com', 'jane@example.com', 'bob@example.com', 'alice@example.com'];
    const existingUsers = await queryInterface.sequelize.query(
      `SELECT email FROM users WHERE email IN (${demoEmails.map(e => `'${e}'`).join(',')});`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    const existingEmails = existingUsers.map(u => u.email);

    // Create demo users
    const demoUsers = [];
    const userRoles = [];

    if (!existingEmails.includes('john@example.com')) {
      demoUsers.push({
        firstName: 'John',
        lastName: 'Doe',
        username: 'johndoe',
        email: 'john@example.com',
        password: await bcrypt.hash('Password123', 10),
        phone: '+1234567891',
        role: 'admin',
        isActive: true,
        isEmailVerified: true,
        lastPasswordChange: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    if (!existingEmails.includes('jane@example.com')) {
      demoUsers.push({
        firstName: 'Jane',
        lastName: 'Smith',
        username: 'janesmith',
        email: 'jane@example.com',
        password: await bcrypt.hash('Password123', 10),
        phone: '+1234567892',
        role: 'editor',
        isActive: true,
        isEmailVerified: true,
        lastPasswordChange: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    if (!existingEmails.includes('bob@example.com')) {
      demoUsers.push({
        firstName: 'Bob',
        lastName: 'Johnson',
        username: 'bobjohnson',
        email: 'bob@example.com',
        password: await bcrypt.hash('Password123', 10),
        phone: '+1234567893',
        role: 'contributor',
        isActive: true,
        isEmailVerified: true,
        lastPasswordChange: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    if (!existingEmails.includes('alice@example.com')) {
      demoUsers.push({
        firstName: 'Alice',
        lastName: 'Williams',
        username: 'alicew',
        email: 'alice@example.com',
        password: await bcrypt.hash('Password123', 10),
        phone: '+1234567894',
        role: 'viewer',
        isActive: true,
        isEmailVerified: true,
        lastPasswordChange: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    if (demoUsers.length > 0) {
      const insertedUsers = await queryInterface.bulkInsert('users', demoUsers, { returning: true });

      // Assign roles to demo users
      for (let i = 0; i < insertedUsers.length; i++) {
        const user = insertedUsers[i];
        let roleId = null;

        if (user.email === 'john@example.com') roleId = adminRoleId;
        else if (user.email === 'jane@example.com') roleId = editorRoleId;
        else if (user.email === 'bob@example.com') roleId = contributorRoleId;
        else if (user.email === 'alice@example.com') roleId = viewerRoleId;

        if (roleId) {
          userRoles.push({
            userId: user.id,
            roleId: roleId,
            assignedBy: null,
            assignedAt: new Date(),
            createdAt: new Date(),
            updatedAt: new Date()
          });
        }
      }

      if (userRoles.length > 0) {
        await queryInterface.bulkInsert('user_roles', userRoles);
      }

      console.log(`✅ ${demoUsers.length} demo users created`);
      console.log('   Demo credentials:');
      console.log('   john@example.com / Password123 (Admin)');
      console.log('   jane@example.com / Password123 (Editor)');
      console.log('   bob@example.com / Password123 (Contributor)');
      console.log('   alice@example.com / Password123 (Viewer)');
    } else {
      console.log('ℹ️ Demo users already exist');
    }
  },

  down: async (queryInterface, Sequelize) => {
    const demoEmails = ['john@example.com', 'jane@example.com', 'bob@example.com', 'alice@example.com'];
    
    // Get user IDs
    const users = await queryInterface.sequelize.query(
      `SELECT id FROM users WHERE email IN (${demoEmails.map(e => `'${e}'`).join(',')});`,
      { type: Sequelize.QueryTypes.SELECT }
    );
    
    const userIds = users.map(u => u.id);
    
    if (userIds.length > 0) {
      // Delete user roles
      await queryInterface.bulkDelete('user_roles', {
        userId: userIds
      });
      
      // Delete users
      await queryInterface.bulkDelete('users', {
        email: demoEmails
      });
    }
  }
};