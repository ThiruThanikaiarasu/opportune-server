const jwt = require('jsonwebtoken')

const generateToken = (user) =>{
    return jwt.sign({ id: user._id }, process.env.ACCESS_TOKEN, { expiresIn: '30d' })
}

const setTokenCookie = (response, cookieName, token) => {
    const options = {
        httpOnly: true,
        secure: true,
        sameSite: 'None'
    }
    response.cookie(cookieName, token, options)
}

const clearTokenCookie = (response, cookieName) => {

    response.clearCookie(cookieName,{
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
