const { generateOtp , createOtp, findAuthUserByEmail } = require('../services/authService')
const { findUserByEmail, createUser } = require('../services/userService')
const { setResponseBody } = require('../utils/responseFormatter')
const { validationResult } = require('express-validator')
const { generateToken, setTokenCookie } = require('../utils/tokenServices')
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

module.exports = {
    signup,
    sendVerificationCode,
    verifyOtp
}