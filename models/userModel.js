const mongoose = require('mongoose')

/**
 * @swagger
 *  components:
 *   schemas:
 *    User:
 *     type: object
 *     required:
 *      - name
 *      - email
 *      - password
 *      - username
 *     properties: 
 *      name:
 *       type: string
 *       description: Name of the user
 *       example: John Doe
 *       minLength: 1
 *       maxLength: 100
 *      username:
 *       type: string
 *       description: Username unique name for each user(case insensitive)
 *       example: JohnDoe
 *       minLength: 1
 *       maxLength: 39
 *      email:
 *       type: string
 *       description: Email of the user
 *       example: johndoe@gmail.com
 *      phone:
 *       type: object
 *       required: 
 *        - countryCode
 *        - number
 *       properties: 
 *        countryCode:
 *         type: String
 *         description: Country code of the Phone Number
 *         example: +91
 *        number:
 *         type: String
 *         description: Phone Number of the user
 *         example: 7785877858
 *      password:
 *       type: string
 *       description: Password for the user account
 *       example: Johndoe123@
 *       minLength: 8
 *       maxLength: 20
 *      googleId:
 *       type: string
 *       description: Password for the user account
 *       example: Johndoe123@
 *      githubId:
 *       type: string
 *       description: Password for the user account
 *       example: Johndoe123@
 *      createdAt:
 *       type: string
 *       format: date-time
 *       description: The timestamp when the user was created.
 *       example: '2025-01-01T12:00:00Z'
 *      updatedAt:
 *       type: string
 *       format: date-time
 *       description: The timestamp when the user was last updated.
 *       example: '2025-01-01T12:00:00Z'
 *     additionalProperties: false
 *     timestamps: true
 * 
 */

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String, 
            required: [true, 'First name is mandatory field'],
            minlength: [1, 'First name must be at least 1 character long'],
            maxlength: [100, 'First name must not exceed 100 characters'],
            match: [
              /^[A-Za-z\s]+$/, // Regex to allow only letters and spaces
              'First name can only contain letters and spaces',
            ],
        },
        username: {
            type: String, 
            required: [true, "Username is a mandatory field"],
            minLength: [1, 'Username must be at least 1 character long'],
            maxLength: [39, 'Username must not exceed 39 characters'],
            match: [
                /^(?=[a-zA-Z0-9])(?=.*[a-zA-Z0-9]$)[a-zA-Z0-9-_]*$/,
                "Username can only contain letters, numbers, hyphens (-), and underscores (_), and must not start or end with a hyphen or underscore"
            ]
        },
        email: {
            type: String, 
            required: [true, 'Email is mandatory field'],
            unique: true,
            lowercase: true,
            trim: true,
            match: [/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/, 'Please provide a valid email address'],
        },
        phone: {
            countryCode: {
                type: String,
                match: /^\+\d{1,4}$/,
            },
            number: {
                type: String,
                match: /^\d{10}$/,
            }
        },
        password: {
            type: String, 
            select: false
        },
        googleId: {
            type: String,
        },
        githubId: {
            type: String,
        }
    },
    {
        timestamps: true,
    },
    {
        collection: 'users'
    }
)

module.exports = mongoose.model('users', userSchema)