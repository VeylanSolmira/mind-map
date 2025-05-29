import express from 'express';
import {
  getEventsByGoalId,
  getEventsByDateRange,
  getAllEvents,
  createEvent,
  updateEvent,
  deleteEvent
} from '../controllers/goalEventController';

const router = express.Router();

// RESTful routes using controllers
router.get('/goal/:goalId', getEventsByGoalId);
router.get('/date-range', getEventsByDateRange);
router.get('/', getAllEvents);
router.post('/', createEvent);
router.put('/:id', updateEvent);
router.delete('/:id', deleteEvent);

export default router; 