const bcrypt = require('bcrypt')

const userModel = require('../models/userModel')
const userProfileModel = require('../models/userProfileModel')
const { uploadToS3, deleteFromS3 } = require('./s3Service')

const findUserByEmail = (email) => {
    return userModel.findOne({ email }).select('+password')
}

const createUser = async(name, username, email, password) => {

    const user = new userModel({
        name,
        username,
        email,
        password
    })
    
    await user.save()

    return user
}

const findUserNameAlreadyExists = async (username) => {
    return await userModel.exists({ username })
}

const updateUserPassword = async( user, password ) => {
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    user.password = hashedPassword
    await user.save();
    
    return user
}

const updateUserProfileData = async ({_id, email}, profileData, profilePicture) => {
    let userProfile = await userProfileModel.findOne({ author: _id })
    
    if(!userProfile) {
        userProfile = new userProfileModel(
            {
                author: _id,
                ...profileData
            }
        ) 
    } else {
        Object.assign(userProfile, profileData)
    }

    if(profilePicture) {
        if(userProfile.profilePicture && userProfile.profilePicture.s3Key) {
            await deleteFromS3(userProfile.profilePicture.s3Key)
        }

        const thumbnailS3Key = await uploadToS3(profilePicture)

        userProfile.profilePicture = {
            originalname: profilePicture.originalname,
            size: profilePicture.size,
            mimetype: profilePicture.mimetype,
            s3Key: thumbnailS3Key
        }
    }

    await userProfile.save()

    return userProfile
}

module.exports = {
    findUserByEmail,
    createUser,
    findUserNameAlreadyExists,
    updateUserPassword,
    updateUserProfileData
}