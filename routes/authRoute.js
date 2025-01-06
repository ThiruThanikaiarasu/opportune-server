const express = require('express')
const router = express.Router()

const { validateUserSignupInputValues, validateVerifyOtpRequest, validateResendOtpRequest } = require('../validators/authValidator')
const { signup, sendVerificationCode, verifyOtp } = require('../controllers/authController')


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
 *       409:
 *         description: Conflict, User already exists
 *       500:
 *         description: Internal server error
 */

router.post('/resendOtp', validateResendOtpRequest(), sendVerificationCode)

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

module.exports = router