'use strict';
module.exports = (sequelize, DataTypes) => {
  const CorporateUnwindCounterCard = sequelize.define(
    'CorporateUnwindCounterCard',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      archive_id: {
        type: DataTypes.INTEGER,
        references: { model: 'corporate_unwind_archives', key: 'id' },
        onDelete: 'CASCADE',
      },
      sort_order: DataTypes.INTEGER,
      image: DataTypes.STRING(500),
      count: DataTypes.STRING(50),
      description: DataTypes.STRING(255),
    },
    { tableName: 'corporate_unwind_counter_cards', timestamps: true }
  );
  return CorporateUnwindCounterCard;
};