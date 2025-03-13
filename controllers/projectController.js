const { validationResult } = require('express-validator')
const { default: mongoose } = require('mongoose')

const { doesAuthorHaveProjectWithTitle, createNewProject, searchProjectByKeyword, getFilteredProjects, getHomeFeedProjects, searchTagsByKeyword, searchAllTags, getPopularProjectsByAuthor, findProjectByAuthorAndSlug, createVote, updateProjectVoteCount, findVote, deleteVote, findProjectBySlug, incrementProjectViewCount, updateProjectData, createSlug } = require("../services/projectService")
const { setResponseBody } = require("../utils/responseFormatter")
const UploadError = require('../errors/UploadError')


const addANewProject = async (request, response) => {
    const user = request.user._id
    const { title, description, problemStatement, problemSolution, tags, githubLink, hostedLink, documentation } = request.body
    const thumbnail = request.file
    
    try {

        const errors = validationResult(request)

        if (!errors.isEmpty()) {
            return response.status(400).json({ message: errors.array()[0].msg })
        }
        
        const existingProject = await doesAuthorHaveProjectWithTitle(user, title) 

        if(existingProject) {
            return response.status(409).send(setResponseBody("Title already exists. Please choose a different title.", "existing_project_title", null))
        }

        const newProject = await createNewProject(user, title, description, problemStatement, problemSolution, tags, githubLink, hostedLink, documentation, thumbnail) 

        response.status(201).send(setResponseBody("Project created Successfully", null, newProject))
    }
    catch(error) {
        console.log(error)
        if(error instanceof UploadError) {
            return response.status(error.statusCode).send(setResponseBody(error.message, "service_unavailable", null))
        }
        response.status(500).send(setResponseBody(error.message, "server_error", null))
    }
}

const editProject = async (request, response) => {
    const userId = request.user._id
    const { projectSlug } = request.params
    const newProjectData = request.body 
    const thumbnail = request.file || null

    try {
        const project = await findProjectBySlug(projectSlug)

        if(!project) {
            return response.status(404).send(setResponseBody("Project not found", "not_found", null))
        }

        if(project.title !== newProjectData.title) {
            const newSlug = createSlug(newProjectData.title) 
            const isExistingSlug = await findProjectBySlug(newSlug)
            if(isExistingSlug) {
                return response.status(409).send(setResponseBody("Title already exists. Please choose a different title.", "existing_project_title", null))
            }

        }

        if (project.author.toString() !== userId.toString()) {
            return response.status(403).send(setResponseBody("Unauthorized access", "unauthorized", null))
        }
        
        const updatedProject = await updateProjectData(project, newProjectData, thumbnail)

        response.status(200).send(setResponseBody("Project updated successfully", null, updatedProject))
    }
    catch(error) {
        response.status(500).send(setResponseBody(error.message, "server_error", null))
    }
}

const homeFeed = async (request, response) => {

    const { limit = 10, page = 1 } = request.query
    const limitInt = parseInt(limit, 10)
    const pageInt = parseInt(page, 10)

    try {
        const userId = request.isAuthenticated ? request.user._id : null
        const projects = await getHomeFeedProjects(limitInt, pageInt, userId)

        response.status(200).send(setResponseBody("Home feed projects", null, projects))
    }
    catch(error) {
        response.status(500).send(setResponseBody(error.message, "server_error", null))
    }

}

const searchProjects = async (request, response) => {
    const { keyword, limit = 10, page = 1 } = request.query
    const limitInt = parseInt(limit, 10)
    const pageInt = parseInt(page, 10)


    try{
        if(!keyword || !keyword.trim()) {
            return response.status(400).send(setResponseBody("Keyword is required", "keyword_missing", null))
        }

        const userId = request.isAuthenticated ? request.user._id : null
        const projects = await searchProjectByKeyword(keyword, limitInt, pageInt, userId)

        response.status(200).send(setResponseBody("Projects that matches the keyword", null, projects))

    }
    catch(error) {
        response.status(500).send(setResponseBody(error.message, "server_error", null))
    }
}

const filterProjects = async (request, response) => {
    const { tag, sortBy = "createdAt", order = "desc", limit = 10, page = 1 } = request.query 
    const limitInt = parseInt(limit, 10)
    const pageInt = parseInt(page, 10)

    try{
        const userId = request.isAuthenticated ? request.user._id : null
        const projects = await getFilteredProjects(tag, sortBy, order, limitInt, pageInt, userId)

        response.status(200).send(setResponseBody("Filtered projects", null, projects))
    }
    catch(error) {
        response.status(500).send(setResponseBody(error.message, "server_error", null))
    }
}

const searchTags = async (request, response) => {
    const { keyword = '' } = request.query
    try {
        const tags = await searchTagsByKeyword(keyword)

        response.status(200).send(setResponseBody("Tags fetched successfully", null, tags))
    }
    catch(error) {
        response.status(500).send(setResponseBody(error.message, "server_error", null))
    }
}

const getAllTags = async (request, response) => {
    try {
        const tags = await searchAllTags()

        response.status(200).send(setResponseBody("All Tags fetched successfully", null, tags))
    }
    catch(error) {
        response.status(500).send(setResponseBody(error.message, "server_error", null))
    }
}

const getProjectByUsernameAndSlug = async (request, response) => {
    const {username, slug} = request.params

    try {
        const project = await findProjectByAuthorAndSlug(username, slug)

        if(!project) {
            return response.status(404).send(setResponseBody("Project not found", "not_found", null))
        }

        response.status(200).send(setResponseBody("Project found", null, project))
    }
    catch(error) {
        response.status(500).send(setResponseBody(error.message, "server_error", null))
    }
}

const getMoreProjects = async (request, response) => {
    const { username, slug } = request.params
    const { limit = 10,  page = 1} = request.query
    const limitInt = parseInt(limit, 10)
    const pageInt = parseInt(page, 10)

    try {
        const projects = await getPopularProjectsByAuthor(username, slug, limitInt, pageInt)
        
        response.status(200).send(setResponseBody("Author's other projects", null, projects))
    }
    catch(error) {
        response.status(500).send(setResponseBody(error.message, "server_error", null))
    }
}

const handleUpvote = async (request, response) => {
    const { projectSlug } = request.params
    const userId = request.user._id

    const session = await mongoose.startSession()
    
    session.startTransaction()

    try {

        const existingVote = await findVote(projectSlug, userId)

        if(existingVote) {
            await session.abortTransaction()
            session.endSession()
            return response.status(400).send(setResponseBody("Already upvoted", "duplicate_upvote", null))
        }
        
        await createVote(projectSlug, userId, session)
        await updateProjectVoteCount(projectSlug, 1, session) 

        await session.commitTransaction()
        session.endSession()

        return response.status(200).send(setResponseBody("Upvote added successfully", null, null))
        
    }
    catch(error) {
        await session.abortTransaction()
        session.endSession()

        response.status(500).send(setResponseBody(error.message, "server_error", null))
    }
}

const handleRemoveUpvote = async (request, response) => {
    const { projectSlug } = request.params
    const userId = request.user._id
    const session = await mongoose.startSession()
    
    session.startTransaction() 

    try {
        const existingVote = await findVote(projectSlug, userId)

        if (!existingVote) {
            await session.abortTransaction()
            session.endSession()
            return response.status(400).send(setResponseBody("Upvote not found", "upvote_not_found", null))
        }

        await deleteVote(projectSlug, userId, session)
        await updateProjectVoteCount(projectSlug, -1, session)

        await session.commitTransaction()
        session.endSession()

        return response.status(200).send(setResponseBody("Upvote removed successfully", null, null))
    }
    catch (error) {
        await session.abortTransaction()
        session.endSession()

        return response.status(500).send(setResponseBody(error.message, "server_error", null))
    }
}

const updateProjectView = async (request, response) => {
    const { projectSlug } = request.params

    try {
        const project = await findProjectBySlug(projectSlug) 

        if(!project) {
            return response.status(400).send(setResponseBody("Project not found", "not_found", null))
        }

        const viewsCount = await incrementProjectViewCount(project)
        
        response.status(200).send(setResponseBody('View count updated', null, viewsCount))
    }
    catch(error) {
        return response.status(500).send(setResponseBody(error.message, "server_error", null))
    }
}

module.exports = {
    addANewProject,
    editProject,
    homeFeed,
    searchProjects,
    filterProjects,
    searchTags,
    getAllTags,
    getProjectByUsernameAndSlug,
    getMoreProjects,
    handleUpvote,
    handleRemoveUpvote,
    updateProjectView
}