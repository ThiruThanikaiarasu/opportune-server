const mongoose = require('mongoose')

/**
 * @swagger
 *  components:
 *   schemas:
 *    Skill:
 *     type: object
 *     required:
 *      - name
 *     properties:
 *      name:
 *       type: string
 *       description: The name of the skill (e.g., HTML, CSS, JavaScript, Node.js)
 *       example: JavaScript
 */

const skillSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Skill name is a mandatory field'],
            unique: true,
            trim: true,
        }
    },
    {
        timestamps: true,
    },
    {
        collection: 'skills'
    }
)

module.exports = mongoose.model('skills', skillSchema)
