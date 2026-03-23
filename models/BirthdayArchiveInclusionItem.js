'use strict';
module.exports = (sequelize, DataTypes) => {
  const BirthdayArchiveInclusionItem = sequelize.define(
    'BirthdayArchiveInclusionItem',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      archive_id: {
        type: DataTypes.INTEGER,
        references: { model: 'birthday_archives', key: 'id' },
        onDelete: 'CASCADE',
      },
      sort_order: DataTypes.INTEGER,
      heading: DataTypes.STRING,
      link: DataTypes.STRING(500),
      image: DataTypes.STRING(500),
    },
    { tableName: 'birthday_archive_inclusion_items', timestamps: true }
  );
  return BirthdayArchiveInclusionItem;
};