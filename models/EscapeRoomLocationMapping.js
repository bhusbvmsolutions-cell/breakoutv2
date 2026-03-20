'use strict';

module.exports = (sequelize, DataTypes) => {
  const EscapeRoomLocationMapping = sequelize.define(
    "EscapeRoomLocationMapping",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      escape_room_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique:false,
        references: {
          model: 'escape_rooms',
          key: 'id'
        }
      },
      location_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique:false,
        references: {
          model: 'escape_room_locations',
          key: 'id'
        }
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      }
    },
    {
      tableName: "escape_room_location_mappings",
      timestamps: true,
      
    }
  );

  return EscapeRoomLocationMapping;
};