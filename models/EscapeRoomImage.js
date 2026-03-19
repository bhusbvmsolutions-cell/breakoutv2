'use strict';

module.exports = (sequelize, DataTypes) => {
  const EscapeRoomImage = sequelize.define(
    "EscapeRoomImage",
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
      image_url: {
        type: DataTypes.STRING(500),
        allowNull: false,
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
      tableName: "escape_room_images",
      timestamps: true,
    }
  );

  return EscapeRoomImage;
};