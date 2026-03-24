'use strict';
module.exports = (sequelize, DataTypes) => {
  const AboutUsCard = sequelize.define(
    'AboutUsCard',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      about_id: {
        type: DataTypes.INTEGER,
        references: { model: 'about_us', key: 'id' },
        onDelete: 'CASCADE',
      },
      sort_order: DataTypes.INTEGER,
      image: DataTypes.STRING(500),
      heading: DataTypes.STRING,
      description: DataTypes.STRING,
    },
    { tableName: 'about_us_cards', timestamps: true }
  );
  return AboutUsCard;
};