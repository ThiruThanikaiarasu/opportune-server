const bcrypt = require('bcryptjs')

const userModel = require('../models/userModel')
const skillsModel = require('../models/skillsModel')
const userProfileModel = require('../models/userProfileModel')
const { uploadToS3, deleteFromS3 } = require('./s3Service')
const { S3_BASE_URL } = require('../configurations/constants')

const findUserByEmail = (email) => {
    return userModel.findOne({ email }).select('+password')
}

const findUserByUsername = (username) => {
    return userModel.findOne({ username })
}

const createUser = async ({ 
    name, 
    username, 
    email, 
    password = null
}) => {

    const user = new userModel({
        name,
        username,
        email,
        password
    })
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
            const s3Key = userProfile.profilePicture.replace(S3_BASE_URL, '')
            await deleteFromS3(s3Key)
        }

        const thumbnailS3Key = await uploadToS3(profilePicture)

        userProfile.profilePicture = S3_BASE_URL + thumbnailS3Key
    }

    await userProfile.save()

    return userProfile
}

const findPortfolioDetails = async (username) => {
    const pipeline = [
        {
            $match: { username: username }
        },
        {
            $lookup: {
                from: "userprofiles",
                localField: "_id",
                foreignField: "author",
                as: "profileArray"
            }
        },
        {
            $lookup: {
                from: "projects",
                localField: "_id",
                foreignField: "author",
                as: "projects"
            }
        },
        {
            $addFields: {
                profileData: { $arrayElemAt: ["$profileArray", 0] }
            }
        },
        {
            $addFields: {
                bio: "$profileData.bio",
                portfolioLink: "$profileData.portfolioLink",
                resumeLink: "$profileData.resumeLink",
                accounts: "$profileData.accounts",
                passedOutYear: "$profileData.passedOutYear",
                profilePicture: "$profileData.profilePicture",
                skills: "$profileData.skills",
                professionalExperience: "$profileData.professionalExperience",
                professionalTitle: "$profileData.professionalTitle",
                totalProjects: { $size: "$projects" },
                totalUpvotes: { 
                    $reduce: {
                        input: "$projects",
                        initialValue: 0,
                        in: { $add: ["$$value", { $ifNull: ["$$this.upvoteCount", 0] }] }
                    }
                }
            }
        },
        {
            $project: {
                profileArray: 0,
                profileData: 0,
                __v: 0,
                _id: 0,
                password: 0,
                createdAt: 0,
                updatedAt: 0
            }
        },
    ]

    const results = await userModel.aggregate(pipeline)
    return results.length > 0 ? results[0] : null
}

const searchSkillsByKeyword = async (keyword) => {
    if (!keyword.trim()) {
        return fetchAllSkills()
    }

    const skills = await skillsModel.find({
        name: { $regex: `^${keyword}`, $options: 'i' }
    })

    
    return skills
}

const fetchAllSkills = () => {
    return skillsModel.find().limit() 
}

module.exports = {
    findUserByEmail,
    findUserByUsername,
    createUser,
    findUserNameAlreadyExists,
    updateUser,
    fetchUserProfileData,
    updateUserProfileData,
    findPortfolioDetails,
    searchSkillsByKeyword
}