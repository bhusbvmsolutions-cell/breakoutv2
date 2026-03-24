'use strict';
module.exports = (sequelize, DataTypes) => {
  const CorporateLdInnerPoint = sequelize.define(
    'CorporateLdInnerPoint',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      page_id: {
        type: DataTypes.INTEGER,
        references: { model: 'corporate_ld_inner_pages', key: 'id' },
        onDelete: 'CASCADE',
      },
      sort_order: DataTypes.INTEGER,
      image: DataTypes.STRING(500),
      heading: DataTypes.STRING,
      description: DataTypes.STRING,
    },
    { tableName: 'corporate_ld_inner_points', timestamps: true }
  );
  return CorporateLdInnerPoint;
};