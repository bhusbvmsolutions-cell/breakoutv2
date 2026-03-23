// models/BirthdayInnerPackageCell.js
'use strict';
module.exports = (sequelize, DataTypes) => {
  const BirthdayInnerPackageCell = sequelize.define(
    'BirthdayInnerPackageCell',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      row_id: {
        type: DataTypes.INTEGER,
        references: { model: 'birthday_inner_package_rows', key: 'id' },
        onDelete: 'CASCADE',
      },
      column_id: {
        type: DataTypes.INTEGER,
        references: { model: 'birthday_inner_package_columns', key: 'id' },
        onDelete: 'CASCADE',
      },
      value: DataTypes.STRING,
    },
    { tableName: 'birthday_inner_package_cells', timestamps: true }
  );
  return BirthdayInnerPackageCell;
};