import React, { useState, useEffect } from 'react';
import './TableView.css';
import type { Goal } from '../types';
import CreateGoalModal from './CreateGoalModal';

/* Commented out local Goal interface
interface Goal {
  _id: string;
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

type SortField = keyof Goal;
type SortDirection = 'asc' | 'desc';

interface TableViewProps {
  data: Goal[];
}

const ITEMS_PER_PAGE = 10;

interface Column {
  field: keyof Goal;
  headerName: string;
}

const columns: Column[] = [
  { field: 'description', headerName: 'Description' },
  { field: 'link', headerName: 'Link' },
  { field: 'summary', headerName: 'Summary' },
  { field: 'goalType', headerName: 'Type' },
  { field: 'hierarchyId', headerName: 'Hierarchy ID' },
  { field: 'done', headerName: 'Done' },
  { field: 'priority', headerName: 'Priority' },
  { field: 'effectivePriority', headerName: 'Effective Priority' },
  { field: 'lastSelected', headerName: 'Last Selected' },
  { field: 'decayRate', headerName: 'Decay Rate' },
  { field: 'score', headerName: 'Score' },
  { field: 'assessment', headerName: 'Assessment' },
  { field: 'communityValue', headerName: 'Community Value' },
  { field: 'start', headerName: 'Start' },
  { field: 'end', headerName: 'End' },
  { field: 'autoIngest', headerName: 'Auto Ingest' },
  { field: 'tier', headerName: 'Tier' },
  { field: 'domain', headerName: 'Domain' },
  { field: 'subtopic', headerName: 'Subtopic' },
  { field: 'tags', headerName: 'Tags' },
  { field: 'next_action_date', headerName: 'Next Action Date' },
  { field: 'action_note', headerName: 'Action Note' },
  { field: 'date_added', headerName: 'Date Added' }
];

const TableView: React.FC<TableViewProps> = ({ data }) => {
  const [editingCell, setEditingCell] = useState<{ id: string; field: keyof Goal } | null>(null);
  const [editValue, setEditValue] = useState('');
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; nodeId: string } | null>(null);
  const [headerContextMenu, setHeaderContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [visibleColumns, setVisibleColumns] = useState<Set<keyof Goal>>(() => {
    const savedVisibleColumns = localStorage.getItem('visibleColumns');
    return savedVisibleColumns ? new Set(JSON.parse(savedVisibleColumns)) : new Set([
      'description',
      'goalType',
      'hierarchyId',
      'done',
      'priority',
      'effectivePriority',
      'lastSelected',
      'score',
      'assessment',
      'communityValue',
      'start',
      'end'
    ]);
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<SortField>('description');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [editedData, setEditedData] = useState<Goal[]>(data);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{ text: string; x: number; y: number } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchField, setSearchField] = useState<keyof Goal | null>(null);
  const [fullGoalData, setFullGoalData] = useState<Goal | null>(null);
  const [isProcessingIngest, setIsProcessingIngest] = useState(false);
  const [columnOrder, setColumnOrder] = useState<Column[]>(() => {
    const savedOrder = localStorage.getItem('columnOrder');
    return savedOrder ? JSON.parse(savedOrder) : columns;
  });
  const [draggedColumn, setDraggedColumn] = useState<Column | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<Column | null>(null);

  // Save column order to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('columnOrder', JSON.stringify(columnOrder));
  }, [columnOrder]);

  // Save visible columns to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('visibleColumns', JSON.stringify(Array.from(visibleColumns)));
  }, [visibleColumns]);

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleCellClick = (id: string, field: keyof Goal) => {
    const goal = data.find((item: Goal) => item._id === id);
    if (goal) {
      setEditingCell({ id, field });
      setEditValue(String(goal[field]));
    }
  };

  const handleCellChange = async (id: string, field: keyof Goal, value: string) => {
    setEditValue(value);
  };

  const handleKeyPress = async (e: React.KeyboardEvent, id: string, field: keyof Goal) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      try {
        setIsSaving(true);
        setError(null);
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
        const response = await fetch(`${API_URL}/goals/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            [field]: editValue
          })
        });

        if (!response.ok) {
          throw new Error('Failed to update goal');
        }

        // Update local state without reloading
        const updatedData = data.map((item: Goal) => {
          if (item._id === id) {
            return {
              ...item,
              [field]: editValue
            };
          }
          return item;
        });
        setEditedData(updatedData);
        setEditingCell(null);
      } catch (error) {
        console.error('Error updating goal:', error);
        setError('Failed to update goal. Please try again.');
      } finally {
        setIsSaving(false);
      }
    } else if (e.key === 'Escape') {
      setEditingCell(null);
    }
  };

  const handleCellMouseEnter = (e: React.MouseEvent<HTMLDivElement>, value: string) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltip({
      text: value,
      x: rect.left,
      y: rect.bottom + window.scrollY
    });
  };

  const handleCellMouseLeave = () => {
    setTooltip(null);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to first page when search changes
  };

  const toggleSearch = (field: keyof Goal) => {
    if (searchField === field) {
      setIsSearchVisible(false);
      setSearchField(null);
      setSearchQuery('');
    } else {
      setIsSearchVisible(true);
      setSearchField(field);
      setSearchQuery('');
    }
  };

  // Filter data based on search query
  const filteredData = editedData.filter(goal => {
    if (!searchQuery || !searchField) return true;
    const value = String(goal[searchField]).toLowerCase();
    return value.includes(searchQuery.toLowerCase());
  });

  const sortedData = [...filteredData].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];

    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === 'asc' 
        ? aValue - bValue
        : bValue - aValue;
    }

    if (typeof aValue === 'boolean' && typeof bValue === 'boolean') {
      return sortDirection === 'asc'
        ? (aValue === bValue ? 0 : aValue ? -1 : 1)
        : (aValue === bValue ? 0 : aValue ? 1 : -1);
    }

    return 0;
  });

  // Pagination calculations
  const totalPages = Math.ceil(sortedData.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentData = sortedData.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    setEditingCell(null); // Clear any active editing when changing pages
  };

  const renderCell = (goal: Goal, field: keyof Goal) => {
    const isEditing = editingCell?.id === goal._id && editingCell?.field === field;
    const value = goal[field];
    const uniqueKey = `${goal._id || 'unknown'}-${field}`;

    if (isEditing) {
      return (
        <input
          key={`input-${uniqueKey}`}
          type={field === 'priority' ? 'number' : 'text'}
          value={editValue}
          onChange={(e) => handleCellChange(goal._id, field, e.target.value)}
          onBlur={() => setEditingCell(null)}
          onKeyPress={(e) => handleKeyPress(e, goal._id, field)}
          min={field === 'priority' ? '0.01' : undefined}
          step={field === 'priority' ? '0.01' : undefined}
          autoFocus
        />
      );
    }

    if (field === 'link' && typeof value === 'string' && value) {
      return (
        <a
          key={`link-${uniqueKey}`}
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="cell-content link"
        >
          {value}
        </a>
      );
    }

    if (field === 'effectivePriority' as keyof Goal && typeof value === 'number') {
      const formattedValue = value.toFixed(2);
      return (
        <div
          key={`div-${uniqueKey}`}
          onClick={() => handleCellClick(goal._id, field)}
          onKeyPress={(e) => handleKeyPress(e, goal._id, field)}
          onMouseEnter={(e) => handleCellMouseEnter(e, formattedValue)}
          onMouseLeave={handleCellMouseLeave}
          data-full-text={formattedValue}
        >
          {formattedValue}
        </div>
      );
    }

    if (field === 'lastSelected') {
      const date = new Date(value as string);
      const formattedDate = date.toLocaleString(undefined, {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      }).replace(/(\d+)\/(\d+)\/(\d+)/, '$3-$1-$2');
      return (
        <div
          key={`div-${uniqueKey}`}
          onClick={() => handleCellClick(goal._id, field)}
          onKeyPress={(e) => handleKeyPress(e, goal._id, field)}
          onMouseEnter={(e) => handleCellMouseEnter(e, formattedDate)}
          onMouseLeave={handleCellMouseLeave}
          className="cell-content"
        >
          {formattedDate}
        </div>
      );
    }

    if (typeof value === 'boolean') {
      return (
        <input
          key={`checkbox-${uniqueKey}`}
          type="checkbox"
          checked={value}
          onChange={(e) => handleCellChange(goal._id, field, String(e.target.checked))}
          onKeyPress={(e) => handleKeyPress(e, goal._id, field)}
        />
      );
    }

    const displayValue = String(value);
    return (
      <div
        key={`div-${uniqueKey}`}
        onClick={() => handleCellClick(goal._id, field)}
        onKeyPress={(e) => handleKeyPress(e, goal._id, field)}
        onMouseEnter={(e) => handleCellMouseEnter(e, displayValue)}
        onMouseLeave={handleCellMouseLeave}
        className="cell-content"
      >
        {displayValue}
      </div>
    );
  };

  const handleContextMenu = async (e: React.MouseEvent, nodeId: string) => {
    e.preventDefault();
    try {
      // Find the goal by description to get its _id
      const goalToFetch = data.find(goal => goal.description === nodeId);
      if (!goalToFetch) {
        throw new Error('Goal not found');
      }

      // Fetch the full goal data
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
      const response = await fetch(`${API_URL}/goals/${goalToFetch._id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch goal data');
      }
      const fullData = await response.json();
      setFullGoalData(fullData);

      setContextMenu({
        x: e.clientX,
        y: e.clientY,
        nodeId
      });
    } catch (error) {
      console.error('Error fetching goal data:', error);
    }
  };

  const handleDeleteNode = async (nodeId: string) => {
    try {
      // Find the goal by description to get its _id
      const goalToDelete = data.find(goal => goal.description === nodeId);
      if (!goalToDelete) {
        throw new Error('Goal not found');
      }

      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
      const response = await fetch(`${API_URL}/goals/${goalToDelete._id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete goal');
      }

      // Refresh the page to show the updated table
      window.location.reload();
    } catch (error) {
      console.error('Error deleting goal:', error);
    }
  };

  const handleCreateGoal = async (newGoal: Omit<Goal, '_id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
      const response = await fetch(`${API_URL}/goals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newGoal,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create goal');
      }

      // Refresh the page to show the new goal
      window.location.reload();
    } catch (error) {
      console.error('Error creating goal:', error);
    }
  };

  const handleHeaderContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setHeaderContextMenu({
      x: e.clientX,
      y: e.clientY
    });
  };

  const toggleColumnVisibility = (field: keyof Goal) => {
    setVisibleColumns(prev => {
      const newSet = new Set(prev);
      if (newSet.has(field)) {
        newSet.delete(field);
      } else {
        newSet.add(field);
      }
      return newSet;
    });
  };

  // Filter columns based on visibility and order
  const visibleColumnsList = columnOrder.filter(col => visibleColumns.has(col.field));

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClick = () => {
      setContextMenu(null);
      setHeaderContextMenu(null);
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  const handleResearchIngest = async () => {
    try {
      setIsProcessingIngest(true);
      setError(null);
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
      const response = await fetch(`${API_URL}/research/ingest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('Failed to process research ingest');
      }

      // Refresh the page to show updated data
      window.location.reload();
    } catch (error) {
      console.error('Error processing research ingest:', error);
      setError('Failed to process research ingest. Please try again.');
    } finally {
      setIsProcessingIngest(false);
    }
  };

  const handleDragStart = (column: Column) => {
    setDraggedColumn(column);
  };

  const handleDragOver = (e: React.DragEvent, column: Column) => {
    e.preventDefault();
    setDragOverColumn(column);
  };

  const handleDrop = (e: React.DragEvent, targetColumn: Column) => {
    e.preventDefault();
    if (draggedColumn && targetColumn && draggedColumn !== targetColumn) {
      const newOrder = [...columnOrder];
      const draggedIndex = newOrder.findIndex(col => col.field === draggedColumn.field);
      const targetIndex = newOrder.findIndex(col => col.field === targetColumn.field);
      
      // Remove dragged column and insert at new position
      newOrder.splice(draggedIndex, 1);
      newOrder.splice(targetIndex, 0, draggedColumn);
      
      setColumnOrder(newOrder);
    }
    setDraggedColumn(null);
    setDragOverColumn(null);
  };

  const handleDragEnd = () => {
    setDraggedColumn(null);
    setDragOverColumn(null);
  };

  return (
    <div className="table-container">
      <div className="table-header">
        <div className="table-info">
          Showing {startIndex + 1}-{Math.min(endIndex, sortedData.length)} of {sortedData.length} entries
          <button 
            className="add-goal-button"
            onClick={() => setIsModalOpen(true)}
            style={{
              marginLeft: '16px',
              padding: '8px 16px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <span style={{ fontSize: '18px' }}>+</span>
            Add New Goal
          </button>
          <button 
            className="action-button"
            onClick={handleResearchIngest}
            disabled={isProcessingIngest}
            style={{
              backgroundColor: '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px'
            }}
          >
            <svg 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
            </svg>
            {isProcessingIngest ? 'Processing...' : 'Ingest Bookmarks'}
          </button>
        </div>
      </div>
      {error && <div className="error-message">{error}</div>}
      {isSaving && (
        <div className="saving-indicator">
          Saving changes...
        </div>
      )}
      {tooltip && (
        <div 
          className="tooltip"
          style={{
            left: tooltip.x,
            top: tooltip.y
          }}
        >
          {tooltip.text}
        </div>
      )}
      <table className="goals-table">
        <thead onContextMenu={handleHeaderContextMenu}>
          <tr>
            {visibleColumnsList.map(column => (
              <th
                key={column.field}
                draggable
                onDragStart={() => handleDragStart(column)}
                onDragOver={(e) => handleDragOver(e, column)}
                onDrop={(e) => handleDrop(e, column)}
                onDragEnd={handleDragEnd}
                onClick={() => handleSort(column.field as SortField)}
                className={`${draggedColumn?.field === column.field ? 'dragging' : ''} ${dragOverColumn?.field === column.field ? 'drag-over' : ''} ${sortField === column.field ? `sorted-${sortDirection}` : ''}`}
              >
                <div className="header-content">
                  {column.headerName}
                  <button 
                    className="search-toggle"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleSearch(column.field);
                    }}
                  >
                    🔍
                  </button>
                  {sortField === column.field && (
                    <span className="sort-indicator">
                      {sortDirection === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
                {isSearchVisible && searchField === column.field && (
                  <div className="search-container">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={handleSearchChange}
                      placeholder={`Search ${column.headerName.toLowerCase()}...`}
                      className="search-input"
                    />
                  </div>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {currentData.map(goal => (
            <tr 
              key={goal._id}
              onContextMenu={(e) => handleContextMenu(e, goal.description)}
            >
              {visibleColumnsList.map(column => (
                <td
                  key={`cell-${goal._id}-${column.field}`}
                  onClick={() => handleCellClick(goal._id, column.field)}
                  className={editingCell?.id === goal._id && editingCell?.field === column.field ? 'editing' : ''}
                >
                  {renderCell(goal, column.field)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="pagination">
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>
      {contextMenu && (
        <div
          style={{
            position: 'fixed',
            top: contextMenu.y,
            left: contextMenu.x,
            backgroundColor: 'white',
            border: '1px solid #ddd',
            borderRadius: '4px',
            boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
            zIndex: 1000,
          }}
        >
          <button
            onClick={() => {
              handleDeleteNode(contextMenu.nodeId);
              setContextMenu(null);
            }}
            style={{
              display: 'block',
              width: '100%',
              padding: '8px 16px',
              border: 'none',
              backgroundColor: 'transparent',
              textAlign: 'left',
              cursor: 'pointer',
              color: '#dc3545',
              fontSize: '14px',
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            Delete
          </button>
        </div>
      )}
      {headerContextMenu && (
        <div
          style={{
            position: 'fixed',
            top: headerContextMenu.y,
            left: headerContextMenu.x,
            backgroundColor: 'white',
            border: '1px solid #ddd',
            borderRadius: '4px',
            boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
            zIndex: 1000,
            padding: '8px 0',
            minWidth: '200px',
            color: '#333'
          }}
        >
          <div style={{ 
            padding: '0 16px 8px', 
            borderBottom: '1px solid #eee', 
            marginBottom: '8px',
            color: '#333'
          }}>
            <strong>Toggle Columns</strong>
          </div>
          {columns.map(column => (
            <label
              key={column.field}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '6px 16px',
                cursor: 'pointer',
                fontSize: '14px',
                userSelect: 'none',
                color: '#333'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <input
                type="checkbox"
                checked={visibleColumns.has(column.field)}
                onChange={() => toggleColumnVisibility(column.field)}
                style={{ marginRight: '8px' }}
              />
              {column.headerName}
            </label>
          ))}
        </div>
      )}
      {isModalOpen && (
        <CreateGoalModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleCreateGoal}
          existingGoals={data}
        />
      )}
    </div>
  );
};

export default TableView; 