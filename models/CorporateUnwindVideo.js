'use strict';
module.exports = (sequelize, DataTypes) => {
  const CorporateUnwindVideo = sequelize.define(
    'CorporateUnwindVideo',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      archive_id: {
        type: DataTypes.INTEGER,
        references: { model: 'corporate_unwind_archives', key: 'id' },
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
      tableName: 'corporate_unwind_videos',
      timestamps: true,
      indexes: [{ unique: true, fields: ['archive_id', 'video_id'] }],
    }
  );
  return CorporateUnwindVideo;
};