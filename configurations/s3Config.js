const { S3Client} = require('@aws-sdk/client-s3')

const s3 = new S3Client(
    {
        credentials: {
            accessKeyId: process.env.BUCKET_ACCESS_KEY,
            secretAccessKey: process.env.BUCKET_SECRET_KEY
        },
        region: process.env.BUCKET_REGION
    }
)

module.exports = s3