const { body } = require('express-validator');

const registerValidator = [
    body('name').trim().notEmpty().withMessage('Full name is required'),
    body('email').isEmail().withMessage('Valid email address is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    body('role').optional().isIn(['INDUSTRY', 'OFFICER', 'ADMIN']).withMessage('Invalid role specified')
];

const loginValidator = [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required')
];

const companyProfileValidator = [
    body('name').trim().notEmpty().withMessage('Company name is required'),
    body('industry').trim().notEmpty().withMessage('Industry is required'),
    body('sector').trim().notEmpty().withMessage('Sector is required'),
    body('state').trim().notEmpty().withMessage('State is required'),
    body('district').trim().notEmpty().withMessage('District is required')
];

module.exports = {
    registerValidator,
    loginValidator,
    companyProfileValidator
};
