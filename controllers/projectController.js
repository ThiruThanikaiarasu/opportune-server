const { validationResult } = require('express-validator')

const { doesAuthorHaveProjectWithTitle, createNewProject } = require("../services/projectService")
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

module.exports = {
    addANewProject
}