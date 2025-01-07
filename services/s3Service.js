const crypto = require('crypto')
const { PutObjectCommand, DeleteObjectCommand } = require('@aws-sdk/client-s3')

const s3 = require("../configurations/s3Config")
const UploadError = require("../errors/UploadError")


const generateRandomImageName = () => crypto.randomBytes(32).toString('hex')

const uploadToS3 = async (thumbnail) => {
    const imageName = generateRandomImageName()

    const params = {
        Bucket: process.env.BUCKET_NAME,
        Key: imageName,
        Body: thumbnail.buffer,
        ContentType: thumbnail.mimetype,
        ACL: 'bucket-owner-full-control'
    }

    try{
        await s3.send(new PutObjectCommand(params))
        return imageName
    } 
    catch(error) {
        throw new UploadError("Failed to upload image. Please try again later.", 503)
    }
}

const deleteFromS3 = async (s3Key) => {
    try {
        const params = {
            Bucket: process.env.BUCKET_NAME,
            Key: s3Key
        }
    
        await s3.send(new DeleteObjectCommand(params))
    }
    catch(error) {
        throw new UploadError("Failed to delete old image from S3. Please try again later.", 503)
    }
}

module.exports = {
    uploadToS3,
    deleteFromS3
}