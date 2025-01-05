const express = require('express')
const router = express.Router()

const { addANewProject, searchProjects } = require('../controllers/projectController')
const upload = require('../middleware/fileUpload')
const { verifyUser } = require('../middleware/authMiddleware')
const { validateProjectInputValues } = require('../validators/projectValidator')


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
 *       201:
 *         description: Project created successfully
 *       400:
 *         description: Input Validation error
 *       409:
 *         description: Conflict, Project with same Title already exist
 *       503:
 *         description: Service unavailable, temporarily unable to handle the request
*/

router.post('/', verifyUser, upload.single('thumbnail'), validateProjectInputValues, addANewProject)


/**
 * @swagger
 * /project/search:
 *  get:
 *   tags:
 *    - Project
 *   summary: Search for projects by keyword
 *   parameters:
 *    - name: keyword
 *      in: query
 *      description: The keyword to search for in project title, description and tags. 
 *      required: true
 *      schema: 
 *       type: string 
 *    - name: limit
 *      in: query
 *      description: The number of results to return. 
 *      required: false
 *      schema: 
 *       type: string 
 *    - name: page
 *      in: query
 *      description: The page number for pagination. 
 *      required: false
 *      schema: 
 *       type: string 
 *   responses: 
 *    200:
 *      description: Successfully retrieved projects
 *    400:
 *      description: Missing keyword in the query parameters
 *    500:
 *      description: Internal server error
 */

router.get('/search', searchProjects)

module.exports = router