'use strict';
module.exports = (sequelize, DataTypes) => {
  const VenueExperienceTypeMapping = sequelize.define(
    'VenueExperienceTypeMapping',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      venue_id: {
        type: DataTypes.INTEGER,
        references: { model: 'venues', key: 'id' },
        onDelete: 'CASCADE',
      },
      experience_type_id: {
        type: DataTypes.INTEGER,
        references: { model: 'venue_experience_types', key: 'id' },
        onDelete: 'CASCADE',
      },
    },
    {
      tableName: 'venue_experience_type_mappings',
      timestamps: false,
      indexes: [{ unique: true, fields: ['venue_id', 'experience_type_id'] }],
    }
  );
  return VenueExperienceTypeMapping;
};