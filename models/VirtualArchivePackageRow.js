// models/VirtualArchivePackageRow.js
'use strict';
module.exports = (sequelize, DataTypes) => {
  const VirtualArchivePackageRow = sequelize.define(
    'VirtualArchivePackageRow',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      archive_id: {
        type: DataTypes.INTEGER,
        references: { model: 'virtual_archives', key: 'id' },
        onDelete: 'CASCADE',
      },
      sort_order: DataTypes.INTEGER,
      feature: DataTypes.STRING,
    },
    { tableName: 'virtual_archive_package_rows' }
  );
  return VirtualArchivePackageRow;
};