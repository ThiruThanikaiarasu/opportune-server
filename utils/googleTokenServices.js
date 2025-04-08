const axios = require('axios')
const jwt = require('jsonwebtoken')

const { setTokenCookie, clearTokenCookie} = require('../utils/tokenServices')
const { updateOAuthToken } = require('../services/oauthTokenService')
const { setResponseBody } = require('../utils/responseFormatter')

const refreshAccessToken = async ( refreshToken ) => {
    try {
        const response = await axios.post("https://oauth2.googleapis.com/token", {
            client_id: process.env.GOOGLE_CLIENT_ID,
            client_secret: process.env.GOOGLE_CLIENT_SECRET,
            refresh_token: refreshToken,
            grant_type: "refresh_token"
        });

        return response.data.access_token; 
    } catch (error) {
        if (error.response) {

            const { status, data } = error.response;
 
            if (status === 400 && data.error === "invalid_grant") {
                throw new Error("Session Expired: Your refresh token is invalid or has expired. Please log in again.");
            }

            if (status === 429) {
                throw new Error("Too Many Requests: You have exceeded the request limit. Please try again later.");
            }

            throw new Error(`OAuth Error: ${data.error_description || "Failed to refresh access token."}`);
        }

        throw new Error("Network Error: Unable to connect to Google's OAuth server. Please check your connection.");
    }
}

const verifyGoogleAccessToken = async (accessToken, refreshToken, userId, response, request) => {
    try {
        const googleResponse = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo", {
            headers: { Authorization: `Bearer ${accessToken}` }
        });

        request.user = { _id: userId, email: googleResponse.data.email };
        return accessToken;
    } 
    catch (error) {
        if (error.response?.status === 401) {
            try {
                if (!refreshToken) {
                    response.status(440).send(setResponseBody("Session Expired", "session_expired", null));
                    return null;  
                }

                const newAccessToken = await refreshAccessToken(refreshToken, userId);

                clearTokenCookie(response, "googleAuthToken");
                const token = jwt.sign({ _id: userId, accessToken: newAccessToken }, process.env.ACCESS_TOKEN, { expiresIn: '30d' });
                setTokenCookie(response, 'googleAuthToken', token);

                return await verifyGoogleAccessToken(newAccessToken, refreshToken, userId, response, request);
            } catch (refreshError) {
                if (refreshError.response?.status === 400) {
                    await updateOAuthToken({ 
                        _id: userId,
                        provider: "google",
                        refreshToken: null 
                    });

                    response.status(440).send(setResponseBody("Session Expired", "session_expired", null));
                    return null; 
                }

                response.status(500).send(setResponseBody("Internal Server Error", "server_error", null));
                return null; 
            }
        }

        response.status(401).send(setResponseBody("Invalid Google Token", "authentication_error", null));
        return null; 
    }
};



module.exports = { refreshAccessToken, verifyGoogleAccessToken }