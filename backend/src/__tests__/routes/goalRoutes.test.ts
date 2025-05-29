import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import Goal from '../../models/Goal';
import goalRoutes from '../../routes/goalRoutes';

// Create a test app instance
const app = express();
app.use(express.json());
app.use('/api/goals', goalRoutes);

describe('Goal Routes', () => {
  beforeEach(async () => {
    // Clear the goals collection before each test
    await Goal.deleteMany({});
  });

  describe('GET /api/goals', () => {
    it('should return empty array when no goals exist', async () => {
      const response = await request(app)
        .get('/api/goals')
        .expect(200)
        .expect('Content-Type', /json/);

      expect(response.body).toEqual([]);
    });

    it('should return all goals', async () => {
      // Create test goals
      const testGoals = [
        {
          hierarchyId: '1',
          description: 'Test Goal 1',
          goalType: 'Overarching',
          status: 'Not Started'
        },
        {
          hierarchyId: '2',
          description: 'Test Goal 2',
          goalType: 'Longterm',
          status: 'In Progress'
        }
      ];

      await Goal.insertMany(testGoals);

      const response = await request(app)
        .get('/api/goals')
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body[0].description).toBe('Test Goal 1');
      expect(response.body[1].description).toBe('Test Goal 2');
    });
  });

  describe('GET /api/goals/:id', () => {
    it('should return 404 for non-existent goal', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      
      const response = await request(app)
        .get(`/api/goals/${fakeId}`)
        .expect(404);

      expect(response.body.message).toBe('Goal not found');
    });

    it('should return a specific goal', async () => {
      const goal = await Goal.create({
        hierarchyId: '1',
        description: 'Test Goal',
        goalType: 'Moderate',
        status: 'Not Started'
      });

      const response = await request(app)
        .get(`/api/goals/${goal._id}`)
        .expect(200);

      expect(response.body.description).toBe('Test Goal');
      expect(response.body._id).toBe(goal._id.toString());
    });
  });

  describe('POST /api/goals', () => {
    it('should create a new goal', async () => {
      const newGoal = {
        hierarchyId: '1.1',
        description: 'New Test Goal',
        goalType: 'Micro',
        status: 'Not Started',
        priority: 3
      };

      const response = await request(app)
        .post('/api/goals')
        .send(newGoal)
        .expect(201)
        .expect('Content-Type', /json/);

      expect(response.body.description).toBe(newGoal.description);
      expect(response.body.hierarchyId).toBe(newGoal.hierarchyId);
      expect(response.body._id).toBeDefined();

      // Verify it was saved to database
      const savedGoal = await Goal.findById(response.body._id);
      expect(savedGoal).toBeTruthy();
      expect(savedGoal?.description).toBe(newGoal.description);
    });

    it('should return 500 for invalid goal data', async () => {
      const invalidGoal = {
        // Missing required fields
        description: 'Invalid Goal'
      };

      const response = await request(app)
        .post('/api/goals')
        .send(invalidGoal)
        .expect(500);

      expect(response.body.message).toBe('Error creating goal');
    });
  });

  describe('PUT /api/goals/:id', () => {
    it('should update an existing goal', async () => {
      const goal = await Goal.create({
        hierarchyId: '1',
        description: 'Original Description',
        goalType: 'Longterm',
        status: 'Not Started'
      });

      const updates = {
        description: 'Updated Description',
        status: 'In Progress',
        priority: 5
      };

      const response = await request(app)
        .put(`/api/goals/${goal._id}`)
        .send(updates)
        .expect(200);

      expect(response.body.description).toBe(updates.description);
      expect(response.body.status).toBe(updates.status);
      expect(response.body.priority).toBe(updates.priority);
    });

    it('should return 404 when updating non-existent goal', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      
      const response = await request(app)
        .put(`/api/goals/${fakeId}`)
        .send({ description: 'Updated' })
        .expect(404);

      expect(response.body.message).toBe('Goal not found');
    });
  });

  describe('DELETE /api/goals/:id', () => {
    it('should delete an existing goal', async () => {
      const goal = await Goal.create({
        hierarchyId: '1',
        description: 'To Be Deleted',
        goalType: 'Day',
        status: 'Not Started'
      });

      await request(app)
        .delete(`/api/goals/${goal._id}`)
        .expect(200);

      // Verify it was deleted
      const deletedGoal = await Goal.findById(goal._id);
      expect(deletedGoal).toBeNull();
    });

    it('should return 404 when deleting non-existent goal', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      
      const response = await request(app)
        .delete(`/api/goals/${fakeId}`)
        .expect(404);

      expect(response.body.message).toBe('Goal not found');
    });
  });
});