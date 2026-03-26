'use strict';
module.exports = (sequelize, DataTypes) => {
  const VenueContentSection = sequelize.define(
    'VenueContentSection',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      venue_id: {
        type: DataTypes.INTEGER,
        references: { model: 'venues', key: 'id' },
        onDelete: 'CASCADE',
      },
      heading: DataTypes.STRING(500),
      content: { type: DataTypes.TEXT('long'), allowNull: false },
      sort_order: DataTypes.INTEGER,
      isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
    },
    {
      tableName: 'venue_content_sections',
      timestamps: true,
    }
  );
  return VenueContentSection;
};