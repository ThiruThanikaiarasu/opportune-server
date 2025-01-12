const axios = require('axios')
const jwt = require('jsonwebtoken');

const { createUser, findUserByEmail} = require('../services/userService')
const { setTokenCookie } = require('../utils/tokenServices')
const { setResponseBody } = require('../utils/responseFormatter')

const handleGitHubCallback = async (request, response) => {
    const { profile, accessToken } = request.user;
    try {

        const primaryEmail = profile.emails[0]?.value || 'No primary email found'; 

        const userData = {
            name: profile._json.name || profile._json.login,  
            username: profile._json.login,
            email: primaryEmail,
            githubId: profile._json.id
        }

        const existingUser = await findUserByEmail(primaryEmail)
        let newUser
        if(!existingUser)
        {
            newUser = await createUser(userData)
        }
        
        newUser = newUser || existingUser
        const token = jwt.sign({ _id: newUser._id , accessToken: accessToken },process.env.ACCESS_TOKEN,{ expiresIn: '30d' })
        setTokenCookie(response,'githubAuthToken', token)

        response.redirect(process.env.POST_AUTH_REDIRECT_URL);
    }
    catch(error)
    {
        return response.status(500).send(setResponseBody(error.message, "server_error", null));
    }
}

module.exports = { handleGitHubCallback };