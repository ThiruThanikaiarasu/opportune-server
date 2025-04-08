const request = require('supertest');
const app = require('../app'); 
const { findUserNameAlreadyExists, findUserByEmail, updateUserPassword } = require('../services/userService'); 

jest.mock('../services/userService' ,() =>({
    findUserNameAlreadyExists: jest.fn(),
    findUserByEmail: jest.fn(),
    updateUserPassword: jest.fn()
}))

describe('POST /checkUsername', () => {
    describe('Valid input scenario', () => {
      it('should return 200 if the username is available', async () => {
        const mockUsername = 'newUsername123';
  
        findUserNameAlreadyExists.mockResolvedValue(null); // No user with this username
  
        const response = await request(app)
          .post('/api/v1/user/checkUsername')
          .send({ username: mockUsername });
  
        expect(response.status).toBe(200);
        expect(response.body).toEqual(
          expect.objectContaining({
            message: 'Username is available',
          })
        );
        expect(findUserNameAlreadyExists).toHaveBeenCalledWith(mockUsername);
      });
  
      it('should return 200 if the username is available (username with special characters)', async () => {
        const mockUsername = 'newusername_123';
  
        findUserNameAlreadyExists.mockResolvedValue(null); // No user with this username
  
        const response = await request(app)
          .post('/api/v1/user/checkUsername')
          .send({ username: mockUsername });
        
        expect(response.status).toBe(200);
        expect(response.body).toEqual(
          expect.objectContaining({
            message: 'Username is available',
          })
        );
        expect(findUserNameAlreadyExists).toHaveBeenCalledWith(mockUsername);
      });
    });
  
    describe('Invalid input scenario', () => {
      it('should return 400 if username is missing', async () => {
        const response = await request(app)
          .post('/api/v1/user/checkUsername')
          .send({}); // Empty body, no username
        
        console.log(response.body)
        expect(response.status).toBe(400);
        expect(response.body).toEqual(
          expect.objectContaining({
            message: 'Username is a required field',
          })
        );
        expect(findUserNameAlreadyExists).toHaveBeenCalled();
      });
  
      it('should return 400 if username fails validation', async () => {
        const mockUsername = 'a'; // Invalid username (too short)
  
        const response = await request(app)
          .post('/api/v1/user/checkUsername')
          .send({ username: mockUsername });
  
        expect(response.status).toBe(400);
        expect(response.body).toEqual(
          expect.objectContaining({
            message: 'Username must be at least 3 character long',
          })
        );
        expect(findUserNameAlreadyExists).toHaveBeenCalled();
      });
  
      it('should return 409 if the username already exists', async () => {
        const mockUsername = 'existingUsername';
  
        findUserNameAlreadyExists.mockResolvedValue(true); // Username already exists
  
        const response = await request(app)
          .post('/api/v1/user/checkUsername')
          .send({ username: mockUsername });
  
        expect(response.status).toBe(409);
        expect(response.body).toEqual(
          expect.objectContaining({
            message: 'Username already exists',
          })
        );
        expect(findUserNameAlreadyExists).toHaveBeenCalledWith(mockUsername);
      });
  
      it('should return 500 if an error occurs in the database query', async () => {
        const mockUsername = 'someUsername';
  
        findUserNameAlreadyExists.mockRejectedValue(new Error('Database error')); // Simulating a DB error
  
        const response = await request(app)
          .post('/api/v1/user/checkUsername')
          .send({ username: mockUsername });
  
        expect(response.status).toBe(500);
        expect(response.body).toEqual(
          expect.objectContaining({
            message: 'Database error',
          })
        );
        expect(findUserNameAlreadyExists).toHaveBeenCalledWith(mockUsername);
      });
  
      it('should return 400 if the username is too long', async () => {
        const mockUsername = 'a'.repeat(256); // Username too long (greater than 255 characters)
  
        const response = await request(app)
          .post('/api/v1/user/checkUsername')
          .send({ username: mockUsername });
  
        expect(response.status).toBe(400);
        expect(response.body).toEqual(
          expect.objectContaining({
            message: 'Username must not exceed 20 characters',
          })
        );
        expect(findUserNameAlreadyExists).toHaveBeenCalled();
      });
  
      it('should return 400 if username contains spaces', async () => {
        const mockUsername = 'username with spaces';
  
        const response = await request(app)
          .post('/api/v1/user/checkUsername')
          .send({ username: mockUsername });
  
        expect(response.status).toBe(400);
        expect(response.body).toEqual(
          expect.objectContaining({
            message: 'Username can only contain letters, numbers, hyphens (-), and underscores (_), and must not start or end with a hyphen or underscore',
          })
        );
        expect(findUserNameAlreadyExists).toHaveBeenCalled();
      });
  
      it('should return 400 if username contains special characters', async () => {
        const mockUsername = 'username@123!';
  
        const response = await request(app)
          .post('/api/v1/user/checkUsername')
          .send({ username: mockUsername });
  
        expect(response.status).toBe(400);
        expect(response.body).toEqual(
          expect.objectContaining({
            message: 'Username can only contain letters, numbers, hyphens (-), and underscores (_), and must not start or end with a hyphen or underscore',
          })
        );
        expect(findUserNameAlreadyExists).toHaveBeenCalled();
      });
    });
  
    describe('Edge cases', () => {
      it('should return 409 if the username already exists (case insensitive)', async () => {
        const mockUsername = 'existingusername'; // Check case insensitivity
  
        findUserNameAlreadyExists.mockResolvedValue(true); // Username already exists
  
        const response = await request(app)
          .post('/api/v1/user/checkUsername')
          .send({ username: mockUsername });
  
        expect(response.status).toBe(409);
        expect(response.body).toEqual(
          expect.objectContaining({
            message: 'Username already exists',
          })
        );
        expect(findUserNameAlreadyExists).toHaveBeenCalledWith(mockUsername);
      });
    });
});

describe('POST /api/v1/user/resetPassword', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Valid input scenario', () => {
    it('should return 200 and update password successfully', async () => {
      const mockRequestBody = { email: 'johndoe@gmail.com', password: 'Password!123' };
      const mockUser = { name: 'John Doe', username: 'john_doe', email: 'johndoe@gmail.com' };
      const mockUpdatedUser = { ...mockUser, password: 'hashedPassword' };

      findUserByEmail.mockResolvedValue(mockUser); // User exists
      updateUserPassword.mockResolvedValue(mockUpdatedUser); // Password updated

      const response = await request(app)
        .post('/api/v1/user/resetPassword')
        .send(mockRequestBody);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(
        expect.objectContaining({
          message: 'Password reset successfully.',
          data: {
            name: mockUser.name,
            username: mockUser.username,
            email: mockUser.email,
          },
        })
      );
      expect(findUserByEmail).toHaveBeenCalledWith(mockRequestBody.email);
      expect(updateUserPassword).toHaveBeenCalledWith(mockUser, mockRequestBody.password);
    });
  });

  describe('Validation error scenarios', () => {
    it('should return 400 if email or password is missing', async () => {

      const response = await request(app)
        .post('/api/v1/user/resetPassword')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toEqual(
        expect.objectContaining({
          error: "validation_error",
          message: "Email is a required field"
        })
      );
      expect(findUserByEmail).not.toHaveBeenCalled();
      expect(updateUserPassword).not.toHaveBeenCalled();
    });

    it('should return 400 if password fails validation', async () => {
      
      const response = await request(app)
        .post('/api/v1/user/resetPassword')
        .send({ email: 'johndoe@gmail.com', password: '123' });

      expect(response.status).toBe(400);
      expect(response.body).toEqual(
        expect.objectContaining({
          message: 'Password must be minimum 8 and maximum 20 characters',
          error: 'validation_error',
        })
      );
      expect(findUserByEmail).not.toHaveBeenCalled();
      expect(updateUserPassword).not.toHaveBeenCalled();
    });
  });

  describe('Error scenarios', () => {
    it('should return 400 if user is not found', async () => {
      const mockRequestBody = { email: 'nonexistent@gmail.com', password: 'Password!123' };

      
      findUserByEmail.mockResolvedValue(null); // User not found

      const response = await request(app)
        .post('/api/v1/user/resetPassword')
        .send(mockRequestBody);

      expect(response.status).toBe(400);
      expect(response.body).toEqual(
        expect.objectContaining({
          message: 'Invalid Operation'
        })
      );
      expect(findUserByEmail).toHaveBeenCalledWith(mockRequestBody.email);
      expect(updateUserPassword).not.toHaveBeenCalled();
    });

    it('should return 500 if an internal server error occurs', async () => {
      const mockRequestBody = { email: 'johndoe@gmail.com', password: 'Password!123' };

      
      findUserByEmail.mockRejectedValue(new Error('Database connection error')); // Simulated DB error

      const response = await request(app)
        .post('/api/v1/user/resetPassword')
        .send(mockRequestBody);

      expect(response.status).toBe(500);
      expect(response.body).toEqual(
        expect.objectContaining({
          error: "server_error",
          message: "Database connection error",
        })
      );
      expect(findUserByEmail).toHaveBeenCalledWith(mockRequestBody.email);
      expect(updateUserPassword).not.toHaveBeenCalled();
    });
  });
});
  