import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import type { DropResult, DroppableProvided, DraggableProvided, DroppableStateSnapshot, DraggableStateSnapshot } from 'react-beautiful-dnd';
import type { Goal } from '../types';
import { updateGoal } from '../services/api';
import './KanbanView.css';

interface KanbanViewProps {
  data: Goal[];
  onDataRefresh?: () => void;
}

interface KanbanColumn {
  id: string;
  title: string;
  status: 'not-started' | 'in-progress' | 'completed';
  items: Goal[];
  color: string;
}

const KanbanView: React.FC<KanbanViewProps> = ({ data, onDataRefresh }) => {
  const [columns, setColumns] = useState<KanbanColumn[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize columns based on data
  useEffect(() => {
    const initialColumns: KanbanColumn[] = [
      { 
        id: 'not-started', 
        title: 'Not Started', 
        status: 'not-started',
        items: [], 
        color: '#e3f2fd' 
      },
      { 
        id: 'in-progress', 
        title: 'In Progress', 
        status: 'in-progress',
        items: [], 
        color: '#fff3e0' 
      },
      { 
        id: 'completed', 
        title: 'Completed', 
        status: 'completed',
        items: [], 
        color: '#e8f5e9' 
      }
    ];

    // Sort goals into columns based on their status and done flag
    data.forEach(goal => {
      if (goal.done || goal.status === 'completed') {
        initialColumns[2].items.push(goal);
      } else {
        // Kanban column logic based only on explicit status, not lastSelected
        const hasStartDate = goal.start && goal.start.trim() !== '';
        const startDate = hasStartDate ? new Date(goal.start) : null;
        const now = new Date();
        const hasStarted = startDate && startDate <= now;
        
        if (hasStarted) {
          initialColumns[1].items.push(goal);
        } else {
          initialColumns[0].items.push(goal);
        }
      }
    });

    // Sort items by priority within each column
    initialColumns.forEach(column => {
      column.items.sort((a, b) => b.effectivePriority - a.effectivePriority);
    });

    setColumns(initialColumns);
  }, [data]);

  const onDragEnd = async (result: DropResult) => {
    if (!result.destination) {
      return;
    }

    const { source, destination, draggableId } = result;
    
    console.log('Drag operation:', { 
      source: source.droppableId, 
      destination: destination.droppableId, 
      goalId: draggableId,
      availableGoalIds: data.map(g => g._id).slice(0, 5) // Log first 5 IDs for debugging
    });
    
    // Find the goal being moved - check both data and current columns
    let goal = data.find(g => g._id === draggableId);
    
    if (!goal) {
      // If not in data, check if it exists in current columns (might be stale)
      const allColumnItems = columns.flatMap(col => col.items);
      goal = allColumnItems.find(g => g._id === draggableId);
      
      if (!goal) {
        console.error('Goal not found in data or columns:', draggableId);
        setError('Goal not found. Refreshing data...');
        if (onDataRefresh) {
          onDataRefresh();
        }
        return;
      } else {
        console.warn('Goal found in columns but not in data - data may be stale');
        // Don't proceed with database update for stale goals
        setError('Data may be outdated. Refreshing...');
        if (onDataRefresh) {
          onDataRefresh();
        }
        return;
      }
    }

    // Create fresh columns from current data
    const freshColumns: KanbanColumn[] = [
      { 
        id: 'not-started', 
        title: 'Not Started', 
        status: 'not-started',
        items: [], 
        color: '#e3f2fd' 
      },
      { 
        id: 'in-progress', 
        title: 'In Progress', 
        status: 'in-progress',
        items: [], 
        color: '#fff3e0' 
      },
      { 
        id: 'completed', 
        title: 'Completed', 
        status: 'completed',
        items: [], 
        color: '#e8f5e9' 
      }
    ];

    // Rebuild columns from current data
    data.forEach(g => {
      if (g.done || g.status === 'completed') {
        freshColumns[2].items.push(g);
      } else {
        // Kanban column logic based only on explicit status, not lastSelected
        const hasStartDate = g.start && g.start.trim() !== '';
        const startDate = hasStartDate ? new Date(g.start) : null;
        const now = new Date();
        const hasStarted = startDate && startDate <= now;
        
        if (hasStarted) {
          freshColumns[1].items.push(g);
        } else {
          freshColumns[0].items.push(g);
        }
      }
    });

    // Sort items by priority within each column
    freshColumns.forEach(column => {
      column.items.sort((a, b) => b.effectivePriority - a.effectivePriority);
    });

    // Now apply the drag operation to fresh columns
    const sourceColumn = freshColumns.find(col => col.id === source.droppableId);
    const destColumn = freshColumns.find(col => col.id === destination.droppableId);
    
    if (!sourceColumn || !destColumn) {
      console.error('Column not found in fresh columns');
      return;
    }

    // Find the goal in the source column
    const sourceGoalIndex = sourceColumn.items.findIndex(g => g._id === draggableId);
    if (sourceGoalIndex === -1) {
      console.error('Goal not found in source column of fresh data');
      setError('Goal position outdated. Refreshing...');
      if (onDataRefresh) {
        onDataRefresh();
      }
      return;
    }
    
    setIsLoading(true);
    setError(null);

    try {
      if (source.droppableId === destination.droppableId) {
        // Reordering within the same column
        const [removed] = sourceColumn.items.splice(sourceGoalIndex, 1);
        sourceColumn.items.splice(destination.index, 0, removed);
      } else {
        // Moving between columns
        const [removed] = sourceColumn.items.splice(sourceGoalIndex, 1);
        destColumn.items.splice(destination.index, 0, removed);

        // Update goal status in database
        const updatedGoal: Partial<Goal> = {
          done: destColumn.status === 'completed',
          status: destColumn.status === 'completed' ? 'completed' as const : 'active' as const,
          // Don't update lastSelected for column moves - it interferes with column logic
          start: destColumn.status === 'in-progress' && !goal.start 
            ? new Date().toISOString()  // Set start date when moving to in-progress
            : destColumn.status === 'not-started' 
            ? ''  // Clear start date when moving to not-started
            : goal.start  // Keep existing start date for other moves
        };

        console.log('Updating goal with data:', {
          id: goal._id,
          done: updatedGoal.done,
          status: updatedGoal.status,
          destination: destColumn.status,
          currentStart: goal.start,
          newStart: updatedGoal.start
        });

        await updateGoal(goal._id, updatedGoal);
        console.log('Successfully updated goal in database');
      }

      setColumns(freshColumns);
      
      // Refresh data after operation to ensure consistency
      if (onDataRefresh) {
        setTimeout(() => onDataRefresh(), 300);
      }
    } catch (err) {
      console.error('Error updating goal:', err);
      
      // Handle 404 errors specifically - goal may have been deleted
      if (err instanceof Error && err.message.includes('404')) {
        setError(`Goal no longer exists in database. Refreshing data...`);
        console.warn(`Goal ${draggableId} not found in database, refreshing data`);
        
        // Clear error after showing it briefly
        setTimeout(() => setError(null), 2000);
        
        // Refresh data immediately to sync with database
        if (onDataRefresh) {
          onDataRefresh();
        }
      } else {
        setError('Failed to update goal');
        
        // For other errors, also refresh to ensure consistency
        if (onDataRefresh) {
          setTimeout(() => onDataRefresh(), 1000);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getGoalTypeIcon = (goalType: string) => {
    switch (goalType) {
      case 'Overarching': return '🎯';
      case 'Longterm': return '📈';
      case 'Moderate': return '📋';
      case 'Micro': return '⚡';
      case 'Day': return '📅';
      default: return '📄';
    }
  };

  const getPriorityColor = (priority: number) => {
    if (priority >= 3) return '#ff4444';
    if (priority >= 2) return '#ff8800';
    if (priority >= 1) return '#4CAF50';
    return '#9e9e9e';
  };

  if (error) {
    return (
      <div className="kanban-error">
        <p>Error: {error}</p>
        <button onClick={() => setError(null)}>Dismiss</button>
      </div>
    );
  }

  return (
    <div className="kanban-view">
      <div className="kanban-header">
        <h2>🔄 Kanban Board</h2>
        <p>Drag goals between columns to update their status</p>
        {isLoading && <div className="loading-indicator">Updating...</div>}
      </div>
      
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="kanban-board">
          {columns.map((column) => (
            <div 
              key={column.id}
              className="kanban-column"
              style={{ '--column-color': column.color } as React.CSSProperties}
            >
              <div className="column-header">
                <h3>{column.title}</h3>
                <span className="item-count">{column.items.length}</span>
              </div>
              
              <Droppable 
                droppableId={column.id}
                isDropDisabled={false}
                isCombineEnabled={false}
                ignoreContainerClipping={false}
              >
                {(provided: DroppableProvided, snapshot: DroppableStateSnapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`column-content ${snapshot.isDraggingOver ? 'dragging-over' : ''}`}
                  >
                    {column.items.length === 0 ? (
                      <div className="empty-column">
                        <p>No goals here</p>
                        <small>Drag goals from other columns</small>
                      </div>
                    ) : (
                      column.items.map((goal, index) => (
                        <Draggable 
                          key={goal._id} 
                          draggableId={goal._id} 
                          index={index}
                        >
                          {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className={`kanban-card ${snapshot.isDragging ? 'dragging' : ''}`}
                            >
                              <div className="card-header">
                                <span className="goal-type">
                                  {getGoalTypeIcon(goal.goalType)}
                                </span>
                                <span className="hierarchy-id">{goal.hierarchyId}</span>
                                <div 
                                  className="priority-indicator"
                                  style={{ backgroundColor: getPriorityColor(goal.priority) }}
                                  title={`Priority: ${goal.priority}`}
                                >
                                  {goal.priority.toFixed(1)}
                                </div>
                              </div>
                              
                              <div className="card-content">
                                <h4 className="goal-title">{goal.description}</h4>
                                
                                <div className="goal-meta">
                                  <div className="meta-item">
                                    <span className="meta-label">Effective Priority:</span>
                                    <span className="meta-value">{goal.effectivePriority.toFixed(2)}</span>
                                  </div>
                                  
                                  {goal.start && (
                                    <div className="meta-item">
                                      <span className="meta-label">Start:</span>
                                      <span className="meta-value">
                                        {new Date(goal.start).toLocaleDateString()}
                                      </span>
                                    </div>
                                  )}
                                  
                                  {goal.end && (
                                    <div className="meta-item">
                                      <span className="meta-label">End:</span>
                                      <span className="meta-value">
                                        {new Date(goal.end).toLocaleDateString()}
                                      </span>
                                    </div>
                                  )}
                                </div>
                                
                                <div className="goal-stats">
                                  <span className="stat">
                                    📊 Score: {goal.score}
                                  </span>
                                  <span className="stat">
                                    🎖️ Assessment: {goal.assessment}
                                  </span>
                                </div>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))
                    )}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
};

export default KanbanView; 