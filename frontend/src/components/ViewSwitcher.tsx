import React, { useState } from 'react';
import SelectView from './SelectView';
import TableView from './TableView';
import '../App.css';
import type { Goal } from '../services/api';

type ViewType = 'select' | 'table';

interface ViewSwitcherProps {
  data: Goal[];
}

const ViewSwitcher: React.FC<ViewSwitcherProps> = ({ data }) => {
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
      </div>
      <div className="views-container">
        {activeView === 'select' && <SelectView data={data} />}
        {activeView === 'table' && <TableView data={data} />}
      </div>
    </div>
  );
};

export default ViewSwitcher; 