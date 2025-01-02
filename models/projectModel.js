const mongoose = require('mongoose')

/**
 * @swagger
 *  components:
 *   schemas:
 *    Project:
 *     type: object
 *     required:
 *      - author
 *      - title
 *      - description
 *      - thumbnail
 *      - tags
 *      - githubLink
 *     properties: 
 *      author:
 *       type: string
 *       description: The unique identifier of the user who created the project.
 *       example: 60d0fe4f5311236168a109ca
 *      title:
 *       type: string
 *       description: The title of the project.
 *       example: 'My Cool Project'
 *       minLength: 3
 *       maxLength: 100
 *      description:
 *       type: string
 *       description: A brief description of the project.
 *       example: 'This project is about building a web app using the MERN stack.'
 *       minLength: 10
 *       maxLength: 500
 *      thumbnail:
 *       type: string
 *       description: The URL of the project's thumbnail image stored in AWS S3 after the file upload.
 *       example: 'https://s3.amazonaws.com/bucket-name/thumbnail.jpg'
 *       format: uri
 *      tags:
 *       type: array
 *       items:
 *         type: string
 *       description: A list of tags associated with the project, helping with categorization.
 *       example: ['MERN', 'Web Development', 'Full Stack']
 *       minItems: 1
 *       maxItems: 3
 *      githubLink:
 *       type: string
 *       description: The GitHub repository URL for the project.
 *       example: 'https://github.com/username/my-cool-project'
 *      hostedLink:
 *       type: string
 *       description: The live, hosted version of the project.
 *       example: 'https://mycoolproject.com'
 *      documentation:
 *       type: string
 *       description: The URL to the documentation for the project.
 *       example: 'https://mycoolproject.com/docs'
 *      viewsCount:
 *       type: integer
 *       description: The number of times the project has been viewed.
 *       example: 100
 *      upvoteCount:
 *       type: integer
 *       description: The number of upvotes the project has received.
 *       example: 25
 *      createdAt:
 *       type: string
 *       format: date-time
 *       description: The timestamp when the project was created.
 *       example: '2025-01-01T12:00:00Z'
 *      updatedAt:
 *       type: string
 *       format: date-time
 *       description: The timestamp when the project was last updated.
 *       example: '2025-01-01T12:00:00Z'
 *     additionalProperties: false
 *     timestamps: true
 */


const projectSchema = new mongoose.Schema(
    {
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'users',
            required: [true, 'Author is a mandatory field'],
        },
        title: {
            type: String,
            required: [true, 'Title is a mandatory field'],
            minlength: [3, 'Title must be at least 3 characters long'],
            maxlength: [100, 'Title must not exceed 100 characters'],
        },
        description: {
            type: String,
            required: [true, 'Description is a mandatory field'],
            minlength: [10, 'Description must be at least 10 characters long'],
            maxlength: [500, 'Description must not exceed 500 characters'],
        },
        thumbnail: {
            type: String,
            required: [true, 'Thumbnail is a mandatory field'],
        },
        tags: {
            type: [String],
            required: [true, 'Tags is a mandatory field'],
            validate: {
                validator: function (tags) {
                    return tags.length >= 1 && tags.length <= 3
                },
                message: 'Must have at least one and at most three tags',
            },
        },
        githubLink: {
            type: String,
            required: [true, 'GitHub link is a mandatory field'],
            match: [/^(http|https):\/\/github\.com\/[a-zA-Z0-9\-]+(\/[a-zA-Z0-9\-]+)*$/, 'GitHub link must be a valid URL'],
        },
        hostedLink: {
            type: String,
            match: [/^(http|https):\/\/[a-zA-Z0-9\-]+\.[a-zA-Z]{2,6}(\/[a-zA-Z0-9\-]*)*$/, 'Hosted link must be a valid URL'],
        },
        documentation: {
            type: String,
            match: [/^(http|https):\/\/.*$/, 'Documentation link must be a valid URL'],
        },
        viewsCount: {
            type: Number,
            default: 0,
        },
        upvoteCount: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    },
    {
        collection: 'projects'
    }
)

module.exports = mongoose.model('projects', projectSchema)