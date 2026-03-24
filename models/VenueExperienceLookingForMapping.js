'use strict';
module.exports = (sequelize, DataTypes) => {
  const VenueExperienceLookingForMapping = sequelize.define(
    'VenueExperienceLookingForMapping',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      venue_id: {
        type: DataTypes.INTEGER,
        references: { model: 'venues', key: 'id' },
        onDelete: 'CASCADE',
      },
      looking_for_id: {
        type: DataTypes.INTEGER,
        references: { model: 'venue_experience_looking_for', key: 'id' },
        onDelete: 'CASCADE',
      },
    },
    {
      tableName: 'venue_experience_looking_for_mappings',
      timestamps: false,
      indexes: [{ unique: true, fields: ['venue_id', 'looking_for_id'] }],
    }
  );
  return VenueExperienceLookingForMapping;
};