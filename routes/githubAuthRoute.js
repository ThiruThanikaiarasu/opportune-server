const express = require("express");
const router = express.Router();
const passport = require('passport')

const { handleGitHubCallback, logoutUser } = require("../controllers/githubAuthController");
const { authenticateWithGitHub } = require('../middleware/githubAuthMiddleware')

/**
 * @swagger
 * /auth/github/login:
 *   get:
 *     tags:
 *       - "GitHub Authentication"
 *     summary: "Login with GitHub"
 *     description: "Initiates the GitHub OAuth login flow."
 *     responses:
 *       200:
 *         description: "Redirects to GitHub login page"
 *       400:
 *         description: "Bad Request"
 */

router.get("/login", authenticateWithGitHub);

/**
 * @swagger
 * /auth/github/callback:
 *   get:
 *     tags:
 *       - "GitHub Authentication"
 *     summary: "GitHub OAuth Callback"
 *     description: "Handles the GitHub OAuth callback and retrieves user information."
 *     parameters:
 *       - in: query
 *         name: code
 *         required: true
 *         description: "GitHub OAuth code"
 *     responses:
 *       200:
 *         description: "Successfully authenticated, user data retrieved"
 *       400:
 *         description: "Bad Request"
 *       500:
 *         description: "Authentication failed"
 */

router.get("/callback", authenticateWithGitHub, handleGitHubCallback);

/**
 * @swagger
 * /auth/github/logout:
 *   get:
 *     tags:
 *       - "GitHub Authentication"
 *     summary: "Logout User"
 *     description: "Logs the user out by clearing the session."
 *     responses:
 *       200:
 *         description: "User logged out successfully"
 *       500:
 *         description: "Logout failed"
 */

router.post("/logout", logoutUser);

module.exports = router;