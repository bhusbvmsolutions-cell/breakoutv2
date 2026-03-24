'use strict';
module.exports = (sequelize, DataTypes) => {
  const AboutUs = sequelize.define(
    'AboutUs',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      // Banner section
      banner_heading: DataTypes.STRING,
      banner_description: DataTypes.STRING,
      banner_image: DataTypes.STRING(500),
      // Vision section
      vision_image: DataTypes.STRING(500),
      vision_heading1: DataTypes.STRING,
      vision_description1: DataTypes.TEXT,
      vision_heading2: DataTypes.STRING,
      vision_description2: DataTypes.TEXT,
      // Counters section
      counters_heading: DataTypes.STRING,
      counters_rating: DataTypes.STRING(500),
      // Content section
      content_heading: DataTypes.STRING,
      content_description: DataTypes.TEXT,
      // Cards section heading
      cards_heading: DataTypes.STRING,
      // Our Story section
      our_story_image: DataTypes.STRING(500),
      our_story_heading: DataTypes.STRING,
      our_story_description: DataTypes.TEXT,
      // Our Founders section (single)
      founders_heading: DataTypes.STRING,
      founders_image: DataTypes.STRING(500),
      founders_name: DataTypes.STRING,
      founders_designation: DataTypes.STRING,
      founders_description: DataTypes.TEXT,
      founders_whatsapp: DataTypes.STRING,
      founders_instagram: DataTypes.STRING,
      founders_linkedin: DataTypes.STRING,
      founders_twitter: DataTypes.STRING,
      founders_gmail: DataTypes.STRING,
      founders_link: DataTypes.STRING,
      // Our Leaders section heading
      leaders_heading: DataTypes.STRING,
      // Our Advisors section heading
      advisors_heading: DataTypes.STRING,
      isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
    },
    {
      tableName: 'about_us',
      timestamps: true,
    }
  );
  return AboutUs;
};