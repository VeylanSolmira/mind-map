import axios from 'axios';
import type { Goal } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Create axios instance with specific configuration
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Get all goals
export const getGoals = async (): Promise<Goal[]> => {
  try {
    const response = await axiosInstance.get('/goals');
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Axios error details:', {
        message: error.message,
        code: error.code,
        config: error.config,
        response: error.response
      });
    }
    throw error;
  }
};

// Get a single goal by ID
export const getGoal = async (_id: string): Promise<Goal> => {
  const response = await axiosInstance.get(`/goals/${_id}`);
  return response.data;
};

// Create a new goal
export const createGoal = async (goal: Omit<Goal, '_id'>): Promise<Goal> => {
  const response = await axiosInstance.post('/goals', goal);
  return response.data;
};

// Update an existing goal
export const updateGoal = async (_id: string, goal: Partial<Goal>): Promise<Goal> => {
  const response = await axiosInstance.put(`/goals/${_id}`, goal);
  return response.data;
};

// Delete a goal
export const deleteGoal = async (_id: string): Promise<void> => {
  await axiosInstance.delete(`/goals/${_id}`);
};

export default {
  getGoals,
  getGoal,
  createGoal,
  updateGoal,
  deleteGoal
};

/* Commented out local Goal interface
export interface Goal {
  _id: string;  // MongoDB's _id
  hierarchyId: string;  // Hierarchical path (e.g. "1.1.1")
  description: string;
  goalType: string;
  naming: string;
  done: boolean;
  priority: number;
  effectivePriority: number;  // Calculated priority with time decay
  lastSelected: string;  // ISO date string of when the goal was last selected
  decayRate: number;  // Rate at which the priority decays over time
  score: number;
  assessment: number;
  communityValue: number;
  start: string;
  end: string;
  children?: Goal[];
}
*/ 