'use strict';

module.exports = (sequelize, DataTypes) => {
  const EscapeRoomLocationEventSpace = sequelize.define(
    "EscapeRoomLocationEventSpace",
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
      space_name: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      capacity: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      style: {
        type: DataTypes.STRING(255),
        allowNull: true
      },
      sort_order: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      }
    },
    {
      tableName: "escape_room_location_event_spaces",
      timestamps: true
    }
  );

  return EscapeRoomLocationEventSpace;
};