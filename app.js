require('dotenv').config()
const express = require('express')
const app = express()

app.get('/', (request, response) => {
    response.status(200).send({ message: "Server running successfully."})
})

module.exports = app