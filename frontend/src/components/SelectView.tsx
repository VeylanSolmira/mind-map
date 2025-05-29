import React, { useState, useEffect } from 'react';
import './SelectView.css';
import type { Goal } from '../types';
import { updateGoal } from '../services/api';
import { calculateEffectivePriority } from '../utils/priorityUtils';

interface SelectViewProps {
  data: Goal[];
  onGoalUpdated: () => Promise<void>;
}

const SelectView: React.FC<SelectViewProps> = ({ data, onGoalUpdated }) => {
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [loading, setLoading] = useState(false);

  const selectRandomGoal = () => {
    if (data.length === 0) return;

    // Filter out goals that are done
    const availableGoals = data.filter(goal => !goal.done);
    if (availableGoals.length === 0) return;

    // Calculate inverse priorities (1/priority) and total
    const inversePriorities = availableGoals.map(goal => ({
      goal,
      inversePriority: 1 / goal.effectivePriority
    }));
    const totalInversePriority = inversePriorities.reduce((sum, item) => sum + item.inversePriority, 0);

    // Generate random number between 0 and total inverse priority
    let random = Math.random() * totalInversePriority;

    // Select goal based on inverse priority (lower priority = higher chance)
    for (const { goal, inversePriority } of inversePriorities) {
      random -= inversePriority;
      if (random <= 0) {
        setSelectedGoal(goal);
        break;
      }
    }
  };

  const handleAccept = async () => {
    if (!selectedGoal) return;
    
    try {
      setLoading(true);
      const newPriority = selectedGoal.priority * 0.9; // Decrease priority by 10%
      const now = new Date();
      const newEffectivePriority = calculateEffectivePriority(
        newPriority,
        selectedGoal.decayRate,
        now
      );

      const updatedGoal = {
        ...selectedGoal,
        priority: newPriority,
        lastSelected: now.toISOString(),
        effectivePriority: newEffectivePriority
      };
      
      await handleSaveGoal(updatedGoal);
      await onGoalUpdated(); // Refresh the goals data
      setTimeout(() => {
        selectRandomGoal();
      }, 1000);
    } catch (error) {
      console.error('Error updating goal:', error);
      if (error instanceof Error) {
        console.error('Error details:', error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedGoal) return;
    
    try {
      setLoading(true);
      const newPriority = selectedGoal.priority * 1.1; // Increase priority by 10%
      const now = new Date();
      const newEffectivePriority = calculateEffectivePriority(
        newPriority,
        selectedGoal.decayRate,
        now
      );

      const updatedGoal = {
        ...selectedGoal,
        priority: newPriority,
        effectivePriority: newEffectivePriority
      };
      
      await handleSaveGoal(updatedGoal);
      await onGoalUpdated(); // Refresh the goals data
      setTimeout(() => {
        selectRandomGoal();
      }, 1000);
    } catch (error) {
      console.error('Error updating goal:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveGoal = async (goal: Goal) => {
    try {
      const result = await updateGoal(goal._id, goal);
      
      // Update the goal in the state
      setSelectedGoal(result);
    } catch (error) {
      console.error('Error saving goal:', error);
    }
  };

  useEffect(() => {
    selectRandomGoal();
  }, [data]);

  if (!selectedGoal) {
    return <div className="select-view">No goals available</div>;
  }

  return (
    <div className="select-view">
      <h2>Selected Goal</h2>
      <div className="selected-goal">
        <h3>{selectedGoal.description}</h3>
        <p>Type: {selectedGoal.goalType}</p>
        <p>Priority: {selectedGoal.priority.toFixed(2)}</p>
        <p>Effective Priority: {selectedGoal.effectivePriority.toFixed(2)}</p>
        <p>Last Selected: {new Date(selectedGoal.lastSelected).toLocaleString()}</p>
        <div className="goal-actions">
          <button 
            className="accept-button"
            onClick={handleAccept}
            disabled={loading}
          >
            Accept
          </button>
          <button 
            className="reject-button"
            onClick={handleReject}
            disabled={loading}
          >
            Reject
          </button>
        </div>
      </div>
    </div>
  );
};

export default SelectView; 