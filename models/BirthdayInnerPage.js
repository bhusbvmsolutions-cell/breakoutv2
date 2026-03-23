// models/BirthdayInnerPage.js
'use strict';
module.exports = (sequelize, DataTypes) => {
  const BirthdayInnerPage = sequelize.define(
    'BirthdayInnerPage',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      title: { type: DataTypes.STRING, allowNull: false },
      slug: { type: DataTypes.STRING, allowNull: false, unique: true },
      image: DataTypes.STRING(500),
      banner_heading: DataTypes.STRING,
      banner_description: DataTypes.STRING,
      banner_image: DataTypes.STRING(500),
      counters_heading: DataTypes.STRING,
      counters_content: DataTypes.TEXT,
      counters_note: DataTypes.STRING,
      counters_counter_heading: DataTypes.STRING,
      counters_rating: DataTypes.DECIMAL(3,1),
      image_card_heading: DataTypes.STRING,
      party_inclusions_heading: DataTypes.STRING,
      party_inclusions_note: DataTypes.STRING,
      slider_heading: DataTypes.STRING,
      slider_description: DataTypes.STRING,
      image1: DataTypes.STRING(500),
      image2: DataTypes.STRING(500),
      image3: DataTypes.STRING(500),
      footer_heading: DataTypes.STRING,
      footer_content: DataTypes.TEXT,
      isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
    },
    {
      tableName: 'birthday_inner_pages',
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
  return BirthdayInnerPage;
};