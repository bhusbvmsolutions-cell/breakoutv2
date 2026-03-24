'use strict';
module.exports = (sequelize, DataTypes) => {
  const CorporateLdInnerVideo = sequelize.define(
    'CorporateLdInnerVideo',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      page_id: {
        type: DataTypes.INTEGER,
        references: { model: 'corporate_ld_inner_pages', key: 'id' },
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
    {
      tableName: 'corporate_ld_inner_videos',
      timestamps: true,
      indexes: [{ unique: true, fields: ['page_id', 'video_id'] }],
    }
  );
  return CorporateLdInnerVideo;
};