const bcrypt = require('bcrypt')

const userModel = require('../models/userModel')
const userProfileModel = require('../models/userProfileModel')
const { uploadToS3, deleteFromS3 } = require('./s3Service')
const { S3_BASE_URL } = require('../configurations/constants')

const findUserByEmail = (email) => {
    return userModel.findOne({ email }).select('+password')
}

const createUser = async ({ 
    name, 
    username, 
    email, 
    password = null, 
    githubId = null, 
    googleId = null 
}) => {

    const user = new userModel({
        name,
        username,
        email,
        password,
        githubId,
        googleId
    });

    await user.save();

    return user;
};


const findUserNameAlreadyExists = async (username) => {
    return await userModel.exists({ username })
}

const updateUser = async (user, updates) => {
    if (updates.password) {
        const salt = await bcrypt.genSalt(10); 
        const hashedPassword = await bcrypt.hash(updates.password, salt); 
        user.password = hashedPassword; 
    }

    const { password, ...otherUpdates } = updates;

    Object.assign(user, otherUpdates);

    await user.save(); 
    return user; 
};

const fetchUserProfileData = (userId) => {
    const userProfile = userProfileModel.aggregate(
        [
            {
                $match: { author: userId }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'author',
                    foreignField: '_id',
                    as: 'authorDetails'
                }
            },
            {
                $unwind: '$authorDetails'
            },
            {
                $project: {
                    _id: 0, 
                    __v: 0, 
                    author: 0,
                    'authorDetails.password': 0, 
                    'authorDetails._id': 0, 
                    'authorDetails.__v': 0, 
                    'authorDetails.createdAt': 0, 
                    'authorDetails.updatedAt': 0, 
                }
            }
        ]
    )
    return userProfile
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
        Object.keys(profileData).forEach(key => {
            if (profileData[key] !== undefined) {
                userProfile[key] = profileData[key]
            }
        })
    }

    if(profilePicture) {
        if(userProfile.profilePicture) {
            await deleteFromS3(userProfile.profilePicture)
        }

        const thumbnailS3Key = await uploadToS3(profilePicture)

        userProfile.profilePicture = S3_BASE_URL + thumbnailS3Key
    }

    await userProfile.save()

    return userProfile
}

module.exports = {
    findUserByEmail,
    createUser,
    findUserNameAlreadyExists,
    updateUser,
    fetchUserProfileData,
    updateUserProfileData
}