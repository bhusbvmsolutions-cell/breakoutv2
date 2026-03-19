'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('escape_room_locations', {
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
      banner_heading: {
        type: Sequelize.STRING(255),
        allowNull: true
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
      banner_featured_image: {
        type: Sequelize.STRING(500),
        allowNull: true
      },
      trailor_video: {
        type: Sequelize.STRING(500),
        allowNull: true
      },
      banner_description: {
        type: Sequelize.TEXT,
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
      text_section_description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      pricing_section_heading: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      pricing_section_note: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      location_city: {
        type: Sequelize.STRING(100),
        allowNull: true
      },
      location_timings: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      location_total_capacity: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      location_parking_info: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      location_parking_video_link: {
        type: Sequelize.STRING(500),
        allowNull: true
      },
      location_address: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      location_map_url: {
        type: Sequelize.STRING(500),
        allowNull: true
      },
      image_cards_heading: {
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
    await queryInterface.dropTable('escape_room_locations');
  }
};
