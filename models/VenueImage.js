'use strict';
module.exports = (sequelize, DataTypes) => {
  const VenueImage = sequelize.define(
    'VenueImage',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      venue_id: {
        type: DataTypes.INTEGER,
        references: { model: 'venues', key: 'id' },
        onDelete: 'CASCADE',
      },
      image: DataTypes.STRING(500),
      sort_order: DataTypes.INTEGER,
    },
    {
      tableName: 'venue_images',
      timestamps: true,
    }
  );
  return VenueImage;
};