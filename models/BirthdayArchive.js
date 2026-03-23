'use strict';
module.exports = (sequelize, DataTypes) => {
  const BirthdayArchive = sequelize.define(
    'BirthdayArchive',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      banner_heading: DataTypes.STRING,
      banner_description: DataTypes.STRING,
      banner_video_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: { model: 'videos', key: 'id' }
      },
      banner_content: DataTypes.TEXT,
      banner_note: DataTypes.STRING,
      counters_heading: DataTypes.STRING,
      counters_rating: DataTypes.STRING(500),
      party_inclusions_heading: DataTypes.STRING,
      party_inclusions_note: DataTypes.STRING,
      slider_heading: DataTypes.STRING,
      slider_description: DataTypes.STRING,
      image1: DataTypes.STRING(500),
      image2: DataTypes.STRING(500),
      image3: DataTypes.STRING(500),
      footer_heading: DataTypes.STRING,
      footer_content: DataTypes.TEXT,
      isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
    },
    {
      tableName: 'birthday_archives',
      timestamps: true,
    }
  );
  return BirthdayArchive;
};