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
        type: Sequelize.STRING,
        allowNull: false
      },
      uniqueName: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      path: {
        type: Sequelize.STRING,
        allowNull: false
      },
      url: {
        type: Sequelize.STRING,
        allowNull: false
      },
      title: {
        type: Sequelize.STRING,
        allowNull: true
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      thumbnail: {
        type: Sequelize.STRING,
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
        type: Sequelize.STRING,
        allowNull: true
      },
      mimeType: {
        type: Sequelize.STRING,
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
        type: Sequelize.STRING,
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
