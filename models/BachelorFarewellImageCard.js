'use strict';
module.exports = (sequelize, DataTypes) => {
  const BachelorFarewellImageCard = sequelize.define(
    'BachelorFarewellImageCard',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      archive_id: {
        type: DataTypes.INTEGER,
        references: { model: 'bachelor_farewell_archives', key: 'id' },
        onDelete: 'CASCADE',
      },
      sort_order: DataTypes.INTEGER,
      heading: DataTypes.STRING,
      link: DataTypes.STRING,
      image: DataTypes.STRING(500),
    },
    { tableName: 'bachelor_farewell_image_cards', timestamps: true }
  );
  return BachelorFarewellImageCard;
};