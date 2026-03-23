'use strict';
module.exports = (sequelize, DataTypes) => {
  const BachelorFarewellPackageCell = sequelize.define(
    'BachelorFarewellPackageCell',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      row_id: {
        type: DataTypes.INTEGER,
        references: { model: 'bachelor_farewell_package_rows', key: 'id' },
        onDelete: 'CASCADE',
      },
      column_id: {
        type: DataTypes.INTEGER,
        references: { model: 'bachelor_farewell_package_columns', key: 'id' },
        onDelete: 'CASCADE',
      },
      value: DataTypes.STRING,
    },
    { tableName: 'bachelor_farewell_package_cells', timestamps: true }
  );
  return BachelorFarewellPackageCell;
};