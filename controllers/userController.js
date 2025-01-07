const { findUserNameAlreadyExists } = require('../services/userService')
const { validationResult } = require('express-validator')
const { setResponseBody } = require('../utils/responseFormatter')

const checkUsernameAvailability = async(request,response) => {
    const { username } = request.body
    try {
        const errors = validationResult(request)

        if(!errors.isEmpty()) {
            return response.status(400).send(setResponseBody(errors.array()[0].msg,"validation_error",null))
        }

        const userExists = !!(await findUserNameAlreadyExists(username))
        if (userExists) {
            return response.status(409).send(setResponseBody("Username already exists","existing_user_name",null));
        }
        return response.status(200).send(setResponseBody("Username is available",null,null));
    }
    catch(error)
    {
        return response.status(500).send(setResponseBody(error.message, "server_error", null))
    }
}

module.exports = {
    checkUsernameAvailability
}