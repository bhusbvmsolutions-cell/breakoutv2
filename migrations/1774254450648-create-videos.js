'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('videos', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      filename: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      uniqueName: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true
      },
      path: {
        type: Sequelize.STRING(500),
        allowNull: false
      },
      url: {
        type: Sequelize.STRING(500),
        allowNull: false
      },
      title: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      thumbnail: {
        type: Sequelize.STRING(500),
        allowNull: true
      },
      size: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      duration: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      format: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      mimeType: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      width: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      height: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      quality: {
        type: Sequelize.STRING(20),
        allowNull: true
      },
      status: {
        type: Sequelize.ENUM('active', 'inactive', 'processing', 'failed'),
        allowNull: false,
        defaultValue: 'active'
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
    await queryInterface.dropTable('videos');
  }
};
