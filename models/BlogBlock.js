'use strict';

module.exports = (sequelize, DataTypes) => {
  const BlogBlock = sequelize.define(
    "BlogBlock",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },

      blogId: {
        type: DataTypes.UUID,
        allowNull: false
      },

      type: {
        type: DataTypes.ENUM(
          "paragraph",
          "heading",
          "image",
          "quote",
          "code",
          "hero",
          "text",
          "gallery",
          "cards",
          "faq",
          "locations",
          "cta"
        ),
      },
      title: {
        type: DataTypes.STRING
      },

      subtitle: {
        type: DataTypes.STRING
      },

      content: {
        type: DataTypes.TEXT('long')
      },

      settings: {
        type: DataTypes.JSON
      },

      sortOrder: {
        type: DataTypes.INTEGER
      }
    },
    {
      tableName: "blog_blocks",
      timestamps: true
    }
  );

  return BlogBlock;
};