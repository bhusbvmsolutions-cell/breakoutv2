'use strict';
module.exports = (sequelize, DataTypes) => {
  const Page = sequelize.define(
    'Page',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      name: { type: DataTypes.STRING(500), allowNull: false },
      slug: { type: DataTypes.STRING(500), allowNull: false, unique: true },
      reference: { type: DataTypes.STRING(500), allowNull: false },
    },
    {
      tableName: 'pages',
      timestamps: true,
    }
  );
  return Page;
};