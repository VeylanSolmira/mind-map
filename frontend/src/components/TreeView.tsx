import React, { useState, useEffect } from 'react';
import Tree from 'react-d3-tree';
import type { RawNodeDatum } from 'react-d3-tree';
import { updateGoal } from '../services/api';
import './TreeView.css';
import type { Goal } from '../types';

interface TreeNode extends Goal {
  children?: TreeNode[];
}

interface TreeViewProps {
  data: Goal[];
}

interface AddNodeFormProps {
  parentNode: string;
  onSave: (newNode: Partial<TreeNode>) => Promise<void>;
  onCancel: () => void;
  position: { x: number; y: number };
}

const AddNodeForm: React.FC<AddNodeFormProps> = ({ onSave, onCancel, position }) => {
  const [formData, setFormData] = useState<Partial<TreeNode>>({
    description: '',
    goalType: '',
    priority: 1,
    start: '',
    end: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description || !formData.goalType) {
      setError('Description and Goal Type are required');
      return;
    }

    try {
      setIsSaving(true);
      setError(null);
      await onSave(formData);
    } catch {
      setError('Failed to save node. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div 
      className="add-node-form"
      style={{
        position: 'absolute',
        left: position.x,
        top: position.y,
      }}
    >
      <form onSubmit={handleSubmit}>
        <h3>Add New Node</h3>
        {error && <div className="error-message">{error}</div>}
        
        <div className="form-group">
          <label htmlFor="description">Description *</label>
          <input
            type="text"
            id="description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="goalType">Goal Type *</label>
          <input
            type="text"
            id="goalType"
            value={formData.goalType}
            onChange={(e) => setFormData(prev => ({ ...prev, goalType: e.target.value }))}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="priority">Priority *</label>
          <input
            type="number"
            id="priority"
            value={formData.priority}
            onChange={(e) => setFormData(prev => ({ ...prev, priority: Number(e.target.value) }))}
            min="0.01"
            step="0.01"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="start">Start Date</label>
          <input
            type="date"
            id="start"
            value={formData.start}
            onChange={(e) => setFormData(prev => ({ ...prev, start: e.target.value }))}
          />
        </div>

        <div className="form-group">
          <label htmlFor="end">End Date</label>
          <input
            type="date"
            id="end"
            value={formData.end}
            onChange={(e) => setFormData(prev => ({ ...prev, end: e.target.value }))}
          />
        </div>

        <div className="form-actions">
          <button type="button" onClick={onCancel} disabled={isSaving}>
            Cancel
          </button>
          <button type="submit" disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  );
};

// Build tree structure from flat goals array
function buildTree(goals: TreeNode[]): TreeNode[] {
  // Sort goals by hierarchyId to ensure parents are processed before children
  const sortedGoals = [...goals].sort((a, b) => {
    const aParts = a.hierarchyId?.split('.') || [];
    const bParts = b.hierarchyId?.split('.') || [];
    return aParts.length - bParts.length;
  });

  const goalMap = new Map<string, TreeNode>();
  const tree: TreeNode[] = [];

  // First pass: Create a map of all goals using hierarchyId as key
  sortedGoals.forEach(goal => {
    goalMap.set(goal.hierarchyId, { ...goal, children: [] });
  });

  // Second pass: Build the tree structure using hierarchyId
  sortedGoals.forEach(goal => {
    const goalWithChildren = goalMap.get(goal.hierarchyId)!;
    const hierarchyParts = goal.hierarchyId?.split('.') || [];
    
    if (hierarchyParts.length > 1) {
      // This is a child goal
      const parentHierarchyId = hierarchyParts.slice(0, -1).join('.');
      const parent = goalMap.get(parentHierarchyId);
      
      if (parent) {
        parent.children = parent.children || [];
        parent.children.push(goalWithChildren);
      } else {
        console.warn(`Parent with hierarchyId ${parentHierarchyId} not found for goal ${goal.hierarchyId}`);
        tree.push(goalWithChildren);
      }
    } else {
      // This is a root goal
      tree.push(goalWithChildren);
    }
  });

  return tree;
}

const getBorderColor = (goalType: string): string => {
  switch (goalType) {
    case 'Overarching':
      return '#1565C0';
    case 'Longterm':
      return '#2E7D32';
    case 'Moderate':
      return '#E65100';
    case 'Micro':
      return '#6A1B9A';
    case 'Day':
      return '#00838F';
    default:
      return '#424242';
  }
};

const TreeView: React.FC<TreeViewProps> = ({ data: initialData }) => {
  const [data, setData] = useState(initialData);
  const tree = buildTree(data);
  const [editingNode, setEditingNode] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [formPosition, setFormPosition] = useState<{ x: number; y: number } | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; nodeId: string } | null>(null);
  
  // Initialize with all nodes expanded
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(() => {
    const expanded = new Set<string>();
    const addNode = (node: TreeNode) => {
      expanded.add(node.description);
      node.children?.forEach(addNode);
    };
    tree.forEach(addNode);
    return expanded;
  });

  // Create a map of node descriptions to their total descendant count
  const nodeDescendantCountMap = React.useMemo(() => {
    const map = new Map<string, number>();
    const countDescendants = (node: TreeNode): number => {
      if (!node.children?.length) return 0;
      return node.children.length + node.children.reduce((sum, child) => sum + countDescendants(child), 0);
    };
    const addNode = (node: TreeNode) => {
      map.set(node.description, countDescendants(node));
      node.children?.forEach(addNode);
    };
    tree.forEach(addNode);
    return map;
  }, [tree]);

  // Create a map of node descriptions to their children
  const nodeChildrenMap = React.useMemo(() => {
    const map = new Map<string, boolean>();
    const addNode = (node: TreeNode) => {
      map.set(node.description, Boolean(node.children?.length));
      node.children?.forEach(addNode);
    };
    tree.forEach(addNode);
    return map;
  }, [tree]);

  const treeData = React.useMemo(() => {
    return tree.map(node => {
      const mapNode = (n: TreeNode): RawNodeDatum => ({
        name: n.description,
        attributes: {
          Type: n.goalType,
          Priority: n.priority,
          Score: n.score,
          Assessment: n.assessment,
          'Community Value': n.communityValue,
          Start: n.start,
          End: n.end,
          Done: n.done ? 'Yes' : 'No'
        },
        children: expandedNodes.has(n.description) ? n.children?.map(mapNode) : undefined
      });
      return mapNode(node);
    });
  }, [tree, expandedNodes]);

  const handleEdgeClick = (nodeId: string) => {
    setExpandedNodes(prev => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  };

  const handleNodeClick = (node: { data: RawNodeDatum }) => {
    if (!editingNode) {
      setEditingNode(node.data.name);
      setEditValue(node.data.name);
    }
  };

  const handleEditSubmit = async () => {
    if (editingNode && editValue.trim() && editValue !== editingNode) {
      try {
        // Find the goal by description to get its IDs
        const goalToUpdate = data.find(goal => goal.description === editingNode);
        if (!goalToUpdate) {
          throw new Error('Goal not found');
        }

        // Use the updateGoal function from our API service
        await updateGoal(goalToUpdate._id, {
          description: editValue,
          hierarchyId: goalToUpdate.hierarchyId  // Keep the hierarchical ID unchanged
        });

        // Update local state
        setData(prevData => 
          prevData.map(goal => 
            goal._id === goalToUpdate._id 
              ? { ...goal, description: editValue }
              : goal
          )
        );
      } catch (error) {
        console.error('Error updating goal:', error);
        // TODO: Show error message to user
      }
    }
    setEditingNode(null);
  };

  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleEditSubmit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setEditingNode(null);
    }
  };

  const handleAddNode = (parentNode: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedNode(parentNode);
    setFormPosition({ x: e.clientX, y: e.clientY });
  };

  const handleSaveNode = async (newNode: Partial<TreeNode>) => {
    if (!selectedNode) return;

    // Find the parent node to get its hierarchyId
    const parentNode = data.find(goal => goal.description === selectedNode);
    if (!parentNode) return;

    // Generate new hierarchyId
    const parentHierarchyId = parentNode.hierarchyId;
    const siblings = data.filter(goal => 
      goal.hierarchyId.startsWith(parentHierarchyId + '.') &&
      goal.hierarchyId.split('.').length === parentHierarchyId.split('.').length + 1
    );
    
    const lastSibling = siblings.sort((a, b) => {
      const aNum = parseInt(a.hierarchyId.split('.').pop() || '0');
      const bNum = parseInt(b.hierarchyId.split('.').pop() || '0');
      return bNum - aNum;
    })[0];

    const lastNumber = lastSibling 
      ? parseInt(lastSibling.hierarchyId.split('.').pop() || '0')
      : 0;
    
    const newHierarchyId = `${parentHierarchyId}.${lastNumber + 1}`;

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
      const response = await fetch(`${API_URL}/goals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...newNode,
          hierarchyId: newHierarchyId,
          done: false,
          score: 0,
          assessment: 0,
          communityValue: 0,
          decayRate: 0.1,
          effectivePriority: newNode.priority
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create goal');
      }

      // Refresh the page to show the new node
      window.location.reload();
    } catch (error) {
      console.error('Error creating goal:', error);
      throw error;
    }
  };

  const handleCancelAdd = () => {
    setSelectedNode(null);
    setFormPosition(null);
  };

  const handleContextMenu = (e: React.MouseEvent, nodeId: string) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      nodeId
    });
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

      // Refresh the page to show the updated tree
      window.location.reload();
    } catch (error) {
      console.error('Error deleting goal:', error);
    }
  };

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  const handleAddChildNode = (node: RawNodeDatum) => {
    const goal = node.data as Goal;
    
    const newNode: Omit<Goal, '_id'> = {
      hierarchyId: `${goal.hierarchyId}.1`,
      description: 'New Child Goal',
      goalType: 'Micro',
      done: false,
      priority: 0,
      effectivePriority: 0,
      lastSelected: new Date().toISOString(),
      decayRate: 0.001,
      score: 0,
      assessment: 0,
      communityValue: 0,
      start: '',
      end: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Start editing immediately for new nodes
    setEditingNode(newNode);
  };

  const handleEditNode = (node: RawNodeDatum) => {
    const goal = node.data as Goal;
    setEditingNode(goal);
  };

  const handleSaveEdit = async () => {
    if (!editingNode) return;
    
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
      await fetch(`${API_URL}/goals/${editingNode._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description: editingNode.description,
          goalType: editingNode.goalType,
          done: editingNode.done,
          priority: editingNode.priority
        }),
      });
    } catch (error) {
      console.error('Error updating goal:', error);
      // TODO: Show error message to user
    }
  };

  return (
    <div className="tree-view">
      <div style={{ width: '100%', height: '800px', backgroundColor: '#f5f5f5' }}>
        {treeData ? (
          <Tree
            data={treeData}
            orientation="vertical"
            collapsible={true}
            translate={{ x: 400, y: 120 }}
            onNodeClick={handleNodeClick}
            renderCustomNodeElement={({ nodeDatum }) => {
              const goalType = nodeDatum.attributes?.Type as string;
              const borderColor = getBorderColor(goalType);
              const nodeId = nodeDatum.name;
              const isExpanded = expandedNodes.has(nodeId);
              const hasChildren = nodeChildrenMap.get(nodeId) || false;
              const isEditing = editingNode === nodeId;
              
              // Calculate text dimensions
              const canvas = document.createElement('canvas');
              const context = canvas.getContext('2d');
              if (!context) return null;
              context.font = '13px system-ui, -apple-system, sans-serif';
              
              // Calculate text width and height
              const words = nodeDatum.name.split(' ');
              let maxLineWidth = 0;
              let currentLineWidth = 0;
              let lines = 1;
              
              words.forEach(word => {
                const wordWidth = context.measureText(word + ' ').width;
                if (currentLineWidth + wordWidth > 200) {
                  lines++;
                  currentLineWidth = wordWidth;
                } else {
                  currentLineWidth += wordWidth;
                }
                maxLineWidth = Math.max(maxLineWidth, currentLineWidth);
              });
              
              // Dynamic size based on text
              const NODE_WIDTH = Math.max(100, Math.min(maxLineWidth + 4, 300)); // Just 4px padding
              const NODE_HEIGHT = Math.max(40, lines * 16 + 4);

              return (
                <g>
                  <foreignObject
                    x={-NODE_WIDTH/2}
                    y={-NODE_HEIGHT/2}
                    width={NODE_WIDTH}
                    height={NODE_HEIGHT}
                    style={{ overflow: 'visible' }}
                  >
                    <div 
                      style={{ 
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        padding: '2px',
                        boxSizing: 'border-box',
                        fontFamily: 'system-ui, -apple-system, sans-serif',
                        backgroundColor: isEditing ? '#f8f9fa' : 'white',
                        borderRadius: '3px',
                        border: `1px solid ${isEditing ? '#007bff' : borderColor}`,
                        boxShadow: isEditing ? '0 0 0 2px rgba(0,123,255,0.25)' : '0 1px 1px rgba(0,0,0,0.1)',
                        transition: 'all 0.2s ease',
                        position: 'relative',
                        cursor: isEditing ? 'text' : 'pointer'
                      }}
                      onClick={() => handleNodeClick({ data: nodeDatum })}
                      onContextMenu={(e) => handleContextMenu(e, nodeId)}
                    >
                      {isEditing ? (
                        <textarea
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyDown={handleEditKeyDown}
                          onBlur={handleEditSubmit}
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            width: '100%',
                            height: '100%',
                            border: 'none',
                            padding: '4px',
                            margin: '0',
                            fontSize: '13px',
                            fontFamily: 'inherit',
                            textAlign: 'center',
                            outline: 'none',
                            backgroundColor: 'transparent',
                            color: '#333',
                            resize: 'none',
                            overflow: 'hidden'
                          }}
                          autoFocus
                        />
                      ) : (
                        <div style={{ 
                          fontSize: '13px',
                          fontWeight: '400',
                          color: '#333',
                          textAlign: 'center',
                          whiteSpace: 'normal',
                          wordBreak: 'break-word',
                          maxWidth: '100%',
                          lineHeight: '16px'
                        }}>
                          {nodeDatum.name}
                        </div>
                      )}
                    </div>
                  </foreignObject>
                  {/* Collapse/Expand symbol */}
                  {hasChildren && (
                    <g 
                      transform={`translate(0, ${NODE_HEIGHT/2 + 10})`}
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleEdgeClick(nodeId)}
                    >
                      <circle
                        r="8"
                        fill="white"
                        stroke={borderColor}
                        strokeWidth="1"
                      />
                      <foreignObject
                        x="-8"
                        y="-8"
                        width="16"
                        height="16"
                        style={{ overflow: 'visible' }}
                      >
                        <div
                          style={{
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: borderColor,
                            fontSize: '12px',
                            fontWeight: 'bold',
                            fontFamily: 'system-ui, -apple-system, sans-serif',
                            lineHeight: '1',
                            textAlign: 'center'
                          }}
                        >
                          {isExpanded ? '−' : nodeDescendantCountMap.get(nodeId) || 0}
                        </div>
                      </foreignObject>
                    </g>
                  )}
                  {/* Add node button */}
                  <g 
                    transform={`translate(${NODE_WIDTH/2 + 10}, 0)`}
                    style={{ cursor: 'pointer' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddNode(nodeDatum.name, e);
                    }}
                  >
                    <circle
                      r="8"
                      fill="white"
                      stroke={borderColor}
                      strokeWidth="1"
                    />
                    <foreignObject
                      x="-8"
                      y="-8"
                      width="16"
                      height="16"
                      style={{ overflow: 'visible' }}
                    >
                      <div
                        style={{
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: borderColor,
                          fontSize: '12px',
                          fontWeight: 'bold',
                          fontFamily: 'system-ui, -apple-system, sans-serif',
                          lineHeight: '1',
                          textAlign: 'center'
                        }}
                      >
                        +
                      </div>
                    </foreignObject>
                  </g>
                </g>
              );
            }}
            pathFunc="step"
            separation={{ siblings: 2, nonSiblings: 2.5 }}
            nodeSize={{ x: 200, y: 100 }}
            shouldCollapseNeighborNodes={true}
          />
        ) : (
          <p>Loading tree data...</p>
        )}
      </div>
      {selectedNode && formPosition && (
        <AddNodeForm
          parentNode={selectedNode}
          onSave={handleSaveNode}
          onCancel={handleCancelAdd}
          position={formPosition}
        />
      )}
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
    </div>
  );
};

export default TreeView;
