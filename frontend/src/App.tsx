import React, { useState, useEffect } from 'react'
import './App.css'
import TreeView from './components/TreeView'
import TableView from './components/TableView'
import TimelineView from './components/TimelineView'
import KanbanView from './components/KanbanView'
import CalendarView from './components/CalendarView'
import SelectView from './components/SelectView'
import CreateGoalModal from './components/CreateGoalModal'
import { getGoals, createGoal, updateGoal } from './services/api'
import { calculateEffectivePriority } from './utils/priorityUtils'
import type { Goal } from './types'

type ViewType = 'tree' | 'table' | 'timeline' | 'kanban' | 'calendar' | 'select';

/* Commented out local Goal interface
interface Goal {
  id: string;
  hierarchyId: string;
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
}
*/

const App: React.FC = () => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeView, setActiveView] = useState<ViewType>(() => {
    const savedView = localStorage.getItem('activeView');
    return (savedView as ViewType) || 'tree';
  });
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const updateEffectivePriorities = async () => {
    const updatedGoals = goals.map(goal => ({
      ...goal,
      effectivePriority: calculateEffectivePriority(
        goal.priority,
        goal.decayRate,
        goal.lastSelected
      )
    }));

    // Update each goal in the database
    for (const goal of updatedGoals) {
      try {
        await updateGoal(goal._id, goal);
      } catch (error) {
        console.error(`Error updating goal ${goal._id}:`, error);
      }
    }

    // Update local state
    setGoals(updatedGoals);
  };

  const refreshGoals = async () => {
    try {
      setLoading(true);
      const updatedGoals = await getGoals();
      setGoals(updatedGoals);
    } catch (error) {
      console.error('Error refreshing goals:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshGoals();
  }, []);

  const handleCreateGoal = async (newGoal: Omit<Goal, '_id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const createdGoal = await createGoal({
        ...newGoal,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      setGoals(prevData => [...prevData, createdGoal]);
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error creating goal:', error);
    }
  };

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
          setIsFullscreen(false);
        }
      }
    } catch (error: unknown) {
      const err = error as Error;
      console.error(`Error attempting to enable fullscreen: ${err.message}`);
    }
  };

  const toggleView = async (view: ViewType) => {
    if (view === 'table' || view === 'select') {
      await updateEffectivePriorities();
    }
    setActiveView(view);
    localStorage.setItem('activeView', view);
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>🧠 Mind Map Goal Management System</h1>
        <button 
          className="fullscreen-button"
          onClick={toggleFullscreen}
        >
          {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
        </button>
      </header>
      <div className="view-tabs">
        <button 
          className={`view-tab ${activeView === 'tree' ? 'active' : ''}`}
          onClick={() => toggleView('tree')}
        >
          Goals: Tree
        </button>
        <button 
          className={`view-tab ${activeView === 'table' ? 'active' : ''}`}
          onClick={() => toggleView('table')}
        >
          Goals: Table
        </button>
        <button 
          className={`view-tab ${activeView === 'timeline' ? 'active' : ''}`}
          onClick={() => toggleView('timeline')}
        >
          Timeline
        </button>
        <button 
          className={`view-tab ${activeView === 'kanban' ? 'active' : ''}`}
          onClick={() => toggleView('kanban')}
        >
          Kanban
        </button>
        <button 
          className={`view-tab ${activeView === 'calendar' ? 'active' : ''}`}
          onClick={() => toggleView('calendar')}
        >
          Calendar
        </button>
        <button 
          className={`view-tab ${activeView === 'select' ? 'active' : ''}`}
          onClick={() => toggleView('select')}
        >
          Select Goal
        </button>
      </div>
      <main className={`App-main ${isFullscreen ? 'fullscreen' : ''}`}>
        <div className="views-container">
          {activeView === 'tree' && <div className="view-panel"><TreeView data={goals} /></div>}
          {activeView === 'table' && <div className="view-panel"><TableView data={goals} /></div>}
          {activeView === 'timeline' && <div className="view-panel"><TimelineView data={goals} /></div>}
          {activeView === 'kanban' && <div className="view-panel"><KanbanView data={goals} /></div>}
          {activeView === 'calendar' && <div className="view-panel"><CalendarView data={goals} /></div>}
          {activeView === 'select' && <div className="view-panel"><SelectView data={goals} onGoalUpdated={refreshGoals} /></div>}
        </div>
      </main>
      {!isFullscreen && (
        <footer className="App-footer">
          <p>© 2025 🧠 Mind Map Goal Management System</p>
        </footer>
      )}
      {isModalOpen && (
        <CreateGoalModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleCreateGoal}
          existingGoals={goals}
        />
      )}
    </div>
  )
}

export default App
