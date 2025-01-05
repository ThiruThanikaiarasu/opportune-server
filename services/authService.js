const userModel = require('../models/userModel')

const findUserByEmail = async (email) => {
    return await userModel.findOne({email})
}

const findUserById = async (id) => {
    return await userModel.findOne({ _id: id})
}

const createUser = async ( name, email, password) => {
    const user = new userModel({
        name,
        email,
        password
    })
    await user.save()

    return user
}
module.exports = {
    findUserByEmail,
    findUserById,
    createUser
}