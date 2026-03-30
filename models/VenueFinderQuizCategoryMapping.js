'use strict';
module.exports = (sequelize, DataTypes) => {
  const VenueFinderQuizCategoryMapping = sequelize.define(
    'VenueFinderQuizCategoryMapping',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      question_id: { type: DataTypes.INTEGER, references: { model: 'venue_finder_quiz_questions', key: 'id' }, onDelete: 'CASCADE' },
      category_id: { type: DataTypes.INTEGER, references: { model: 'venue_categories', key: 'id' }, onDelete: 'CASCADE' },
    },
    {
      tableName: 'venue_finder_quiz_category_mappings',
      timestamps: false,
      indexes: [{ unique: true, fields: ['question_id', 'category_id'] }],
    }
  );
  return VenueFinderQuizCategoryMapping;
};