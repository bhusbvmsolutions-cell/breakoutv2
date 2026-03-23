'use strict';
module.exports = (sequelize, DataTypes) => {
  const CorporateUnwindWhyUsItem = sequelize.define(
    'CorporateUnwindWhyUsItem',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      archive_id: {
        type: DataTypes.INTEGER,
        references: { model: 'corporate_unwind_archives', key: 'id' },
        onDelete: 'CASCADE',
      },
      sort_order: DataTypes.INTEGER,
      heading: DataTypes.STRING,
      image: DataTypes.STRING(500),
    },
    { tableName: 'corporate_unwind_why_us_items', timestamps: true }
  );
  return CorporateUnwindWhyUsItem;
};