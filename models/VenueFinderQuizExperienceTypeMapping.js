'use strict';
module.exports = (sequelize, DataTypes) => {
  const VenueFinderQuizExperienceTypeMapping = sequelize.define(
    'VenueFinderQuizExperienceTypeMapping',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      question_id: { type: DataTypes.INTEGER, references: { model: 'venue_finder_quiz_questions', key: 'id' }, onDelete: 'CASCADE' },
      experience_type_id: { type: DataTypes.INTEGER, references: { model: 'venue_experience_types', key: 'id' }, onDelete: 'CASCADE' },
    },
    {
      tableName: 'venue_finder_quiz_experience_type_mappings',
      timestamps: false,
      indexes: [{ unique: true, fields: ['question_id', 'experience_type_id'] }],
    }
  );
  return VenueFinderQuizExperienceTypeMapping;
};