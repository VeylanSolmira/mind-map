import type { GoalEvent } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL;

export const getEventsByGoalId = async (goalId: string): Promise<GoalEvent[]> => {
  const response = await fetch(`${API_BASE_URL}/goal-events/goal/${goalId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch goal events');
  }
  return response.json();
};

export const getEventsByDateRange = async (startDate: string, endDate: string): Promise<GoalEvent[]> => {
  const response = await fetch(
    `${API_BASE_URL}/goal-events/date-range?startDate=${startDate}&endDate=${endDate}`
  );
  if (!response.ok) {
    throw new Error('Failed to fetch goal events');
  }
  return response.json();
};

export const createGoalEvent = async (event: Omit<GoalEvent, '_id'>): Promise<GoalEvent> => {
  const response = await fetch(`${API_BASE_URL}/goal-events`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(event),
  });
  if (!response.ok) {
    throw new Error('Failed to create goal event');
  }
  return response.json();
};

export const updateGoalEvent = async (id: string, event: Partial<GoalEvent>): Promise<GoalEvent> => {
  const response = await fetch(`${API_BASE_URL}/goal-events/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(event),
  });
  if (!response.ok) {
    throw new Error('Failed to update goal event');
  }
  return response.json();
};

export const deleteGoalEvent = async (id: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/goal-events/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete goal event');
  }
}; 