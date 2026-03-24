'use strict';
module.exports = (sequelize, DataTypes) => {
  const CorporateLdInnerPage = sequelize.define(
    'CorporateLdInnerPage',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      title: { type: DataTypes.STRING, allowNull: false },
      slug: { type: DataTypes.STRING, allowNull: false, unique: true },
      // Banner section
      banner_heading: DataTypes.STRING,
      banner_description: DataTypes.TEXT,
      banner_image: DataTypes.STRING(500),
      // Content section
      content: DataTypes.TEXT,
      // Image card section
      image_card_heading: DataTypes.STRING,
      image_card_description: DataTypes.TEXT,
      // Points section
      points_heading: DataTypes.STRING,
      points_description: DataTypes.TEXT,
      // Key resources section
      key_resources_heading: DataTypes.STRING,
      isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
    },
    {
      tableName: 'corporate_ld_inner_pages',
      timestamps: true,
      hooks: {
        beforeValidate: (page) => {
          if (page.title && !page.slug) {
            const slugify = require('slugify');
            page.slug = slugify(page.title, { lower: true, strict: true, remove: /[*+~.()'"!:@]/g });
          }
        },
      },
    }
  );
  return CorporateLdInnerPage;
};