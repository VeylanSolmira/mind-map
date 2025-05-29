import React, { useState, useEffect } from 'react';
import type { Goal } from '../types';
import { 
  buildNavigationTree, 
  generateNewHierarchyId, 
  getHierarchyPath, 
  hasChildren,
  type TreeNavigationNode 
} from '../utils/hierarchyUtils';
import './GoalTreeNavigator.css';

interface GoalTreeNavigatorProps {
  existingGoals: Goal[];
  selectedParent: TreeNavigationNode | null;
  onSelectParent: (parent: TreeNavigationNode | null) => void;
  onPreviewHierarchyId: (hierarchyId: string) => void;
}

interface TreeNodeProps {
  node: TreeNavigationNode;
  level: number;
  isSelected: boolean;
  isExpanded: boolean;
  onSelect: (node: TreeNavigationNode) => void;
  onToggleExpand: (node: TreeNavigationNode) => void;
}

const TreeNodeComponent: React.FC<TreeNodeProps> = ({
  node,
  level,
  isSelected,
  isExpanded,
  onSelect,
  onToggleExpand
}) => {
  const nodeHasChildren = hasChildren(node);
  const indent = level * 20;

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

  return (
    <div className="tree-node-container">
      <div 
        className={`tree-node ${isSelected ? 'selected' : ''}`}
        style={{ paddingLeft: `${indent}px` }}
        onClick={() => onSelect(node)}
      >
        <div className="node-content">
          <div className="node-expand">
            {nodeHasChildren ? (
              <button
                className="expand-button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleExpand(node);
                }}
              >
                {isExpanded ? '▼' : '▶'}
              </button>
            ) : (
              <span className="no-expand">•</span>
            )}
          </div>
          
          <div className="node-info">
            <span className="node-icon">
              {nodeHasChildren ? '📁' : getGoalTypeIcon(node.goalType)}
            </span>
            <span className="node-text">
              <span className="hierarchy-id">{node.hierarchyId}</span>
              <span className="description">{node.description}</span>
            </span>
          </div>
          
          <div className="node-actions">
            <button
              className="add-child-button"
              onClick={(e) => {
                e.stopPropagation();
                onSelect(node);
              }}
              title="Add child goal here"
            >
              + Add Child
            </button>
          </div>
        </div>
      </div>
      
      {isExpanded && nodeHasChildren && (
        <div className="tree-children">
          {node.children?.map(child => (
            <TreeNodeComponent
              key={child.hierarchyId}
              node={child}
              level={level + 1}
              isSelected={false}
              isExpanded={false} // We'll manage this in the parent
              onSelect={onSelect}
              onToggleExpand={onToggleExpand}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const GoalTreeNavigator: React.FC<GoalTreeNavigatorProps> = ({
  existingGoals,
  selectedParent,
  onSelectParent,
  onPreviewHierarchyId
}) => {
  const [tree, setTree] = useState<TreeNavigationNode[]>([]);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const navigationTree = buildNavigationTree(existingGoals);
    setTree(navigationTree);
  }, [existingGoals]);

  useEffect(() => {
    // Update preview hierarchy ID when selection changes
    const newHierarchyId = generateNewHierarchyId(selectedParent, existingGoals);
    onPreviewHierarchyId(newHierarchyId);
  }, [selectedParent, existingGoals, onPreviewHierarchyId]);

  const handleToggleExpand = (node: TreeNavigationNode) => {
    setExpandedNodes(prev => {
      const next = new Set(prev);
      if (next.has(node.hierarchyId)) {
        next.delete(node.hierarchyId);
      } else {
        next.add(node.hierarchyId);
      }
      return next;
    });
  };

  const handleSelectRoot = () => {
    onSelectParent(null);
  };

  const filteredTree = searchTerm 
    ? tree.filter(node => 
        node.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        node.hierarchyId.includes(searchTerm)
      )
    : tree;

  return (
    <div className="goal-tree-navigator">
      <div className="navigator-header">
        <h3>Choose Goal Location</h3>
        <p className="navigator-description">
          Select where you want to add the new goal in your hierarchy
        </p>
      </div>

      <div className="search-container">
        <input
          type="text"
          placeholder="Search goals..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="location-preview">
        <div className="preview-label">New goal will be created at:</div>
        <div className="preview-path">
          <strong>{getHierarchyPath(selectedParent)}</strong>
        </div>
        <div className="preview-id">
          ID: {generateNewHierarchyId(selectedParent, existingGoals)}
        </div>
      </div>

      <div className="tree-container">
        <div className="root-option">
          <button
            className={`root-button ${selectedParent === null ? 'selected' : ''}`}
            onClick={handleSelectRoot}
          >
            <span className="node-icon">🏠</span>
            <span>Root Level</span>
            <span className="add-action">+ Add Here</span>
          </button>
        </div>

        <div className="tree-nodes">
          {filteredTree.length === 0 ? (
            <div className="empty-tree">
              <p>No goals found. Your new goal will be the first!</p>
            </div>
          ) : (
            filteredTree.map(node => (
              <TreeNodeComponent
                key={node.hierarchyId}
                node={node}
                level={0}
                isSelected={selectedParent?.hierarchyId === node.hierarchyId}
                isExpanded={expandedNodes.has(node.hierarchyId)}
                onSelect={onSelectParent}
                onToggleExpand={handleToggleExpand}
              />
            ))
          )}
        </div>
      </div>

      <div className="navigator-actions">
        <button
          className="expand-all-button"
          onClick={() => {
            const allNodes = new Set<string>();
            const addNodeIds = (nodes: TreeNavigationNode[]) => {
              nodes.forEach(node => {
                if (hasChildren(node)) {
                  allNodes.add(node.hierarchyId);
                  addNodeIds(node.children || []);
                }
              });
            };
            addNodeIds(tree);
            setExpandedNodes(allNodes);
          }}
        >
          Expand All
        </button>
        
        <button
          className="collapse-all-button"
          onClick={() => setExpandedNodes(new Set())}
        >
          Collapse All
        </button>
      </div>
    </div>
  );
};

export default GoalTreeNavigator; 