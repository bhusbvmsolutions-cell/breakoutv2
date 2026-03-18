'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('images', {
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
      altText: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      size: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
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
    await queryInterface.dropTable('images');
  }
};
