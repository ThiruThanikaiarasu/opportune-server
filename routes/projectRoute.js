const express = require('express')
const router = express.Router()

const { addANewProject, searchProjects, filterProjects, homeFeed, searchTags, getAllTags, getMoreProjects } = require('../controllers/projectController')
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
 * /project/home:
 *  get:
 *   tags:
 *    - Project
 *   summary: Retrieve the home feed projects
 *   description: Get a list of projects for the home feed with pagination support.
 *   parameters:
 *    - name: limit
 *      in: query
 *      description: The number of results to return per page. Default is 10.
 *      required: false
 *      schema:
 *       type: string
 *       example: "10"
 *    - name: page
 *      in: query
 *      description: The page number for pagination. Default is 1.
 *      required: false
 *      schema:
 *       type: string
 *       example: "1"
 *   responses:
 *    200:
 *      description: Successfully retrieved home feed projects
 *    500:
 *      description: Internal server error
 */


router.get('/home', homeFeed)


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


/**
 * @swagger
 * /project/filter:
 *  get:
 *   tags:
 *    - Project
 *   summary: Filter projects by tag and sort the results
 *   parameters:
 *    - name: tag
 *      in: query
 *      description: The tag to filter projects by.
 *      required: false
 *      schema: 
 *       type: string
 *    - name: sortBy
 *      in: query
 *      description: The field to sort the results by. Default is "createdAt".
 *      required: false
 *      schema: 
 *       type: string
 *       example: "createdAt"
 *    - name: order
 *      in: query
 *      description: The order of sorting. Can be "asc" or "desc". Default is "desc".
 *      required: false
 *      schema: 
 *       type: string
 *       enum:
 *        - asc
 *        - desc
 *       example: "desc"
 *    - name: limit
 *      in: query
 *      description: The number of results to return. Default is 10.
 *      required: false
 *      schema: 
 *       type: string
 *       example: "10"
 *    - name: page
 *      in: query
 *      description: The page number for pagination. Default is 1.
 *      required: false
 *      schema: 
 *       type: string
 *       example: "1"
 *   responses:
 *    200:
 *      description: Successfully retrieved filtered projects
 *    500:
 *      description: Internal server error
 */

router.get('/filter', filterProjects)


/**
 * @swagger
 * /project/tags:
 *  get:
 *   tags:
 *    - Project
 *   summary: Get all tags
 *   responses:
 *    200:
 *      description: Successfully retrieved all tags
 *    500:
 *      description: Internal server error
 */

router.get('/tags', getAllTags)

/**
 * @swagger
 * /project/tag:
 *  get:
 *   tags:
 *    - Project
 *   summary: Search for tags by keyword
 *   parameters:
 *    - name: keyword
 *      in: query
 *      description: The keyword to search for in tags.
 *      required: false
 *      schema:
 *       type: string
 *   responses:
 *    200:
 *      description: Successfully retrieved tags
 *    500:
 *      description: Internal server error
 */

router.get('/tag', searchTags)


/**
 * @swagger
 * /{username}/{slug}/more:
 *  get:
 *   tags:
 *    - Project
 *   summary: Retrieve more projects from the same author
 *   parameters:
 *    - name: username
 *      in: path
 *      description: The username of the author.
 *      required: true
 *      schema:
 *       type: string
 *       example: johndoe
 *    - name: slug
 *      in: path
 *      description: The slug of the current project.
 *      required: true
 *      schema:
 *       type: string
 *       example: opportune
 *    - name: limit
 *      in: query
 *      description: The number of projects to return.
 *      required: false
 *      schema:
 *       type: integer
 *       default: 10
 *    - name: page
 *      in: query
 *      description: The page number for pagination.
 *      required: false
 *      schema:
 *       type: integer
 *       default: 1
 *   responses:
 *    200:
 *     description: Successfully retrieved more projects by the author
 *    500:
 *     description: Internal server error
 */


router.get('/:username/:slug/more', getMoreProjects)

module.exports = router