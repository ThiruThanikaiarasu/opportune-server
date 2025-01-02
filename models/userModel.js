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
 *     properties: 
 *      id:
 *       type: string
 *       description: The unique identifier for the user
 *       example: 650f-
 *      name:
 *       type: string
 *       description: Name of the user
 *       example: John Doe
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
 *      googleId:
 *       type: string
 *       description: Password for the user account
 *       example: Johndoe123@
 *      githubId:
 *       type: string
 *       description: Password for the user account
 *       example: Johndoe123@
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
            select: false, 
            minlength: [8, 'Password must be at least 8 characters long'],
            maxlength: [20, 'Password must not exceed 20 characters'],
            match: [
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>_])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,20}$/,
                'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
              ],
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