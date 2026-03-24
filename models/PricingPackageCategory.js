'use strict';
module.exports = (sequelize, DataTypes) => {
  const PricingPackageCategory = sequelize.define(
    'PricingPackageCategory',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      name: { type: DataTypes.STRING, allowNull: false },
      slug: { type: DataTypes.STRING, allowNull: false, unique: true },
      description: DataTypes.TEXT,
      isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
    },
    {
      tableName: 'pricing_package_categories',
      timestamps: true,
      hooks: {
        beforeValidate: (PricingPackageCategory) => {
          if (PricingPackageCategory.name && !PricingPackageCategory.slug) {
            const slugify = require('slugify');
            PricingPackageCategory.slug = slugify(PricingPackageCategory.name, { lower: true, strict: true, remove: /[*+~.()'"!:@]/g });
          }
        },
      },
    }
  );
  return PricingPackageCategory;
};