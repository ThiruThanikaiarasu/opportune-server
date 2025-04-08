const { S3_BASE_URL } = require("../configurations/constants")
const { uploadToS3 } = require("./s3Service")
const aboutUsImageModel = require("../models/aboutUsImageModel")

const addImagesToDB = async (images, title = "", description = "", order = 0) => {
    try {
        const uploadedImages = await Promise.all(
            images.map(async (image) => {
                const imageS3Key = await uploadToS3(image)
                const imageUrl = S3_BASE_URL + imageS3Key

                return {
                    title,
                    description,
                    order,
                    imageUrl
                }
            })
        )

        await aboutUsImageModel.insertMany(uploadedImages)
    }
    catch(error) {
        throw error
    }
}

const getAllAboutUsImagesFromDB = () => {
    return aboutUsImageModel.find().sort({ order: 1 })
}

module.exports = {
    addImagesToDB,
    getAllAboutUsImagesFromDB
}