"use strict";
module.exports = (sequelize, DataTypes) => {
  const BachelorFarewellArchive = sequelize.define(
    "BachelorFarewellArchive",
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      type: { type: DataTypes.ENUM("bachelor", "farewell"), allowNull: false },
      banner_heading: DataTypes.STRING,
      banner_description: DataTypes.STRING,
      banner_video_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: { model: "videos", key: "id" },
      },
      counters_heading: DataTypes.STRING,
      counters_content: DataTypes.TEXT,
      counters_note: DataTypes.STRING,
      counters_counter_heading: DataTypes.STRING,
      counters_rating: DataTypes.STRING(500),
      image_card_heading: DataTypes.STRING,
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
      tableName: "bachelor_farewell_archives",
      timestamps: true,
    }
  );
  return BachelorFarewellArchive;
};
