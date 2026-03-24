'use strict';
module.exports = (sequelize, DataTypes) => {
  const Location = sequelize.define(
    'Location',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      title: { type: DataTypes.STRING, allowNull: false },
      slug: { type: DataTypes.STRING, allowNull: false, unique: true },
      banner_image: DataTypes.STRING(500),
      description: DataTypes.TEXT,
      meta_title: DataTypes.STRING,
      meta_description: DataTypes.TEXT,
      meta_keywords: DataTypes.STRING,
      isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
    },
    {
      tableName: 'locations',
      timestamps: true,
      hooks: {
        beforeValidate: (location) => {
          if (location.title && !location.slug) {
            const slugify = require('slugify');
            location.slug = slugify(location.title, { lower: true, strict: true, remove: /[*+~.()'"!:@]/g });
          }
        },
      },
    }
  );

  return Location;
};