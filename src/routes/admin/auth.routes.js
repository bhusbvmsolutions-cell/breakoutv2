const express = require('express');
const router = express.Router();
const authController = require('../../controllers/admin/auth.controller');
const { validateLogin, handleValidation } = require('../../middlewares/validation');
const { redirectIfAuthenticated } = require('../../middlewares/auth');

// Login routes (no authentication required)
router.get('/login', redirectIfAuthenticated, authController.loginForm);
router.post('/login', validateLogin, handleValidation, authController.login);

// Logout route
router.get('/logout', authController.logout);

// Password reset routes
router.get('/forgot-password', redirectIfAuthenticated, authController.forgotPasswordForm);
router.post('/forgot-password', redirectIfAuthenticated, authController.forgotPassword);
router.get('/reset-password/:token', redirectIfAuthenticated, authController.resetPasswordForm);
router.post('/reset-password/:token', redirectIfAuthenticated, authController.resetPassword);

module.exports = router;