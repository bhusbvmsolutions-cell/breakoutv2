'use strict';
module.exports = (sequelize, DataTypes) => {
  const HomePage = sequelize.define(
    'HomePage',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      banner_heading: DataTypes.STRING,
      banner_description: DataTypes.STRING,
      banner_heading1: DataTypes.STRING,
      banner_heading2: DataTypes.STRING,
      banner_heading3: DataTypes.STRING,
      banner_image1: DataTypes.STRING(500),
      banner_image2: DataTypes.STRING(500),
      banner_image3: DataTypes.STRING(500),
      banner_content: DataTypes.TEXT('long'),
      banner_note: DataTypes.STRING,
      counters_heading: DataTypes.STRING,
      counters_rating: DataTypes.STRING(500),
      footer_heading: DataTypes.STRING,
      footer_description1: DataTypes.TEXT,
      footer_description2: DataTypes.TEXT,
      isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
    },
    {
      tableName: 'home_pages',
      timestamps: true,
    }
  );

  return HomePage;
};