'use strict';
module.exports = (sequelize, DataTypes) => {
  const VenueFinderQuiz = sequelize.define(
    'VenueFinderQuiz',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      title: { type: DataTypes.STRING(500), allowNull: false },
      slug: { type: DataTypes.STRING(500), allowNull: false, unique: true },
      birthday_blog_id: {
        type: DataTypes.INTEGER,
        references: { model: 'birthday_blogs', key: 'id' },
        onDelete: 'SET NULL',
        allowNull: true,
        set(value) { if (value === '') value = null; this.setDataValue('birthday_blog_id', value); },
      },
      isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
    },
    {
      tableName: 'venue_finder_quizzes',
      timestamps: true,
      hooks: {
        beforeValidate: (quiz) => {
          if (quiz.title && !quiz.slug) {
            const slugify = require('slugify');
            quiz.slug = slugify(quiz.title, { lower: true, strict: true, remove: /[*+~.()'"!:@]/g });
          }
        },
      },
    }
  );
  return VenueFinderQuiz;
};