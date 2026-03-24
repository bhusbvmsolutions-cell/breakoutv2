'use strict';
module.exports = (sequelize, DataTypes) => {
  const CorporateRetreatWhyChooseUsItem = sequelize.define(
    'CorporateRetreatWhyChooseUsItem',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      archive_id: {
        type: DataTypes.INTEGER,
        references: { model: 'corporate_retreat_archives', key: 'id' },
        onDelete: 'CASCADE',
      },
      sort_order: DataTypes.INTEGER,
      heading: DataTypes.STRING,
      image: DataTypes.STRING(500),
    },
    { tableName: 'corporate_retreat_why_choose_us_items', timestamps: true }
  );
  return CorporateRetreatWhyChooseUsItem;
};