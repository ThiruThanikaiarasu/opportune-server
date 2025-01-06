const bcrypt = require('bcrypt')

const { generateOtp , createOtp, findAuthUserByEmail } = require('../services/authService')
const { findUserByEmail, createUser } = require('../services/userService')
const { setResponseBody } = require('../utils/responseFormatter')
const { validationResult } = require('express-validator')
const { generateToken, setTokenCookie, clearTokenCookie } = require('../utils/tokenServices')
const { sendOtpThroughMail } = require('../services/emailService')
const OtpError = require('../errors/OtpError')
const EmailError = require('../errors/EmailError')

const signup = async(request,response) =>
{
    const {name, username, email, password } =  request.body
    try
    {
        const errors = validationResult(request)

        if(!errors.isEmpty()) {
            return response.status(400).send(setResponseBody(errors.array()[0].msg,"validation_error",null))
        }

        const existingUser = await findUserByEmail(email)
        if(existingUser) 
        {
            return response.status(409).send(setResponseBody("User already exist","existing_user",null))
        }

        const existingAuthUser = await findAuthUserByEmail(email)
        if(existingAuthUser)
        {
            return response.status(409).send(setResponseBody("OTP Already Sent", "existing_user", null));
        }
        const otp = await createOtp(name, username, email, password) 
        await sendOtpThroughMail(email, otp) 

        response.status(201).send(setResponseBody("OTP sent successfully", null, null))
    }
    catch(error)
    {
        if (error instanceof EmailError) {
            return response.status(error.statusCode).send(setResponseBody(error.message, "email_error", null)) 
        } 
        response.status(500).send(setResponseBody(error.message, "server_error", null))
    }
}

const sendVerificationCode = async(request, response) =>{
    const { email } = request.body
    try
    {
        const errors = validationResult(request)

        if(!errors.isEmpty()) {
            return response.status(400).send(setResponseBody(errors.array()[0].msg,"validation_error",null))
        }

        const existingUser = await findUserByEmail(email)
        if(existingUser) 
        {
            return response.status(409).send(setResponseBody("User already exist","existing_user",null))
        }

        const otp = await generateOtp(email)
        await sendOtpThroughMail(email, otp)

        response.status(201).send(setResponseBody("OTP sent successfully", null, null))
    }
    catch(error)
    {
        if (error instanceof OtpError) {
            return response.status(error.statusCode).send(setResponseBody(error.message, "otp_error", null)) 
        } 
        if (error instanceof EmailError) {
            return response.status(error.statusCode).send(setResponseBody(error.message, "email_error", null)) 
        } 
        response.status(500).send(setResponseBody(error.message, "server_error", null))
    }
}

const verifyOtp = async(request,response) => {
    const { email, otp } = request.body

    try
    {
        const errors = validationResult(request)

        if(!errors.isEmpty()) {
            return response.status(400).send(setResponseBody(errors.array()[0].msg,"validation_error",null))
        }

        const otpData = await findAuthUserByEmail(email)

        if(!otpData) {
            return response.status(410).send(setResponseBody("OTP expired. Request new one.", "otp_expired", null))
        }

        if(otpData.otp.toString() !== otp.toString()) {
            return response.status(401).send(setResponseBody("Incorrect OTP", "verification_failed", null))
        }

        const {name, username, password } = await findAuthUserByEmail(email)
        const newUser = await createUser(name, username, email, password)

        const token = generateToken(newUser)
        setTokenCookie(response, token)
        
        response.status(200).send(setResponseBody("Verification successful", null, null))
    }
    catch(error)
    {
        response.status(500).send(setResponseBody(error.message, "server_error", null))
    }
}

const login = async(request, response) => {
    const { email, password } = request.body
    
    try {
        const errors = validationResult(request)

        if(!errors.isEmpty()) {
            return response.status(400).send(setResponseBody(errors.array()[0].msg,"validation_error",null))
        }

        const existingUser = await findUserByEmail(email)
        if(!existingUser) {
            return response.status(401).send(setResponseBody("Invalid email address", "invalid_email", null))
        }

        const validatePassword = await bcrypt.compare(password, existingUser.password)
        if(!validatePassword) {
            return response.status(401).send(setResponseBody("Invalid password", "invalid_password", null))
        }

        const token = generateToken(existingUser)
        setTokenCookie(response, token)

        let responseData = {
            username : existingUser.username, 
            email: existingUser.email
        }

        response.status(200).send(setResponseBody("Logged in Successfully", null, responseData))
    }
    catch(error){
        return response.status(500).send(setResponseBody(error.message, "server_error", null))
    }
}

const logout = async(request, response) =>{
    try{
        const userCookie = request.cookies
        if(Object.keys(userCookie).length != 0)
        {
            if(userCookie.SessionID)
            {
                clearTokenCookie(response)
                return response.status(201).send(setResponseBody("User has been Logout", null, null))
            }
            return response.status(400).send(setResponseBody("Invalid operation: No token found", null, null));
        }
        return response.status(204).send(setResponseBody("No active session found", null, null));
    }
    catch(error)
    {
        return response.status(500).send(setResponseBody(error.message, "server_error", null))
    }
}
module.exports = {
    signup,
    sendVerificationCode,
    verifyOtp,
    login,
    logout
}