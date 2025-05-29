import React, { useState } from 'react';
import SelectView from './SelectView';
import TableView from './TableView';
import TreeView from './TreeView';
import TimelineView from './TimelineView';
import KanbanView from './KanbanView';
import CalendarView from './CalendarView';
import PriorityQueueView from './PriorityQueueView';
import GraphView from './GraphView';
import '../App.css';
import type { Goal } from '../types';

type ViewType = 'select' | 'table' | 'tree' | 'timeline' | 'kanban' | 'calendar' | 'priority' | 'graph';

interface ViewSwitcherProps {
  data: Goal[];
  onGoalUpdated: () => Promise<void>;
}

const ViewSwitcher: React.FC<ViewSwitcherProps> = ({ data, onGoalUpdated }) => {
  const [activeView, setActiveView] = useState<ViewType>('select');

  const toggleView = (view: ViewType) => {
    setActiveView(view);
  };

  return (
    <div className="view-switcher">
      <div className="view-tabs">
        <button
          className={`view-tab ${activeView === 'select' ? 'active' : ''}`}
          onClick={() => toggleView('select')}
        >
          Select View
        </button>
        <button
          className={`view-tab ${activeView === 'table' ? 'active' : ''}`}
          onClick={() => toggleView('table')}
        >
          Table View
        </button>
        <button
          className={`view-tab ${activeView === 'tree' ? 'active' : ''}`}
          onClick={() => toggleView('tree')}
        >
          Tree View
        </button>
        <button
          className={`view-tab ${activeView === 'timeline' ? 'active' : ''}`}
          onClick={() => toggleView('timeline')}
        >
          Timeline View
        </button>
        <button
          className={`view-tab ${activeView === 'kanban' ? 'active' : ''}`}
          onClick={() => toggleView('kanban')}
        >
          Kanban View
        </button>
        <button
          className={`view-tab ${activeView === 'calendar' ? 'active' : ''}`}
          onClick={() => toggleView('calendar')}
        >
          Calendar View
        </button>
        <button
          className={`view-tab ${activeView === 'priority' ? 'active' : ''}`}
          onClick={() => toggleView('priority')}
        >
          Priority Queue
        </button>
        <button
          className={`view-tab ${activeView === 'graph' ? 'active' : ''}`}
          onClick={() => toggleView('graph')}
        >
          Graph View
        </button>
      </div>
      <div className="views-container">
        {activeView === 'select' && <SelectView data={data} onGoalUpdated={onGoalUpdated} />}
        {activeView === 'table' && <TableView data={data} />}
        {activeView === 'tree' && <TreeView data={data} />}
        {activeView === 'timeline' && <TimelineView data={data} />}
        {activeView === 'kanban' && <KanbanView data={data} onDataRefresh={onGoalUpdated} />}
        {activeView === 'calendar' && <CalendarView data={data} />}
        {activeView === 'priority' && <PriorityQueueView />}
        {activeView === 'graph' && <GraphView />}
      </div>
    </div>
  );
};

export default ViewSwitcher; 