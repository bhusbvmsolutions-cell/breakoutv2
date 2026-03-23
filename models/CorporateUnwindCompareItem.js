'use strict';
module.exports = (sequelize, DataTypes) => {
  const CorporateUnwindCompareItem = sequelize.define(
    'CorporateUnwindCompareItem',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      archive_id: {
        type: DataTypes.INTEGER,
        references: { model: 'corporate_unwind_archives', key: 'id' },
        onDelete: 'CASCADE',
      },
      sort_order: DataTypes.INTEGER,
      left_point: DataTypes.STRING,
      right_image: DataTypes.STRING(500),
      right_point: DataTypes.STRING,
    },
    { tableName: 'corporate_unwind_compare_items', timestamps: true }
  );
  return CorporateUnwindCompareItem;
};