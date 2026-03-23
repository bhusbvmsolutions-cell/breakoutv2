// models/BirthdayInnerInclusionItem.js
'use strict';
module.exports = (sequelize, DataTypes) => {
  const BirthdayInnerInclusionItem = sequelize.define(
    'BirthdayInnerInclusionItem',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      page_id: {
        type: DataTypes.INTEGER,
        references: { model: 'birthday_inner_pages', key: 'id' },
        onDelete: 'CASCADE',
      },
      sort_order: DataTypes.INTEGER,
      heading: DataTypes.STRING,
      link: DataTypes.STRING(500),
      image: DataTypes.STRING(500),
    },
    { tableName: 'birthday_inner_inclusion_items', timestamps: true }
  );
  return BirthdayInnerInclusionItem;
};