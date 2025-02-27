const { S3_BASE_URL } = require('../configurations/constants')
const UploadError = require('../errors/UploadError')
const projectModel = require('../models/projectModel')
const projectTagModel = require('../models/projectTagModel')
const upvoteModel = require('../models/upvoteModel')
const { uploadToS3 } = require('./s3Service')


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
                s3Key: thumbnailURL
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

const getHomeFeedProjects = async (limit, page, userId = null) => { 
    const skip = (page - 1) * limit 
    const s3BaseUrl = `https://${process.env.BUCKET_NAME}.s3.${process.env.BUCKET_REGION}.amazonaws.com/`
    
    const pipeline = [ 
        { 
            $addFields: { 
                thumbnailUrl: { 
                    $cond: { 
                        if: { $ifNull: ["$thumbnail.s3Key", false] },  
                        then: { $concat: [ 
                            s3BaseUrl, 
                            "$thumbnail.s3Key"  
                        ] }, 
                        else: null  
                    } 
                },
                isUserLiked: false
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
        { 
            $unwind: '$authorDetails' 
        }
    ]
    
    if (userId) {
        pipeline.push({
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
        })
        
        pipeline.push({
            $addFields: {
                isUserLiked: { $cond: { if: { $gt: [{ $size: '$userUpvotes' }, 0] }, then: true, else: false } }
            }
        })
        
        pipeline.push({
            $project: {
                userUpvotes: 0
            }
        })

        pipeline.push({
            $lookup: {
                from: 'userprofiles',
                localField: 'author',
                foreignField: 'author',
                as: 'authorProfile'
            }
        })

        pipeline.push({
            $unwind: { 
                path: '$authorProfile', 
                preserveNullAndEmptyArrays: true 
            }
        })

        pipeline.push({
            $addFields: {
                'authorDetails.profilePicture': { 
                    $cond: { 
                        if: { $ifNull: ['$authorProfile.profilePicture.s3Key', false] }, 
                        then: { $concat: [s3BaseUrl, '$authorProfile.profilePicture.s3Key'] }, 
                        else: null 
                    } 
                }
            }
        })
    }
    
    pipeline.push(
        { 
            $sort: { 
                upvoteCount: -1, 
                createdAt: -1 
            } 
        }, 
        {  
            $skip: skip  
        },  
        {  
            $limit: limit  
        }, 
        { 
            $project: { 
                __v: 0, 
                'thumbnail': 0, 
                _id: 0, 
                'authorDetails.__v': 0, 
                'authorDetails._id': 0, 
                'authorDetails.password': 0, 
                'authorDetails.createdAt': 0, 
                'authorDetails.updatedAt': 0,
                'authorProfile': 0
            } 
        }
    )
    
    const projects = await projectModel.aggregate(pipeline)
    
    return projects
}

const searchProjectByKeyword = async (keyword, limit, page) => {

    const skip = (page - 1) * limit
    
    const searchQuery = {
        $or: [
            {
                title: {
                    $regex: keyword,
                    $options: 'i',
                }
            },
            {
                description: {
                    $regex: keyword,
                    $options: 'i',
                }
            },
            {
                tags: {
                    $elemMatch: {
                        $regex: keyword,
                        $options: 'i',
                    }
                }
            }
        ]
    }

    const s3BaseUrl = `https://${process.env.BUCKET_NAME}.s3.${process.env.BUCKET_REGION}.amazonaws.com/` 

    const projects = await projectModel.aggregate(
        [
            { 
                $match: searchQuery 
            },
            {
                $addFields: {
                    thumbnailUrl: {
                      $cond: {
                        if: { $ifNull: ["$thumbnail.s3Key", false] }, 
                        then: { $concat: [
                          s3BaseUrl,
                          "$thumbnail.s3Key" 
                        ] },
                        else: null 
                      }
                    }
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
            {
                $unwind: '$authorDetails'
            },
            { 
                $skip: skip 
            }, 
            { 
                $limit: limit 
            },
            {
                $project: {
                    __v0: 0,
                    'thumbnail.s3Key': 0,
                    _id: 0,
                    'authorDetails.__v': 0,
                    'authorDetails._id': 0,
                    'authorDetails.password': 0,
                    'authorDetails.createdAt': 0,
                    'authorDetails.updatedAt': 0,
                }
            }

        ]
    )

    return projects
}

const getFilteredProjects = async (tag, sortBy, order, limit, page) => {

    const skip = (page - 1) * limit

    const filters = {}
    if(tag) filters.tags = { $regex: tag, $options: 'i' }
    
    const sortOrder = order === 'asc' ? 1 : -1
    const sortCriteria = { [sortBy] : sortOrder }

    const s3BaseUrl = `https://${process.env.BUCKET_NAME}.s3.${process.env.BUCKET_REGION}.amazonaws.com/`
    
    const projects = await projectModel.aggregate(
        [
            {
                $match: filters
            },
            {
                $addFields: {
                    thumbnailUrl: {
                      $cond: {
                        if: { $ifNull: ["$thumbnail.s3Key", false] }, 
                        then: { $concat: [
                          s3BaseUrl,
                          "$thumbnail.s3Key" 
                        ] },
                        else: null 
                      }
                    }
                  }
            },
            {
                $sort: sortCriteria
            },
            {
                $skip: skip
            },
            {
                $limit: limit
            }
        ]
    )

    return projects
}

const searchAllTags = () => {
    return projectTagModel.find()
}

const searchTagsByKeyword = (keyword) => {
    if(!keyword.trim()) {
        return searchAllTags()
    }

    return projectTagModel.find(
        {
            tag: {
                $regex: `^${keyword}`, 
                $options: 'i'
            }
        }
    )
}

const findProjectByAuthorAndSlug = async (username, slug) => {
    const s3BaseUrl = `https://${process.env.BUCKET_NAME}.s3.${process.env.BUCKET_REGION}.amazonaws.com/`

        const project = await projectModel.aggregate(
        [
            {
                $match: {
                    slug:  slug 
                },
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
                    'authorDetails.username': username,
                },
            },
            {
                $addFields: {
                    thumbnailUrl: {
                        $cond: {
                            if: { $ifNull: ['$thumbnail.s3Key', false] },
                            then: { $concat: [s3BaseUrl, '$thumbnail.s3Key'] },
                            else: null,
                        },
                    },
                },
            },
            {
                $project: {
                    '__v': 0,
                    'thumbnail.s3Key': 0,
                    '_id': 0,
                    'author': 0,
                    'authorDetails.__v': 0,
                    'authorDetails._id': 0,
                    'authorDetails.password': 0,
                    'authorDetails.createdAt': 0,
                    'authorDetails.updatedAt': 0,
                }
            }   
        ]
    )

    return project.length > 0 ? project[0] : null
}

const getPopularProjectsByAuthor = async (username, slug, limit, page) => {

    const skip = (page - 1) *limit

    const s3BaseUrl = `https://${process.env.BUCKET_NAME}.s3.${process.env.BUCKET_REGION}.amazonaws.com/`

    const projects = await projectModel.aggregate(
        [
            {
                $addFields: {
                    thumbnailUrl: {
                        $cond: {
                            if: { $ifNull: ["$thumbnail.s3Key", false] }, 
                            then: { $concat: [
                            s3BaseUrl,
                            "$thumbnail.s3Key" 
                            ] },
                            else: null 
                        }
                    }
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'author',
                    foreignField: '_id',
                    as: 'authorDetails',
                    pipeline: [
                        { $match: { username: username } },
                        { $project: { _id: 0, username: 1, name: 1, email: 1 } }
                    ]
                }
            },
            {
                $unwind: '$authorDetails'
            },
            {
                $match: {
                    'authorDetails.username': username,
                    slug: { $ne: slug }
                }
            },
            {
                $addFields: {
                    thumbnailUrl: {
                        $cond: {
                            if: { $ifNull: ['$thumbnail.s3Key', false] },
                            then: { $concat: [s3BaseUrl, '$thumbnail.s3Key'] },
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
                    data: [{ $skip: skip }, { $limit: limit }]
                }
            },
            {
                $project: {
                    total: { $arrayElemAt: ['$metadata.total', 0] },
                    projects: '$data'
                }
            },
            {
                $unset: ['__v', 'thumbnail.s3Key', '_id', 'author']
            }
        ]
    )

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
    doesAuthorHaveProjectWithTitle,
    createNewProject,
    getHomeFeedProjects,
    searchProjectByKeyword,
    getFilteredProjects,
    searchAllTags,
    searchTagsByKeyword,
    findProjectByAuthorAndSlug,
    getPopularProjectsByAuthor,
    findProjectBySlug,
    createVote,
    updateProjectVoteCount,
    findVote,
    deleteVote,
    incrementProjectViewCount
}