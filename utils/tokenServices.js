const jwt = require('jsonwebtoken')

const { setResponseBody } = require('../utils/responseFormatter')

const generateToken = (user) =>{
    return jwt.sign({ id: user._id }, process.env.ACCESS_TOKEN, { expiresIn: '30d' })
}

const setTokenCookie = (response, token) => {
    const options = {
        httpOnly: true,
        secure: true,
        sameSite: 'None'
    }
    response.cookie('SessionID', token, options)
}

const clearTokenCookie = (response) => {

    response.clearCookie('SessionID',{
        httpOnly: true,
            secure: true,
            sameSite: 'None',
            path: '/'
    })
}

module.exports = { 
    generateToken, 
    setTokenCookie,
    clearTokenCookie
}
