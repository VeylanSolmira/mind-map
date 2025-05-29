import React from 'react';
import { format } from 'date-fns';
import type { Goal } from '../types';

interface TimelineViewProps {
  data: Goal[];
}

const TimelineView: React.FC<TimelineViewProps> = ({ data }) => {
  // Filter out items without dates and sort by start date
  const sortedData = [...data]
    .filter(item => item.start && item.end) // Only include items with both start and end dates
    .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

  if (sortedData.length === 0) {
    return (
      <div className="timeline-view">
        <h2>Timeline View</h2>
        <div style={{ 
          padding: '20px',
          textAlign: 'center',
          color: '#333'
        }}>
          No items with dates available to display in the timeline.
        </div>
      </div>
    );
  }

  return (
    <div className="timeline-view">
      <h2>Timeline View</h2>
      <div className="timeline-container" style={{ padding: '20px' }}>
        {sortedData.map((item) => {
          const startDate = new Date(item.start);
          const endDate = new Date(item.end);
          const duration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

          return (
            <div 
              key={item._id}
              className="timeline-item"
              style={{
                marginBottom: '20px',
                padding: '15px',
                background: 'white',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                position: 'relative',
                borderLeft: `4px solid ${item.done ? '#4CAF50' : '#2196F3'}`
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ margin: '0 0 8px 0', fontSize: '16px', fontWeight: '600', color: '#333' }}>
                    {item.description}
                  </h3>
                  <div style={{ fontSize: '14px', color: '#555', marginBottom: '8px' }}>
                    {item.goalType} | Priority: {item.priority} | Score: {item.score}
                  </div>
                  <div style={{ fontSize: '13px', color: '#666' }}>
                    {format(startDate, 'MMM d, yyyy')} - {format(endDate, 'MMM d, yyyy')} ({duration} days)
                  </div>
                </div>
                <div style={{ 
                  padding: '4px 8px', 
                  borderRadius: '4px',
                  background: item.done ? '#E8F5E9' : '#E3F2FD',
                  color: item.done ? '#2E7D32' : '#1565C0',
                  fontSize: '12px',
                  fontWeight: '500'
                }}>
                  {item.done ? 'Completed' : 'In Progress'}
                </div>
              </div>
              {item.hierarchyId && (
                <div style={{ 
                  fontSize: '12px', 
                  color: '#666',
                  marginTop: '8px',
                  fontStyle: 'italic'
                }}>
                  Path: {item.hierarchyId}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TimelineView; 