// models/PartyArchive.js
'use strict';
module.exports = (sequelize, DataTypes) => {
  const PartyArchive = sequelize.define(
    'PartyArchive',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      banner_heading: DataTypes.STRING,
      banner_description: DataTypes.TEXT,
      banner_birthday_image: DataTypes.STRING(500),
      banner_bachelor_image: DataTypes.STRING(500),
      banner_farewell_image: DataTypes.STRING(500),
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
      tableName: 'party_archives',
      timestamps: true,
    }
  );
  return PartyArchive;
};