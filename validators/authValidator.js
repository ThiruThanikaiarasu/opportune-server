const { validateEmail, validateUsername, validatePassword, validateOtp, validateName} = require('./commonValidators');

const validateUserSignupInputValues = () => [
    validateName(),
    validateUsername(),
    validateEmail(),
    validatePassword()
];

const validateResendOtpRequest = () => [
    validateEmail()
];

const validateVerifyOtpRequest = () => [
    validateEmail(),
    validateOtp()
];

const validateUserLoginInput = () => [
    validateEmail(),
    validatePassword()
]
module.exports = {
    validateUserSignupInputValues,
    validateResendOtpRequest,
    validateVerifyOtpRequest,
    validateUserLoginInput
};
