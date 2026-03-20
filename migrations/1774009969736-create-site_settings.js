'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('site_settings', {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true
      },
      siteName: {
        type: Sequelize.STRING(255),
        allowNull: true,
        defaultValue: null
      },
      siteTagline: {
        type: Sequelize.STRING(255),
        allowNull: true,
        defaultValue: null
      },
      siteDescription: {
        type: Sequelize.TEXT,
        allowNull: true,
        defaultValue: null
      },
      siteLogo: {
        type: Sequelize.STRING(255),
        allowNull: true,
        defaultValue: null
      },
      siteFavicon: {
        type: Sequelize.STRING(255),
        allowNull: true,
        defaultValue: null
      },
      contactEmail: {
        type: Sequelize.STRING(255),
        allowNull: true,
        defaultValue: null
      },
      contactPhone: {
        type: Sequelize.STRING(255),
        allowNull: true,
        defaultValue: null
      },
      alternatePhone: {
        type: Sequelize.STRING(255),
        allowNull: true,
        defaultValue: null
      },
      whatsappNumber: {
        type: Sequelize.STRING(255),
        allowNull: true,
        defaultValue: null
      },
      address: {
        type: Sequelize.TEXT,
        allowNull: true,
        defaultValue: null
      },
      facebookUrl: {
        type: Sequelize.STRING(255),
        allowNull: true,
        defaultValue: null
      },
      twitterUrl: {
        type: Sequelize.STRING(255),
        allowNull: true,
        defaultValue: null
      },
      instagramUrl: {
        type: Sequelize.STRING(255),
        allowNull: true,
        defaultValue: null
      },
      linkedinUrl: {
        type: Sequelize.STRING(255),
        allowNull: true,
        defaultValue: null
      },
      youtubeUrl: {
        type: Sequelize.STRING(255),
        allowNull: true,
        defaultValue: null
      },
      maintenanceMode: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: 0
      },
      maintenanceMessage: {
        type: Sequelize.TEXT,
        allowNull: true,
        defaultValue: null
      },
      isActive: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: 1
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
    await queryInterface.dropTable('site_settings');
  }
};
