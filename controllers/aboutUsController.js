const UploadError = require("../errors/UploadError")
const { addImagesToDB } = require("../services/aboutUsService")
const { setResponseBody } = require("../utils/responseFormatter")

const addAboutUsImage = async (request, response) => {
    const { title, description, order } = request.body
    const images = request.files
    try {
        if (!request.files || request.files.length === 0) {
            return response.status(400).send(setResponseBody("At least one image is required", "bad_request", null))
        }

        await addImagesToDB(images, title, description, order)

        response.status(201).send(setResponseBody("Images uploaded successfully", "success", null))
    }
    catch(error) {
        console.log(error)
        if(error instanceof UploadError) {
            return response.status(error.statusCode).send(setResponseBody(error.message, "service_unavailable", null))
        }

        response.status(500).send(setResponseBody(error.message, "server_error", null))
    }
}

module.exports = {
    addAboutUsImage
}