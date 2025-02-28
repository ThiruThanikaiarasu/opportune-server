const jwt = require('jsonwebtoken')

const { findUserByEmail, createUser, updateUser } = require('../services/userService')
const { setTokenCookie } = require('../utils/tokenServices')
const { setResponseBody } = require('../utils/responseFormatter')
const { generateUsername } = require('../utils/usernameGenerator')
const { findOAuthTokenById, updateOAuthToken } = require('../services/oauthTokenService')

const googleAuthCallback = async (request, response) => {
    try {
      const { profile, accessToken, refreshToken } = request.user;
  
      const userData = {
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
      const existingOauthUser = await findOAuthTokenById( newUser._id , "google")

      if(!existingOauthUser || !existingOauthUser.refreshToken)
      {
        await updateOAuthToken({
          _id: newUser._id,
          provider: "google",
          providerId: profile.id,
          refreshToken: refreshToken
        })
      }

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
  