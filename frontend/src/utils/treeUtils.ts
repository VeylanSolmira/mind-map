import type { TreeNode } from '../types/index';

export function buildTree(goals: TreeNode[]): TreeNode[] {
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
        // Parent not found - add to root
        tree.push(goalWithChildren);
      }
    } else {
      // This is a root goal
      tree.push(goalWithChildren);
    }
  });

  return tree;
} 