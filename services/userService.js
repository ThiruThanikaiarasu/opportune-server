const userModel = require('../models/userModel')

const findUserByEmail = (email) => {
    return userModel.findOne({ email })
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
module.exports = {
    findUserByEmail,
    createUser
}