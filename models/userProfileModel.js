const mongoose = require('mongoose')

/**
 * @swagger
 * components:
 *  schemas: 
 *   UserProfile:
 *    type: object
 *    required: 
 *     - author
 *     - professionalTitle
 *     - professionalExperience
 *     - bio
 *     - passedOutYear
 *    properties: 
 *     author: 
 *      type: string 
 *      description: The unique identifier of the user who owns the profile.
 *      example: 60d0fe4f5311236168a109ca
 *     professionalTitle:
 *      type: string
 *      description: The user's professional title or designation.
 *      example: 'Full Stack Developer'
 *     bio: 
 *      type: string 
 *      description: A short biography about the user.
 *      example: 'Passionate web developer with expertise in the MERN stack.'
 *      maxLength: 200
 *     profilePicture:
 *      type: string
 *      description: The URL of the user's profile picture.
 *      example: 'https://lh3.googleusercontent.com/a/profile-image'
 *     portfolioLink:
 *      type: string
 *      description: A link to the user's portfolio website.
 *      example: 'https://myportfolio.com'
 *     resumeLink:
 *      type: string
 *      description: A link to the user's resume (either this or resumeFile is required).
 *      example: 'https://myresume.com/resume'
 *     resumeFile:
 *      type: string
 *      description: The URL of the user's uploaded resume file (either this or resumeLink is required).
 *      example: 'https://s3.amazonaws.com/bucket-name/resume.pdf'
 *     accounts:
 *      type: array
 *      items:
 *       type: object
 *       properties:
 *        domain:
 *         type: string
 *         description: The domain or platform of the account.
 *         example: 'LeetCode'
 *         maxLength: 50
 *        url:
 *         type: string
 *         description: The URL of the user's account on the specified domain.
 *         example: 'https://leetcode.com/username'
 *     professionalExperience:
 *      type: number
 *      description: The number of years of professional experience the user has.
 *      example: 3
 *      minimum: 0
 *      maximum: 60
 *     passedOutYear:
 *      type: integer
 *      description: The year the user graduated from their educational institution.
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
 *    timestamps: true 
 */

const userProfileSchema = new mongoose.Schema(
    {
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'users',
            required: [true, 'Author is a mandatory field'],
        },
        professionalTitle: {
            type: String, 
            required: [true, 'Professional Title is a mandatory field']
        },
        bio: {
            type: String,
            trim: true,
            required: [true, 'Bio is a mandatory field'],
            maxlength: [200, 'Bio must not exceed 200 characters'],
        },
        profilePicture: {
            type: String,
            trim: true,
            match: [
                /^(http|https):\/\/[a-zA-Z0-9\-_.]+(\.[a-zA-Z]{2,})?(:[0-9]{1,5})?(\/[a-zA-Z0-9\-_.~!*'();:@&=+$,/?#[\]%]*)?$/,
                'External link must be a valid URL'
            ]
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
        professionalExperience: {
            type: Number,
            required: [true, 'Professional Experience is a mandatory field'],
            min: [0, 'Professional Experience cannot be negative'],
            max: [60, 'Professional Experience exceeds the realistic limit']
        },
        passedOutYear: {
            type: Number,
            required: [true, 'Passed Out Year is a mandatory field'],
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

userProfileSchema.pre('validate', function(next) {
    if (!this.resumeLink && !this.resumeFile) {
        return next(new Error('Either Resume Link or Resume File is required'))
    }
    next()
})