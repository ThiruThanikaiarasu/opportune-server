const express = require('express')
const router = express.Router()

const { checkUsernameAvailability, updateUserProfile, resetPassword, getUserProfile, getUserInfo, getPortfolioByUsername } = require('../controllers/userController')
const { validateCheckUsernameInput, validateResetPasswordInputs } = require('../validators/userValidator')
const upload = require('../middleware/fileUpload')
const { verifyUser } = require('../middleware/authMiddleware')

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
 *       409:
 *         description: The new password cannot be the same as the old password
 *       500:
 *         description: Internal server error
 */

router.post('/resetPassword', validateResetPasswordInputs(), resetPassword)

/**
 * @swagger
 * /profile:
 *   get:
 *     summary: Retrieve the authenticated user's profile
 *     description: Fetches the profile details of the currently logged-in user.
 *     tags:
 *       - User Profile
 *     security:
 *       - BearerAuth: []
 *   responses:
 *    200:
 *      description: Successfully retrieved home feed projects
 *    401:
 *     description: Unauthorized, invalid or missing token
 *    500:
 *      description: Internal server error
 */

router.get('/profile', verifyUser, getUserProfile)

/**
 * @swagger
 * /user/profile:
 *   get:
 *     summary: Retrieve the authenticated user's profile
 *     description: Fetches the profile details of the currently logged-in user.
 *     tags:
 *       - User Profile
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved user profile
 *       401:
 *         description: Unauthorized, invalid or missing token
 *       500:
 *         description: Internal server error
 */

router.get('/profile', verifyUser, getUserProfile)

/**
 * @swagger
 * /user/profile:
 *  patch:
 *   tags:
 *    - User Profile
 *   summary: Update user profile information
 *   requestBody:
 *    required: true
 *    content:
 *     multipart/form-data:
 *      schema:
 *       type: object
 *       properties:
 *         profilePicture:
 *           type: string
 *           format: binary
 *           description: Upload a new profile picture.
 *         bio:
 *           type: string
 *           description: A short biography about the user.
 *           example: "Passionate web developer with a focus on MERN stack projects."
 *         portfolioLink:
 *           type: string
 *           description: A link to the user's portfolio website.
 *           example: "https://myportfolio.com"
 *         resumeLink:
 *           type: string
 *           description: A link to the user's resume.
 *           example: "https://myresume.com/resume"
 *         resumeFile:
 *           type: string
 *           format: binary
 *           description: Upload your resume.
 *         accounts:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               domain:
 *                 type: string
 *                 description: The domain or platform of the account.
 *                 example: "LeetCode"
 *                 maxLength: 50
 *               url:
 *                 type: string
 *                 description: The URL of the user's account on the specified domain.
 *                 example: "https://leetcode.com/username"
 *         passedOutYear:
 *           type: integer
 *           description: The year the user passed out from their educational institution.
 *           example: 2020
 *           minimum: 1960
 *           maximum: 2040
 *   responses:
 *    200:
 *     description: User profile updated successfully
 *    400:
 *     description: Validation error in input data
 *    401:
 *     description: Unauthorized, user must be logged in
 *    500:
 *     description: Internal server error
 *    503: 
 *     description: 
 */

router.patch('/profile', upload.single('profilePicture'), verifyUser, updateUserProfile)

/**
 * @swagger
 * /user/info:
 *   get:
 *     tags:
 *       - User
 *     summary: Get user information
 *     description: Retrieves user details after verifying authentication.
 *     responses:
 *       200:
 *         description: Successfully retrieved user information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 profilePicture:
 *                   type: string
 *                   format: uri
 *                   description: URL of the user's profile picture
 *                   example: "https://app.s3.ap-south-1.amazonaws.com/sdfgdbvdssdvggegfxcfgdgd"
 *                 username:
 *                   type: string
 *                   description: The username of the user
 *                   example: "jon"
 *                 email:
 *                   type: string
 *                   format: email
 *                   description: The email address of the user
 *                   example: "jon@gmail.com"
 *       401:
 *         description: Unauthorized, user must be logged in
 *       500:
 *         description: Internal server error
 */

router.get('/info',verifyUser, getUserInfo)

/**
 * @swagger
 * /user/portfolio/{username}:
 *   get:
 *     tags:
 *       - User Profile
 *     summary: Get portfolio details by username
 *     description: Fetches the portfolio details of a user based on their username.
 *     parameters:
 *       - name: username
 *         in: path
 *         required: true
 *         description: The username of the portfolio owner.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully retrieved portfolio details
 *       404:
 *         description: Portfolio not found
 *       500:
 *         description: Internal server error
 */

router.get('/portfolio/:username', getPortfolioByUsername)

module.exports = router