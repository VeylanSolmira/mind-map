import { Request, Response } from 'express';
import Goal, { IGoal } from '../models/Goal';
import { sendErrorResponse, sendSuccessResponse } from '../utils/asyncHandler';

export const getAllGoals = async (req: Request, res: Response) => {
  try {
    const goals = await Goal.find();
    sendSuccessResponse(res, goals);
  } catch (error) {
    sendErrorResponse(res, 500, 'Error fetching goals', error);
  }
};

export const getGoalById = async (req: Request, res: Response) => {
  try {
    const goal = await Goal.findById(req.params._id);
    if (!goal) {
      return sendErrorResponse(res, 404, 'Goal not found');
    }
    sendSuccessResponse(res, goal);
  } catch (error) {
    sendErrorResponse(res, 500, 'Error fetching goal', error);
  }
};

export const updateGoal = async (req: Request, res: Response) => {
  try {
    const goal = await Goal.findByIdAndUpdate(
      req.params._id,
      { $set: req.body },
      { new: true }
    );
    if (!goal) {
      return sendErrorResponse(res, 404, 'Goal not found');
    }
    sendSuccessResponse(res, goal);
  } catch (error) {
    sendErrorResponse(res, 500, 'Error updating goal', error);
  }
};

export const createGoal = async (req: Request, res: Response) => {
  try {
    const goal = new Goal(req.body);
    await goal.save();
    sendSuccessResponse(res, goal, 201);
  } catch (error) {
    sendErrorResponse(res, 500, 'Error creating goal', error);
  }
};

export const deleteGoal = async (req: Request, res: Response) => {
  try {
    const goal = await Goal.findByIdAndDelete(req.params._id);
    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }
    res.json({ message: 'Goal deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting goal', error });
  }
}; 