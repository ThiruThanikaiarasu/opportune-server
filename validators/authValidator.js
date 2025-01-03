const { body }  = require('express-validator')

const validateUserSignupInputValues = 
     [
    body('name')
        .notEmpty()
            .withMessage('Name is a required field')
        .matches(/^[a-zA-Z\s]+$/)
            .withMessage('Name must contain only letters and spaces of upto ')
        .isLength({ max: 50 })
            .withMessage('Name must not exceed 50 characters'),
    

    body('email')
        .notEmpty()
            .withMessage('Email is a required field')
        .isEmail()
            .withMessage('Invalid email format')
        .isLength({ max: 254 })
            .withMessage('Email must not exceed 254 characters'),

    body('password')
        .notEmpty()
            .withMessage('Password is required')
        .isLength({ min: 8, max: 20 })
            .withMessage('Password must be minimum 8 and maximum  20 characters')
        .matches(/[a-z]/)
            .withMessage('Password must contain at least one lowercase letter')
        .matches(/[A-Z]/)
            .withMessage('Password must contain at least one uppercase letter')
        .matches(/\d/)
            .withMessage('Password must contain at least one number')
        .matches(/[@$!%*?&]/)
            .withMessage('Password must contain at least one special character')
    ]

module.exports = {
    validateUserSignupInputValues
}