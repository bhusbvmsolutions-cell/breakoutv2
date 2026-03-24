'use strict';
module.exports = (sequelize, DataTypes) => {
  const FounderMessageImage = sequelize.define(
    'FounderMessageImage',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      founder_message_id: {
        type: DataTypes.INTEGER,
        references: { model: 'founder_messages', key: 'id' },
        onDelete: 'CASCADE',
      },
      image: DataTypes.STRING(500),
      sort_order: DataTypes.INTEGER,
    },
    {
      tableName: 'founder_message_images',
      timestamps: true,
    }
  );
  return FounderMessageImage;
};