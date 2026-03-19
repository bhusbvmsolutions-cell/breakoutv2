'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('escape_room_archives', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      banner_heading: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      banner_description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      banner_image: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      banner_cta_label1: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      banner_cta_link1: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      banner_cta_label2: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      banner_cta_link2: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      icon_heading: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      icon_description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      counter_heading: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      counter_rating: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      footer_heading: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      footer_description1: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      footer_description2: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      isActive: {
        type: Sequelize.BOOLEAN,
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
    await queryInterface.dropTable('escape_room_archives');
  }
};
