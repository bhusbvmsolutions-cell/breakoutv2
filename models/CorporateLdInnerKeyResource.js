'use strict';
module.exports = (sequelize, DataTypes) => {
  const CorporateLdInnerKeyResource = sequelize.define(
    'CorporateLdInnerKeyResource',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      page_id: {
        type: DataTypes.INTEGER,
        references: { model: 'corporate_ld_inner_pages', key: 'id' },
        onDelete: 'CASCADE',
      },
      sort_order: DataTypes.INTEGER,
      heading: DataTypes.STRING,
      image: DataTypes.STRING(500),
    },
    { tableName: 'corporate_ld_inner_key_resources', timestamps: true }
  );
  return CorporateLdInnerKeyResource;
};