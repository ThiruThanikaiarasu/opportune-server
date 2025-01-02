const express = require('express')
const app = express()

app.get('/', (request, response) => {
    response.status(200).send({ message: "Server running successfully."})
})

app.listen(3500, console.log(`Server is running at http://localhost:3500`))