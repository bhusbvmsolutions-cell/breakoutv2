'use strict';
module.exports = (sequelize, DataTypes) => {
  const ActivityImageCard = sequelize.define(
    'ActivityImageCard',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      activity_id: {
        type: DataTypes.INTEGER,
        references: { model: 'activities', key: 'id' },
        onDelete: 'CASCADE',
      },
      sort_order: DataTypes.INTEGER,
      heading: DataTypes.STRING,
      image: DataTypes.STRING(500),
    },
    { tableName: 'activity_image_cards', timestamps: true }
  );
  return ActivityImageCard;
};