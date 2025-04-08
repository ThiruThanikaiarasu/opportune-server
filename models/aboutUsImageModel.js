const mongoose = require('mongoose')

/**
 * @swagger
 * components:
 *   schemas:
 *     AboutUsImage:
 *       type: object
 *       required:
 *         - imageUrl
 *       properties:
 *         title:
 *           type: string
 *           example: "Company Vision"
 *         imageUrl:
 *           type: string
 *           example: "https://my-bucket.s3.amazonaws.com/about-us/company-vision.jpg"
 *         description:
 *           type: string
 *           example: "A brief description about our company vision."
 *         order:
 *           type: number
 *           default: 0
 *           example: 1
 */

const aboutUsImageSchema = new mongoose.Schema(
    {
        title: {
            type: String, 
        },
        imageUrl: {
            type: String, 
            required: [true, 'Image URL is a mandatory field']
        },
        description: {
            type: String,
        },
        order: {
            type: Number,
            default: 0
        }
    },
    {
        timestamps: true,
    },
    {
        collection: 'aboutUsImages'
    }
)

module.exports = mongoose.model('aboutUsImages', aboutUsImageSchema)