const { body, validationResult } = require('express-validator');

// Login validation rules
const validateLogin = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required')
];

// Validation handler
const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // For API requests
    if (req.path.startsWith('/api')) {
      return res.status(400).json({ 
        success: false,
        errors: errors.array() 
      });
    }
    
    // For form submissions
    const errorMessages = errors.array().map(err => err.msg);
    return res.render('admin/login', {
      title: 'Admin Login',
      error: errorMessages[0],
      layout: false,
      body: ''
    });
  }
  next();
};

module.exports = {
  validateLogin,
  handleValidation
};