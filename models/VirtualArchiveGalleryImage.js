// models/VirtualArchiveGalleryImage.js
'use strict';
module.exports = (sequelize, DataTypes) => {
  const VirtualArchiveGalleryImage = sequelize.define(
    'VirtualArchiveGalleryImage',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      archive_id: {
        type: DataTypes.INTEGER,
        references: { model: 'virtual_archives', key: 'id' },
        onDelete: 'CASCADE',
      },
      image: DataTypes.STRING(500),
      sort_order: DataTypes.INTEGER,
    },
    { tableName: 'virtual_archive_gallery_images' }
  );
  return VirtualArchiveGalleryImage;
};