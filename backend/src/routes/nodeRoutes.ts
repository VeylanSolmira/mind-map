import express from 'express';
import {
  createNode,
  getNodes,
  getNode,
  updateNode,
  deleteNode,
  getPriorityQueue,
  updatePositions
} from '../controllers/nodeController';

const router = express.Router();

// Basic CRUD routes
router.post('/', createNode);
router.get('/', getNodes);
router.get('/priority', getPriorityQueue);
router.get('/:id', getNode);
router.put('/:id', updateNode);
router.delete('/:id', deleteNode);

// Special routes
router.post('/positions', updatePositions);

export default router; 