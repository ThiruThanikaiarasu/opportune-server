const axios = require('axios')
const jwt = require('jsonwebtoken');
const passport = require('passport')

const { createUser, findUserByEmail} = require('../services/userService')
const { setTokenCookie, clearTokenCookie } = require('../utils/tokenServices')
const { setResponseBody } = require('../utils/responseFormatter')

const handleGitHubCallback = async (request, response) => {
    const { profile, accessToken } = request.user;
    try {

        const token = jwt.sign({ accessToken },process.env.ACCESS_TOkEN,{ expiresIn: '30d' })
        setTokenCookie(response,'githubAuthToken', token)

        const primaryEmail = profile.emails[0]?.value || 'No primary email found'; 

        const userData = {
            name: profile._json.name || profile._json.login,  
            username: profile._json.login,
            email: primaryEmail,
            githubId: profile._json.id
        }

        const existingUser = await findUserByEmail(primaryEmail)

        if(!existingUser)
        {
            await createUser(userData)
        }

        response.redirect(process.env.POST_AUTH_REDIRECT_URL);
    }
    catch(error)
    {
        console.error("Error during GitHub OAuth:", error);
        response.status(500).json({ message: "Authentication failed" });
    }
}

const logoutUser = (request, response) => {
    try {
        const userCookie = request.cookies;

        if (Object.keys(userCookie).length !== 0) {
            if (userCookie.githubAuthToken) {
                clearTokenCookie(response, 'githubAuthToken');
                return response.status(200).send(setResponseBody("User has been logged out", null, null));
            } else {
                return response.status(400).send(setResponseBody("Invalid operation: No GitHub token found", null, null));
            }
        }

        return response.status(204).send(setResponseBody("No active session found", null, null));
    } catch (error) {
        return response.status(500).send(setResponseBody(error.message, "server_error", null));
    }
};


module.exports = { handleGitHubCallback, logoutUser };