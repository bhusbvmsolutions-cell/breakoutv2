'use strict';
module.exports = (sequelize, DataTypes) => {
  const CorporateArchive = sequelize.define(
    'CorporateArchive',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      banner_heading: DataTypes.STRING,
      banner_description: DataTypes.STRING,
      banner_unwind_image: DataTypes.STRING(500),
      banner_retreats_image: DataTypes.STRING(500),
      banner_connect_image: DataTypes.STRING(500),
      banner_content: DataTypes.TEXT,
      banner_note: DataTypes.STRING,
      counters_heading: DataTypes.STRING,
      counters_rating: DataTypes.STRING(500),
      footer_heading: DataTypes.STRING,
      footer_description1: DataTypes.TEXT,
      footer_description2: DataTypes.TEXT,
      isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
    },
    {
      tableName: 'corporate_archives',
      timestamps: true,
    }
  );
  return CorporateArchive;
};