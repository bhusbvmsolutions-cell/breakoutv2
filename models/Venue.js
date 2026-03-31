'use strict';
module.exports = (sequelize, DataTypes) => {
  const Venue = sequelize.define(
    'Venue',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      name: { type: DataTypes.STRING, allowNull: false },
      slug: { type: DataTypes.STRING, allowNull: false, unique: true },
      price: DataTypes.STRING,
      rating: DataTypes.STRING(500),
      capacity: DataTypes.STRING,
      cover_image: DataTypes.STRING(500),
      is_featured: { type: DataTypes.BOOLEAN, defaultValue: false },
      is_breakout: { type: DataTypes.BOOLEAN, defaultValue: false },
      time: DataTypes.STRING,
      phone: DataTypes.STRING,
      website: DataTypes.STRING,
      address: DataTypes.TEXT,
      google_map: DataTypes.STRING,
      isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
    },
    {
      tableName: 'venues',
      timestamps: true,
      hooks: {
        beforeValidate: (venue) => {
          if (venue.name && !venue.slug) {
            const slugify = require('slugify');
            venue.slug = slugify(venue.name, { lower: true, strict: true, remove: /[*+~.()'"!:@]/g });
          }
        },
      },
    }
  );
  return Venue;
};