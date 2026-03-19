'use strict';

module.exports = (sequelize, DataTypes) => {
  const EscapeRoomArchive = sequelize.define(
    "EscapeRoomArchive",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      banner_heading: {
        type: DataTypes.STRING,
        allowNull: true
      },
      banner_description: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      banner_image: {
        type: DataTypes.STRING,
        allowNull: true
      },
      banner_cta_label1: {
        type: DataTypes.STRING,
        allowNull: true
      },
      banner_cta_link1: {
        type: DataTypes.STRING,
        allowNull: true
      },
      banner_cta_label2: {
        type: DataTypes.STRING,
        allowNull: true
      },
      banner_cta_link2: {
        type: DataTypes.STRING,
        allowNull: true
      },
      icon_heading: {
        type: DataTypes.STRING,
        allowNull: true
      },
      icon_description: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      counter_heading: {
        type: DataTypes.STRING,
        allowNull: true
      },
      counter_rating: {
        type: DataTypes.STRING,
        allowNull: true
      },
      footer_heading: {
        type: DataTypes.STRING,
        allowNull: true
      },
      footer_description1: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      footer_description2: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      }
    },
    {
      tableName: "escape_room_archives",
      timestamps: true
    }
  );

  return EscapeRoomArchive;
};