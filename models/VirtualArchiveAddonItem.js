// models/VirtualArchiveAddonItem.js
'use strict';
module.exports = (sequelize, DataTypes) => {
  const VirtualArchiveAddonItem = sequelize.define(
    'VirtualArchiveAddonItem',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      archive_id: {
        type: DataTypes.INTEGER,
        references: { model: 'virtual_archives', key: 'id' },
        onDelete: 'CASCADE',
      },
      sort_order: DataTypes.INTEGER,
      heading: DataTypes.STRING,
      link: DataTypes.STRING(500),
      image: DataTypes.STRING(500),
    },
    { tableName: 'virtual_archive_addon_items' }
  );
  return VirtualArchiveAddonItem;
};