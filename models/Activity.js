'use strict';
module.exports = (sequelize, DataTypes) => {
  const Activity = sequelize.define(
    'Activity',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      title: { type: DataTypes.STRING, allowNull: false },
      slug: { type: DataTypes.STRING, allowNull: false, unique: true },
      // Banner section
      banner_heading: DataTypes.STRING,
      banner_image: DataTypes.STRING(500),
      banner_description: DataTypes.TEXT,
      banner_content: DataTypes.TEXT,
      challenge_level: DataTypes.STRING,
      competitive_activity: DataTypes.STRING,
      immersive_rating: DataTypes.STRING,
      capacity: DataTypes.STRING,
      duration: DataTypes.STRING,
      virtual_compatibility: DataTypes.STRING,
      cta_label: DataTypes.STRING,
      cta_link: DataTypes.STRING,
      video_trailer: DataTypes.STRING,
      // Content section
      content_heading: DataTypes.STRING,
      content_content: DataTypes.TEXT,
      // Image card section
      image_card_section_heading: DataTypes.STRING,
      // Fixed images
      image1: DataTypes.STRING(500),
      image2: DataTypes.STRING(500),
      image3: DataTypes.STRING(500),
      isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
    },
    {
      tableName: 'activities',
      timestamps: true,
      hooks: {
        beforeValidate: (activity) => {
          if (activity.title && !activity.slug) {
            const slugify = require('slugify');
            activity.slug = slugify(activity.title, { lower: true, strict: true, remove: /[*+~.()'"!:@]/g });
          }
        },
      },
    }
  );
  return Activity;
};