// models/VirtualArchiveIconItem.js
'use strict';
module.exports = (sequelize, DataTypes) => {
  const VirtualArchiveIconItem = sequelize.define(
    'VirtualArchiveIconItem',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      archive_id: {
        type: DataTypes.INTEGER,
        references: { model: 'virtual_archives', key: 'id' },
        onDelete: 'CASCADE',
      },
      sort_order: DataTypes.INTEGER,
      heading: DataTypes.STRING,
      image: DataTypes.STRING(500),
    },
    { tableName: 'virtual_archive_icon_items' }
  );
  return VirtualArchiveIconItem;
};