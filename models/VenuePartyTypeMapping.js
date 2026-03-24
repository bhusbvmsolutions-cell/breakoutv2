'use strict';
module.exports = (sequelize, DataTypes) => {
  const VenuePartyTypeMapping = sequelize.define(
    'VenuePartyTypeMapping',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      venue_id: {
        type: DataTypes.INTEGER,
        references: { model: 'venues', key: 'id' },
        onDelete: 'CASCADE',
      },
      party_type_id: {
        type: DataTypes.INTEGER,
        references: { model: 'venue_party_types', key: 'id' },
        onDelete: 'CASCADE',
      },
    },
    {
      tableName: 'venue_party_type_mappings',
      timestamps: false,
      indexes: [{ unique: true, fields: ['venue_id', 'party_type_id'] }],
    }
  );
  return VenuePartyTypeMapping;
};