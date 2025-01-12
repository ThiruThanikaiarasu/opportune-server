const app = require('../app')
const request = require('supertest')
const bcrypt = require('bcrypt');

const { findAuthUserByEmail, createOtp, generateOtp } = require('../services/authService')
const { findUserByEmail, createUser } = require('../services/userService')
const { setTokenCookie, generateToken } = require('../utils/tokenServices')

jest.mock('../services/authService', () => ({
    findAuthUserByEmail: jest.fn(),
    createOtp: jest.fn(),
    generateOtp : jest.fn()
}))

jest.mock('../services/userService', () => ({
    findUserByEmail: jest.fn(),
    createUser: jest.fn()
}))

jest.mock('../utils/Services',()=> ({
    generateToken: jest.fn(),
    setTokenCookie: jest.fn()
}))

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
}));

describe('Authentication', () => {

    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('POST/signup', () => {
        describe('Valid input scenario', () => {
            it('should create a new user successfully when valid data is provided', async () => {
                
                const mockUserData = { name:'sudhar',username: 'sudhar', email: 'sudhar@gmail.com' ,password : 'Sudhar1234@' }
    
                findUserByEmail.mockResolvedValue(null) 
                createOtp.mockResolvedValue(mockUserData) 
                
                const response = await request(app)
                    .post('/api/v1/auth/signup')
                    .send({
                        name:'sudhar',
                        username: 'sudhar',
                        email: 'sudhar@gmail.com',
                        password: 'Sudhar1234@',
                    })
                
                expect(response.status).toBe(201)
                expect(response.body).toEqual(
                    expect.objectContaining({
                        message: 'OTP sent successfully'
                    })
                )
                expect(findUserByEmail).toHaveBeenCalledWith('sudhar@gmail.com')
                expect(createOtp).toHaveBeenCalledWith('sudhar@gmail.com','sudhar', 'sudhar', 'Sudhar1234@')
            })

            it('should return an error message when trying to sign up with an already existing email', async () => {

                const mockUserData = {name:'sudhar', username: 'sudhar', email: 'sudhar@gmail.com' ,password : 'Sudhar1234@' }

                findUserByEmail.mockResolvedValue(mockUserData)  

                const response = await request(app)
                    .post('/api/v1/auth/signup')
                    .send({
                        name:'sudhar',
                        username: 'sudhar',
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
                    expect(createOtp).not.toHaveBeenCalled()
            })

            describe('Invalid input scenario', () => {
                it('should return an error message when the username is missing', async () => {
                    const response = await request(app)
                        .post('/api/v1/auth/signup')
                        .send({
                            name : 'sudhar',
                            email: 'sudhar@gmail.com',
                            password: 'sudhar1234@',
                        })
            
                    expect(response.status).toBe(400)
                    expect(response.body).toEqual(
                        expect.objectContaining({
                            message: 'Username is a required field',
                        })
                    )
                })
            
                it('should return an error message when the username contains invalid characters', async () => {
                    const response = await request(app)
                        .post('/api/v1/auth/signup')
                        .send({
                            name: 'sudhar',
                            username: 'sudhar@123',
                            email: 'sudhar@gmail.com',
                            password: 'sudhar1234@',
                        })
            
                    expect(response.status).toBe(400)
                    expect(response.body).toEqual(
                        expect.objectContaining({
                            message: 'Username can only contain letters, numbers, hyphens (-), and underscores (_), and must not start or end with a hyphen or underscore',
                        })
                    )
                })
            
                it('should return an error message when the username exceeds 39 characters', async () => {
                    const response = await request(app)
                        .post('/api/v1/auth/signup')
                        .send({
                            name: 'sudhar',
                            username: 'T'.repeat(51),
                            email: 'sudhar@gmail.com',
                            password: 'sudhar1234@',
                        })
            
                    expect(response.status).toBe(400)
                    expect(response.body).toEqual(
                        expect.objectContaining({
                            message: 'Username must not exceed 39 characters',
                        })
                    )
                })
            
                it('should return an error message when the email is missing', async () => {
                    const response = await request(app)
                        .post('/api/v1/auth/signup')
                        .send({
                            name: 'sudhar',
                            username: 'sudhar',
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
                            username: 'sudhar',
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
                            username: 'sudhar',
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
                            username: 'sudhar',
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
                            username: 'sudhar',
                            email: 'sudhar@gmail.com',
                            password: 'Th1@',
                        })
            
                    expect(response.status).toBe(400)
                    expect(response.body).toEqual(
                        expect.objectContaining({
                            message: 'Password must be minimum 8 and maximum 20 characters',
                        })
                    )
                })
            
                it('should return an error message when the password is too long', async () => {
                    const response = await request(app)
                        .post('/api/v1/auth/signup')
                        .send({
                            name: 'sudhar',
                            username: 'sudhar',
                            email: 'sudhar@gmail.com',
                            password: 'sudhar'.repeat(5) + '1@',
                        })
            
                    expect(response.status).toBe(400)
                    expect(response.body).toEqual(
                        expect.objectContaining({
                            message: 'Password must be minimum 8 and maximum 20 characters',
                        })
                    )
                })
            
                it('should return an error message when the password does not contain at least one lowercase letter', async () => {
                    const response = await request(app)
                        .post('/api/v1/auth/signup')
                        .send({
                            name: 'sudhar',
                            username: 'sudhar',
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
                            username: 'sudhar',
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
                            username: 'sudhar',
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
                            username: 'sudhar',
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
    
    describe('POST /resendOtp', () => {
        describe('Valid input scenario', () => {
          it('should send OTP successfully for a new user', async () => {
            const mockEmail = 'sudhar@gmail.com';

            findUserByEmail.mockResolvedValue(null);
            generateOtp.mockResolvedValue(mockEmail); 
          
            const response = await request(app)
              .post('/api/v1/auth/resendOtp')
              .send({ email: mockEmail });
          
            expect(response.status).toBe(201);
            expect(response.body).toEqual(
              expect.objectContaining({
                message: 'OTP sent successfully',
              })
            );
            expect(findUserByEmail).toHaveBeenCalledWith(mockEmail);
            expect(generateOtp).toHaveBeenCalledWith(mockEmail);
          });
      
          it('should return 409 if the user already exists', async () => {
            const mockEmail = 'existinguser@gmail.com';
        
            findUserByEmail.mockResolvedValue({ email: mockEmail }); 
        
            const response = await request(app)
              .post('/api/v1/auth/resendOtp')
              .send({ email: mockEmail });
        
            ;
            expect(response.status).toBe(409);
            expect(response.body).toEqual(
              expect.objectContaining({
                message: 'User already exist',
              })
            );
            expect(findUserByEmail).toHaveBeenCalledWith(mockEmail);
            expect(generateOtp).not.toHaveBeenCalled();
          });
        });
      
        describe('Invalid input scenario', () => {
          it('should return 400 if email is missing', async () => {
            const response = await request(app)
              .post('/api/v1/auth/resendOtp')
              .send({}); 
        
            ;
            expect(response.status).toBe(400);
            expect(response.body).toEqual(
              expect.objectContaining({
                message: 'Email is a required field',
              })
            );
            expect(findUserByEmail).not.toHaveBeenCalled();
            expect(generateOtp).not.toHaveBeenCalled();
          });
      
          it('should return 400 if email format is invalid', async () => {
            const mockEmail = 'invalidemail'; 
        
            const response = await request(app)
              .post('/api/v1/auth/resendOtp')
              .send({ email: mockEmail });
        
            ;
            expect(response.status).toBe(400);
            expect(response.body).toEqual(
              expect.objectContaining({
                message: 'Invalid email format',
              })
            );
            expect(findUserByEmail).not.toHaveBeenCalled();
            expect(generateOtp).not.toHaveBeenCalled();
          });
      
          it('should return 500 if an error occurs in the OTP generation service', async () => {
            const mockEmail = 'sudhar@gmail.com';

            findUserByEmail.mockResolvedValue(null);
            generateOtp.mockRejectedValue(new Error('OTP generation failed'));
        
            const response = await request(app)
              .post('/api/v1/auth/resendOtp')
              .send({ email: mockEmail });
        
            ;
            expect(response.status).toBe(500);
            expect(response.body).toEqual(
              expect.objectContaining({
                message: 'OTP generation failed',
              })
            );
            expect(findUserByEmail).toHaveBeenCalledWith(mockEmail);
            expect(generateOtp).toHaveBeenCalledWith(mockEmail);
          });
        
          it('should return 400 if validation middleware catches an invalid input', async () => {
            const mockEmail = ''; // Empty email input
        
            const response = await request(app)
              .post('/api/v1/auth/resendOtp')
              .send({ email: mockEmail });
        
            expect(response.status).toBe(400);
            expect(response.body).toEqual(
              expect.objectContaining({
                message: 'Email is a required field',
              })
            );
            expect(findUserByEmail).not.toHaveBeenCalled();
            expect(generateOtp).not.toHaveBeenCalled();
          });
        });     
      });
      
      describe('POST /verifyOtp', () => {
        const endpoint = '/api/v1/auth/verifyOtp';
        
        describe('Valid input scenarios', () => {
          it('should verify OTP successfully for a valid user', async () => {
            const mockEmail = 'sudhar@gmail.com';
            const mockOtp = '123456';
            const mockUserData = {
              email: mockEmail,
              otp: mockOtp,
              name: 'Sudhar',
              username: 'sudhar',
              password: 'hashedPassword',
            };
        
            // Mock the service calls
            findAuthUserByEmail.mockResolvedValue(mockUserData);
            createUser.mockResolvedValue(mockUserData);
            generateToken.mockReturnValue('mockToken');
            setTokenCookie.mockImplementation(() => {});
        
            const response = await request(app).post(endpoint).send({
              email: mockEmail,
              otp: mockOtp,
            });
        
            expect(response.status).toBe(200);
            expect(response.body).toEqual(
              expect.objectContaining({
                message: 'Verification successful',
              })
            );
            expect(findAuthUserByEmail).toHaveBeenCalledWith(mockEmail);
            expect(createUser).toHaveBeenCalledWith(
              mockUserData.name,
              mockUserData.username,
              mockUserData.email,
              mockUserData.password
            );
            expect(generateToken).toHaveBeenCalledWith(mockUserData);
            expect(setTokenCookie).toHaveBeenCalled();
          });
        });
      
        describe('Invalid input scenarios', () => {
          it('should return validation error if request body is invalid', async () => {
            const response = await request(app).post(endpoint).send({ email: '', otp: '' });
      
            expect(response.status).toBe(400);
            expect(response.body).toEqual(
              expect.objectContaining({
                message: expect.any(String), 
                error: 'validation_error',
              })
            );
          });
      
          it('should return 410 if OTP is expired', async () => {
            const mockEmail = 'expireduser@gmail.com';
        
            findAuthUserByEmail.mockResolvedValue(null); 
        
            const response = await request(app).post(endpoint).send({
              email: mockEmail,
              otp: '123456',
            });
        
            expect(response.status).toBe(410);
            expect(response.body).toEqual(
              expect.objectContaining({
                message: 'OTP expired. Request new one.',
                error: 'otp_expired',
              })
            );
            expect(findAuthUserByEmail).toHaveBeenCalledWith(mockEmail);
          });
        
          it('should return 401 if OTP does not match', async () => {
            const mockEmail = 'sudhar@gmail.com';
            const mockOtp = '123456';
        
            findAuthUserByEmail.mockResolvedValue({
              email: mockEmail,
              otp: '654321', 
            });
        
            const response = await request(app).post(endpoint).send({
              email: mockEmail,
              otp: mockOtp,
            });
        
            expect(response.status).toBe(401);
            expect(response.body).toEqual(
              expect.objectContaining({
                message: 'Incorrect OTP',
                error: 'verification_failed',
              })
            );
            expect(findAuthUserByEmail).toHaveBeenCalledWith(mockEmail);
          });
      
          it('should return 500 if an unexpected error occurs', async () => {
            const mockEmail = 'sudhar@gmail.com';
            const mockOtp = '123456';
        
            findAuthUserByEmail.mockRejectedValue(new Error('Database error'));
        
            const response = await request(app).post(endpoint).send({
              email: mockEmail,
              otp: mockOtp,
            });
        
            expect(response.status).toBe(500);
            expect(response.body).toEqual(
              expect.objectContaining({
                message: 'Database error',
                error: 'server_error',
              })
            );
            expect(findAuthUserByEmail).toHaveBeenCalledWith(mockEmail);
          });
        });
      });     

      describe('POST /login', () => {
        const endpoint = '/api/v1/auth/login';
      
        describe('Valid input scenarios', () => {
          it('should log in successfully for a valid user', async () => {
            const mockEmail = 'sudhar@gmail.com';
            const mockPassword = 'Password!123';
            const mockHashedPassword = '$2b$12$BCcbna240rC./pqOqs8CaOM6vGcf5pXmxcx4LGJWCEjootd9uzeou'; // example hashed password
            const mockUserData = {
              email: mockEmail,
              password: mockHashedPassword,
              username: 'sudhar',
            };
            
            findUserByEmail.mockResolvedValue(mockUserData);
            bcrypt.compare.mockResolvedValue(true);
            generateToken.mockReturnValue('mockToken');
            setTokenCookie.mockImplementation(() => {});
      
            const response = await request(app).post(endpoint).send({
              email: mockEmail,
              password: mockPassword,
            });

            expect(response.status).toBe(200);
            expect(response.body).toEqual(
              expect.objectContaining({
                message: 'Logged in Successfully',
              })
            );
            expect(findUserByEmail).toHaveBeenCalledWith(mockEmail);
            expect(bcrypt.compare).toHaveBeenCalledWith(mockPassword, mockHashedPassword);
            expect(generateToken).toHaveBeenCalledWith(mockUserData);
            expect(setTokenCookie).toHaveBeenCalledWith(expect.any(Object), 'mockToken');
          });
        });
      
        describe('Invalid input scenarios', () => {
          it('should return an error for invalid email', async () => {
            const mockEmail = 'sudhar@gmail.com';
            const mockPassword = 'Password!123';
      
            findUserByEmail.mockResolvedValue(null);
      
            const response = await request(app).post(endpoint).send({
              email: mockEmail,
              password: mockPassword,
            });
          
            expect(response.status).toBe(401);
            expect(response.body).toEqual(
              expect.objectContaining({
                message: 'Invalid email address',
              })
            );
            expect(findUserByEmail).toHaveBeenCalledWith(mockEmail);
          });
      
          it('should return an error for invalid password', async () => {
            const mockEmail = 'sudhar@gmail.com';
            const mockPassword = 'Password!123';
            const mockHashedPassword = '$2b$10$z5pS12eq6cVZb2g8rm9nQO2P8OW3eAq5DNbuw9OlgV.H.I7S/FyWm'; // example hashed password
            const mockUserData = {
              email: mockEmail,
              password: mockHashedPassword,
              username: 'sudhar',
            };
      
            findUserByEmail.mockResolvedValue(mockUserData);
            bcrypt.compare.mockResolvedValue(false);
      
            const response = await request(app).post(endpoint).send({
              email: mockEmail,
              password: mockPassword,
            });
            
            expect(response.status).toBe(401);
            expect(response.body).toEqual(
              expect.objectContaining({
                message: 'Invalid password',
              })
            );
            expect(findUserByEmail).toHaveBeenCalledWith(mockEmail);
            expect(bcrypt.compare).toHaveBeenCalledWith(mockPassword, mockHashedPassword);
          });
        });
      
        describe('Error handling', () => {
          it('should handle server errors gracefully', async () => {
            const mockEmail = 'sudhar@gmail.com';
            const mockPassword = 'Password!123'
            findUserByEmail.mockImplementation(() => {
              throw new Error('Server error');
            });
      
            const response = await request(app).post(endpoint).send({
              email: mockEmail,
              password: mockPassword,
            });
            
            expect(response.status).toBe(500);
            expect(response.body).toEqual(
              expect.objectContaining({
                message: 'Server error',
              })
            );
          });
        });
      });
})
