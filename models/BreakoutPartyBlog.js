'use strict';
module.exports = (sequelize, DataTypes) => {
  const BreakoutPartyBlog = sequelize.define(
    'BreakoutPartyBlog',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      title: { type: DataTypes.STRING, allowNull: false },
      slug: { type: DataTypes.STRING, allowNull: false, unique: true },
      featured_image: DataTypes.STRING(500),
      banner_heading: DataTypes.STRING,
      banner_description: DataTypes.TEXT,
      banner_video_id: {
        type: DataTypes.INTEGER,
        references: { model: 'videos', key: 'id' },
        onDelete: 'SET NULL',
      },
      banner_content: DataTypes.TEXT,
      meta_title: DataTypes.STRING,
      meta_description: DataTypes.TEXT,
      meta_keywords: DataTypes.STRING,
      og_title: DataTypes.STRING,
      og_description: DataTypes.TEXT,
      isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
    },
    {
      tableName: 'breakout_party_blogs',
      timestamps: true,
      hooks: {
        beforeValidate: (blog) => {
          if (blog.title && !blog.slug) {
            const slugify = require('slugify');
            blog.slug = slugify(blog.title, { lower: true, strict: true, remove: /[*+~.()'"!:@]/g });
          }
        },
      },
    }
  );
  return BreakoutPartyBlog;
};