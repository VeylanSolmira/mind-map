import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import GoalEvent from '../../models/GoalEvent';
import goalEventRoutes from '../../routes/goalEventRoutes';

// Create a test app instance
const app = express();
app.use(express.json());
app.use('/api/goal-events', goalEventRoutes);

describe('Goal Event Routes', () => {
  let testGoalId: mongoose.Types.ObjectId;

  beforeEach(async () => {
    // Clear the events collection before each test
    await GoalEvent.deleteMany({});
    // Create a test goal ID
    testGoalId = new mongoose.Types.ObjectId();
  });

  describe('GET /api/goal-events/goal/:goalId', () => {
    it('should return events for a specific goal', async () => {
      // Create test events
      const testEvents = [
        {
          goalId: testGoalId,
          date: new Date('2025-01-01'),
          notes: 'First event',
          status: 'completed'
        },
        {
          goalId: testGoalId,
          date: new Date('2025-01-02'),
          notes: 'Second event',
          status: 'planned'
        },
        {
          goalId: new mongoose.Types.ObjectId(), // Different goal
          date: new Date('2025-01-03'),
          notes: 'Different goal event',
          status: 'completed'
        }
      ];

      await GoalEvent.insertMany(testEvents);

      const response = await request(app)
        .get(`/api/goal-events/goal/${testGoalId}`)
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body[0].notes).toBe('Second event'); // Should be sorted by date desc
      expect(response.body[1].notes).toBe('First event');
    });

    it('should return empty array for goal with no events', async () => {
      const response = await request(app)
        .get(`/api/goal-events/goal/${testGoalId}`)
        .expect(200);

      expect(response.body).toEqual([]);
    });
  });

  describe('GET /api/goal-events/date-range', () => {
    it('should return events within date range', async () => {
      const testEvents = [
        {
          goalId: testGoalId,
          date: new Date('2025-01-01'),
          notes: 'Event 1'
        },
        {
          goalId: testGoalId,
          date: new Date('2025-01-15'),
          notes: 'Event 2'
        },
        {
          goalId: testGoalId,
          date: new Date('2025-02-01'),
          notes: 'Event 3'
        }
      ];

      await GoalEvent.insertMany(testEvents);

      const response = await request(app)
        .get('/api/goal-events/date-range')
        .query({
          startDate: '2025-01-10',
          endDate: '2025-01-20'
        })
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].notes).toBe('Event 2');
    });
  });

  describe('POST /api/goal-events', () => {
    it('should create a new event', async () => {
      const newEvent = {
        goalId: testGoalId.toString(),
        date: '2025-01-15',
        duration: 60,
        notes: 'Test event',
        status: 'planned'
      };

      const response = await request(app)
        .post('/api/goal-events')
        .send(newEvent)
        .expect(201);

      expect(response.body.notes).toBe(newEvent.notes);
      expect(response.body.duration).toBe(newEvent.duration);
      expect(response.body._id).toBeDefined();

      // Verify it was saved
      const savedEvent = await GoalEvent.findById(response.body._id);
      expect(savedEvent).toBeTruthy();
      expect(savedEvent?.notes).toBe(newEvent.notes);
    });

    it('should return 400 for invalid event data', async () => {
      const invalidEvent = {
        // Missing required goalId
        date: '2025-01-15',
        notes: 'Invalid event'
      };

      const response = await request(app)
        .post('/api/goal-events')
        .send(invalidEvent)
        .expect(400);

      expect(response.body.message).toBe('Error creating event');
    });
  });

  describe('PUT /api/goal-events/:id', () => {
    it('should update an existing event', async () => {
      const event = await GoalEvent.create({
        goalId: testGoalId,
        date: new Date('2025-01-15'),
        notes: 'Original notes',
        status: 'planned'
      });

      const updates = {
        notes: 'Updated notes',
        status: 'completed',
        duration: 120
      };

      const response = await request(app)
        .put(`/api/goal-events/${event._id}`)
        .send(updates)
        .expect(200);

      expect(response.body.notes).toBe(updates.notes);
      expect(response.body.status).toBe(updates.status);
      expect(response.body.duration).toBe(updates.duration);
    });

    it('should return 400 for invalid event ID', async () => {
      const response = await request(app)
        .put('/api/goal-events/invalid-id')
        .send({ notes: 'Updated' })
        .expect(400);

      expect(response.body.message).toBe('Invalid event ID');
    });

    it('should return 404 for non-existent event', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      
      const response = await request(app)
        .put(`/api/goal-events/${fakeId}`)
        .send({ notes: 'Updated' })
        .expect(404);

      expect(response.body.message).toBe('Event not found');
    });
  });

  describe('DELETE /api/goal-events/:id', () => {
    it('should delete an existing event', async () => {
      const event = await GoalEvent.create({
        goalId: testGoalId,
        date: new Date('2025-01-15'),
        notes: 'To be deleted'
      });

      const response = await request(app)
        .delete(`/api/goal-events/${event._id}`)
        .expect(200);

      expect(response.body.message).toBe('Event deleted successfully');

      // Verify deletion
      const deletedEvent = await GoalEvent.findById(event._id);
      expect(deletedEvent).toBeNull();
    });

    it('should return 404 for non-existent event', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      
      const response = await request(app)
        .delete(`/api/goal-events/${fakeId}`)
        .expect(404);

      expect(response.body.message).toBe('Event not found');
    });
  });
});