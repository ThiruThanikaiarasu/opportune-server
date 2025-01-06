const UploadError = require('../errors/UploadError')
const projectModel = require('../models/projectModel')

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

const createNewProject = async (author, title, description, tags, githubLink, hostedLink, documentation, thumbnail) => {
    try {
        const thumbnailS3Key = await uploadToS3(thumbnail)

        const slug = createSlug(title)
        
        const newProjectData = {
            author,
            title,
            slug,
            description,
            tags,
            githubLink,
            thumbnail: {
                originalname: thumbnail.originalname,
                size: thumbnail.size,
                mimetype: thumbnail.mimetype,
                s3Key: thumbnailS3Key
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

const getHomeFeedProjects = async (limit, page) => {

    const skip = (page - 1)* limit

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
                    as: 'authorDetails'
                }
            },
            {
                $unwind: '$authorDetails'
            },
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

module.exports = {
    doesAuthorHaveProjectWithTitle,
    createNewProject,
    getHomeFeedProjects,
    searchProjectByKeyword,
    getFilteredProjects
}