'use strict';

module.exports = (sequelize, DataTypes) => {
  const LandingIdealForItem = sequelize.define(
    "LandingIdealForItem",
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
      tableName: "landing_ideal_for_items",
      timestamps: true
    }
  );

  return LandingIdealForItem;
};