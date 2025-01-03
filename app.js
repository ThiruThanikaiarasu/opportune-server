require('dotenv').config()
const express = require('express')
const app = express()

const cors = require('cors')
const swaggerUi = require('swagger-ui-express')
const cookieParser = require('cookie-parser')

const swaggerSpec = require('./configurations/swaggerConfig') 
const authRoute = require('./routes/authRoute')


app.use(cors())
app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({extended:true}))

app.get('/', (request, response) => {
    response.status(200).send({ message: "Server running successfully."})
})

app.use('/api-doc', swaggerUi.serve, swaggerUi.setup(swaggerSpec))
app.use('/api/v1/auth',authRoute)

module.exports = app