'use strict';
module.exports = (sequelize, DataTypes) => {
  const BachelorFarewellPackageRow = sequelize.define(
    'BachelorFarewellPackageRow',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      archive_id: {
        type: DataTypes.INTEGER,
        references: { model: 'bachelor_farewell_archives', key: 'id' },
        onDelete: 'CASCADE',
      },
      sort_order: DataTypes.INTEGER,
      feature: DataTypes.STRING,
    },
    { tableName: 'bachelor_farewell_package_rows', timestamps: true }
  );
  return BachelorFarewellPackageRow;
};