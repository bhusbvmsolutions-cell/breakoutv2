'use strict';

module.exports = (sequelize, DataTypes) => {
  const EscapeRoomArchiveImage = sequelize.define(
    "EscapeRoomArchiveImage",
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
      image: {
        type: DataTypes.STRING,
        allowNull: true
      }
    },
    {
      tableName: "escape_room_archive_images",
      timestamps: true
    }
  );

  return EscapeRoomArchiveImage;
};