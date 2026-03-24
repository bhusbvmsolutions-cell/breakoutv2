'use strict';
module.exports = (sequelize, DataTypes) => {
  const HomePageCounterCard = sequelize.define(
    'HomePageCounterCard',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      home_page_id: {
        type: DataTypes.INTEGER,
        references: { model: 'home_pages', key: 'id' },
        onDelete: 'CASCADE',
      },
      sort_order: DataTypes.INTEGER,
      image: DataTypes.STRING(500),
      count: DataTypes.STRING(50),
      description: DataTypes.STRING(255),
    },
    {
      tableName: 'home_page_counter_cards',
      timestamps: true,
    }
  );

  return HomePageCounterCard;
};