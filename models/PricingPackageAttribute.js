'use strict';
module.exports = (sequelize, DataTypes) => {
  const PricingPackageAttribute = sequelize.define(
    'PricingPackageAttribute',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      package_id: {
        type: DataTypes.INTEGER,
        references: { model: 'pricing_packages', key: 'id' },
        onDelete: 'CASCADE',
      },
      name: DataTypes.STRING,
      type: {
        type: DataTypes.ENUM('variable', 'constant'),
        allowNull: false,
      },
      price: DataTypes.DECIMAL(10, 2),
      sort_order: DataTypes.INTEGER,
    },
    {
      tableName: 'pricing_package_attributes',
      timestamps: true,
    }
  );
  return PricingPackageAttribute;
};