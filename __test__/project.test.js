const request = require('supertest')
const path = require('path')
const fs = require('fs')

const app = require('../app')
const { createNewProject, doesAuthorHaveProjectWithTitle } = require('../services/projectService')
const { findUserById } = require('../services/authService')

jest.mock('../services/projectService.js', () => ({
    doesAuthorHaveProjectWithTitle: jest.fn(),
    createNewProject: jest.fn()
}))

jest.mock('../services/authService.js', () => ({
    findUserById: jest.fn()
}))

describe('Project Creation', () => {

    beforeEach(() => {
        jest.clearAllMocks()
    })

    beforeAll(() => {
        validToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3N2ExNGM5ZDVhZTMwMTZmNjFiMzJkYSIsImlhdCI6MTczNjA1Mzk2MSwiZXhwIjoxNzM4NjQ1OTYxfQ.7QtImhvBK8XliMoL6EHUWlZRCIWutcXkqoYQYMI2OQ4'

        filePath = path.join(__dirname, '..', 'test-assets', 'thumbnail.jpg')
    })

    describe('POST /project', () => {
        describe('Valid input scenario', () => {
            it('should create a new project successfully when valid data is provided', async () => {

                const mockUserData = {
                    email: "thiru.thanikaiarasu12@gmail.com",
                    _id: "677a14c9d5ae3016f61b32da",
                }

                const mockProjectData = {
                    author: '677a14c9d5ae3016f61b32da',
                    title: 'Jotify',
                    slug: 'opportune-server',
                    description: 'A simple blog app.',
                    thumbnail: {
                        originalname: 'thumbnail.png',
                        size: 76021,
                        mimetype: 'image/jpg',
                        s3Key: '90415cdb42362f137f6c66143ac384eecb4524f292a77e76acdc6f5871de7d28'
                    },
                    tags: [ 'Web Development', 'MERN', 'Full Stack' ],
                    githubLink: 'https://github.com/user/project',
                    hostedLink: null,
                    documentation: null,
                    viewsCount: 0,
                    upvoteCount: 0,
                    _id: '677a166086fbcaca52beae5f',
                    createdAt: '2025-01-05T05:19:28.373Z',
                    updatedAt: '2025-01-05T05:19:28.373Z',
                    __v: 0
                }

                findUserById.mockResolvedValue(mockUserData)
                doesAuthorHaveProjectWithTitle.mockResolvedValue(false)
                createNewProject.mockResolvedValue(mockProjectData)

                const response = await request(app)
                    .post('/api/v1/project')
                    .set('Cookie', `SessionID=${validToken}`)
                    .field('title', 'Jotify')
                    .field('description', 'A simple blog app.')
                    .field('slug', 'jotify')
                    .field('tags', 'MERN')
                    .field('tags', 'Web Development')
                    .field('tags', 'Full Stack')
                    .field('githubLink', 'https://github.com/user/project')
                    .attach('thumbnail', filePath)

                expect(response.status).toBe(201)
                expect(response.body).toEqual(
                    expect.objectContaining({
                        message: 'Project created Successfully',
                        error: null,
                        data: mockProjectData,
                    })
                )

                expect(findUserById).toHaveBeenCalledWith('677a14c9d5ae3016f61b32da')
                expect(doesAuthorHaveProjectWithTitle).toHaveBeenCalledWith('677a14c9d5ae3016f61b32da', 'Jotify')
                expect(createNewProject).toHaveBeenCalledTimes(1)


            })
        })

        describe('Duplicate input scenario', () => {
            it('should return 409 error when the title already exists', async () => {
                const mockUserData = {
                    email: "thiru.thanikaiarasu12@gmail.com",
                    _id: "677a14c9d5ae3016f61b32da",
                }
        
                const existingProject = {
                    author: '677a14c9d5ae3016f61b32da',
                    title: 'Jotify',
                    slug: 'opportune-server',
                    description: 'A simple blog app.',
                    tags: [ 'Web Development', 'MERN', 'Full Stack' ],
                    githubLink: 'https://github.com/user/project',
                    hostedLink: null,
                    documentation: null,
                    viewsCount: 0,
                    upvoteCount: 0,
                    _id: '677a166086fbcaca52beae5f',
                }
        
                // Mock the necessary functions
                findUserById.mockResolvedValue(mockUserData)
                doesAuthorHaveProjectWithTitle.mockResolvedValue(true)
        
                const response = await request(app)
                    .post('/api/v1/project')
                    .set('Cookie', `SessionID=${validToken}`)
                    .field('title', 'Jotify') // The title that already exists
                    .field('description', 'A simple blog app.')
                    .field('slug', 'jotify')
                    .field('tags', 'MERN')
                    .field('tags', 'Web Development')
                    .field('tags', 'Full Stack')
                    .field('githubLink', 'https://github.com/user/project')
                    .attach('thumbnail', filePath)
        
                expect(response.status).toBe(409)
                expect(response.body.message).toBe('Title already exists. Please choose a different title.')
        
                expect(doesAuthorHaveProjectWithTitle).toHaveBeenCalledWith('677a14c9d5ae3016f61b32da', 'Jotify')
                expect(createNewProject).not.toHaveBeenCalled()
            })
        })

        describe('Invalid input scenario', () => {
            it('should return 400 error when the title is missing', async () => {
                const response = await request(app)
                    .post('/api/v1/project')
                    .set('Cookie', `SessionID=${validToken}`)
                    .field('description', 'A simple blog app.')
                    .field('slug', 'jotify')
                    .field('tags', 'MERN')
                    .attach('thumbnail', filePath)

                    expect(response.status).toBe(400)
                expect(response.body.message).toBe('Title is a required field')
            })

            it('should return 400 error when the title contains special characters', async () => {
                const response = await request(app)
                    .post('/api/v1/project')
                    .set('Cookie', `SessionID=${validToken}`)
                    .field('title', 'Jotify@2025!') // Invalid title with special characters
                    .field('description', 'A simple blog app.')
                    .field('slug', 'jotify')
                    .field('tags', 'MERN')
                    .attach('thumbnail', filePath)
        
                expect(response.status).toBe(400)
                expect(response.body.message).toBe('Title can only contain letters, numbers, underscores, and spaces')
            })

            it('should return 400 error when the description is missing', async () => {
                const response = await request(app)
                    .post('/api/v1/project')
                    .set('Cookie', `SessionID=${validToken}`)
                    .field('title', 'Jotify')
                    .field('slug', 'jotify')
                    .field('tags', 'MERN')
                    .field('tags', 'Web Development')
                    .field('tags', 'Full Stack')
                    .field('githubLink', 'https://github.com/user/project')
                    .attach('thumbnail', filePath)
        
                expect(response.status).toBe(400)
                expect(response.body.message).toBe('Description is a required field')
            })
        
            it('should return 400 error when tags are missing', async () => {
                const response = await request(app)
                    .post('/api/v1/project')
                    .set('Cookie', `SessionID=${validToken}`)
                    .field('title', 'Jotify')
                    .field('description', 'A simple blog app.')
                    .field('slug', 'jotify')
                    .field('githubLink', 'https://github.com/user/project')
                    .attach('thumbnail', filePath)
        
                expect(response.status).toBe(400)
                expect(response.body.message).toBe('Tags must be an array with at least one and at most three items')
            })

            it('should return 400 error when more than 3 tags are provided', async () => {
                const response = await request(app)
                    .post('/api/v1/project')
                    .set('Cookie', `SessionID=${validToken}`)
                    .field('title', 'Jotify')
                    .field('description', 'A simple blog app.')
                    .field('slug', 'jotify')
                    .field('tags', 'Web Development')
                    .field('tags', 'MERN')
                    .field('tags', 'Full Stack')
                    .field('tags', 'Node.js') 
                    .attach('thumbnail', filePath)
            
                expect(response.status).toBe(400)
                expect(response.body.message).toBe('Tags must be an array with at least one and at most three items')
            })
        
            it('should return 400 error when the githubLink is missing', async () => {
                const response = await request(app)
                    .post('/api/v1/project')
                    .set('Cookie', `SessionID=${validToken}`)
                    .field('title', 'Jotify')
                    .field('description', 'A simple blog app.')
                    .field('slug', 'jotify')
                    .field('tags', 'MERN')
                    .field('tags', 'Web Development')
                    .field('tags', 'Full Stack')
                    .attach('thumbnail', filePath)
        
                expect(response.status).toBe(400)
                expect(response.body.message).toBe('GitHub link is a required field')
            })
            
        })
        

        
    })
    
})
