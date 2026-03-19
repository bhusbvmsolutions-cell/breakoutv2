'use strict';

module.exports = (sequelize, DataTypes) => {
  const EscapeRoomArchiveVideo = sequelize.define(
    "EscapeRoomArchiveVideo",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      archive_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'escape_room_archives',
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
        type: DataTypes.STRING,
        allowNull: true
      }
    },
    {
      tableName: "escape_room_archive_videos",
      timestamps: true
    }
  );

  return EscapeRoomArchiveVideo;
};