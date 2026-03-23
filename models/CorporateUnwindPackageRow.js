'use strict';
module.exports = (sequelize, DataTypes) => {
  const CorporateUnwindPackageRow = sequelize.define(
    'CorporateUnwindPackageRow',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      archive_id: {
        type: DataTypes.INTEGER,
        references: { model: 'corporate_unwind_archives', key: 'id' },
        onDelete: 'CASCADE',
      },
      sort_order: DataTypes.INTEGER,
      feature: DataTypes.STRING,
    },
    { tableName: 'corporate_unwind_package_rows', timestamps: true }
  );
  return CorporateUnwindPackageRow;
};