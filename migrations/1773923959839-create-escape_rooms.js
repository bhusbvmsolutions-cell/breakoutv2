'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('escape_rooms', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      title: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      slug: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true
      },
      tag: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: null
      },
      banner_heading: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      banner_image: {
        type: Sequelize.STRING(500),
        allowNull: true
      },
      banner_description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      banner_success_rate: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      banner_age_group: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      banner_character: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      banner_min_team: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      banner_scare_factor: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      banner_duration: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      banner_cta_label: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      banner_cta_link: {
        type: Sequelize.STRING(500),
        allowNull: true
      },
      banner_important_note: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      banner_video_trailer: {
        type: Sequelize.STRING(500),
        allowNull: true
      },
      pricing_note: {
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
    await queryInterface.dropTable('escape_rooms');
  }
};
