const otpModel = require('../models/otpModel')
const OtpError = require('../errors/OtpError')
const userModel = require('../models/userModel');

const generateOtp = async( email ) =>{
    const existingOtpData = await otpModel.findOne({ email })
    const MAX_ATTEMPT = 3

    if(existingOtpData)
    {
        if(existingOtpData.attempts >= MAX_ATTEMPT)
        {
            throw new OtpError("Too many attempts",429)
        }

        return await updateOtp(existingOtpData)
    }

    throw new OtpError("Session expires Signup Again",401)
}

const createOtp = async( email, name, username, password) => {
    const otp = generateSixDigitOTP()

    const otpData = {
        name: name || null,
        username : username || null,
        email, 
        password : password || null,
        otp,
        attempts: 1
    }

    await otpModel.create(otpData)

    return otp
}

const updateOtp = async(otpData) =>{
    const newotp = generateSixDigitOTP();
    const newExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await otpModel.updateOne(
        { email : otpData.email},
        {
            $set : { 
                otp : newotp,
                attempts : ++otpData.attempts,
                expiresAt: newExpiresAt
            }
        }
    )
    return newotp
}

const generateSixDigitOTP = () => {
    return Math.floor(100000 + Math.random() * 900000);
}

const findAuthUserByEmail = async(email) => {
    return await otpModel.findOne({ email }).select('+password')
}

const findUserById = async (id) => {
    return await userModel.findOne({ _id: id })
}

module.exports = {
    generateOtp,
    createOtp,
    findAuthUserByEmail,
    findUserById
}