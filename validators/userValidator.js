const { validateUsername, validatePassword, validateEmail } = require('../validators/commonValidators')

const validateCheckUsernameInput = () => [
    validateUsername()
]

const validateResetPasswordInputs = () => [
    validateEmail(),
    validatePassword()
];

module.exports = {
    validateCheckUsernameInput,
    validateResetPasswordInputs
}