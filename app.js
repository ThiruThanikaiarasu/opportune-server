require('dotenv').config()
const express = require('express')
const app = express()

const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./configurations/swaggerConfig');

app.get('/', (request, response) => {
    response.status(200).send({ message: "Server running successfully."})
})

app.use('/api-doc', swaggerUi.serve, swaggerUi.setup(swaggerSpec))


module.exports = app