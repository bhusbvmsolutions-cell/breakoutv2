'use strict';
module.exports = (sequelize, DataTypes) => {
  const CorporateRetreatImageCard = sequelize.define(
    'CorporateRetreatImageCard',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      archive_id: {
        type: DataTypes.INTEGER,
        references: { model: 'corporate_retreat_archives', key: 'id' },
        onDelete: 'CASCADE',
      },
      sort_order: DataTypes.INTEGER,
      heading: DataTypes.STRING,
      image: DataTypes.STRING(500),
    },
    { tableName: 'corporate_retreat_image_cards', timestamps: true }
  );
  return CorporateRetreatImageCard;
};