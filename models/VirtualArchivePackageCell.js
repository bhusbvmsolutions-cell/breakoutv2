// models/VirtualArchivePackageCell.js
'use strict';
module.exports = (sequelize, DataTypes) => {
  const VirtualArchivePackageCell = sequelize.define(
    'VirtualArchivePackageCell',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      row_id: {
        type: DataTypes.INTEGER,
        references: { model: 'virtual_archive_package_rows', key: 'id' },
        onDelete: 'CASCADE',
      },
      column_id: {
        type: DataTypes.INTEGER,
        references: { model: 'virtual_archive_package_columns', key: 'id' },
        onDelete: 'CASCADE',
      },
      value: DataTypes.STRING,
    },
    { tableName: 'virtual_archive_package_cells' }
  );
  return VirtualArchivePackageCell;
};