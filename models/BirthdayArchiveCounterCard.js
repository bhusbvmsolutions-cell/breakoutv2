'use strict';
module.exports = (sequelize, DataTypes) => {
  const BirthdayArchiveCounterCard = sequelize.define(
    'BirthdayArchiveCounterCard',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      archive_id: {
        type: DataTypes.INTEGER,
        references: { model: 'birthday_archives', key: 'id' },
        onDelete: 'CASCADE',
      },
      sort_order: DataTypes.INTEGER,
      image: DataTypes.STRING(500),
      count: DataTypes.STRING(50),
      description: DataTypes.STRING(255),
    },
    { tableName: 'birthday_archive_counter_cards', timestamps: true }
  );
  return BirthdayArchiveCounterCard;
};