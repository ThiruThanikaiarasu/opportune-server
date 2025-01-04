const jwt = require('jsonwebtoken')

const generateToken = (user) =>{
    return jwt.sign({ email: user.email }, process.env.ACCESS_TOKEN, { expiresIn: '1d' })
}

const setTokenCookie = (response, token) => {
    const options = {
        httpOnly: true,
        secure: true,
        sameSite: 'None'
    }
    response.cookie('SessionID', token, options)
}

module.exports = { generateToken, setTokenCookie }
