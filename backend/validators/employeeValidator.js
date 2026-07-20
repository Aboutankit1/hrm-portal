const { body } = require('express-validator');

const createEmployeeValidator = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('mobile').notEmpty().withMessage('Mobile number is required'),
];

const validateResult = (req, res, next) => {
  const { validationResult } = require('express-validator');
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    return res.json({ success: false, errors: errors.array() });
  }
  next();
};

module.exports = { createEmployeeValidator, validateResult };
