const jwt = require('jsonwebtoken')

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

module.exports = { generateToken, setTokenCookie }
