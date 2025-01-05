const UploadError = require('../errors/UploadError')
const projectModel = require('../models/projectModel')

const { uploadToS3 } = require('./s3Service')


const doesAuthorHaveProjectWithTitle = async (author, title) => {
    return await projectModel.exists({ author, title })
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

module.exports = {
    doesAuthorHaveProjectWithTitle,
    createNewProject
}