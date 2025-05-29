import { Request, Response } from 'express';
import GoalEvent from '../models/GoalEvent';
import { Types } from 'mongoose';
import { sendErrorResponse, sendSuccessResponse } from '../utils/asyncHandler';

export const getEventsByGoalId = async (req: Request, res: Response) => {
  try {
    const events = await GoalEvent.find({ goalId: req.params.goalId })
      .sort({ date: -1 });
    sendSuccessResponse(res, events);
  } catch (error) {
    sendErrorResponse(res, 500, 'Error fetching goal events', error);
  }
};

export const getEventsByDateRange = async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;
    
    const events = await GoalEvent.find({
      date: {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string)
      }
    }).sort({ date: 1 });
    
    sendSuccessResponse(res, events);
  } catch (error) {
    sendErrorResponse(res, 500, 'Error fetching events by date range', error);
  }
};

export const getAllEvents = async (req: Request, res: Response) => {
  try {
    const events = await GoalEvent.find().sort({ date: -1 });
    sendSuccessResponse(res, events);
  } catch (error) {
    sendErrorResponse(res, 500, 'Error fetching events', error);
  }
};

export const createEvent = async (req: Request, res: Response) => {
  try {
    const event = new GoalEvent(req.body);
    const savedEvent = await event.save();
    sendSuccessResponse(res, savedEvent, 201);
  } catch (error) {
    sendErrorResponse(res, 400, 'Error creating event', error);
  }
};

export const updateEvent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!Types.ObjectId.isValid(id)) {
      return sendErrorResponse(res, 400, 'Invalid event ID');
    }
    
    const updatedEvent = await GoalEvent.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!updatedEvent) {
      return sendErrorResponse(res, 404, 'Event not found');
    }
    
    sendSuccessResponse(res, updatedEvent);
  } catch (error) {
    sendErrorResponse(res, 400, 'Error updating event', error);
  }
};

export const deleteEvent = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    if (!Types.ObjectId.isValid(id)) {
      return sendErrorResponse(res, 400, 'Invalid event ID');
    }
    
    const deletedEvent = await GoalEvent.findByIdAndDelete(id);
    
    if (!deletedEvent) {
      return sendErrorResponse(res, 404, 'Event not found');
    }
    
    sendSuccessResponse(res, { message: 'Event deleted successfully' });
  } catch (error) {
    sendErrorResponse(res, 500, 'Error deleting event', error);
  }
};