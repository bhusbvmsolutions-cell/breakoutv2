'use strict';
module.exports = (sequelize, DataTypes) => {
  const BachelorFarewellPackageColumn = sequelize.define(
    'BachelorFarewellPackageColumn',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      archive_id: {
        type: DataTypes.INTEGER,
        references: { model: 'bachelor_farewell_archives', key: 'id' },
        onDelete: 'CASCADE',
      },
      sort_order: DataTypes.INTEGER,
      title: DataTypes.STRING,
      duration: DataTypes.STRING,
      image: DataTypes.STRING(500),
    },
    { tableName: 'bachelor_farewell_package_columns', timestamps: true }
  );
  return BachelorFarewellPackageColumn;
};