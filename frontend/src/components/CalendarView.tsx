import React, { useState, useEffect } from 'react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isSameMonth, 
  isToday, 
  addMonths, 
  subMonths,
  startOfWeek,
  endOfWeek
} from 'date-fns';
import type { Goal, GoalEvent } from '../types';
import { getEventsByDateRange } from '../services/goalEventService';
import AddEventModal from './AddEventModal';
import './CalendarView.css';

interface CalendarViewProps {
  data: Goal[];
}

interface ContextMenuPosition {
  x: number;
  y: number;
  day: Date;
}

const CalendarView: React.FC<CalendarViewProps> = ({ data }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<GoalEvent[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<GoalEvent | undefined>();
  const [contextMenu, setContextMenu] = useState<ContextMenuPosition | null>(null);

  // Get the start and end of the month
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  
  // Get the start and end of the week containing the month
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  
  // Get all days in the calendar view
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  useEffect(() => {
    const fetchEvents = async () => {
      const start = startOfMonth(currentDate);
      const end = endOfMonth(currentDate);
      try {
        const monthEvents = await getEventsByDateRange(start.toISOString(), end.toISOString());
        setEvents(monthEvents);
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };

    fetchEvents();
  }, [currentDate]);

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => direction === 'next' ? addMonths(prev, 1) : subMonths(prev, 1));
  };

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    setSelectedEvent(undefined);
    setIsModalOpen(true);
  };

  const handleEventClick = (event: GoalEvent, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedDate(new Date(event.date));
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const handleContextMenu = (e: React.MouseEvent, date: Date) => {
    e.preventDefault();
    handleDayClick(date);
  };

  const handleEventAdded = async () => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    const monthEvents = await getEventsByDateRange(start.toISOString(), end.toISOString());
    setEvents(monthEvents);
  };

  const getEventsForDay = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  return (
    <div className="calendar-view" onClick={() => setContextMenu(null)}>
      <div className="calendar-header">
        <button onClick={() => navigateMonth('prev')}>&lt;</button>
        <h2>{format(currentDate, 'MMMM yyyy')}</h2>
        <button onClick={() => navigateMonth('next')}>&gt;</button>
      </div>
      
      <div className="calendar-grid">
        <div className="calendar-weekdays">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="weekday">{day}</div>
          ))}
        </div>

        <div className="calendar-days">
          {days.map(day => {
            const dayEvents = getEventsForDay(day);

            return (
              <div
                key={day.toISOString()}
                className={`calendar-day ${!isSameMonth(day, currentDate) ? 'other-month' : ''} ${isToday(day) ? 'today' : ''}`}
                onClick={() => handleDayClick(day)}
                onContextMenu={(e) => handleContextMenu(e, day)}
              >
                <div className="day-number">{format(day, 'd')}</div>
                <div className="day-events">
                  {dayEvents.map(event => (
                    <div
                      key={event._id}
                      className={`event ${event.status}`}
                      onClick={(e) => handleEventClick(event, e)}
                    >
                      {event.notes || 'Event'}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {selectedDate && (
        <AddEventModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedDate(null);
            setSelectedEvent(undefined);
          }}
          selectedDate={selectedDate}
          goals={data}
          existingEvent={selectedEvent}
          onEventAdded={handleEventAdded}
        />
      )}

      {contextMenu && (
        <div 
          className="context-menu"
          style={{
            position: 'fixed',
            left: contextMenu.x,
            top: contextMenu.y,
            zIndex: 1000
          }}
        >
          <button onClick={() => handleDayClick(contextMenu.day)}>Add Event</button>
        </div>
      )}
    </div>
  );
};

export default CalendarView; 