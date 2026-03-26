'use strict';
module.exports = (sequelize, DataTypes) => {
  const BreakoutPartyBlogContentGalleryImage = sequelize.define(
    'BreakoutPartyBlogContentGalleryImage',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      content_section_id: {
        type: DataTypes.INTEGER,
        references: { model: 'breakout_party_blog_content_sections', key: 'id' },
        onDelete: 'CASCADE',
      },
      image: DataTypes.STRING(500),
      sort_order: DataTypes.INTEGER,
      isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
    },
    {
      tableName: 'breakout_party_blog_content_gallery_images',
      timestamps: true,
    }
  );
  return BreakoutPartyBlogContentGalleryImage;
};