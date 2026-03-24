'use strict';
module.exports = (sequelize, DataTypes) => {
  const PricingPackage = sequelize.define(
    'PricingPackage',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      name: { type: DataTypes.STRING, allowNull: false },
      min_capacity: DataTypes.INTEGER,
      max_capacity: DataTypes.INTEGER,
      isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
    },
    {
      tableName: 'pricing_packages',
      timestamps: true,
    }
  );
  return PricingPackage;
};