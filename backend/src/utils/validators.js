const { body, param, query } = require('express-validator');

// User validators
const registerValidator = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ max: 100 })
    .withMessage('Name cannot exceed 100 characters'),
  body('role')
    .optional()
    .isIn(['admin', 'chef_chantier', 'ouvrier'])
    .withMessage('Invalid role')
];

const loginValidator = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// Site validators
const siteValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Site name is required')
    .isLength({ max: 200 })
    .withMessage('Name cannot exceed 200 characters'),
  body('location')
    .trim()
    .notEmpty()
    .withMessage('Location is required'),
  body('status')
    .optional()
    .isIn(['planning', 'in_progress', 'paused', 'completed'])
    .withMessage('Invalid status'),
  body('startDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid start date format'),
  body('endDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid end date format')
];

// Task validators
const taskValidator = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Task title is required')
    .isLength({ max: 200 })
    .withMessage('Title cannot exceed 200 characters'),
  body('description')
    .optional()
    .trim(),
  body('priority')
    .optional()
    .isIn(['low', 'medium', 'high'])
    .withMessage('Invalid priority'),
  body('progress')
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage('Progress must be between 0 and 100'),
  body('siteId')
    .isInt()
    .withMessage('Valid site ID is required'),
  body('workerId')
    .optional()
    .isInt()
    .withMessage('Valid worker ID is required')
];

// Worker validators
const workerValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Worker name is required')
    .isLength({ max: 100 })
    .withMessage('Name cannot exceed 100 characters'),
  body('phone')
    .optional()
    .trim()
    .matches(/^[+]?[\d\s-]+$/)
    .withMessage('Invalid phone number'),
  body('specialty')
    .optional()
    .trim(),
  body('hourlyRate')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Hourly rate must be a positive number'),
  body('siteId')
    .optional()
    .isInt()
    .withMessage('Valid site ID is required')
];

// Attendance validators
const attendanceValidator = [
  body('workerId')
    .isInt()
    .withMessage('Valid worker ID is required'),
  body('date')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format'),
  body('checkIn')
    .optional()
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Invalid check-in time format (HH:MM)'),
  body('checkOut')
    .optional()
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Invalid check-out time format (HH:MM)')
];

// Material validators
const materialValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Material name is required')
    .isLength({ max: 200 })
    .withMessage('Name cannot exceed 200 characters'),
  body('unit')
    .trim()
    .notEmpty()
    .withMessage('Unit is required'),
  body('unitPrice')
    .isFloat({ min: 0 })
    .withMessage('Unit price must be a positive number'),
  body('stockQuantity')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Stock quantity must be a non-negative integer'),
  body('alertThreshold')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Alert threshold must be a non-negative integer')
];

// Material usage validators
const materialUsageValidator = [
  body('materialId')
    .isInt()
    .withMessage('Valid material ID is required'),
  body('siteId')
    .isInt()
    .withMessage('Valid site ID is required'),
  body('quantity')
    .isFloat({ min: 0 })
    .withMessage('Quantity must be a positive number'),
  body('usageDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format')
];

// Expense validators
const expenseValidator = [
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required'),
  body('amount')
    .isFloat({ min: 0 })
    .withMessage('Amount must be a positive number'),
  body('category')
    .isIn(['material', 'labor', 'equipment', 'transport', 'other'])
    .withMessage('Invalid category'),
  body('siteId')
    .isInt()
    .withMessage('Valid site ID is required'),
  body('expenseDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format')
];

// Incident validators
const incidentValidator = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Incident title is required'),
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Description is required'),
  body('severity')
    .isIn(['low', 'medium', 'high', 'critical'])
    .withMessage('Invalid severity level'),
  body('siteId')
    .isInt()
    .withMessage('Valid site ID is required'),
  body('incidentDate')
    .optional()
    .isISO8601()
    .withMessage('Invalid date format')
];

// Budget validators
const budgetValidator = [
  body('plannedAmount')
    .isFloat({ min: 0 })
    .withMessage('Planned amount must be a positive number'),
  body('siteId')
    .isInt()
    .withMessage('Valid site ID is required')
];

// Common validators
const idParamValidator = [
  param('id')
    .isInt()
    .withMessage('Invalid ID parameter')
];

module.exports = {
  registerValidator,
  loginValidator,
  siteValidator,
  taskValidator,
  workerValidator,
  attendanceValidator,
  materialValidator,
  materialUsageValidator,
  expenseValidator,
  incidentValidator,
  budgetValidator,
  idParamValidator
};

