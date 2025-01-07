const bcrypt = require('bcrypt')

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

const updateUserPassword = async( user, password ) => {
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    user.password = hashedPassword
    await user.save();
    
    return user
}

module.exports = {
    findUserByEmail,
    createUser,
    findUserNameAlreadyExists,
    updateUserPassword
}