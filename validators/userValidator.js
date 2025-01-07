const { validateUsername } = require('../validators/commonValidators')

const validateCheckUsernameInput = () => [
    validateUsername()
]

module.exports = {
    validateCheckUsernameInput
}