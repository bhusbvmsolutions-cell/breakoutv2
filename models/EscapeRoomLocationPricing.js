'use strict';

module.exports = (sequelize, DataTypes) => {
  const EscapeRoomLocationPricing = sequelize.define(
    "EscapeRoomLocationPricing",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      location_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'escape_room_locations',
          key: 'id'
        }
      },
      day_range: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      price_23: {
        type: DataTypes.STRING(50),
        allowNull: true
      },
      price_46: {
        type: DataTypes.STRING(50),
        allowNull: true
      },
      sort_order: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      }
    },
    {
      tableName: "escape_room_location_pricings",
      timestamps: true
    }
  );

  return EscapeRoomLocationPricing;
};