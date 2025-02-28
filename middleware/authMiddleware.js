const jwt = require('jsonwebtoken')
const axios = require('axios')

const { setResponseBody } = require('../utils/responseFormatter')
const userModel = require('../models/userModel')
const { findUserById } = require('../services/authService')
const { refreshAccessToken, verifyGoogleAccessToken } = require('../utils/googleTokenServices')
const { findOAuthTokenById } = require('../services/oauthTokenService')

const parseCookies = (cookieString) => {

    return cookieString.split(';').reduce((cookies, cookie) => {
        const [key, value] = cookie.split('=').map(item => item.trim())
        cookies[key] = value
        return cookies
    }, {})
}

const optionalVerify = (request, response, next) => {
    const authHeader = request.headers['cookie'];
    if (!authHeader) {
        request.isAuthenticated = false
        return next()
    }

    verifyUser(request, response, next)
}

const verifyUser = async (request, response, next) => {
    try {
        const authHeader = request.headers['cookie'];
        if (!authHeader) {
            return response.status(401).send(setResponseBody("Token not found", "authentication_error", null));
        }

        const cookies = parseCookies(authHeader);
        const sessionId = cookies.SessionID;
        const githubAuthToken = cookies.githubAuthToken; 
        const googleAuthToken = cookies.googleAuthToken

        if (sessionId) {
            
            jwt.verify(sessionId, process.env.ACCESS_TOKEN, async (error, decoded) => {
                if (error) {
                    return response.status(401).send(setResponseBody("Session Expired", "authentication_error", null));
                }

                const { id } = decoded;
                const user = await findUserById(id);  
                request.user = {
                    _id: user._id,
                    email: user.email
                };

                request.isAuthenticated = true
                return next();  
            });
        }
        else if (githubAuthToken) {
            
            jwt.verify(githubAuthToken, process.env.ACCESS_TOKEN, async (error, decoded) => {
                if (error) {
                    return response.status(401).send(setResponseBody("GitHub token expired or invalid", "authentication_error", null));
                }

                const { _id, accessToken } = decoded;  
                try {
                    const githubResponse = await axios.get('https://api.github.com/user', {
                        headers: {
                            Authorization: `Bearer ${accessToken}`  
                        }
                    });
                    if (githubResponse.status === 200) {
                        const githubUser = githubResponse.data;
                        request.user = {
                            _id: _id,
                            githubId: githubUser.id,
                            username: githubUser.login,
                            email: githubUser.email
                        };

                        request.isAuthenticated = true
                        return next();  
                    } else {
                        return response.status(401).send(setResponseBody("GitHub authentication failed", "authentication_error", null));
                    }
                } catch (error) {
                    return response.status(401).send(setResponseBody("GitHub authentication error", "authentication_error", null));
                }
            });
        }
        else if (googleAuthToken) {
            jwt.verify(googleAuthToken, process.env.ACCESS_TOKEN, async (error, decoded) => {
                if (error) {
                    return response.status(401).send(setResponseBody("Google token expired or invalid", "authentication_error", null));
                }
        
                const { _id, accessToken } = decoded;
                try {
                    const user = await findUserById(_id);
                    const existingOauthUser = await findOAuthTokenById(_id, "google");
        
                    if (!user || !existingOauthUser) {
                        return response.status(401).send(setResponseBody("Unauthorized User", "authentication_error", null));
                    }
        
                    let newAccessToken = await verifyGoogleAccessToken(accessToken+"ABC", existingOauthUser.refreshToken, _id, response, request);

                    if (!newAccessToken || !request.user) {
                        return;  
                    }
        
                    request.isAuthenticated = true;
                    return next();
                } catch (error) {
                    console.error("Google authentication error:", error);
                    
                    if (!response.headersSent) {
                        return response.status(500).send(setResponseBody("Internal server error", "server_error", null));
                    }
                }
            });
        }        
        else {
            return response.status(401).send(setResponseBody("No valid authentication token found", "authentication_error", null));
        }
    } catch (error) {
        response.status(500).send(setResponseBody(error.message, "server_error", null));
    }
};




module.exports = {
    optionalVerify,
    verifyUser
}