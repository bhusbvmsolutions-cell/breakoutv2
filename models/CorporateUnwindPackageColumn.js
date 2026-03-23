'use strict';
module.exports = (sequelize, DataTypes) => {
  const CorporateUnwindPackageColumn = sequelize.define(
    'CorporateUnwindPackageColumn',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      archive_id: {
        type: DataTypes.INTEGER,
        references: { model: 'corporate_unwind_archives', key: 'id' },
        onDelete: 'CASCADE',
      },
      sort_order: DataTypes.INTEGER,
      title: DataTypes.STRING,
      duration: DataTypes.STRING,
      image: DataTypes.STRING(500),
    },
    { tableName: 'corporate_unwind_package_columns', timestamps: true }
  );
  return CorporateUnwindPackageColumn;
};