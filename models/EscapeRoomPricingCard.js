'use strict';

module.exports = (sequelize, DataTypes) => {
  const EscapeRoomPricingCard = sequelize.define(
    "EscapeRoomPricingCard",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      escape_room_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'escape_rooms',
          key: 'id'
        }
      },
      day_range: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      price_2_3_players: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      price_4_6_players: {
        type: DataTypes.STRING(100),
        allowNull: true,
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
      tableName: "escape_room_pricing_cards",
      timestamps: true,
    }
  );

  return EscapeRoomPricingCard;
};