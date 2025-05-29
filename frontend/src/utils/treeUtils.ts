import { TreeNode } from '../types';

export function buildTree(goals: TreeNode[]): TreeNode[] {
  console.log('Building tree from goals:', goals);
  
  // Sort goals by hierarchyId to ensure parents are processed before children
  const sortedGoals = [...goals].sort((a, b) => {
    const aParts = a.hierarchyId?.split('.') || [];
    const bParts = b.hierarchyId?.split('.') || [];
    return aParts.length - bParts.length;
  });

  console.log('Sorted goals:', sortedGoals.map(g => ({ _id: g._id, hierarchyId: g.hierarchyId })));

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