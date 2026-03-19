'use strict';

module.exports = (sequelize, DataTypes) => {
  const EscapeRoomLocationVideo = sequelize.define(
    "EscapeRoomLocationVideo",
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
      video_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'videos',
          key: 'id'
        }
      },
      title: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      sort_order: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      }
    },
    {
      tableName: "escape_room_location_videos",
      timestamps: true
    }
  );

  return EscapeRoomLocationVideo;
};