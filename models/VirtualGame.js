// models/VirtualGame.js
'use strict';
module.exports = (sequelize, DataTypes) => {
  const VirtualGame = sequelize.define(
    'VirtualGame',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      title: { type: DataTypes.STRING, allowNull: false },
      slug: { type: DataTypes.STRING, allowNull: false, unique: true },
      // Banner section (all fields)
      banner_heading: DataTypes.STRING,
      banner_image: DataTypes.STRING(500),
      banner_description: DataTypes.TEXT,
      banner_content: DataTypes.TEXT('long'),
      success_rate: DataTypes.STRING(10),
      capacity: DataTypes.STRING(50),
      cta_label: DataTypes.STRING,
      cta_link: DataTypes.STRING,
      video_trailer: DataTypes.STRING,
      isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
    },
    {
      tableName: 'virtual_games',
      timestamps: true,
      hooks: {
        beforeValidate: (game) => {
          if (game.title && !game.slug) {
            const slugify = require('slugify');
            game.slug = slugify(game.title, { lower: true, strict: true, remove: /[*+~.()'"!:@]/g });
          }
        },
      },
    }
  );

  return VirtualGame;
};