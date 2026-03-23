'use strict';
module.exports = (sequelize, DataTypes) => {
  const BachelorFarewellInclusionItem = sequelize.define(
    'BachelorFarewellInclusionItem',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      archive_id: {
        type: DataTypes.INTEGER,
        references: { model: 'bachelor_farewell_archives', key: 'id' },
        onDelete: 'CASCADE',
      },
      sort_order: DataTypes.INTEGER,
      heading: DataTypes.STRING,
      link: DataTypes.STRING(500),
      image: DataTypes.STRING(500),
    },
    { tableName: 'bachelor_farewell_inclusion_items', timestamps: true }
  );
  return BachelorFarewellInclusionItem;
};