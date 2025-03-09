const express = require('express')
const router = express.Router()

const upload = require('../middleware/fileUpload')
const { addAboutUsImage } = require('../controllers/aboutUsController')

/**
 * @swagger
 * /aboutus/images:
 *  post:
 *   tags: 
 *    - About Us
 *   summary: Upload multiple About Us Images (max 10)
 *   requestBody:
 *    required: true
 *    content: 
 *     multipart/form-data: 
 *      schema:
 *       type: object
 *       required: 
 *         - images
 *       properties: 
 *         title: 
 *           type: string
 *           example: "Company Vision"
 *         images: 
 *           type: array
 *           maxItems: 10
 *           items:
 *             type: string
 *             format: binary
 *         description: 
 *           type: string
 *           example: "A brief description about our company vision."
 *         order:
 *           type: number
 *           example: 1
 *   responses: 
 *       201:
 *         description: About Us Images uploaded successfully
 *       400:
 *         description: Input validation error (e.g., more than 10 images uploaded)
 *       503:
 *         description: Service unavailable, temporarily unable to handle the request
 */

router.post('/image', upload.array('images', 10), addAboutUsImage)

module.exports = router