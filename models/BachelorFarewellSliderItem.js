'use strict';
module.exports = (sequelize, DataTypes) => {
  const BachelorFarewellSliderItem = sequelize.define(
    'BachelorFarewellSliderItem',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      archive_id: {
        type: DataTypes.INTEGER,
        references: { model: 'bachelor_farewell_archives', key: 'id' },
        onDelete: 'CASCADE',
      },
      sort_order: DataTypes.INTEGER,
      heading: DataTypes.STRING,
      description: DataTypes.TEXT,
      image: DataTypes.STRING(500),
    },
    { tableName: 'bachelor_farewell_slider_items', timestamps: true }
  );
  return BachelorFarewellSliderItem;
};