const app = require('../app')
const request = require('supertest')
const { findUserByEmail, createUser } = require('../services/authService')

jest.mock('../services/authService', () => ({
    findUserByEmail: jest.fn(),
    createUser: jest.fn(),
}))

describe('Authentication', () => {

    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('POST/signup', () => {
        describe('Valid input scenario', () => {
            it('should create a new user successfully when valid data is provided', async () => {
                
                const mockUserData = { name: 'sudhar', email: 'sudhar@gmail.com' ,password : 'Sudhar1234@' }
    
                findUserByEmail.mockResolvedValue(null) 
                createUser.mockResolvedValue(mockUserData) 
    
                
                const response = await request(app)
                    .post('/api/v1/auth/signup')
                    .send({
                        name: 'sudhar',
                        email: 'sudhar@gmail.com',
                        password: 'Sudhar1234@',
                    })
                
                expect(response.status).toBe(201)
                expect(response.body).toEqual(
                    expect.objectContaining({
                        message: 'User Created Successfully',
                        data: mockUserData,
                    })
                )
                expect(findUserByEmail).toHaveBeenCalledWith('sudhar@gmail.com')
                expect(createUser).toHaveBeenCalledWith('sudhar', 'sudhar@gmail.com', 'Sudhar1234@')
            })
        })
        
        describe('Invalid input scenario', () => {
            it('should return an error message when trying to sign up with an already existing email', async () => {

                const mockUserData = { name: 'sudhar', email: 'sudhar@gmail.com' ,password : 'Sudhar1234@' }

                findUserByEmail.mockResolvedValue(mockUserData)  

                const response = await request(app)
                    .post('/api/v1/auth/signup')
                    .send({
                        name: 'sudhar',
                        email: 'sudhar@gmail.com',
                        password: 'Sudhar1234@',
                    })

                    expect(response.status).toBe(409)
                    expect(response.body).toEqual(
                        expect.objectContaining({
                            message: 'User already exist',
                        })
                    )
                    expect(findUserByEmail).toHaveBeenCalledWith('sudhar@gmail.com')
                    expect(createUser).not.toHaveBeenCalled()
            })

            describe('Invalid input scenario', () => {
                it('should return an error message when the name is missing', async () => {
                    const response = await request(app)
                        .post('/api/v1/auth/signup')
                        .send({
                            email: 'sudhar@gmail.com',
                            password: 'sudhar1234@',
                        })
            
                    expect(response.status).toBe(400)
                    expect(response.body).toEqual(
                        expect.objectContaining({
                            message: 'Name is a required field',
                        })
                    )
                })
            
                it('should return an error message when the name contains invalid characters', async () => {
                    const response = await request(app)
                        .post('/api/v1/auth/signup')
                        .send({
                            name: 'sudhar@123',
                            email: 'sudhar@gmail.com',
                            password: 'sudhar1234@',
                        })
            
                    expect(response.status).toBe(400)
                    expect(response.body).toEqual(
                        expect.objectContaining({
                            message: 'Name must contain only letters and spaces of upto ',
                        })
                    )
                })
            
                it('should return an error message when the name exceeds 50 characters', async () => {
                    const response = await request(app)
                        .post('/api/v1/auth/signup')
                        .send({
                            name: 'T'.repeat(51),
                            email: 'sudhar@gmail.com',
                            password: 'sudhar1234@',
                        })
            
                    expect(response.status).toBe(400)
                    expect(response.body).toEqual(
                        expect.objectContaining({
                            message: 'Name must not exceed 50 characters',
                        })
                    )
                })
            
                it('should return an error message when the email is missing', async () => {
                    const response = await request(app)
                        .post('/api/v1/auth/signup')
                        .send({
                            name: 'sudhar',
                            password: 'sudhar1234@',
                        })
            
                    expect(response.status).toBe(400)
                    expect(response.body).toEqual(
                        expect.objectContaining({
                            message: 'Email is a required field',
                        })
                    )
                })
            
                it('should return an error message when the email is invalid', async () => {
                    const response = await request(app)
                        .post('/api/v1/auth/signup')
                        .send({
                            name: 'sudhar',
                            email: 'invalid-email',
                            password: 'sudhar1234@',
                        })
            
                    expect(response.status).toBe(400)
                    expect(response.body).toEqual(
                        expect.objectContaining({
                            message: 'Invalid email format',
                        })
                    )
                })
            
                it('should return an error message when the email exceeds 254 characters', async () => {
                    const response = await request(app)
                        .post('/api/v1/auth/signup')
                        .send({
                            name: 'sudhar',
                            email: `${'a'.repeat(254)}@gmail.com`,
                            password: 'sudhar1234@',
                        })
            
                    expect(response.status).toBe(400)
                    expect(response.body).toEqual(
                        expect.objectContaining({
                            message: 'Email must not exceed 254 characters',
                        })
                    )
                })
            
                it('should return an error message when the password is missing', async () => {
                    const response = await request(app)
                        .post('/api/v1/auth/signup')
                        .send({
                            name: 'sudhar',
                            email: 'sudhar@gmail.com',
                        })
            
                    expect(response.status).toBe(400)
                    expect(response.body).toEqual(
                        expect.objectContaining({
                            message: 'Password is required',
                        })
                    )
                })
            
                it('should return an error message when the password is too short', async () => {
                    const response = await request(app)
                        .post('/api/v1/auth/signup')
                        .send({
                            name: 'sudhar',
                            email: 'sudhar@gmail.com',
                            password: 'Th1@',
                        })
            
                    expect(response.status).toBe(400)
                    expect(response.body).toEqual(
                        expect.objectContaining({
                            message: 'Password must be minimum 8 and maximum  20 characters',
                        })
                    )
                })
            
                it('should return an error message when the password is too long', async () => {
                    const response = await request(app)
                        .post('/api/v1/auth/signup')
                        .send({
                            name: 'sudhar',
                            email: 'sudhar@gmail.com',
                            password: 'sudhar'.repeat(5) + '1@',
                        })
            
                    expect(response.status).toBe(400)
                    expect(response.body).toEqual(
                        expect.objectContaining({
                            message: 'Password must be minimum 8 and maximum  20 characters',
                        })
                    )
                })
            
                it('should return an error message when the password does not contain at least one lowercase letter', async () => {
                    const response = await request(app)
                        .post('/api/v1/auth/signup')
                        .send({
                            name: 'sudhar',
                            email: 'sudhar@gmail.com',
                            password: 'SUDHAR1234@',
                        })
            
                    expect(response.status).toBe(400)
                    expect(response.body).toEqual(
                        expect.objectContaining({
                            message: 'Password must contain at least one lowercase letter',
                        })
                    )
                })
            
                it('should return an error message when the password does not contain at least one uppercase letter', async () => {
                    const response = await request(app)
                        .post('/api/v1/auth/signup')
                        .send({
                            name: 'sudhar',
                            email: 'sudhar@gmail.com',
                            password: 'sudhar1234@',
                        })
            
                    expect(response.status).toBe(400)
                    expect(response.body).toEqual(
                        expect.objectContaining({
                            message: 'Password must contain at least one uppercase letter',
                        })
                    )
                })
            
                it('should return an error message when the password does not contain at least one number', async () => {
                    const response = await request(app)
                        .post('/api/v1/auth/signup')
                        .send({
                            name: 'sudhar',
                            email: 'sudhar@gmail.com',
                            password: 'Sudhar@@@@',
                        })
            
                    expect(response.status).toBe(400)
                    expect(response.body).toEqual(
                        expect.objectContaining({
                            message: 'Password must contain at least one number',
                        })
                    )
                })
            
                it('should return an error message when the password does not contain at least one special character', async () => {
                    const response = await request(app)
                        .post('/api/v1/auth/signup')
                        .send({
                            name: 'sudhar',
                            email: 'sudhar@gmail.com',
                            password: 'Sudhar1234',
                        })
            
                    expect(response.status).toBe(400)
                    expect(response.body).toEqual(
                        expect.objectContaining({
                            message: 'Password must contain at least one special character',
                        })
                    )
                })
            })
            
        })
        
    })

})
