const { findUserNameAlreadyExists } = require('../services/userService')

const generateUsername = async (email) => {
    const baseUsername = email.split(' ')[0]; 
    let username = `${baseUsername}_${Math.floor(1000 + Math.random() * 9000)}`;

    while (await findUserNameAlreadyExists(username)) {
        username = `${baseUsername}_${Math.floor(1000 + Math.random() * 9000)}`;
    }

    return username;
};

module.exports = { generateUsername }