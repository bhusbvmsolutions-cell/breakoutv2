// models/VirtualArchivePackageColumn.js
'use strict';
module.exports = (sequelize, DataTypes) => {
  const VirtualArchivePackageColumn = sequelize.define(
    'VirtualArchivePackageColumn',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      archive_id: {
        type: DataTypes.INTEGER,
        references: { model: 'virtual_archives', key: 'id' },
        onDelete: 'CASCADE',
      },
      sort_order: DataTypes.INTEGER,
      title: DataTypes.STRING,
      duration: DataTypes.STRING,
      image: DataTypes.STRING(500),
    },
    { tableName: 'virtual_archive_package_columns' }
  );
  return VirtualArchivePackageColumn;
};