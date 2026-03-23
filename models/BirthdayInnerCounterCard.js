// models/BirthdayInnerCounterCard.js
'use strict';
module.exports = (sequelize, DataTypes) => {
  const BirthdayInnerCounterCard = sequelize.define(
    'BirthdayInnerCounterCard',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      page_id: {
        type: DataTypes.INTEGER,
        references: { model: 'birthday_inner_pages', key: 'id' },
        onDelete: 'CASCADE',
      },
      sort_order: DataTypes.INTEGER,
      image: DataTypes.STRING(500),
      count: DataTypes.STRING(50),
      description: DataTypes.STRING(255),
    },
    { tableName: 'birthday_inner_counter_cards', timestamps: true }
  );
  return BirthdayInnerCounterCard;
};