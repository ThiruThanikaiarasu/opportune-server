require('dotenv').config()
const express = require('express')
const app = express()

const cors = require('cors')
const swaggerUi = require('swagger-ui-express')
const cookieParser = require('cookie-parser')
const passport = require('passport')

require('./configurations/passportConfig');
const swaggerSpec = require('./configurations/swaggerConfig') 
const authRoute = require('./routes/authRoute')
const projectRoute = require('./routes/projectRoute')
const userRoute = require('./routes/userRoute')
const githubAuthRoute = require('./routes/githubAuthRoute')
const googleAuthRoute = require('./routes/googleAuthRoute')
const { CSS_URL } = require('./configurations/constants')
const rateLimiter = require('./middleware/rateLimiterMiddleware')
const aboutUsRoute = require('./routes/aboutUsRoute')

app.use(cors({
    origin: process.env.CORS_ORIGIN_URL, 
    credentials: true
}))
app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(passport.initialize())

app.get('/', (request, response) => {
    response.status(200).send({ message: "Server running successfully."})
})

app.use('/api-doc', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {customCssUrl: CSS_URL}))
app.use('/api/v1/auth', rateLimiter.auth, authRoute)
app.use('/api/v1/project', rateLimiter.contentBrowsing, projectRoute)
app.use('/api/v1/user', rateLimiter.standard, userRoute)
app.use('/api/v1/auth/github', rateLimiter.auth, githubAuthRoute)
app.use('/api/v1/auth/google', rateLimiter.auth, googleAuthRoute)
app.use('/api/v1/aboutus/', rateLimiter.standard, aboutUsRoute)

module.exports = app