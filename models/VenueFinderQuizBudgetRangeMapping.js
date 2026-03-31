'use strict';
module.exports = (sequelize, DataTypes) => {
  const VenueFinderQuizBudgetRangeMapping = sequelize.define(
    'VenueFinderQuizBudgetRangeMapping',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      question_id: { type: DataTypes.INTEGER, references: { model: 'venue_finder_quiz_questions', key: 'id' }, onDelete: 'CASCADE' },
      budget_range_id: { type: DataTypes.INTEGER, references: { model: 'venue_budget_ranges', key: 'id' }, onDelete: 'CASCADE' },
    },
    {
      tableName: 'venue_finder_quiz_budget_range_mappings',
      timestamps: false,
      indexes: [{ unique: true, fields: ['question_id', 'budget_range_id'] }],
    }
  );
  return VenueFinderQuizBudgetRangeMapping;
};