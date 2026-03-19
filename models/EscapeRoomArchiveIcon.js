'use strict';

module.exports = (sequelize, DataTypes) => {
  const EscapeRoomArchiveIcon = sequelize.define(
    "EscapeRoomArchiveIcon",
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
      heading: {
        type: DataTypes.STRING,
        allowNull: true
      },
      image: {
        type: DataTypes.STRING,
        allowNull: true
      }
    },
    {
      tableName: "escape_room_archive_icons",
      timestamps: true
    }
  );

  return EscapeRoomArchiveIcon;
};