import express from 'express';
import {
  getAllGoals,
  getGoalById,
  updateGoal,
  createGoal,
  deleteGoal
} from '../controllers/goalController';
import { IGoal } from '../models/Goal';
import Goal from '../models/Goal';

const router = express.Router();

router.get('/goals', getAllGoals);
router.get('/goals/:_id', getGoalById);
router.put('/goals/:_id', updateGoal);
router.post('/goals', createGoal);
router.delete('/goals/:_id', deleteGoal);

// Get all goals
router.get('/', async (req, res) => {
  try {
    const goals = await Goal.find().sort({ createdAt: -1 });
    res.json(goals);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching goals', error });
  }
});

// Create a new goal
router.post('/', async (req, res) => {
  try {
    const goal = new Goal(req.body);
    const savedGoal = await goal.save();
    res.status(201).json(savedGoal);
  } catch (error) {
    res.status(500).json({ message: 'Error creating goal', error });
  }
});

// Update goal description
router.post('/update', async (req, res) => {
  try {
    const { description, newDescription } = req.body;
    
    if (!description || !newDescription) {
      return res.status(400).json({ error: 'Description and newDescription are required' });
    }

    const result = await Goal.updateOne(
      { description },
      { $set: { description: newDescription } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Goal not found' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error updating goal:', error);
    res.status(500).json({ error: 'Failed to update goal' });
  }
});

export default router; 