'use strict';
module.exports = (sequelize, DataTypes) => {
  const VenueBudgetRangeMapping = sequelize.define(
    'VenueBudgetRangeMapping',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      venue_id: {
        type: DataTypes.INTEGER,
        references: { model: 'venues', key: 'id' },
        onDelete: 'CASCADE',
      },
      budget_range_id: {
        type: DataTypes.INTEGER,
        references: { model: 'venue_budget_ranges', key: 'id' },
        onDelete: 'CASCADE',
      },
    },
    {
      tableName: 'venue_budget_range_mappings',
      timestamps: false,
      indexes: [{ unique: true, fields: ['venue_id', 'budget_range_id'] }],
    }
  );
  return VenueBudgetRangeMapping;
};