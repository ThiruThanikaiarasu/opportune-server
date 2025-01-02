const { findUserByEmail,createUser } = require('../services/authService')
const { setResponseBody } = require('../utils/responseFormatter')
const { validationResult } = require('express-validator')


const signup = async(request,response) =>
{
    const { name , email, password, phone} =  request.body
    const phoneNumber = phone || undefined 
    try
    {
        const errors = validationResult(request)

        if(!errors.isEmpty()) {
            return response.status(400).send(setResponseBody(errors.array()[0].msg,"validation_error",null))
        }

        const existingUser = await findUserByEmail(email)
        if(existingUser) 
        {
            return response.status(409).send(setResponseBody("User already exist","existing_user",null))
        }
        const newUser = await createUser(name, email, password, phoneNumber) 

        response.status(201).send(setResponseBody("User Created Successfully", null, newUser))
    }
    catch(error)
    {
        response.status(500).send(setResponseBody(error.message, "server_error", null))
    }
}

module.exports = {signup}