const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

/**
 * @swagger
 * components:
 *   schemas:
 *     Otp:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: The name of the user
 *           example: john doe
 *         username:
 *           type: string
 *           description: The username of the user
 *           example: john_doe
 *         email:
 *           type: string
 *           description: The email of the user
 *           example: johndoe@gmail.com
 *         password:
 *           type: string
 *           description: The hashed password of the user
 *           example: 1234Abcd!@
 *         otp:
 *           type: number
 *           description: The 6-digit OTP code
 *           example: 123456
 *         expiresAt:
 *           type: string
 *           format: date-time
 *           description: Expiration time for the OTP
 *           example: 2025-01-04T15:30:00.000Z
 *         attempts:
 *           type: number
 *           description: Number of OTP validation attempts
 *           example: 1
 *       required:
 *         - name
 *         - username
 *         - email
 *         - otp
 *         - expiresAt
 *         - attempts
 */

const otpSchema = new mongoose.Schema(
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
        otp: {
            type: Number,
            required: [true, 'OTP is a mandatory field'],
            min: [100000, 'OTP must be at least 6 digits'], 
            max: [999999, 'OTP must not exceed 6 digits']
        },
        expiresAt: {
            type: Date,
            required: [true, 'Expiration time is mandatory'],
            default: () => new Date(Date.now() + 10 * 60 * 1000), 
            index: { expires: '10m' }
        },
        attempts: {
            type: Number,
            required: true,
            default: 0, 
            min: [0, 'Attempts cannot be less than 0'],
            max: [3, 'Maximum attempts allowed are 3'], 
        }
    },
    {
        timestamps: true,
    },
    {
        collection: 'otp'
    }
)

otpSchema.pre('save', function (next) {
    const user = this

    if (!user.isModified('password')) return next()
    bcrypt.genSalt(10, (error, salt) => {
        if (error) return next(error)

        bcrypt.hash(user.password, salt, (error, hash) => {
            if (error) return next(error)

            user.password = hash
            next()
        })
    })
})

module.exports = mongoose.model('otp',otpSchema)