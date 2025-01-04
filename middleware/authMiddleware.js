const jwt = require('jsonwebtoken')

const { setResponseBody } = require('../utils/responseFormatter')
const userModel = require('../models/userModel')


const parseCookies = (cookieString) => {

    return cookieString.split(';').reduce((cookies, cookie) => {
        const [key, value] = cookie.split('=').map(item => item.trim())
        cookies[key] = value
        return cookies
    }, {})
}

const verifyUser = async (request, response, next) => {
    try {
        const authHeader = request.headers['cookie']
        if(!authHeader) {
            return response.status(401).send(setResponseBody("Token not found", "authentication_error", null))
        }

        const cookies = parseCookies(authHeader)

        const token = cookies.SessionID

        jwt.verify(token, process.env.ACCESS_TOKEN, async (error, decoded) => {
            if(error) {
                return response.status(401).send(setResponseBody("Session Expired", "authentication_error", null))   
            }

            const { id } = decoded

            const user = await userModel.findOne({ _id: id })
            request.user = {
                _id: user._id,
                email: user.email
            }

            next()
        })
    }
    catch(error) {
        response.status(500).send(setResponseBody(error.message, "server_error", null))
    }
}

module.exports = {
    verifyUser
}