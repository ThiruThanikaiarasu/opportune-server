const userModel = require('../models/userModel')

const findUserByEmail = (email) => {
    return userModel.findOne({ email }).select('+password')
}

const createUser = async(name, username, email, password) => {

    const user = new userModel({
        name,
        username,
        email,
        password
    })
    
    await user.save()

    return user
}

const findUserNameAlreadyExists = async(username) => {
    return await userModel.exists({ username })
}
module.exports = {
    findUserByEmail,
    createUser,
    findUserNameAlreadyExists
}