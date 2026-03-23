'use strict';
module.exports = (sequelize, DataTypes) => {
  const CorporateUnwindImageCard = sequelize.define(
    'CorporateUnwindImageCard',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      archive_id: {
        type: DataTypes.INTEGER,
        references: { model: 'corporate_unwind_archives', key: 'id' },
        onDelete: 'CASCADE',
      },
      sort_order: DataTypes.INTEGER,
      heading: DataTypes.STRING,
      game_link: DataTypes.STRING(500),
      image: DataTypes.STRING(500),
    },
    { tableName: 'corporate_unwind_image_cards', timestamps: true }
  );
  return CorporateUnwindImageCard;
};