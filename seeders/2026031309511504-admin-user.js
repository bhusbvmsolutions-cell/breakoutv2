'use strict';
const bcrypt = require('bcryptjs');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Get super admin role ID
    const roles = await queryInterface.sequelize.query(
      `SELECT id FROM roles WHERE name = 'super_admin';`,
      { type: Sequelize.QueryTypes.SELECT }
    );
    
    const superAdminRoleId = roles[0]?.id;
    
    if (!superAdminRoleId) {
      console.log('⚠️ Super admin role not found. Run roles seeder first.');
      return;
    }
    
    // Check if admin user already exists
    const existingUser = await queryInterface.sequelize.query(
      `SELECT id FROM users WHERE email = 'admin@example.com';`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (existingUser.length === 0) {
      const hashedPassword = await bcrypt.hash('Admin@123', 10);
      
      // Insert admin user
      const [result] = await queryInterface.sequelize.query(
        `INSERT INTO users 
        (firstName, lastName, username, email, password, phone, role, isActive, isEmailVerified, lastPasswordChange, createdAt, updatedAt) 
        VALUES 
        ('Super', 'Admin', 'superadmin', 'admin@example.com', ?, '+1234567890', 'super_admin', true, true, ?, NOW(), NOW())`,
        {
          replacements: [hashedPassword, new Date()],
          type: Sequelize.QueryTypes.INSERT
        }
      );

      // Get the inserted user ID
      const [newUser] = await queryInterface.sequelize.query(
        `SELECT id FROM users WHERE email = 'admin@example.com';`,
        { type: Sequelize.QueryTypes.SELECT }
      );

      // Assign super admin role to user
      if (newUser) {
        await queryInterface.bulkInsert('user_roles', [{
          userId: newUser.id,
          roleId: superAdminRoleId,
          assignedBy: null,
          assignedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date()
        }]);
      }
      
      console.log('✅ Super admin user created');
      console.log('   Email: admin@example.com');
      console.log('   Password: Admin@123');
    } else {
      console.log('ℹ️ Admin user already exists');
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Delete user roles first
    const user = await queryInterface.sequelize.query(
      `SELECT id FROM users WHERE email = 'admin@example.com';`,
      { type: Sequelize.QueryTypes.SELECT }
    );
    
    if (user[0]?.id) {
      await queryInterface.bulkDelete('user_roles', {
        userId: user[0].id
      });
    }
    
    // Delete user
    await queryInterface.bulkDelete('users', {
      email: 'admin@example.com'
    });
  }
};