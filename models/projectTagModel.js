const mongoose = require('mongoose')

/**
 * @swagger
 *  components:
 *   schemas:
 *    ProjectTag:
 *     type: object
 *     required:
 *      - tag
 *     properties:
 *      tag:
 *       type: string
 *       description: The tag associated with the project to help categorize it (e.g., technology stack, project type)
 *       example: MERN
 */

const projectTagSchema = new mongoose.Schema(
    {
        tag: {
            type: String, 
            required: [true, 'Tag is a mandatory field'],
            unique: true,
            trim: true,
        }
    },
    {
        timestamps: true,
    },
    {
        collection: 'projectTag'
    }
)

module.exports = mongoose.model('projectTag', projectTagSchema)