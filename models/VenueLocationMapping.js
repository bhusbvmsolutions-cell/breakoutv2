'use strict';
module.exports = (sequelize, DataTypes) => {
  const VenueLocationMapping = sequelize.define(
    'VenueLocationMapping',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      venue_id: {
        type: DataTypes.INTEGER,
        references: { model: 'venues', key: 'id' },
        onDelete: 'CASCADE',
      },
      location_id: {
        type: DataTypes.INTEGER,
        references: { model: 'locations', key: 'id' },
        onDelete: 'CASCADE',
      },
    },
    {
      tableName: 'venue_location_mappings',
      timestamps: false,
      indexes: [{ unique: true, fields: ['venue_id', 'location_id'] }],
    }
  );
  return VenueLocationMapping;
};