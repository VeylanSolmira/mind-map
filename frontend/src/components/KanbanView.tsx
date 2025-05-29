import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import type { DropResult, DroppableProvided, DraggableProvided, DroppableStateSnapshot, DraggableStateSnapshot } from 'react-beautiful-dnd';
import type { Goal } from '../types';
import { updateGoal } from '../services/api';
import './KanbanView.css';

interface KanbanViewProps {
  data: Goal[];
}

interface KanbanColumn {
  id: string;
  title: string;
  status: 'not-started' | 'in-progress' | 'completed';
  items: Goal[];
  color: string;
}

const KanbanView: React.FC<KanbanViewProps> = ({ data }) => {
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
      if (goal.done) {
        initialColumns[2].items.push(goal);
      } else {
        // Check if goal has started based on start date or lastSelected
        const startDate = goal.start ? new Date(goal.start) : null;
        const lastSelected = new Date(goal.lastSelected);
        const now = new Date();
        
        // Consider it "in progress" if recently selected (within 7 days) or has start date in past
        const recentlySelected = (now.getTime() - lastSelected.getTime()) < (7 * 24 * 60 * 60 * 1000);
        const hasStarted = startDate && startDate <= now;
        
        if (recentlySelected || hasStarted) {
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
    if (!result.destination) return;

    const { source, destination, draggableId } = result;
    
    setIsLoading(true);
    setError(null);

    try {
      // Find the goal being moved
      const goal = data.find(g => g._id === draggableId);
      if (!goal) throw new Error('Goal not found');

      // Update local state first for immediate feedback
      const newColumns = [...columns];
      
      if (source.droppableId === destination.droppableId) {
        // Reordering within the same column
        const columnIndex = newColumns.findIndex(col => col.id === source.droppableId);
        if (columnIndex === -1) return;

        const copiedItems = [...newColumns[columnIndex].items];
        const [removed] = copiedItems.splice(source.index, 1);
        copiedItems.splice(destination.index, 0, removed);

        newColumns[columnIndex] = { ...newColumns[columnIndex], items: copiedItems };
      } else {
        // Moving between columns - update goal status
        const sourceColumnIndex = newColumns.findIndex(col => col.id === source.droppableId);
        const destColumnIndex = newColumns.findIndex(col => col.id === destination.droppableId);
        if (sourceColumnIndex === -1 || destColumnIndex === -1) return;

        const sourceItems = [...newColumns[sourceColumnIndex].items];
        const destItems = [...newColumns[destColumnIndex].items];
        const [removed] = sourceItems.splice(source.index, 1);
        destItems.splice(destination.index, 0, removed);

        newColumns[sourceColumnIndex] = { ...newColumns[sourceColumnIndex], items: sourceItems };
        newColumns[destColumnIndex] = { ...newColumns[destColumnIndex], items: destItems };

        // Update goal status in database
        const destColumn = newColumns[destColumnIndex];
        const updatedGoal = {
          ...goal,
          done: destColumn.status === 'completed',
          lastSelected: new Date().toISOString(),
          // Update start date if moving to in-progress and no start date set
          start: destColumn.status === 'in-progress' && !goal.start 
            ? new Date().toISOString() 
            : goal.start
        };

        await updateGoal(goal._id, updatedGoal);
      }

      setColumns(newColumns);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update goal');
      // Revert to original state on error
      setColumns(columns);
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
          {columns.map(column => (
            <div 
              key={column.id}
              className="kanban-column"
              style={{ '--column-color': column.color } as React.CSSProperties}
            >
              <div className="column-header">
                <h3>{column.title}</h3>
                <span className="item-count">{column.items.length}</span>
              </div>
              
              <Droppable droppableId={column.id}>
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
                        <Draggable key={goal._id} draggableId={goal._id} index={index}>
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