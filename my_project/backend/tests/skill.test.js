const request = require('supertest');
const app = require('../index'); // Adjust path to your Express app
const User = require('../models/user');
const Skill = require('../models/skill');
const bcrypt = require('bcrypt');

describe('Skill Endpoints', () => {
  let testUserToken;
  let testUserId;

  const regularUser = {
    username: 'skilltester',
    email: 'skill@example.com',
    password: 'password123',
  };

  beforeAll(async () => {
    // Register and login a user to get a token for protected routes
    const hashedPassword = await bcrypt.hash(regularUser.password, 10);
    const user = await User.create({ ...regularUser, password_hash: hashedPassword });
    testUserId = user.user_id;

    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({ email: regularUser.email, password: regularUser.password });
    testUserToken = loginResponse.body.token;

    if (!testUserToken) {
        console.error("Failed to get token for skill tests. Login response:", loginResponse.body);
        throw new Error("Failed to authenticate test user for skill tests.");
    }
  });

  describe('GET /api/skills', () => {
    it('should fetch all skills successfully', async () => {
      // Optionally create some skills first if the DB is empty
      await Skill.create({ name: 'Test Skill 1', description: 'Desc 1' });
      await Skill.create({ name: 'Test Skill 2', description: 'Desc 2' });

      const response = await request(app).get('/api/skills');

      expect(response.statusCode).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThanOrEqual(2); // Check for at least the two created
      expect(response.body[0]).toHaveProperty('skill_id');
      expect(response.body[0]).toHaveProperty('name');
    });
  });

  describe('POST /api/skills', () => {
    const newSkillData = {
      name: 'Programming',
      description: 'The art of coding.',
    };

    it('should create a new skill if user is authenticated', async () => {
      const response = await request(app)
        .post('/api/skills')
        .set('Authorization', `Bearer ${testUserToken}`)
        .send(newSkillData);

      expect(response.statusCode).toBe(201);
      expect(response.body).toHaveProperty('skill_id');
      expect(response.body.name).toBe(newSkillData.name);
      expect(response.body.description).toBe(newSkillData.description);

      // Verify the skill is in the database
      const dbSkill = await Skill.findByPk(response.body.skill_id);
      expect(dbSkill).not.toBeNull();
      expect(dbSkill.name).toBe(newSkillData.name);
    });

    it('should return 400 if name is missing', async () => {
      const response = await request(app)
        .post('/api/skills')
        .set('Authorization', `Bearer ${testUserToken}`)
        .send({ description: 'Missing name' });

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toMatch(/Skill name is required/i);
    });

    it('should return 409 if skill name already exists', async () => {
      // First create the skill
      await Skill.create({ name: newSkillData.name, description: 'Initial description' });
      // Then try to create it again
      const response = await request(app)
        .post('/api/skills')
        .set('Authorization', `Bearer ${testUserToken}`)
        .send(newSkillData); // Attempt to create with the same name

      expect(response.statusCode).toBe(409);
      expect(response.body.message).toMatch(/Skill name already exists/i);
    });

    it('should return 403 if no token is provided', async () => {
      const response = await request(app)
        .post('/api/skills')
        .send(newSkillData);

      expect(response.statusCode).toBe(403); // Or 401 depending on middleware setup
      expect(response.body.message).toMatch(/No token provided/i);
    });
  });

  // TODO: Add tests for PUT /api/skills/:skill_id
  // TODO: Add tests for DELETE /api/skills/:skill_id
});
