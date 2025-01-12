const express = require("express");
const router = express.Router();

const { handleGitHubCallback } = require("../controllers/githubAuthController");
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

module.exports = router;