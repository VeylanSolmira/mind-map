import express from 'express';
import GoalEvent from '../models/GoalEvent';
import { Types } from 'mongoose';

const router = express.Router();

// Get all events for a goal
router.get('/goal/:goalId', async (req, res) => {
  try {
    const events = await GoalEvent.find({ goalId: req.params.goalId })
      .sort({ date: -1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching goal events', error });
  }
});

// Get events for a date range
router.get('/date-range', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const events = await GoalEvent.find({
      date: {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string)
      }
    }).sort({ date: 1 });
    
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching goal events by date range', error });
  }
});

// Create a new event
router.post('/', async (req, res) => {
  try {
    const event = new GoalEvent({
      ...req.body,
      goalId: new Types.ObjectId(req.body.goalId)
    });
    const savedEvent = await event.save();
    res.status(201).json(savedEvent);
  } catch (error) {
    res.status(500).json({ message: 'Error creating goal event', error });
  }
});

// Update an event
router.put('/:id', async (req, res) => {
  try {
    const event = await GoalEvent.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: 'Error updating goal event', error });
  }
});

// Delete an event
router.delete('/:id', async (req, res) => {
  try {
    const event = await GoalEvent.findByIdAndDelete(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting goal event', error });
  }
});

export default router; 