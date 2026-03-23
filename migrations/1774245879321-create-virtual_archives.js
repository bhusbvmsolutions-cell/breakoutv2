'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('virtual_archives', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      banner_heading: {
        type: Sequelize.STRING(255)
      },
      banner_description: {
        type: Sequelize.TEXT
      },
      banner_video_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'videos',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      content_section_content: {
        type: Sequelize.TEXT
      },
      content_section_note: {
        type: Sequelize.STRING(255)
      },
      counters_heading: {
        type: Sequelize.STRING(255)
      },
      counters_counter_heading: {
        type: Sequelize.STRING(255)
      },
      counters_counter_rating: {
        type: Sequelize.DECIMAL
      },
      icons_heading: {
        type: Sequelize.STRING(255)
      },
      addons_heading: {
        type: Sequelize.STRING(255)
      },
      packages_heading: {
        type: Sequelize.STRING(255)
      },
      footer_heading: {
        type: Sequelize.STRING(255)
      },
      footer_description1: {
        type: Sequelize.TEXT
      },
      footer_description2: {
        type: Sequelize.TEXT
      },
      createdAt: {
        type: Sequelize.DATE
      },
      updatedAt: {
        type: Sequelize.DATE
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('virtual_archives');
  }
};
