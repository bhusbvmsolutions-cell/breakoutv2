'use strict';
module.exports = (sequelize, DataTypes) => {
  const VenueSuitableTimeMapping = sequelize.define(
    'VenueSuitableTimeMapping',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      venue_id: {
        type: DataTypes.INTEGER,
        references: { model: 'venues', key: 'id' },
        onDelete: 'CASCADE',
      },
      suitable_time_id: {
        type: DataTypes.INTEGER,
        references: { model: 'venue_suitable_times', key: 'id' },
        onDelete: 'CASCADE',
      },
    },
    {
      tableName: 'venue_suitable_time_mappings',
      timestamps: false,
      indexes: [{ unique: true, fields: ['venue_id', 'suitable_time_id'] }],
    }
  );
  return VenueSuitableTimeMapping;
};