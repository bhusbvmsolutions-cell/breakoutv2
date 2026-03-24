'use strict';
module.exports = (sequelize, DataTypes) => {
  const TncPage = sequelize.define(
    'TncPage',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      reference: { type: DataTypes.STRING, allowNull: false, unique: true },
      title: { type: DataTypes.STRING, allowNull: false },
      content: { type: DataTypes.TEXT('long') },
      isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
    },
    {
      tableName: 'tnc_pages',
      timestamps: true,
    }
  );
  return TncPage;
};