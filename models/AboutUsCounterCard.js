// models/AboutUsCounterCard.js
'use strict';
module.exports = (sequelize, DataTypes) => {
  const AboutUsCounterCard = sequelize.define(
    'AboutUsCounterCard',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      about_id: {
        type: DataTypes.INTEGER,
        references: { model: 'about_us', key: 'id' },
        onDelete: 'CASCADE',
      },
      sort_order: DataTypes.INTEGER,
      image: DataTypes.STRING(500),
      count: DataTypes.STRING(50),
      description: DataTypes.STRING(255),
    },
    { tableName: 'about_us_counter_cards', timestamps: true }
  );
  return AboutUsCounterCard;
};