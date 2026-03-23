'use strict';
module.exports = (sequelize, DataTypes) => {
  const BachelorFarewellCounterCard = sequelize.define(
    'BachelorFarewellCounterCard',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      archive_id: {
        type: DataTypes.INTEGER,
        references: { model: 'bachelor_farewell_archives', key: 'id' },
        onDelete: 'CASCADE',
      },
      sort_order: DataTypes.INTEGER,
      image: DataTypes.STRING(500),
      count: DataTypes.STRING(50),
      description: DataTypes.STRING(255),
    },
    { tableName: 'bachelor_farewell_counter_cards', timestamps: true }
  );
  return BachelorFarewellCounterCard;
};