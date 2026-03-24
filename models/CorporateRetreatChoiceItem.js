'use strict';
module.exports = (sequelize, DataTypes) => {
  const CorporateRetreatChoiceItem = sequelize.define(
    'CorporateRetreatChoiceItem',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      archive_id: {
        type: DataTypes.INTEGER,
        references: { model: 'corporate_retreat_archives', key: 'id' },
        onDelete: 'CASCADE',
      },
      sort_order: DataTypes.INTEGER,
      heading: DataTypes.STRING,
      game_link: DataTypes.STRING(500),
      image: DataTypes.STRING(500),
    },
    { tableName: 'corporate_retreat_choice_items', timestamps: true }
  );
  return CorporateRetreatChoiceItem;
};