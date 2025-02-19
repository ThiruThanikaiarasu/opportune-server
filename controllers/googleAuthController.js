const jwt = require('jsonwebtoken')

const { findUserByEmail, createUser } = require('../services/userService')
const { setTokenCookie } = require('../utils/tokenServices')
const { setResponseBody } = require('../utils/responseFormatter')
const { generateUsername } = require('../utils/usernameGenerator')
const googleAuthCallback = async (request, response) => {
    try {
      const { profile, accessToken } = request.user;
  
      const userData = {
        googleId: profile.id,
        name: profile.displayName,
        email: profile.emails[0].value,
      };
      
      const existingUser = await findUserByEmail(userData.email)
      let newUser
      if(!existingUser)
      {
        userData.username = await generateUsername(profile.displayName)
        newUser = await createUser(userData)
      }
      
      newUser = newUser || existingUser
      const token = jwt.sign({ _id: newUser._id , accessToken: accessToken },process.env.ACCESS_TOKEN,{ expiresIn: '30d' })
      setTokenCookie(response,'googleAuthToken', token)

      response.redirect(process.env.POST_AUTH_REDIRECT_URL);
    }
    catch(error)
    {
        return response.status(500).send(setResponseBody(error.message, "server_error", null));
    }
  }
  
  module.exports = { googleAuthCallback }
  