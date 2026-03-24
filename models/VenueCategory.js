"use strict";
module.exports = (sequelize, DataTypes) => {
  const VenueCategory = sequelize.define(
    "VenueCategory",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING(500),
        allowNull: false,
      },
      slug: {
        type: DataTypes.STRING(500),
        allowNull: false,
        unique: true,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: null,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      tableName: "venue_categories",
      timestamps: true,
    }
  );
  return VenueCategory;
};
