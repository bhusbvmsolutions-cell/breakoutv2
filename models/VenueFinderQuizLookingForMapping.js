'use strict';
module.exports = (sequelize, DataTypes) => {
  const VenueFinderQuizLookingForMapping = sequelize.define(
    'VenueFinderQuizLookingForMapping',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      question_id: { type: DataTypes.INTEGER, references: { model: 'venue_finder_quiz_questions', key: 'id' }, onDelete: 'CASCADE' },
      looking_for_id: { type: DataTypes.INTEGER, references: { model: 'venue_experience_looking_for', key: 'id' }, onDelete: 'CASCADE' },
    },
    {
      tableName: 'venue_finder_quiz_looking_for_mappings',
      timestamps: false,
      indexes: [{ unique: true, fields: ['question_id', 'looking_for_id'] }],
    }
  );
  return VenueFinderQuizLookingForMapping;
};