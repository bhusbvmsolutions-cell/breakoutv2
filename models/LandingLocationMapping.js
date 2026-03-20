'use strict';

module.exports = (sequelize, DataTypes) => {
  const LandingLocationMapping = sequelize.define(
    "LandingLocationMapping",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      landing_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique:false,
        references: {
          model: 'landing_pages',
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
      tableName: "landing_location_mappings",
      timestamps: true,
    }
  );

  return LandingLocationMapping;
};