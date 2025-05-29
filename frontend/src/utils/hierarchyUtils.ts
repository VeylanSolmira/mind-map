import type { Goal } from '../types';

export interface TreeNavigationNode extends Goal {
  children?: TreeNavigationNode[];
  level: number;
}

/**
 * Build a tree structure for navigation from flat goals array
 */
export function buildNavigationTree(goals: Goal[]): TreeNavigationNode[] {
  // Sort goals by hierarchyId to ensure parents are processed before children
  const sortedGoals = [...goals].sort((a, b) => {
    return a.hierarchyId.localeCompare(b.hierarchyId, undefined, { numeric: true, sensitivity: 'base' });
  });

  const goalMap = new Map<string, TreeNavigationNode>();
  const tree: TreeNavigationNode[] = [];

  // First pass: Create nodes with level information
  sortedGoals.forEach(goal => {
    const level = goal.hierarchyId.split('.').length;
    goalMap.set(goal.hierarchyId, { 
      ...goal, 
      children: [], 
      level 
    });
  });

  // Second pass: Build the tree structure
  sortedGoals.forEach(goal => {
    const node = goalMap.get(goal.hierarchyId)!;
    const hierarchyParts = goal.hierarchyId.split('.');
    
    if (hierarchyParts.length > 1) {
      // This is a child goal
      const parentHierarchyId = hierarchyParts.slice(0, -1).join('.');
      const parent = goalMap.get(parentHierarchyId);
      
      if (parent) {
        parent.children = parent.children || [];
        parent.children.push(node);
      } else {
        // Parent not found - add to root
        tree.push(node);
      }
    } else {
      // This is a root goal
      tree.push(node);
    }
  });

  return tree;
}

/**
 * Generate the next available hierarchy ID for a given parent
 */
export function generateNewHierarchyId(parentNode: TreeNavigationNode | null, existingGoals: Goal[]): string {
  if (!parentNode) {
    // Add to root level
    const rootGoals = existingGoals.filter(goal => !goal.hierarchyId.includes('.'));
    const maxRootNumber = rootGoals.reduce((max, goal) => {
      const number = parseInt(goal.hierarchyId);
      return isNaN(number) ? max : Math.max(max, number);
    }, 0);
    return String(maxRootNumber + 1);
  }

  // Add as child of parent
  const parentHierarchyId = parentNode.hierarchyId;
  const siblings = existingGoals.filter(goal => {
    const parts = goal.hierarchyId.split('.');
    const parentParts = parentHierarchyId.split('.');
    
    // Must be direct child (one level deeper)
    if (parts.length !== parentParts.length + 1) return false;
    
    // Must start with parent hierarchy
    const parentPrefix = parentParts.join('.');
    return goal.hierarchyId.startsWith(parentPrefix + '.');
  });

  const maxChildNumber = siblings.reduce((max, sibling) => {
    const parts = sibling.hierarchyId.split('.');
    const lastPart = parts[parts.length - 1];
    const number = parseInt(lastPart);
    return isNaN(number) ? max : Math.max(max, number);
  }, 0);

  return `${parentHierarchyId}.${maxChildNumber + 1}`;
}

/**
 * Get the display path for a hierarchy ID
 */
export function getHierarchyPath(node: TreeNavigationNode | null): string {
  if (!node) return 'Root Level';
  
  const parts = node.hierarchyId.split('.');
  return `${parts.join(' > ')} (${node.description})`;
}

/**
 * Check if a node has children
 */
export function hasChildren(node: TreeNavigationNode): boolean {
  return Boolean(node.children && node.children.length > 0);
}

/**
 * Get all ancestors of a node
 */
export function getAncestors(hierarchyId: string, allGoals: Goal[]): Goal[] {
  const parts = hierarchyId.split('.');
  const ancestors: Goal[] = [];
  
  for (let i = 1; i < parts.length; i++) {
    const ancestorId = parts.slice(0, i).join('.');
    const ancestor = allGoals.find(goal => goal.hierarchyId === ancestorId);
    if (ancestor) {
      ancestors.push(ancestor);
    }
  }
  
  return ancestors;
} 