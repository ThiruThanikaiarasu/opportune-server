const express = require('express')
const router = express.Router()

const { addANewProject } = require('../controllers/projectController')
const upload = require('../middleware/fileUpload')


/**
 * @swagger
 * /project:
 *  post:
 *   tags: 
 *    - Project
 *   summary: Create a new project
 *   requestBody:
 *    required: true
 *    content: 
 *     application/json: 
 *      schema:
 *       type: object
 *       required: 
 *         - author
 *         - title
 *         - description
 *         - thumbnail
 *         - tags
 *         - githubLink
 *       properties: 
 *         author: 
 *           type: string
 *           example: 66070b26334405fc15d70fa0
 *         title: 
 *           type: string
 *           example: opportune
 *         description: 
 *           type: string
 *           example: Find Talent by Projects, Not GPAs.
 *         thumbnail: 
 *           type: string
 *           format: binary
 *           example: https://my-bucket.s3.amazonaws.com/thumbnails/project-thumbnail.jpg
 *         tags: 
 *           type: array
 *           items: 
 *             type: string     
 *           example: ["MERN", "AWS"]
 *         githubLink: 
 *           type: string
 *           example: https://github.com/user/project
 *         hostedLink: 
 *           type: string
 *           example: https://myproject.com
 *         documentation: 
 *           type: string
 *           example: https://docs.myproject.com
 *   responses: 
 *       200:
 *         description: Project created successfully
*/

router.post('/', upload.single('thumbnail'), addANewProject)

module.exports = router