const { S3_BASE_URL } = require('../configurations/constants')
const UploadError = require('../errors/UploadError')
const projectModel = require('../models/projectModel')
const projectTagModel = require('../models/projectTagModel')
const upvoteModel = require('../models/upvoteModel')
const { uploadToS3, deleteFromS3 } = require('./s3Service')


const doesAuthorHaveProjectWithTitle = async (author, title) => {
    const slug = createSlug(title)
    return await projectModel.exists({ author, slug })
}

const createSlug = (title) => {
    return title
        .toLowerCase()
        .trim()                  
        .replace(/\s+/g, '-')
}

const createNewProject = async (author, title, description, problemStatement, problemSolution, tags, githubLink, hostedLink, documentation, thumbnail) => {
    try {
        const thumbnailS3Key = await uploadToS3(thumbnail)
        const thumbnailURL = S3_BASE_URL + thumbnailS3Key

        const slug = createSlug(title)
        
        const newProjectData = {
            author,
            title,
            slug,
            description, 
            problemStatement, 
            problemSolution,
            tags,
            githubLink,
            thumbnail: {
                originalname: thumbnail.originalname,
                size: thumbnail.size,
                mimetype: thumbnail.mimetype,
                s3Url: thumbnailURL
            },
            hostedLink: hostedLink || null, 
            documentation: documentation || null
        }
    
        const project = new projectModel(newProjectData)
        
        await project.save()
    
        return project
    }
    catch(error) {
        if(error instanceof UploadError) {
            throw error
        }

        throw error
    }
}

const updateProjectData = async (project, newProjectData, thumbnail) => {
    Object.keys(newProjectData).forEach(key => {
        if (newProjectData[key] !== undefined) {
            project[key] = newProjectData[key]
        }
    })

    if (thumbnail) {
        if (project.thumbnail && project.thumbnail.s3Url) {
            const s3Key = project.thumbnail.s3Url.replace(S3_BASE_URL, '')
            await deleteFromS3(s3Key)
        }

        const thumbnailS3Key = await uploadToS3(thumbnail)

        project.thumbnail.originalname = thumbnail.originalname
        project.thumbnail.size = thumbnail.size
        project.thumbnail.mimetype = thumbnail.mimetype
        project.thumbnail.s3Url = S3_BASE_URL + thumbnailS3Key
    }

    await project.save()
    
    return project
}

const getHomeFeedProjects = async (limit, page, userId = null, search = '', tag = '') => {
    const skip = (page - 1) * limit

    const pipeline = []

    if (search || tag) {
        const matchConditions = []

        if (search) {
            matchConditions.push({
                $or: [
                    { title: { $regex: search, $options: 'i' } },
                    { description: { $regex: search, $options: 'i' } }
                ]
            })
        }

        if (tag) {
            matchConditions.push({
                $expr: {
                    $in: [tag.toLowerCase(), { $map: { input: '$tags', as: 't', in: { $toLower: '$$t' } } }]
                }
            })
        }
        
        pipeline.push({
            $match: {
                $and: matchConditions
            }
        })        
    }

    pipeline.push(
        {
            $addFields: {
                thumbnailUrl: {
                    $cond: {
                        if: { $ifNull: ["$thumbnail.s3Url", false] },
                        then: "$thumbnail.s3Url",
                        else: null
                    }
                },
                isUpvotedByUser: false
            }
        },
        {
            $lookup: {
                from: 'users',
                localField: 'author',
                foreignField: '_id',
                as: 'authorDetails'
            }
        },
        { $unwind: '$authorDetails' },
        {
            $lookup: {
                from: 'userprofiles',
                localField: 'author',
                foreignField: 'author',
                as: 'authorProfile'
            }
        },
        {
            $unwind: {
                path: '$authorProfile',
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $addFields: {
                'authorDetails.profilePicture': {
                    $cond: {
                        if: { $ifNull: ['$authorProfile.profilePicture', false] },
                        then: '$authorProfile.profilePicture',
                        else: null
                    }
                }
            }
        }
    )

    if (userId) {
        pipeline.push(
            {
                $lookup: {
                    from: 'upvotes',
                    let: { projectSlug: '$slug' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ['$upvoteFor', '$$projectSlug'] },
                                        { $eq: ['$upvoteBy', userId] }
                                    ]
                                }
                            }
                        }
                    ],
                    as: 'userUpvotes'
                }
            },
            {
                $addFields: {
                    isUpvotedByUser: {
                        $cond: {
                            if: { $gt: [{ $size: '$userUpvotes' }, 0] },
                            then: true,
                            else: false
                        }
                    }
                }
            },
            {
                $project: {
                    userUpvotes: 0
                }
            }
        )
    }

    pipeline.push(
        { $sort: { upvoteCount: -1, createdAt: -1 } },
        { $skip: skip },
        { $limit: limit + 1 },
        {
            $project: {
                __v: 0,
                thumbnail: 0,
                _id: 0,
                'authorDetails.__v': 0,
                'authorDetails._id': 0,
                'authorDetails.password': 0,
                'authorDetails.createdAt': 0,
                'authorDetails.updatedAt': 0,
                authorProfile: 0
            }
        }
    )

    const projects = await projectModel.aggregate(pipeline)
    const hasNextPage = projects.length > limit

    return {
        projects: hasNextPage ? projects.slice(0, limit) : projects,
        hasNextPage
    }
}


const searchAllTags = () => {
    return projectTagModel.find()
}

const findProjectByAuthorAndSlug = async (username, slug) => {
    const project = await projectModel.aggregate([
        {
            $match: { slug }
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
            $match: {
                'authorDetails.username': username
            }
        },
        {
            $addFields: {
                thumbnailUrl: {
                    $cond: {
                        if: { $ifNull: ['$thumbnail.s3Url', false] },
                        then: '$thumbnail.s3Url',
                        else: null
                    }
                }
            }
        },
        {
            $lookup: {
                from: 'userprofiles',
                localField: 'author',
                foreignField: 'author',
                as: 'authorProfile'
            }
        },
        {
            $unwind: {
                path: '$authorProfile',
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $addFields: {
                'authorDetails.profilePicture': {
                    $cond: {
                        if: { $ifNull: ['$authorProfile.profilePicture', false] },
                        then: '$authorProfile.profilePicture',
                        else: null
                    }
                }
            }
        },
        {
            $project: {
                __v: 0,
                thumbnail: 0,
                _id: 0,
                author: 0,
                'authorDetails.__v': 0,
                'authorDetails._id': 0,
                'authorDetails.password': 0,
                'authorDetails.createdAt': 0,
                'authorDetails.updatedAt': 0,
                authorProfile: 0
            }
        }
    ])

    return project.length > 0 ? project[0] : null
}

const getPopularProjectsByAuthor = async (username, slug, limit, page) => {
    const skip = (page - 1) * limit

    const projects = await projectModel.aggregate([
        {
            $addFields: {
                thumbnailUrl: {
                    $cond: {
                        if: { $ifNull: ["$thumbnail.s3Url", false] },
                        then: "$thumbnail.s3Url",
                        else: null
                    }
                }
            }
        },
        {
            $match: {
                slug: { $ne: slug }
            }
        },
        {
            $lookup: {
                from: 'users',
                localField: 'author',
                foreignField: '_id',
                as: 'authorDetails'
            }
        },
        { $unwind: '$authorDetails' },
        {
            $match: {
                'authorDetails.username': username
            }
        },
        {
            $lookup: {
                from: 'userprofiles',
                localField: 'author',
                foreignField: 'author',
                as: 'authorProfile'
            }
        },
        {
            $unwind: {
                path: '$authorProfile',
                preserveNullAndEmptyArrays: true
            }
        },
        {
            $addFields: {
                'authorDetails.profilePicture': {
                    $cond: {
                        if: { $ifNull: ['$authorProfile.profilePicture', false] },
                        then: '$authorProfile.profilePicture',
                        else: null
                    }
                }
            }
        },
        {
            $sort: {
                upvoteCount: -1,
                viewsCount: -1,
                createdAt: -1
            }
        },
        {
            $facet: {
                metadata: [{ $count: 'total' }],
                data: [
                    { $skip: skip },
                    { $limit: limit },
                    {
                        $project: {
                            __v: 0,
                            thumbnail: 0,
                            _id: 0,
                            author: 0,
                            'authorDetails.__v': 0,
                            'authorDetails._id': 0,
                            'authorDetails.password': 0,
                            'authorDetails.createdAt': 0,
                            'authorDetails.updatedAt': 0,
                            authorProfile: 0
                        }
                    }
                ]
            }
        },
        {
            $project: {
                total: { $arrayElemAt: ['$metadata.total', 0] },
                projects: '$data'
            }
        }
    ])

    return projects
}

const findProjectBySlug = (slug) => {
    return projectModel.findOne({ slug })
}

const createVote = async (projectSlug, userId, session) => {
    const project = await findProjectBySlug(projectSlug)
    if (!project) {
        throw new Error('Project not found')
    }

    const newVote = new upvoteModel({
        upvoteBy: userId,
        upvoteFor: projectSlug
    })

    await newVote.save({ session })

}

const updateProjectVoteCount = async (projectSlug, incrementValue, session) => {
    const project = await findProjectBySlug(projectSlug)
    if (!project) {
        throw new Error('Project not found')
    }

    await projectModel.updateOne(
        { slug: projectSlug },
        { $inc: { upvoteCount: incrementValue } },
        { session } 
    )
}

const findVote = (projectSlug, userId) => {
    return upvoteModel.findOne({ upvoteFor: projectSlug, upvoteBy: userId })
}

const deleteVote = (projectSlug, userId, session) => {
    return upvoteModel.findOneAndDelete({ upvoteFor: projectSlug, upvoteBy: userId }).session(session)
}

const incrementProjectViewCount = async (project) => {
    project.viewsCount += 1
    await project.save()
    return project.viewsCount
}

module.exports = {
    createSlug,
    doesAuthorHaveProjectWithTitle,
    createNewProject,
    updateProjectData,
    getHomeFeedProjects,
    searchAllTags,
    findProjectByAuthorAndSlug,
    getPopularProjectsByAuthor,
    findProjectBySlug,
    createVote,
    updateProjectVoteCount,
    findVote,
    deleteVote,
    incrementProjectViewCount
}