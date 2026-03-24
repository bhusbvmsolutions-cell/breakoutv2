'use strict';
module.exports = (sequelize, DataTypes) => {
  const CorporateRetreatVideo = sequelize.define(
    'CorporateRetreatVideo',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      archive_id: {
        type: DataTypes.INTEGER,
        references: { model: 'corporate_retreat_archives', key: 'id' },
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
      tableName: 'corporate_retreat_videos',
      timestamps: true,
      indexes: [{ unique: true, fields: ['archive_id', 'video_id'] }],
    }
  );
  return CorporateRetreatVideo;
};