const request = require('supertest');
const app = require('../index'); // Adjust path to your Express app
const sequelize = require('../config/database'); // To interact with DB if needed, or use models directly
const User = require('../models/user');

describe('Auth Endpoints', () => {
  // No need for beforeAll/afterAll for DB connection here if setup.js handles it globally
  // and sequelize instance is correctly configured for test env.

  // Test user data
  const testUser = {
    username: 'testuser',
    email: 'test@example.com',
    password: 'password123',
  };
  const testUserLogin = {
    email: 'test@example.com', // or username: 'testuser'
    password: 'password123',
  };


  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send(testUser);

      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty('user_id');
      expect(response.body.username).toBe(testUser.username);
      expect(response.body.email).toBe(testUser.email);
      expect(response.body).not.toHaveProperty('password_hash'); // Ensure password hash isn't returned

      // Verify user is in the database
      const dbUser = await User.findOne({ where: { email: testUser.email } });
      expect(dbUser).not.toBeNull();
      expect(dbUser.username).toBe(testUser.username);
    });

    it('should return 409 if email already exists', async () => {
      // First, ensure the user from previous test (or a new one) is in DB
      // The afterEach hook should clear users, so we register again or rely on previous test if run in order.
      // For isolation, it's better to create the user here if not relying on order.
      await User.create({ username: 'anotheruser', email: testUser.email, password_hash: 'somehash' });

      const response = await request(app)
        .post('/api/auth/register')
        .send({ ...testUser, username: 'newusername' }); // Same email, different username

      expect(response.statusCode).toBe(409);
      expect(response.body.message).toMatch(/Email already in use/i);
    });

    it('should return 409 if username already exists', async () => {
      await User.create({ username: testUser.username, email: 'another@example.com', password_hash: 'somehash' });

      const response = await request(app)
        .post('/api/auth/register')
        .send({ ...testUser, email: 'unique@example.com' }); // Same username, different email

      expect(response.statusCode).toBe(409);
      expect(response.body.message).toMatch(/Username already in use/i);
    });

    it('should return 400 for missing fields', async () => {
        const response = await request(app)
            .post('/api/auth/register')
            .send({ email: testUser.email, password: testUser.password }); // Missing username
        expect(response.statusCode).toBe(400);
        expect(response.body.message).toMatch(/Username, email, and password are required/i);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Ensure a user is registered before each login test
      // The afterEach in setup.js clears the DB, so we need to recreate the user
      const bcrypt = require('bcrypt');
      const hashedPassword = await bcrypt.hash(testUser.password, 10);
      await User.create({ ...testUser, password_hash: hashedPassword });
    });

    it('should login an existing user successfully and return a token', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send(testUserLogin);

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('token');
      // TODO: Optionally decode token and verify payload if needed
    });

    it('should return 401 for incorrect password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ ...testUserLogin, password: 'wrongpassword' });

      expect(response.statusCode).toBe(401);
      expect(response.body.message).toMatch(/Invalid credentials/i);
    });

    it('should return 401 for non-existent user', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({ email: 'nonexistent@example.com', password: 'somepassword' });

      expect(response.statusCode).toBe(401);
      expect(response.body.message).toMatch(/Invalid credentials/i);
    });

    it('should return 400 for missing fields', async () => {
        const response = await request(app)
            .post('/api/auth/login')
            .send({ email: testUserLogin.email }); // Missing password
        expect(response.statusCode).toBe(400);
        expect(response.body.message).toMatch(/Email \(or username\) and password are required/i);
    });
  });
});
