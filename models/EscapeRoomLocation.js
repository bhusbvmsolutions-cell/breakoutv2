'use strict';

module.exports = (sequelize, DataTypes) => {
  const EscapeRoomLocation = sequelize.define(
    "EscapeRoomLocation",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      title: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      slug: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true
      },
      banner_heading: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      banner_video_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'videos',
          key: 'id'
        }
      },
      banner_featured_image: {
        type: DataTypes.STRING(500),
        allowNull: true,
        comment: "Featured image/thumbnail for the video"
      },
      trailor_video:{
        type: DataTypes.STRING(500),
        allowNull: true,
        comment: "URL or path to banner trailor video"
      },
      banner_description: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      banner_cta_label: {
        type: DataTypes.STRING(100),
        allowNull: true
      },
      banner_cta_link: {
        type: DataTypes.STRING(500),
        allowNull: true
      },
      text_section_description: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      pricing_section_heading: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      pricing_section_note: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      location_city: {
        type: DataTypes.STRING(100),
        allowNull: true
      },
      location_timings: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      location_total_capacity: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      location_parking_info: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      location_parking_video_link: {
        type: DataTypes.STRING(500),
        allowNull: true
      },
      location_address: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      location_map_url: {
        type: DataTypes.STRING(500),
        allowNull: true
      },
      image_cards_heading: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      footer_heading: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      footer_description1: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      footer_description2: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      }
    },
    {
      tableName: "escape_room_locations",
      timestamps: true,
      hooks: {
        beforeValidate: (location) => {
          if (location.title && !location.slug) {
            location.slug = require('slugify')(location.title, { 
              lower: true, 
              strict: true,
              remove: /[*+~.()'"!:@]/g
            });
          }
        }
      }
    }
  );

  return EscapeRoomLocation;
};