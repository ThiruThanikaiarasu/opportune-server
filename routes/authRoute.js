const express = require('express')
const router = express.Router()

const { validateUserSignupInputValues, validateVerifyOtpRequest, validateResendOtpRequest, validateUserLoginInput
 } = require('../validators/authValidator')
const { signup, sendVerificationCode, verifyOtp, login, logout, sendForgotPasswordOtp } = require('../controllers/authController')


/**
 * @swagger
 * /auth/signup:
 *   post:
 *     tags:
 *       - User Authentication
 *     summary: Create a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - username
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               username:
 *                 type: string
 *                 example: John_Doe
 *               email:
 *                 type: string
 *                 example: johndoe@gmail.com
 *               password:
 *                 type: string
 *                 example: Johndoe123@
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Input validation error
 *       409:
 *         description: Conflict, User already exists
 */

router.post('/signup', validateUserSignupInputValues(), signup)

/**
 * @swagger
 * /auth/resendOtp:
 *   post:
 *     tags:
 *       - User Authentication
 *     summary: Resend OTP for email verification
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 example: johndoe@gmail.com
 *     responses:
 *       201:
 *         description: OTP sent successfully
 *       401:
 *         description: Session expires Signup Again
 *       409:
 *         description: Conflict, User already exists
 *       429:
 *         description: Too many attempts
 *       500:
 *         description: Internal server error
 */

router.post('/resendOtp', validateResendOtpRequest(), sendVerificationCode)

/**
 * @swagger
 * /auth/forgetPassword:
 *   post:
 *     tags:
 *       - User Authentication
 *     summary: Resend OTP for email verification
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 example: johndoe@gmail.com
 *     responses:
 *       201:
 *         description: OTP sent successfully
 *       400:
 *         description: Invalid Operation
 *       401:
 *         description: Session expires Signup Again
 *       409:
 *         description: Conflict, User already exists
 *       429:
 *         description: Too many attempts
 *       500:
 *         description: Internal server error
 */

router.post('/forgetPassword', validateResendOtpRequest(), sendForgotPasswordOtp)
/**
 * @swagger
 * /auth/verifyOtp:
 *   post:
 *     tags:
 *       - User Authentication
 *     summary: Verify OTP for email authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - otp
 *             properties:
 *               email:
 *                 type: string
 *                 example: johndoe@gmail.com
 *               otp:
 *                 type: string
 *                 example: 123456
 *     responses:
 *       200:
 *         description: Verification successful
 *       401:
 *         description: Incorrect OTP
 *       410:
 *         description: OTP expired
 *       500:
 *         description: Internal server error
 */

router.post('/verifyOtp', validateVerifyOtpRequest(), verifyOtp)

/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags:
 *       - User Authentication
 *     summary: User login for authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: johndoe@gmail.com
 *               password:
 *                 type: string
 *                 example: Password!123
 *     responses:
 *       200:
 *         description: Logged in successfully
 *       400:
 *         description: Bad Request (Validation error)
 *       401:
 *         description: Unauthorized (Invalid email or password)
 *       500:
 *         description: Internal server error
 */

router.post('/login', validateUserLoginInput(), login)

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     tags:
 *       - User Authentication
 *     summary: Logout the user and clear session cookies
 *     responses:
 *       201:
 *         description: User has been logged out successfully
 *       204:
 *         description: No active session found
 *       400:
 *         description: Invalid operation, no token found
 *       500:
 *         description: Internal server error
 */

router.post('/logout',logout)

module.exports = router