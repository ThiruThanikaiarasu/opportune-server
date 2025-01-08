const { validationResult } = require('express-validator')

const { doesAuthorHaveProjectWithTitle, createNewProject, searchProjectByKeyword, getFilteredProjects, getHomeFeedProjects, searchTagsByKeyword, searchAllTags, getPopularProjectsByAuthor, findProjectByAuthorAndSlug } = require("../services/projectService")
const { setResponseBody } = require("../utils/responseFormatter")
const UploadError = require('../errors/UploadError')


const addANewProject = async (request, response) => {
    const user = request.user._id
    const { title, description, tags, githubLink, hostedLink, documentation } = request.body
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

        const newProject = await createNewProject(user, title, description, tags, githubLink, hostedLink, documentation, thumbnail) 

        response.status(201).send(setResponseBody("Project created Successfully", null, newProject))
    }
    catch(error) {

        if(error instanceof UploadError) {
            return response.status(error.statusCode).send(setResponseBody(error.message, "service_unavailable", null))
        }
        response.status(500).send(setResponseBody(error.message, "server_error", null))
    }
}

const homeFeed = async (request, response) => {

    const { limit = 10, page = 1 } = request.query
    const limitInt = parseInt(limit, 10)
    const pageInt = parseInt(page, 10)

    try {
        const projects = await getHomeFeedProjects(limitInt, pageInt)

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

        const projects = await searchProjectByKeyword(keyword, limitInt, pageInt)

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
        const projects = await getFilteredProjects(tag, sortBy, order, limitInt, pageInt)

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

module.exports = {
    addANewProject,
    homeFeed,
    searchProjects,
    filterProjects,
    searchTags,
    getAllTags,
    getProjectByUsernameAndSlug,
    getMoreProjects
}