// models/BirthdayInnerImageCard.js
'use strict';
module.exports = (sequelize, DataTypes) => {
  const BirthdayInnerImageCard = sequelize.define(
    'BirthdayInnerImageCard',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      page_id: {
        type: DataTypes.INTEGER,
        references: { model: 'birthday_inner_pages', key: 'id' },
        onDelete: 'CASCADE',
      },
      sort_order: DataTypes.INTEGER,
      heading: DataTypes.STRING,
      image: DataTypes.STRING(500),
    },
    { tableName: 'birthday_inner_image_cards', timestamps: true }
  );
  return BirthdayInnerImageCard;
};