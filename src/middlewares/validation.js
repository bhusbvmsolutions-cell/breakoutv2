const { body, validationResult } = require('express-validator');

const validateLogin = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email'),

  body('password')
    .notEmpty().withMessage('Password is required')
];

const handleValidation = (req, res, next) => {

  const errors = validationResult(req);

  if (!errors.isEmpty()) {

    if (req.path.startsWith('/api')) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    return res.render('admin/login', {
      title: 'Admin Login',
      error: errors.array()[0].msg,
      layout: false
    });
  }

  next();
};

module.exports = {
  validateLogin,
  handleValidation
};