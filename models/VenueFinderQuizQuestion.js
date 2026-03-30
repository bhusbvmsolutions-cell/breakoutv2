'use strict';
module.exports = (sequelize, DataTypes) => {
  const VenueFinderQuizQuestion = sequelize.define(
    'VenueFinderQuizQuestion',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      quiz_id: { type: DataTypes.INTEGER, allowNull: false, references: { model: 'venue_finder_quizzes', key: 'id' }, onDelete: 'CASCADE' },
      text: { type: DataTypes.TEXT, allowNull: false },
      order: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
      type: { type: DataTypes.ENUM('radio', 'checkbox', 'select', 'range', 'date'), defaultValue: 'radio', allowNull: false },
      options_source: {
        type: DataTypes.ENUM('custom', 'categories', 'budget_ranges', 'experience_types', 'party_types', 'suitable_times', 'looking_for', 'locations'),
        defaultValue: 'custom',
        allowNull: false,
        comment: 'Source of options. If not "custom", options are loaded from the referenced table using the many-to-many mappings defined in junction tables.',
      },
      config: { type: DataTypes.JSON, allowNull: true, comment: 'Configuration for range/date questions.' },
      filter_mapping: { type: DataTypes.JSON, allowNull: true, comment: 'Mapping from user input to venue filters for range/date.' },
      isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
    },
    {
      tableName: 'venue_finder_quiz_questions',
      timestamps: true,
    }
  );
  return VenueFinderQuizQuestion;
};