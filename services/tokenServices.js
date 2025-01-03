const jwt = require('jsonwebtoken')

const { ACCESS_TOkEN } = require("../configurations/config")

const generateToken = (user) =>{
    return jwt.sign({ email: user.email }, ACCESS_TOkEN, { expiresIn: '1d' })
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
