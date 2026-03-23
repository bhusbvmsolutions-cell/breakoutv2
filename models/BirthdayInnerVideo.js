// models/BirthdayInnerVideo.js
'use strict';
module.exports = (sequelize, DataTypes) => {
  const BirthdayInnerVideo = sequelize.define(
    'BirthdayInnerVideo',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      page_id: {
        type: DataTypes.INTEGER,
        references: { model: 'birthday_inner_pages', key: 'id' },
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
      tableName: 'birthday_inner_videos',
      timestamps: true,
      indexes: [{ unique: true, fields: ['page_id', 'video_id'] }],
    }
  );
  return BirthdayInnerVideo;
};