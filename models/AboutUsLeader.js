'use strict';
module.exports = (sequelize, DataTypes) => {
  const AboutUsLeader = sequelize.define(
    'AboutUsLeader',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      about_id: {
        type: DataTypes.INTEGER,
        references: { model: 'about_us', key: 'id' },
        onDelete: 'CASCADE',
      },
      sort_order: DataTypes.INTEGER,
      image: DataTypes.STRING(500),
      name: DataTypes.STRING,
      designation: DataTypes.STRING,
      description: DataTypes.TEXT,
      whatsapp: DataTypes.STRING,
      instagram: DataTypes.STRING,
      linkedin: DataTypes.STRING,
      twitter: DataTypes.STRING,
      gmail: DataTypes.STRING,
      link: DataTypes.STRING,
    },
    { tableName: 'about_us_leaders', timestamps: true }
  );
  return AboutUsLeader;
};