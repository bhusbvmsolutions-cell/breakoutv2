'use strict';

module.exports = (sequelize, DataTypes) => {
  const LandingImageCard = sequelize.define(
    "LandingImageCard",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      landing_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'landing_pages',
          key: 'id'
        }
      },
      heading: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      image: {
        type: DataTypes.STRING(500),
        allowNull: true
      },
      sort_order: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      }
    },
    {
      tableName: "landing_image_cards",
      timestamps: true
    }
  );

  return LandingImageCard;
};