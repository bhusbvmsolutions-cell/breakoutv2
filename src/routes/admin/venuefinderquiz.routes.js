const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../../middlewares/auth');
const quizController = require('../../controllers/admin/venuefinderquiz.controller');

// All admin routes require authentication
router.use(isAuthenticated);

// Quiz routes
router.get('/', quizController.listQuizzes);
router.get('/create', quizController.createQuizForm);
router.post('/', quizController.storeQuiz);
router.get('/:id/edit', quizController.editQuizForm);
router.put('/:id', quizController.updateQuiz);
router.delete('/:id', quizController.deleteQuiz);
router.post('/:id/toggle-status', quizController.toggleQuizStatus);

// Question routes
router.get('/:quizId/questions', quizController.listQuestions);
router.get('/:quizId/questions/create', quizController.createQuestionForm);
router.post('/:quizId/questions', quizController.storeQuestion);
router.get('/:quizId/questions/:questionId/edit', quizController.editQuestionForm);
router.put('/:quizId/questions/:questionId', quizController.updateQuestion);
router.delete('/:quizId/questions/:questionId', quizController.deleteQuestion);

// Custom option routes (only for questions with options_source = 'custom')
router.get('/:quizId/questions/:questionId/options', quizController.listOptions);
router.get('/:quizId/questions/:questionId/options/create', quizController.createOptionForm);
router.post('/:quizId/questions/:questionId/options', quizController.storeOption);
router.get('/:quizId/questions/:questionId/options/:optionId/edit', quizController.editOptionForm);
router.put('/:quizId/questions/:questionId/options/:optionId', quizController.updateOption);
router.delete('/:quizId/questions/:questionId/options/:optionId', quizController.deleteOption);

module.exports = router;