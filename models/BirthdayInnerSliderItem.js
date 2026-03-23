// models/BirthdayInnerSliderItem.js
'use strict';
module.exports = (sequelize, DataTypes) => {
  const BirthdayInnerSliderItem = sequelize.define(
    'BirthdayInnerSliderItem',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      page_id: {
        type: DataTypes.INTEGER,
        references: { model: 'birthday_inner_pages', key: 'id' },
        onDelete: 'CASCADE',
      },
      sort_order: DataTypes.INTEGER,
      heading: DataTypes.STRING,
      description: DataTypes.TEXT,
      image: DataTypes.STRING(500),
    },
    { tableName: 'birthday_inner_slider_items', timestamps: true }
  );
  return BirthdayInnerSliderItem;
};