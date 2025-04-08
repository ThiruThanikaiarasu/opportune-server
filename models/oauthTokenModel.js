const mongoose = require('mongoose')

/**
 * @swagger
 * components:
 *   schemas:
 *     Oauthtoken:
 *       type: object
 *       description: Stores OAuth authentication tokens for users.
 *       properties:
 *         author:
 *           type: string
 *           format: uuid
 *           description: The ID of the user associated with the token.
 *           example: "60d0fe4f5311236168a109ca"
 *         provider:
 *           type: string
 *           enum: [google, github]
 *           description: The OAuth provider.
 *           example: "google"
 *         providerId:
 *           type: string
 *           description: The unique identifier from the OAuth provider.
 *           example: "12345678901234567890"
 *         refreshToken:
 *           type: string
 *           nullable: true
 *           description: The refresh token provided by the OAuth provider.
 *           example: "1//0g2dC2J9ytZrQCgYIARAAGBASNwF-L9I..."
 *       required:
 *         - author
 *         - provider
 *         - providerId
 */

const oauthtokenSchema = new mongoose.Schema({
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'users',
            required: true
        },
        provider: {
            type: String,
            enum: ['google', 'github'],
            required: true
        },
        providerId: {
            type: String,
            required: true,
            unique: true
        },
        refreshToken: {
            type: String,
            default: null
        }
    }, 
    { 
        timestamps: true
    },
    {
        collection: 'Oauthtoken'
    }
);

oauthtokenSchema.index({ author: 1, provider: 1 }, { unique: true });

module.exports = mongoose.model('Oauthtoken', oauthtokenSchema)
  