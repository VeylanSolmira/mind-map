import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import type { Goal, GoalEvent } from '../types';
import { createGoalEvent, updateGoalEvent } from '../services/goalEventService';
import CreateGoalModal from './CreateGoalModal';
import { createGoal } from '../services/api';
import './AddEventModal.css';

interface AddEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: Date;
  goals: Goal[];
  existingEvent?: GoalEvent;
  onEventAdded: () => void;
}

const AddEventModal: React.FC<AddEventModalProps> = ({
  isOpen,
  onClose,
  selectedDate,
  goals,
  existingEvent,
  onEventAdded
}) => {
  const [selectedGoalId, setSelectedGoalId] = useState<string>('');
  const [duration, setDuration] = useState<number>(30);
  const [notes, setNotes] = useState<string>('');
  const [status, setStatus] = useState<'completed' | 'in-progress' | 'planned'>('planned');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCreateGoalModalOpen, setIsCreateGoalModalOpen] = useState(false);

  useEffect(() => {
    if (existingEvent) {
      setSelectedGoalId(existingEvent.goalId);
      setDuration(existingEvent.duration || 30);
      setNotes(existingEvent.notes || '');
      setStatus(existingEvent.status);
    } else {
      // Reset form when opening for a new event
      setSelectedGoalId('');
      setDuration(30);
      setNotes('');
      setStatus('planned');
    }
  }, [existingEvent, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGoalId) {
      setError('Please select a goal');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const eventData = {
        goalId: selectedGoalId,
        date: selectedDate.toISOString(),
        duration,
        notes,
        status,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (existingEvent) {
        await updateGoalEvent(existingEvent._id, eventData);
      } else {
        await createGoalEvent(eventData);
      }

      onEventAdded();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save event');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateGoal = async (newGoal: Omit<Goal, '_id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const createdGoal = await createGoal({
        ...newGoal,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      setSelectedGoalId(createdGoal._id);
      setIsCreateGoalModalOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create goal');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{existingEvent ? 'Edit Event' : 'Add Event'}</h2>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Date</label>
            <div className="date-display">
              {format(selectedDate, 'MMMM d, yyyy')}
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="goal">Goal</label>
            <select
              id="goal"
              value={selectedGoalId}
              onChange={(e) => setSelectedGoalId(e.target.value)}
              required
            >
              <option value="">Select a goal</option>
              {goals.map(goal => (
                <option key={goal._id} value={goal._id}>
                  {goal.description}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="create-goal-button"
              onClick={() => setIsCreateGoalModalOpen(true)}
            >
              Create New Goal
            </button>
          </div>

          <div className="form-group">
            <label htmlFor="duration">Duration (minutes)</label>
            <input
              id="duration"
              type="number"
              min="1"
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value))}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="status">Status</label>
            <select
              id="status"
              value={status}
              onChange={(e) => setStatus(e.target.value as 'completed' | 'in-progress' | 'planned')}
              required
            >
              <option value="planned">Planned</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="notes">Notes</label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="modal-footer">
            <button
              type="button"
              className="cancel-button"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="submit-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : existingEvent ? 'Update' : 'Add'}
            </button>
          </div>
        </form>

        {isCreateGoalModalOpen && (
          <CreateGoalModal
            isOpen={isCreateGoalModalOpen}
            onClose={() => setIsCreateGoalModalOpen(false)}
            onSave={handleCreateGoal}
            existingGoals={goals}
          />
        )}
      </div>
    </div>
  );
};

export default AddEventModal; 