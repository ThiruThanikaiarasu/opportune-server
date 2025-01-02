const express = require('express')
const router = express.Router()
const { validateUserSignupInputValues } = require('../validators/authValidator')
const { signup } = require('../controllers/authController')

/**
 * @swagger
 * /signup:
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
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 example: johndoe@gmail.com
 *               phone:
 *                 type: object
 *                 properties:
 *                   countryCode:
 *                     type: string
 *                     example: +91
 *                   number:
 *                     type: string
 *                     example: 7785877858
 *                 required:
 *                   - countryCode
 *                   - number
 *               password:
 *                 type: string
 *                 example: Johndoe123@
 *               googleId:
 *                 type: string
 *                 example: google-id-12345
 *               githubId:
 *                 type: string
 *                 example: github-id-67890
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Input validation error
 *       409:
 *         description: Conflict, User already exists
 */

router.post('/signup', validateUserSignupInputValues, signup)

router.post('/login')

module.exports = router