'use strict';
module.exports = (sequelize, DataTypes) => {
  const VenueCategoryMapping = sequelize.define(
    'VenueCategoryMapping',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      venue_id: {
        type: DataTypes.INTEGER,
        references: { model: 'venues', key: 'id' },
        onDelete: 'CASCADE',
      },
      category_id: {
        type: DataTypes.INTEGER,
        references: { model: 'venue_categories', key: 'id' },
        onDelete: 'CASCADE',
      },
    },
    {
      tableName: 'venue_category_mappings',
      timestamps: false,
      indexes: [{ unique: true, fields: ['venue_id', 'category_id'] }],
    }
  );
  return VenueCategoryMapping;
};