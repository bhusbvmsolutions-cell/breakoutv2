// models/BirthdayInnerPackageRow.js
'use strict';
module.exports = (sequelize, DataTypes) => {
  const BirthdayInnerPackageRow = sequelize.define(
    'BirthdayInnerPackageRow',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      page_id: {
        type: DataTypes.INTEGER,
        references: { model: 'birthday_inner_pages', key: 'id' },
        onDelete: 'CASCADE',
      },
      sort_order: DataTypes.INTEGER,
      feature: DataTypes.STRING,
    },
    { tableName: 'birthday_inner_package_rows', timestamps: true }
  );
  return BirthdayInnerPackageRow;
};