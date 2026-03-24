'use strict';
module.exports = (sequelize, DataTypes) => {
  const PricingPackageCategoryMapping = sequelize.define(
    'PricingPackageCategoryMapping',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      package_id: {
        type: DataTypes.INTEGER,
        references: { model: 'pricing_packages', key: 'id' },
        onDelete: 'CASCADE',
      },
      category_id: {
        type: DataTypes.INTEGER,
        references: { model: 'pricing_package_categories', key: 'id' },
        onDelete: 'CASCADE',
      },
    },
    {
      tableName: 'pricing_package_category_mappings',
      timestamps: true,
      indexes: [{ unique: true, fields: ['package_id', 'category_id'] }],
    }
  );
  return PricingPackageCategoryMapping;
};