'use strict';

module.exports = (sequelize, DataTypes) => {
  const BlogBlockItem = sequelize.define(
    "BlogBlockItem",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },

      blockId: {
        type: DataTypes.UUID,
        allowNull: false
      },

      title: {
        type: DataTypes.STRING
      },

      subtitle: {
        type: DataTypes.STRING
      },

      description: {
        type: DataTypes.TEXT
      },

      image: {
        type: DataTypes.STRING
      },

      icon: {
        type: DataTypes.STRING
      },

      link: {
        type: DataTypes.STRING
      },

      extraData: {
        type: DataTypes.JSON
      },

      sortOrder: {
        type: DataTypes.INTEGER
      }
    },
    {
      tableName: "blog_block_items",
      timestamps: true
    }
  );

  return BlogBlockItem;
};