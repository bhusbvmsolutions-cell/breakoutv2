'use strict';

module.exports = (sequelize, DataTypes) => {
  const Landing = sequelize.define(
    "Landing",
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
      // Banner Section
      banner_image: {
        type: DataTypes.STRING(500),
        allowNull: true
      },
      banner_heading: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      banner_description: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      // Counters Section
      counters_heading: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      counters_content: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      counters_note: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      counters_counter_heading: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      counters_counter_rating: {
        type: DataTypes.DECIMAL(3, 1),
        allowNull: true,
        validate: {
          min: 0,
          max: 5
        }
      },
      // Content Section
      content_section: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      // Image Card Section
      image_card_heading: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      // Ideal For Section
      ideal_for_heading: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      // SEO Fields
      meta_title: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      meta_description: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      meta_keywords: {
        type: DataTypes.STRING(500),
        allowNull: true
      },
      og_title: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      og_description: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      }
    },
    {
      tableName: "landing_pages",
      timestamps: true,
      hooks: {
        beforeValidate: (landing) => {
          if (landing.title && !landing.slug) {
            landing.slug = require('slugify')(landing.title, { 
              lower: true, 
              strict: true,
              remove: /[*+~.()'"!:@]/g
            });
          }
        }
      }
    }
  );

  return Landing;
};