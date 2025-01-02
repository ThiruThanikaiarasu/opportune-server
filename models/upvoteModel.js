const mongoose = require('mongoose')

/**
 * @swagger
 *  components:
 *   schemas:
 *    Upvote:
 *     type: object
 *     required:
 *      - upvoteBy
 *      - upvoteFor
 *     properties:
 *      upvoteBy:
 *       type: string
 *       description: The unique identifier (ObjectId) of the user who upvoted the project.
 *       example: 60d0fe4f5311236168a109ca
 *      upvoteFor:
 *       type: string
 *       description: The unique identifier (ObjectId) of the project that was upvoted.
 *       example: 60d0fe4f5311236168a109cb
 *      createdAt:
 *       type: string
 *       format: date-time
 *       description: The timestamp when the upvote was created.
 *       example: '2025-01-01T12:00:00Z'
 *      updatedAt:
 *       type: string
 *       format: date-time
 *       description: The timestamp when the upvote was last updated.
 *       example: '2025-01-01T12:00:00Z'
 *     additionalProperties: false
 *     timestamps: true
 */


const upvoteSchema = new mongoose.Schema(
    {
        upvoteBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'users'
        },
        upvoteFor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'projects'
        }
    }, 
    {
        timestamps: true
    },
    {
        collection: 'upvotes'
    }
)

module.exports = mongoose.model('upvotes', upvoteSchema)