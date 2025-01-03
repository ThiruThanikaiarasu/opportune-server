const { setResponseBody } = require("../utils/responseFormatter")

const addANewProject = async (request, response) => {
    // const user = request.user._id
    const { title, description, tags, githubLink, hostedLink, documentation } = request.body
    const thumbnail = request.file
    
    try {
        
        console.log(title, description, thumbnail, tags, githubLink, hostedLink, documentation)

        response.status(200).send(setResponseBody(null, null, null))
    }
    catch(error) {
        response.status(500).send(setResponseBody(error.message, "server_error", null))
    }
}

module.exports = {
    addANewProject
}