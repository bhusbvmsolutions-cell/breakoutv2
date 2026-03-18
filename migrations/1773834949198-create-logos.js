'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('logos', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      type: {
        type: Sequelize.ENUM('news', 'brands'),
        allowNull: false,
        defaultValue: 'brands'
      },
      image: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      link: {
        type: Sequelize.STRING(500),
        allowNull: false
      },
      title: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      order: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0
      },
      status: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
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
    await queryInterface.dropTable('logos');
  }
};
