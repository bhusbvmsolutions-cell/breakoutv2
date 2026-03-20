'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('landing_pages', {
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
      banner_image: {
        type: Sequelize.STRING(500),
        allowNull: true
      },
      banner_heading: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      banner_description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      counters_heading: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      counters_content: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      counters_note: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      counters_counter_heading: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      counters_counter_rating: {
        type: Sequelize.DECIMAL,
        allowNull: true
      },
      content_section: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      image_card_heading: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      ideal_for_heading: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      meta_title: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      meta_description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      meta_keywords: {
        type: Sequelize.STRING(500),
        allowNull: true
      },
      og_title: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      og_description: {
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
    await queryInterface.dropTable('landing_pages');
  }
};
