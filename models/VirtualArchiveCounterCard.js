// models/VirtualArchiveCounterCard.js
'use strict';
module.exports = (sequelize, DataTypes) => {
  const VirtualArchiveCounterCard = sequelize.define(
    'VirtualArchiveCounterCard',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      archive_id: {
        type: DataTypes.INTEGER,
        references: { model: 'virtual_archives', key: 'id' },
        onDelete: 'CASCADE',
      },
      sort_order: DataTypes.INTEGER,
      image: DataTypes.STRING(500),
      count: DataTypes.STRING(50),
      description: DataTypes.STRING(255),
    },
    { tableName: 'virtual_archive_counter_cards' }
  );
  return VirtualArchiveCounterCard;
};