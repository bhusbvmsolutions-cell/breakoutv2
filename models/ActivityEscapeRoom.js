'use strict';
module.exports = (sequelize, DataTypes) => {
  const ActivityEscapeRoom = sequelize.define(
    'ActivityEscapeRoom',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      activity_id: {
        type: DataTypes.INTEGER,
        references: { model: 'activities', key: 'id' },
        onDelete: 'CASCADE',
      },
      escaperoom_type: {
        type: DataTypes.ENUM('physical', 'virtual'),
        allowNull: false,
      },
      escaperoom_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      sort_order: DataTypes.INTEGER,
    },
    {
      tableName: 'activity_escaperooms',
      timestamps: true,
      indexes: [{ unique: true, fields: ['activity_id', 'escaperoom_type', 'escaperoom_id'] }],
    }
  );
  return ActivityEscapeRoom;
};