'use strict';
module.exports = (sequelize, DataTypes) => {
  const CorporateLdInnerImageCard = sequelize.define(
    'CorporateLdInnerImageCard',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      page_id: {
        type: DataTypes.INTEGER,
        references: { model: 'corporate_ld_inner_pages', key: 'id' },
        onDelete: 'CASCADE',
      },
      sort_order: DataTypes.INTEGER,
      heading: DataTypes.STRING,
      image: DataTypes.STRING(500),
    },
    { tableName: 'corporate_ld_inner_image_cards', timestamps: true }
  );
  return CorporateLdInnerImageCard;
};