'use strict';

module.exports = (sequelize, DataTypes) => {
  const EscapeRoom = sequelize.define(
    "EscapeRoom",
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
      tag: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: null
      },
      // Banner Section Fields
      banner_heading: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      banner_image: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
      banner_description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      banner_success_rate: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      banner_age_group: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      banner_character: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      banner_min_team: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      banner_scare_factor: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      banner_duration: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      banner_cta_label: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      banner_cta_link: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
      banner_important_note: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      banner_video_trailer: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
      pricing_heading: {
        type: DataTypes.STRING(500),
        allowNull: true,
      },
      
      // Pricing Section Note
      pricing_note: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      }
    },
    {
      tableName: "escape_rooms",
      timestamps: true,
      hooks: {
        beforeValidate: (escapeRoom) => {
          if (escapeRoom.title && !escapeRoom.slug) {
            escapeRoom.slug = require('slugify')(escapeRoom.title, { 
              lower: true, 
              strict: true,
              remove: /[*+~.()'"!:@]/g
            });
          }
        }
      }
    }
  );

  return EscapeRoom;
};