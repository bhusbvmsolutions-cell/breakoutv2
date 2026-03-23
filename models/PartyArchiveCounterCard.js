// models/PartyArchiveCounterCard.js
'use strict';
module.exports = (sequelize, DataTypes) => {
  const PartyArchiveCounterCard = sequelize.define(
    'PartyArchiveCounterCard',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      archive_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: { model: 'party_archives', key: 'id' },
        onDelete: 'CASCADE',
      },
      sort_order: DataTypes.INTEGER,
      image: DataTypes.STRING(500),
      count: DataTypes.STRING(50),
      description: DataTypes.STRING(255),
    },
    {
      tableName: 'party_archive_counter_cards',
      timestamps: true,
    }
  );
  return PartyArchiveCounterCard;
};