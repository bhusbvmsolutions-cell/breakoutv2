'use strict';
module.exports = (sequelize, DataTypes) => {
  const CorporateUnwindArchive = sequelize.define(
    'CorporateUnwindArchive',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      banner_heading: DataTypes.STRING,
      banner_description: DataTypes.TEXT,
      banner_image: DataTypes.STRING(500),
      content_heading: DataTypes.STRING,
      content_content: DataTypes.TEXT,
      content_note: DataTypes.STRING,
      content_footer: DataTypes.STRING,
      counters_heading: DataTypes.STRING,
      counters_rating: DataTypes.STRING(500),
      image_card_heading: DataTypes.STRING,
      addons_heading: DataTypes.STRING,
      why_us_heading: DataTypes.STRING,
      compare_heading: DataTypes.STRING,
      compare_left_heading: DataTypes.STRING,
      compare_right_heading: DataTypes.STRING,
      image1: DataTypes.STRING(500),
      image2: DataTypes.STRING(500),
      image3: DataTypes.STRING(500),
      footer_heading: DataTypes.STRING,
      footer_content: DataTypes.TEXT,
      isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
    },
    {
      tableName: 'corporate_unwind_archives',
      timestamps: true,
    }
  );
  return CorporateUnwindArchive;
};