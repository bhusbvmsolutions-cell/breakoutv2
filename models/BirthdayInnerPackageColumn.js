// models/BirthdayInnerPackageColumn.js
'use strict';
module.exports = (sequelize, DataTypes) => {
  const BirthdayInnerPackageColumn = sequelize.define(
    'BirthdayInnerPackageColumn',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      page_id: {
        type: DataTypes.INTEGER,
        references: { model: 'birthday_inner_pages', key: 'id' },
        onDelete: 'CASCADE',
      },
      sort_order: DataTypes.INTEGER,
      title: DataTypes.STRING,
      duration: DataTypes.STRING,
      image: DataTypes.STRING(500),
    },
    { tableName: 'birthday_inner_package_columns', timestamps: true }
  );
  return BirthdayInnerPackageColumn;
};