import React, { useState } from 'react';
import './CreateGoalModal.css';
import type { Goal } from '../types';

/* Commented out local Goal interface
interface Goal {
  id: string;
  hierarchyId: string;
  description: string;
  goalType: string;
  naming: string;
  done: boolean;
  priority: number;
  effectivePriority: number;
  lastSelected: string;
  decayRate: number;
  score: number;
  assessment: number;
  communityValue: number;
  start: string;
  end: string;
}
*/

interface CreateGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (goal: Omit<Goal, '_id' | 'createdAt' | 'updatedAt'>) => void;
}

const CreateGoalModal: React.FC<CreateGoalModalProps> = ({ onClose, onSave }) => {
  const [newGoal, setNewGoal] = useState<Omit<Goal, '_id' | 'createdAt' | 'updatedAt'>>({
    hierarchyId: '',
    description: '',
    goalType: 'Micro',
    done: false,
    priority: 0,
    effectivePriority: 0,
    lastSelected: new Date().toISOString(),
    decayRate: 0.001,
    score: 0,
    assessment: 0,
    communityValue: 0,
    start: '',
    end: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(newGoal);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setNewGoal(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Create New Goal</h2>
        <form onSubmit={handleSubmit}>
          <div>
            <label>Hierarchy ID:</label>
            <input
              type="text"
              name="hierarchyId"
              value={newGoal.hierarchyId}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label>Description:</label>
            <input
              type="text"
              name="description"
              value={newGoal.description}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label>Type:</label>
            <select name="goalType" value={newGoal.goalType} onChange={handleChange}>
              <option value="Overarching">Overarching</option>
              <option value="Longterm">Longterm</option>
              <option value="Moderate">Moderate</option>
              <option value="Micro">Micro</option>
              <option value="Day">Day</option>
            </select>
          </div>
          <div>
            <label>Done:</label>
            <input
              type="checkbox"
              name="done"
              checked={newGoal.done}
              onChange={handleChange}
            />
          </div>
          <div>
            <label>Priority:</label>
            <input
              type="number"
              name="priority"
              value={newGoal.priority}
              onChange={handleChange}
            />
          </div>
          <div>
            <label>Decay Rate:</label>
            <input
              type="number"
              name="decayRate"
              value={newGoal.decayRate}
              onChange={handleChange}
              step="0.001"
              min="0"
              max="1"
            />
          </div>
          <div>
            <label>Score:</label>
            <input
              type="number"
              name="score"
              value={newGoal.score}
              onChange={handleChange}
            />
          </div>
          <div>
            <label>Assessment:</label>
            <input
              type="number"
              name="assessment"
              value={newGoal.assessment}
              onChange={handleChange}
            />
          </div>
          <div>
            <label>Community Value:</label>
            <input
              type="number"
              name="communityValue"
              value={newGoal.communityValue}
              onChange={handleChange}
            />
          </div>
          <div>
            <label>Start:</label>
            <input
              type="text"
              name="start"
              value={newGoal.start}
              onChange={handleChange}
            />
          </div>
          <div>
            <label>End:</label>
            <input
              type="text"
              name="end"
              value={newGoal.end}
              onChange={handleChange}
            />
          </div>
          <div className="modal-actions">
            <button type="submit">Create</button>
            <button type="button" onClick={onClose}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateGoalModal; 