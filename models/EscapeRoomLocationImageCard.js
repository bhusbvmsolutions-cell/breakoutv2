'use strict';

module.exports = (sequelize, DataTypes) => {
  const EscapeRoomLocationImageCard = sequelize.define(
    "EscapeRoomLocationImageCard",
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
      heading: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      image: {
        type: DataTypes.STRING(500),
        allowNull: true
      },
      cta_label: {
        type: DataTypes.STRING(100),
        allowNull: true
      },
      cta_link: {
        type: DataTypes.STRING(500),
        allowNull: true
      },
      sort_order: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      }
    },
    {
      tableName: "escape_room_location_image_cards",
      timestamps: true
    }
  );

  return EscapeRoomLocationImageCard;
};