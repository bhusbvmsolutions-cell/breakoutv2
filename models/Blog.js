'use strict';

module.exports = (sequelize, DataTypes) => {
  const Blog = sequelize.define(
    "Blog",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },

      title: {
        type: DataTypes.STRING,
        allowNull: false
      },

      slug: {
        type: DataTypes.STRING,
        unique: true
      },

      excerpt: {
        type: DataTypes.TEXT
      },

      heroImage: {
        type: DataTypes.STRING
      },

      author: {
        type: DataTypes.STRING
      },

      readTime: {
        type: DataTypes.INTEGER
      },

      status: {
        type: DataTypes.ENUM("draft", "published"),
        defaultValue: "draft"
      },

      publishedAt: {
        type: DataTypes.DATE
      }
    },
    {
      tableName: "blogs",
      timestamps: true
    }
  );

  return Blog;
};