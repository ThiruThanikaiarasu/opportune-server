const otpModel = require('../models/otpModel');
const userModel = require('../models/userModel');

const generateOtp = async( email ) =>{
    const existingOtpData = await otpModel.findOne({ email })
    const MAX_ATTEMPT = 3

    if(existingOtpData)
    {
        if(existingOtpData.attempts >= MAX_ATTEMPT)
        {
            const error = new Error("Too many attempts");
            error.status = 429;
            throw error;
        }

        return await updateOtp(existingOtpData)
    }

    const error = new Error("Session expires Signup Again");
    error.status = 401;
    throw error;
}

const createOtp = async(name, username, email, password) => {
    const otp = generateSixDigitOTP()

    const otpData = {
        name,
        username,
        email,
        password,
        otp,
        attempts : 1
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