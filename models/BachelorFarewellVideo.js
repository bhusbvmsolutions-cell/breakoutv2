'use strict';
module.exports = (sequelize, DataTypes) => {
  const BachelorFarewellVideo = sequelize.define(
    'BachelorFarewellVideo',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      archive_id: {
        type: DataTypes.INTEGER,
        references: { model: 'bachelor_farewell_archives', key: 'id' },
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
      tableName: 'bachelor_farewell_videos',
      timestamps: true,
      indexes: [{ unique: true, fields: ['archive_id', 'video_id'] }],
    }
  );
  return BachelorFarewellVideo;
};