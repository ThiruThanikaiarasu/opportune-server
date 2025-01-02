const userModel = require('../models/userModel')
const findUserByEmail = async (email) => {
    return await userModel.findOne({email})
}

const createUser = async ( name, email, password, phone) => {
    const user = new userModel({
        name,
        email,
        password,
        phone
    })
    await user.save()

    return user
}
module.exports = {findUserByEmail,createUser}