'use strict';
module.exports = (sequelize, DataTypes) => {
  const VenueFinderQuizSuitableTimeMapping = sequelize.define(
    'VenueFinderQuizSuitableTimeMapping',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      question_id: { type: DataTypes.INTEGER, references: { model: 'venue_finder_quiz_questions', key: 'id' }, onDelete: 'CASCADE' },
      suitable_time_id: { type: DataTypes.INTEGER, references: { model: 'venue_suitable_times', key: 'id' }, onDelete: 'CASCADE' },
    },
    {
      tableName: 'venue_finder_quiz_suitable_time_mappings',
      timestamps: false,
      indexes: [{ unique: true, fields: ['question_id', 'suitable_time_id'] }],
    }
  );
  return VenueFinderQuizSuitableTimeMapping;
};