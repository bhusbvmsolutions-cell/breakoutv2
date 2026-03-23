// models/VirtualArchiveVideo.js
'use strict';
module.exports = (sequelize, DataTypes) => {
  const VirtualArchiveVideo = sequelize.define(
    'VirtualArchiveVideo',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      archive_id: {
        type: DataTypes.INTEGER,
        references: { model: 'virtual_archives', key: 'id' },
        onDelete: 'CASCADE',
      },
      video_id: {
        type: DataTypes.INTEGER,
        references: { model: 'videos', key: 'id' },
        onDelete: 'CASCADE',
      },
      custom_title: DataTypes.STRING,
      sort_order: DataTypes.INTEGER,
    },
    { tableName: 'virtual_archive_videos' }
  );
  return VirtualArchiveVideo;
};