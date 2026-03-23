'use strict';
module.exports = (sequelize, DataTypes) => {
  const CorporateLdArchive = sequelize.define(
    'CorporateLdArchive',
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
      slider_heading: DataTypes.STRING,
      slider_description: DataTypes.TEXT,
      key_resources_heading: DataTypes.STRING,
      image1: DataTypes.STRING(500),
      image2: DataTypes.STRING(500),
      image3: DataTypes.STRING(500),
      footer_heading: DataTypes.STRING,
      footer_content: DataTypes.TEXT,
      isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
    },
    {
      tableName: 'corporate_ld_archives',
      timestamps: true,
    }
  );
  return CorporateLdArchive;
};