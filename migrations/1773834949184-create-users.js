'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      firstName: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      lastName: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      username: {
        type: Sequelize.STRING(255),
        allowNull: true,
        unique: true
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true
      },
      phone: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      avatar: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      bio: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      password: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      role: {
        type: Sequelize.ENUM('admin', 'super_admin', 'editor', 'viewer', 'contributor'),
        allowNull: false,
        defaultValue: 'viewer'
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true
      },
      isEmailVerified: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },
      resetPasswordToken: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      resetPasswordExpires: {
        type: Sequelize.DATE,
        allowNull: true
      },
      emailVerificationToken: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      lastLogin: {
        type: Sequelize.DATE,
        allowNull: true
      },
      lastPasswordChange: {
        type: Sequelize.DATE,
        allowNull: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('users');
  }
};
