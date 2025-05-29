import express from 'express';
import {
  getAllGoals,
  getGoalById,
  updateGoal,
  createGoal,
  deleteGoal
} from '../controllers/goalController';

const router = express.Router();

// RESTful routes using controllers
router.get('/', getAllGoals);
router.get('/:_id', getGoalById);
router.put('/:_id', updateGoal);
router.post('/', createGoal);
router.delete('/:_id', deleteGoal);

export default router; 