const { body } = require('express-validator');

const validateName = () => {
    return body('name')
        .notEmpty()
            .withMessage('Name is a required field')
        .matches(/^[a-zA-Z\s]+$/)
            .withMessage('Name must contain only letters and spaces')
        .isLength({ max: 50 })
            .withMessage('Name must not exceed 50 characters');
};

const validateEmail = () => {
    return body('email')
        .notEmpty()
            .withMessage('Email is a required field')
        .isLength({ max: 254 })
            .withMessage('Email must not exceed 254 characters')
        .isEmail()
            .withMessage('Invalid email format');
};

const validatePassword = () => {
    return body('password')
        .notEmpty()
            .withMessage('Password is required')
        .isLength({ min: 8, max: 20 })
            .withMessage('Password must be minimum 8 and maximum 20 characters')
        .matches(/[a-z]/)
            .withMessage('Password must contain at least one lowercase letter')
        .matches(/[A-Z]/)
            .withMessage('Password must contain at least one uppercase letter')
        .matches(/\d/)
            .withMessage('Password must contain at least one number')
        .matches(/[ !"#$%&'()*+,-./:;<=>?@[\\\]^_`{|}~]/)
            .withMessage('Password must contain at least one special character');
};

const validateOtp = () => {
    return body('otp')
        .notEmpty()
        .withMessage('OTP is required')
        .isLength({ min: 6, max: 6 })
        .withMessage('OTP must be exactly 6 digits')
        .matches(/^\d{6}$/)
        .withMessage('OTP must contain only numeric characters');
};

const validateUsername = () => {
    return body('username')
        .notEmpty()
        .withMessage('Username is a required field')
        .isLength({ min: 3 })
        .withMessage('Username must be at least 3 character long')
        .isLength({ max: 20 })
        .withMessage('Username must not exceed 20 characters')
        .matches(/^(?=[a-zA-Z0-9])(?=.*[a-zA-Z0-9]$)[a-zA-Z0-9-_]*$/)
        .withMessage('Username can only contain letters, numbers, hyphens (-), and underscores (_), and must not start or end with a hyphen or underscore');
};

module.exports = {
    validateName,
    validateUsername,
    validateEmail,
    validatePassword,
    validateOtp
};
