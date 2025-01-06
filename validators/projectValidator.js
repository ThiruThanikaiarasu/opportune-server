const { body } = require("express-validator");

const validateProjectInputValues = [
    body('title')
        .notEmpty()
        .withMessage('Title is a required field')
        .isLength({ min: 3, max: 100 })
        .withMessage('Title must be between 3 and 100 characters')
        .matches(/^[a-zA-Z0-9_ ]+$/)
        .withMessage('Title can only contain letters, numbers, underscores, and spaces'),

    body('description')
        .notEmpty()
        .withMessage('Description is a required field')
        .isLength({ min: 10, max: 500 })
        .withMessage('Description must be between 10 and 500 characters'),

        body('tags')
        .isArray({ min: 1, max: 3 }).withMessage('Tags must be an array with at least one and at most three items')
        .custom((tags) => tags.every(tag => typeof tag === 'string'))
        .withMessage('Each tag must be a string'),

    body('githubLink')
        .notEmpty()
        .withMessage('GitHub link is a required field')
        .isURL()
        .withMessage('GitHub link must be a valid URL')
        .matches(/^https?:\/\/github\.com\/[a-zA-Z0-9\-]+(\/[a-zA-Z0-9\-]+)*$/)
        .withMessage('GitHub link must be a valid GitHub repository URL'),

    body('hostedLink')
        .optional()
        .isURL({
            require_protocol: true, 
            require_valid_protocol: true, 
            protocols: ['http', 'https'], 
            allow_underscores: true, 
            allow_trailing_dot: false, 
            allow_protocol_relative_urls: false, 
        })
        .withMessage('Hosted link must be a valid URL'),

    body('documentation')
        .optional()
        .isURL({
            require_protocol: true, 
            require_valid_protocol: true, 
            protocols: ['http', 'https'], 
            allow_underscores: true, 
            allow_trailing_dot: false, 
            allow_protocol_relative_urls: false, 
        })
        .withMessage('Documentation link must be a valid URL'),
]

module.exports = {
    validateProjectInputValues
}