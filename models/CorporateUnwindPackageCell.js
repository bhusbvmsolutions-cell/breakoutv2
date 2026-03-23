'use strict';
module.exports = (sequelize, DataTypes) => {
  const CorporateUnwindPackageCell = sequelize.define(
    'CorporateUnwindPackageCell',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      row_id: {
        type: DataTypes.INTEGER,
        references: { model: 'corporate_unwind_package_rows', key: 'id' },
        onDelete: 'CASCADE',
      },
      column_id: {
        type: DataTypes.INTEGER,
        references: { model: 'corporate_unwind_package_columns', key: 'id' },
        onDelete: 'CASCADE',
      },
      value: DataTypes.STRING,
    },
    { tableName: 'corporate_unwind_package_cells', timestamps: true }
  );
  return CorporateUnwindPackageCell;
};