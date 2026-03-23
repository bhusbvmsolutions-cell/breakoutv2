'use strict';
module.exports = (sequelize, DataTypes) => {
  const BirthdayArchiveVideo = sequelize.define(
    'BirthdayArchiveVideo',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      archive_id: {
        type: DataTypes.INTEGER,
        references: { model: 'birthday_archives', key: 'id' },
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
      tableName: 'birthday_archive_videos',
      timestamps: true,
      indexes: [{ unique: true, fields: ['archive_id', 'video_id'] }],
    }
  );
  return BirthdayArchiveVideo;
};