'use strict';
module.exports = (sequelize, DataTypes) => {
  const BirthdayArchiveSliderItem = sequelize.define(
    'BirthdayArchiveSliderItem',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      archive_id: {
        type: DataTypes.INTEGER,
        references: { model: 'birthday_archives', key: 'id' },
        onDelete: 'CASCADE',
      },
      sort_order: DataTypes.INTEGER,
      heading: DataTypes.STRING,
      description: DataTypes.TEXT,
      image: DataTypes.STRING(500),
    },
    { tableName: 'birthday_archive_slider_items', timestamps: true }
  );
  return BirthdayArchiveSliderItem;
};