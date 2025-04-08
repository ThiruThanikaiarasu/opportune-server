const express = require('express')
const router = express.Router()

const { authenticateWithGoogle, reauthenticateWithGoogle} = require('../middleware/oauthMiddleware')
const { googleAuthCallback } = require('../controllers/googleAuthController')

/**
 * @swagger
 * /auth/google/login:
 *   get:
 *     tags:
 *       - "Google Authentication"
 *     summary: "Login with Google"
 *     description: "Initiates the Google OAuth login flow."
 *     responses:
 *       200:
 *         description: "Redirects to Google login page"
 *       400:
 *         description: "Bad Request"
 */


router.get('/login',authenticateWithGoogle)

/**
 * @swagger
 * /auth/google/callback:
 *   get:
 *     tags:
 *       - "Google Authentication"
 *     summary: "Google OAuth Callback"
 *     description: "Handles the Google OAuth callback and retrieves user information."
 *     parameters:
 *       - in: query
 *         name: code
 *         required: true
 *         description: "Google OAuth code"
 *     responses:
 *       200:
 *         description: "Successfully authenticated, user data retrieved"
 *       400:
 *         description: "Bad Request"
 *       500:
 *         description: "Authentication failed"
 */

router.get('/callback',authenticateWithGoogle,googleAuthCallback)

/**
 * @swagger
 * /auth/google/reauth:
 *   get:
 *     tags:
 *       - "OAuth Authentication"
 *     summary: "Reauthenticate with Google"
 *     description: "Reauthenticates the user with Google and refreshes the authentication session."
 *     responses:
 *       200:
 *         description: "Successfully reauthenticated"
 *       401:
 *         description: "Unauthorized, authentication required"
 *       500:
 *         description: "Internal server error"
 */

router.get('/reauth', reauthenticateWithGoogle)

module.exports = router