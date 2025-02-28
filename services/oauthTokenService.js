const oauthtokenModel = require('../models/oauthTokenModel')

const findOAuthTokenById = async (_id, provider) => {
    return await oauthtokenModel.findOne({ author: _id, provider });
};

const updateOAuthToken = async ({ _id, provider, ...updates }) => {
    const existingToken = await oauthtokenModel.findOne({ author: _id, provider });

    if (existingToken) {
        Object.assign(existingToken, updates);
        return await existingToken.save();
    }

    return await oauthtokenModel.create({ author: _id, provider, ...updates });
};


module.exports = { findOAuthTokenById, updateOAuthToken }