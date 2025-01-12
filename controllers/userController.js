const bcrypt = require('bcrypt')

const { findUserNameAlreadyExists, findUserByEmail, updateUserPassword, updateUserProfileData } = require('../services/userService')
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

const resetPassword = async(request,response) => {
    const { email, password } = request.body
    try {
        const errors = validationResult(request)

        if(!errors.isEmpty()) {
            return response.status(400).send(setResponseBody(errors.array()[0].msg,"validation_error", null))
        }

        const existingUser = await findUserByEmail(email)
        if(!existingUser)
        {
            return response.status(400).send(setResponseBody("Invalid Operation", "user_not_found", null))
        }

        const isPasswordMatch = await bcrypt.compare(password, existingUser.password);
        if (isPasswordMatch) {
            return response.status(400).send(setResponseBody("The new password cannot be the same as the old password. Please choose a different password.", "password_error", null));
        }

        const userData = await updateUserPassword(existingUser, password)

        let responseData = {
            name : userData.name,
            username : userData.username, 
            email: userData.email
        }

        return response.status(200).send(setResponseBody("Password reset successfully.", null, responseData))
    }
    catch(error) {
        return response.status(500).send(setResponseBody(error.message, "server_error", null))
    }
}

const updateUserProfile = async (request, response) => {
    const user = request.user
    const profileData = request.body
    const profilePicture = request.file || null

    try {
        const userProfile = await updateUserProfileData(user, profileData, profilePicture)

        response.status(200).send(setResponseBody("User Profile updated", null, userProfile))
    }
    catch(error) {
        return response.status(500).send(setResponseBody(error.message, "server_error", null))
    }
}

module.exports = {
    checkUsernameAvailability,
    resetPassword,
    updateUserProfile
}