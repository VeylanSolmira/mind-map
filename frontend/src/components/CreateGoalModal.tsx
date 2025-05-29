import React, { useState } from 'react';
import './CreateGoalModal.css';
import type { Goal } from '../types';
import GoalTreeNavigator from './GoalTreeNavigator';
import { type TreeNavigationNode } from '../utils/hierarchyUtils';

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
  existingGoals: Goal[];
}

const CreateGoalModal: React.FC<CreateGoalModalProps> = ({ 
  isOpen, 
  onClose, 
  onSave, 
  existingGoals 
}) => {
  const [selectedParent, setSelectedParent] = useState<TreeNavigationNode | null>(null);
  const [previewHierarchyId, setPreviewHierarchyId] = useState<string>('1');
  const [useManualEntry, setUseManualEntry] = useState(false);
  
  const [newGoal, setNewGoal] = useState<Omit<Goal, '_id' | 'createdAt' | 'updatedAt'>>({
    hierarchyId: '',
    description: '',
    goalType: 'Micro',
    done: false,
    priority: 1,
    effectivePriority: 1,
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
    
    // Use the generated hierarchy ID if using tree navigator
    const hierarchyId = useManualEntry ? newGoal.hierarchyId : previewHierarchyId;
    
    if (!hierarchyId.trim()) {
      alert('Please select a location for your goal or enter a hierarchy ID');
      return;
    }
    
    onSave({
      ...newGoal,
      hierarchyId: hierarchyId.trim()
    });
    
    // Reset form
    setSelectedParent(null);
    setPreviewHierarchyId('1');
    setNewGoal({
      hierarchyId: '',
      description: '',
      goalType: 'Micro',
      done: false,
      priority: 1,
      effectivePriority: 1,
      lastSelected: new Date().toISOString(),
      decayRate: 0.001,
      score: 0,
      assessment: 0,
      communityValue: 0,
      start: '',
      end: ''
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setNewGoal(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
               type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  const handleClose = () => {
    // Reset form when closing
    setSelectedParent(null);
    setPreviewHierarchyId('1');
    setUseManualEntry(false);
    setNewGoal({
      hierarchyId: '',
      description: '',
      goalType: 'Micro',
      done: false,
      priority: 1,
      effectivePriority: 1,
      lastSelected: new Date().toISOString(),
      decayRate: 0.001,
      score: 0,
      assessment: 0,
      communityValue: 0,
      start: '',
      end: ''
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal">
      <div className="modal-content enhanced">
        <div className="modal-header">
          <h2>Create New Goal</h2>
          <button className="close-button" onClick={handleClose}>&times;</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          {/* Goal Location Section */}
          <div className="form-section">
            <div className="section-header">
              <h3>📍 Goal Location</h3>
              <button
                type="button"
                className="toggle-method-button"
                onClick={() => setUseManualEntry(!useManualEntry)}
              >
                {useManualEntry ? '🌳 Use Tree Navigator' : '✏️ Manual Entry'}
              </button>
            </div>
            
            {!useManualEntry ? (
              <div className="tree-navigator-section">
                <GoalTreeNavigator
                  existingGoals={existingGoals}
                  selectedParent={selectedParent}
                  onSelectParent={setSelectedParent}
                  onPreviewHierarchyId={setPreviewHierarchyId}
                />
              </div>
            ) : (
              <div className="manual-entry-section">
                <label htmlFor="hierarchyId">Hierarchy ID (Advanced)</label>
                <input
                  type="text"
                  id="hierarchyId"
                  name="hierarchyId"
                  value={newGoal.hierarchyId}
                  onChange={handleChange}
                  placeholder="e.g. 1.2.3"
                  required
                />
                <p className="help-text">
                  Enter a hierarchical ID like "1.2.3" where each number represents a level
                </p>
              </div>
            )}
          </div>

          {/* Basic Goal Information */}
          <div className="form-section">
            <h3>📝 Goal Details</h3>
            
            <div className="form-group">
              <label htmlFor="description">Description *</label>
              <textarea
                id="description"
                name="description"
                value={newGoal.description}
                onChange={handleChange}
                placeholder="What do you want to achieve?"
                required
                rows={3}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="goalType">Goal Type *</label>
                <select 
                  id="goalType" 
                  name="goalType" 
                  value={newGoal.goalType} 
                  onChange={handleChange}
                >
                  <option value="Overarching">🎯 Overarching - Life-changing objectives</option>
                  <option value="Longterm">📈 Long-term - 6-12 month goals</option>
                  <option value="Moderate">📋 Moderate - 1-6 month goals</option>
                  <option value="Micro">⚡ Micro - Week to month tasks</option>
                  <option value="Day">📅 Day - Daily/immediate actions</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="priority">Priority</label>
                <input
                  type="number"
                  id="priority"
                  name="priority"
                  value={newGoal.priority}
                  onChange={handleChange}
                  step="0.1"
                  min="0"
                  placeholder="1.0"
                />
              </div>
            </div>
          </div>

          {/* Advanced Options (Collapsible) */}
          <details className="advanced-section">
            <summary>⚙️ Advanced Options</summary>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="decayRate">Decay Rate</label>
                <input
                  type="number"
                  id="decayRate"
                  name="decayRate"
                  value={newGoal.decayRate}
                  onChange={handleChange}
                  step="0.001"
                  min="0"
                  max="1"
                  placeholder="0.001"
                />
                <p className="help-text">How quickly priority decays over time</p>
              </div>

              <div className="form-group">
                <label htmlFor="score">Initial Score</label>
                <input
                  type="number"
                  id="score"
                  name="score"
                  value={newGoal.score}
                  onChange={handleChange}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="assessment">Assessment</label>
                <input
                  type="number"
                  id="assessment"
                  name="assessment"
                  value={newGoal.assessment}
                  onChange={handleChange}
                  placeholder="0"
                />
              </div>

              <div className="form-group">
                <label htmlFor="communityValue">Community Value</label>
                <input
                  type="number"
                  id="communityValue"
                  name="communityValue"
                  value={newGoal.communityValue}
                  onChange={handleChange}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="start">Start Date</label>
                <input
                  type="text"
                  id="start"
                  name="start"
                  value={newGoal.start}
                  onChange={handleChange}
                  placeholder="Optional start date"
                />
              </div>

              <div className="form-group">
                <label htmlFor="end">End Date</label>
                <input
                  type="text"
                  id="end"
                  name="end"
                  value={newGoal.end}
                  onChange={handleChange}
                  placeholder="Optional end date"
                />
              </div>
            </div>
          </details>

          <div className="modal-actions">
            <button type="button" className="cancel-button" onClick={handleClose}>
              Cancel
            </button>
            <button type="submit" className="create-button">
              Create Goal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateGoalModal; 