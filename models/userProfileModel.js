const mongoose = require('mongoose')

/**
 * @swagger
 * components:
 *  schemas: 
 *   UserProfile:
 *    type: object
 *    required: 
 *     - author
 *    properties: 
 *     author: 
 *      type: string 
 *      description: The unique identifier of the user who owns the profile.
 *      example: 60d0fe4f5311236168a109ca
 *     bio: 
 *      type: string 
 *      description: A short biography about the user.
 *      example: 'Passionate web developer with a focus on MERN stack projects.'
 *      maxLength: 300
 *     profilePicture:
 *       type: object
 *       required: 
 *        - originalname
 *        - size
 *        - mimetype
 *        - s3Key
 *       properties:
 *        originalname: 
 *         type: string
 *         description: Originalname of the uploaded file.
 *         example: photo1
 *        size: 
 *         type: number
 *         description: Size of the uploaded file (in bytes).
 *         example: 500
 *        mimetype: 
 *         type: string
 *         description: Mimetype of the uploaded file.
 *         example: image/png
 *        s3Key: 
 *         type: string
 *         description: The URL of the project's thumbnail image stored in AWS S3 after the file upload.
 *         example: 'https://s3.amazonaws.com/bucket-name/thumbnail.jpg'
 *     portfolioLink:
 *       type: string
 *       description: A link to the user's portfolio website.
 *       example: 'https://myportfolio.com'
 *     resumeLink:
 *        type: string
 *        description: A link to the user's resume.
 *        example: 'https://myresume.com/resume'
 *     resumeFile:
 *           type: string
 *           description: The file user's uploaded resume.
 *           example: 'https://s3.amazonaws.com/bucket-name/resume.pdf'
 *     accounts:
 *      type: array
 *      items:
 *        type: object
 *        properties:
 *          domain:
 *           type: string
 *           description: The domain or platform of the account.
 *           example: 'LeetCode'
 *           maxLength: 50
 *          url:
 *           type: string
 *           description: The URL of the user's account on the specified domain.
 *           example: 'https://leetcode.com/username'
 *     passedOutYear:
 *      type: integer
 *      description: The year the user passed out from their educational institution.
 *      example: 2020
 *      minimum: 1960
 *      maximum: 2040
 *     createdAt:
 *      type: string
 *      format: date-time
 *      description: The timestamp when the user profile was created.
 *      example: '2025-01-01T12:00:00Z'
 *     updatedAt:
 *      type: string
 *      format: date-time
 *      description: The timestamp when the user profile was last updated.
 *      example: '2025-01-01T12:00:00Z'
 *    additionalProperties: false
 *    timestamp: true 
 */

const userProfileSchema = new mongoose.Schema(
    {
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'users',
            required: [true, 'Author is a mandatory field'],
        },
        bio: {
            type: String,
            trim: true,
            maxlength: [300, 'Bio must not exceed 300 characters'],
        },
        profilePicture: {
            originalname: {
                type: String,
                trim: true,
            },
            size: {
                type: Number,
            },
            mimetype: {
                type: String,
                match: [
                    /^image\/(jpeg|png|webp|svg\+xml)$/,
                    'Invalid MIME type. Allowed types are: jpeg, png, webp, svg+xml'
                ],
            },
            s3Key: {
                type: String,
                trim: true,
            }
        },
        portfolioLink: {
            type: String,
            match: [
                /^(http|https):\/\/[a-zA-Z0-9\-_.]+(\.[a-zA-Z]{2,})?(:[0-9]{1,5})?(\/[a-zA-Z0-9\-_.~!*'();:@&=+$,/?#[\]%]*)?$/, 
                'Portfolio link must be a valid URL'
            ],
        },
        resumeLink: {
            type: String,
            match: [/^(http|https):\/\/[a-zA-Z0-9\-_.]+(\.[a-zA-Z]{2,})?(:[0-9]{1,5})?(\/[a-zA-Z0-9\-_.~!*'();:@&=+$,/?#[\]%]*)?$/, 'Resume link must be a valid URL'],
        },
        resumeFile: {
            type: String,
        },
        accounts: [
            {
                domain: {
                    type: String,
                    required: [true, 'Account domain is required'],
                    trim: true,
                    maxlength: [50, 'Domain name cannot exceed 50 characters'],
                },
                url: {
                    type: String,
                    required: [true, 'Account URL is required'],
                    trim: true,
                    match: [
                        /^(http|https):\/\/[a-zA-Z0-9\-_.]+(\.[a-zA-Z]{2,})?(:[0-9]{1,5})?(\/[a-zA-Z0-9\-_.~!*'();:@&=+$,/?#[\]%]*)?$/,
                        'Account URL must be a valid URL',
                    ],
                },
            },
        ],
        passedOutYear: {
            type: Number,
            min: [1960, 'Year must be a four-digit positive number'],
            max: [2040, 'Year must be a four-digit positive number'],
            validate: {
                validator: Number.isInteger,
                message: 'Year must be an integer',
            },
        }
    },
    {
        timestamps: true
    },
    {
        collection: 'userProfiles'
    }
)

module.exports = mongoose.model('userProfiles', userProfileSchema)