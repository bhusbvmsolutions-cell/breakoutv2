'use strict';
module.exports = (sequelize, DataTypes) => {
  const BreakoutPartyBlogContentSection = sequelize.define(
    'BreakoutPartyBlogContentSection',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      blog_id: {
        type: DataTypes.INTEGER,
        references: { model: 'breakout_party_blogs', key: 'id' },
        onDelete: 'CASCADE',
      },
      heading: DataTypes.STRING,
      description: DataTypes.TEXT,
      sort_order: DataTypes.INTEGER,
      isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
    },
    {
      tableName: 'breakout_party_blog_content_sections',
      timestamps: true,
    }
  );
  return BreakoutPartyBlogContentSection;
};