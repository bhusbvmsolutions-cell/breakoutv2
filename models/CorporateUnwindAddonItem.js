'use strict';
module.exports = (sequelize, DataTypes) => {
  const CorporateUnwindAddonItem = sequelize.define(
    'CorporateUnwindAddonItem',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      archive_id: {
        type: DataTypes.INTEGER,
        references: { model: 'corporate_unwind_archives', key: 'id' },
        onDelete: 'CASCADE',
      },
      sort_order: DataTypes.INTEGER,
      heading: DataTypes.STRING,
      blog_link: DataTypes.STRING(500),
      image: DataTypes.STRING(500),
    },
    { tableName: 'corporate_unwind_addon_items', timestamps: true }
  );
  return CorporateUnwindAddonItem;
};