const express = require('express')
const router = express.Router()

const { checkUsernameAvailability , resetPassword } = require('../controllers/userController')
const { validateCheckUsernameInput, validateResetPasswordInputs } = require('../validators/userValidator')

/**
 * @swagger
 * /user/checkUsername:
 *   post:
 *     tags:
 *       - User Management
 *     summary: Check if a username is available or already exists
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *             properties:
 *               username:
 *                 type: string
 *                 example: johndoe123
 *                 description: The username to check for availability.
 *     responses:
 *       200:
 *         description: Username availability check successful
 *       400:
 *         description: Bad Request (validation or missing parameters)
 *       409:
 *         description: Username already exists
 *       500:
 *         description: Internal server error
 */

router.post('/checkUsername', validateCheckUsernameInput(), checkUsernameAvailability)

/**
 * @swagger
 * /user/resetPassword:
 *   post:
 *     tags:
 *       - User Management
 *     summary: Reset a user's password
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
 *                 example: johndoe@example.com
 *                 description: The email address of the user.
 *               password:
 *                 type: string
 *                 example: NewPassword123!
 *                 description: The new password to set for the user.
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       400:
 *         description: Bad Request (validation error or invalid operation)
 *       500:
 *         description: Internal server error
 */

router.post('/resetPassword', validateResetPasswordInputs(), resetPassword)

module.exports = router