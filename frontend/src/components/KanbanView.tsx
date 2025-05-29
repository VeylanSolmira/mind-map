import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import type { DropResult, DroppableProvided, DraggableProvided, DroppableStateSnapshot, DraggableStateSnapshot } from 'react-beautiful-dnd';

interface KanbanViewProps {
  data: Array<{
    _id: string;
    description: string;
    goalType: string;
    naming: string;
    done: boolean;
    priority: number;
    score: number;
    assessment: number;
    communityValue: number;
    start: string;
    end: string;
  }>;
}

interface Column {
  id: string;
  title: string;
  items: KanbanViewProps['data'];
}

const KanbanView: React.FC<KanbanViewProps> = ({ data }) => {
  const [columns, setColumns] = useState<Column[]>(() => {
    // Initialize columns
    const initialColumns: Column[] = [
      { id: 'not-started', title: 'Not Started', items: [] },
      { id: 'in-progress', title: 'In Progress', items: [] },
      { id: 'completed', title: 'Completed', items: [] }
    ];

    // Sort items into columns
    data.forEach(item => {
      if (item.done) {
        initialColumns[2].items.push(item);
      } else {
        // Check if the item has started
        const startDate = new Date(item.start);
        const now = new Date();
        if (startDate <= now) {
          initialColumns[1].items.push(item);
        } else {
          initialColumns[0].items.push(item);
        }
      }
    });

    return initialColumns;
  });

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const { source, destination } = result;
    
    if (source.droppableId === destination.droppableId) {
      // Reordering within the same column
      const column = columns.find(col => col.id === source.droppableId);
      if (!column) return;

      const copiedItems = [...column.items];
      const [removed] = copiedItems.splice(source.index, 1);
      copiedItems.splice(destination.index, 0, removed);

      setColumns(columns.map(col => 
        col.id === source.droppableId ? { ...col, items: copiedItems } : col
      ));
    } else {
      // Moving between columns
      const sourceColumn = columns.find(col => col.id === source.droppableId);
      const destColumn = columns.find(col => col.id === destination.droppableId);
      if (!sourceColumn || !destColumn) return;

      const sourceItems = [...sourceColumn.items];
      const destItems = [...destColumn.items];
      const [removed] = sourceItems.splice(source.index, 1);
      destItems.splice(destination.index, 0, removed);

      setColumns(columns.map(col => {
        if (col.id === source.droppableId) {
          return { ...col, items: sourceItems };
        }
        if (col.id === destination.droppableId) {
          return { ...col, items: destItems };
        }
        return col;
      }));
    }
  };

  return (
    <div className="kanban-view">
      <h2>Kanban Board</h2>
      <DragDropContext onDragEnd={onDragEnd}>
        <div style={{ 
          display: 'flex', 
          gap: '20px', 
          padding: '20px',
          minHeight: '600px'
        }}>
          {columns.map(column => (
            <div 
              key={column.id}
              style={{
                flex: 1,
                background: '#f5f5f5',
                borderRadius: '8px',
                padding: '16px',
                minWidth: '300px'
              }}
            >
              <h3 style={{ 
                margin: '0 0 16px 0',
                fontSize: '18px',
                color: '#333',
                fontWeight: '600'
              }}>
                {column.title}
              </h3>
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
                    style={{ 
                      minHeight: '500px',
                      backgroundColor: snapshot.isDraggingOver ? '#f0f0f0' : 'transparent',
                      transition: 'background-color 0.2s ease'
                    }}
                  >
                    {column.items.map((item, index) => (
                      <Draggable key={item._id} draggableId={item._id} index={index}>
                        {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            style={{
                              ...provided.draggableProps.style,
                              marginBottom: '12px',
                              padding: '12px',
                              background: 'white',
                              borderRadius: '6px',
                              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                            }}
                          >
                            <div style={{ 
                              fontSize: '14px', 
                              fontWeight: '500',
                              marginBottom: '4px',
                              color: '#333'
                            }}>
                              {item.description}
                            </div>
                            <div style={{ 
                              fontSize: '12px', 
                              color: '#555',
                              marginBottom: '4px'
                            }}>
                              {item.goalType} | Priority: {item.priority}
                            </div>
                            <div style={{ 
                              fontSize: '11px', 
                              color: '#666',
                              fontStyle: 'italic'
                            }}>
                              {item.naming}
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
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