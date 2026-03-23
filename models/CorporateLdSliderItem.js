'use strict';
module.exports = (sequelize, DataTypes) => {
  const CorporateLdSliderItem = sequelize.define(
    'CorporateLdSliderItem',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      archive_id: {
        type: DataTypes.INTEGER,
        references: { model: 'corporate_ld_archives', key: 'id' },
        onDelete: 'CASCADE',
      },
      sort_order: DataTypes.INTEGER,
      heading: DataTypes.STRING,
      image: DataTypes.STRING(500),
    },
    { tableName: 'corporate_ld_slider_items', timestamps: true }
  );
  return CorporateLdSliderItem;
};