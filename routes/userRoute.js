const express = require('express')
const router = express.Router()

const { checkUsernameAvailability } = require('../controllers/userController')
const { validateCheckUsernameInput } = require('../validators/userValidator')

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

module.exports = router