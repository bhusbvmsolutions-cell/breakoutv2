'use strict';
module.exports = (sequelize, DataTypes) => {
  const FounderMessage = sequelize.define(
    'FounderMessage',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      page: { type: DataTypes.STRING, allowNull: false, unique: true },
      heading: DataTypes.STRING,
      banner_video_id: {
        type: DataTypes.INTEGER,
        references: { model: 'videos', key: 'id' },
        onDelete: 'SET NULL',
      },
      message_title: DataTypes.STRING,
      content: DataTypes.TEXT,
      video: DataTypes.STRING(500),
      isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
    },
    {
      tableName: 'founder_messages',
      timestamps: true,
    }
  );
  return FounderMessage;
};