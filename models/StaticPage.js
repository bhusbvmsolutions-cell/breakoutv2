'use strict';
module.exports = (sequelize, DataTypes) => {
  const StaticPage = sequelize.define(
    'StaticPage',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      slug: { type: DataTypes.STRING, allowNull: false, unique: true },
      heading: DataTypes.STRING,
      content: DataTypes.TEXT,
      isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
    },
    {
      tableName: 'static_pages',
      timestamps: true,
    }
  );
  return StaticPage;
};