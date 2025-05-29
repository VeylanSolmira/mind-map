import { 
  buildNavigationTree, 
  generateNewHierarchyId, 
  getHierarchyPath, 
  hasChildren, 
  getAncestors,
  type TreeNavigationNode 
} from '../hierarchyUtils';
import type { Goal } from '../../types';

// Mock goal data for testing
const mockGoals: Goal[] = [
  {
    _id: '1',
    hierarchyId: '1',
    description: 'Root Goal 1',
    goalType: 'Overarching',
    done: false,
    priority: 1,
    effectivePriority: 1,
    lastSelected: '2024-01-01T00:00:00Z',
    decayRate: 0.001,
    score: 0,
    assessment: 0,
    communityValue: 0,
    start: '',
    end: '',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    _id: '2',
    hierarchyId: '1.1',
    description: 'Child Goal 1.1',
    goalType: 'Longterm',
    done: false,
    priority: 1,
    effectivePriority: 1,
    lastSelected: '2024-01-01T00:00:00Z',
    decayRate: 0.001,
    score: 0,
    assessment: 0,
    communityValue: 0,
    start: '',
    end: '',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    _id: '3',
    hierarchyId: '1.2',
    description: 'Child Goal 1.2',
    goalType: 'Moderate',
    done: false,
    priority: 1,
    effectivePriority: 1,
    lastSelected: '2024-01-01T00:00:00Z',
    decayRate: 0.001,
    score: 0,
    assessment: 0,
    communityValue: 0,
    start: '',
    end: '',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    _id: '4',
    hierarchyId: '1.1.1',
    description: 'Grandchild Goal 1.1.1',
    goalType: 'Micro',
    done: false,
    priority: 1,
    effectivePriority: 1,
    lastSelected: '2024-01-01T00:00:00Z',
    decayRate: 0.001,
    score: 0,
    assessment: 0,
    communityValue: 0,
    start: '',
    end: '',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    _id: '5',
    hierarchyId: '2',
    description: 'Root Goal 2',
    goalType: 'Overarching',
    done: false,
    priority: 1,
    effectivePriority: 1,
    lastSelected: '2024-01-01T00:00:00Z',
    decayRate: 0.001,
    score: 0,
    assessment: 0,
    communityValue: 0,
    start: '',
    end: '',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
];

describe('hierarchyUtils', () => {
  describe('buildNavigationTree', () => {
    it('should build a proper tree structure from flat goal array', () => {
      const tree = buildNavigationTree(mockGoals);
      
      expect(tree).toHaveLength(2); // Two root goals
      expect(tree[0].hierarchyId).toBe('1');
      expect(tree[0].children).toHaveLength(2); // 1.1 and 1.2
      expect(tree[0].children![0].hierarchyId).toBe('1.1');
      expect(tree[0].children![0].children).toHaveLength(1); // 1.1.1
      expect(tree[0].children![0].children![0].hierarchyId).toBe('1.1.1');
      expect(tree[1].hierarchyId).toBe('2');
      expect(tree[1].children).toHaveLength(0);
    });

    it('should handle empty goal array', () => {
      const tree = buildNavigationTree([]);
      expect(tree).toHaveLength(0);
    });

    it('should set correct level information', () => {
      const tree = buildNavigationTree(mockGoals);
      
      expect(tree[0].level).toBe(1); // Root level
      expect(tree[0].children![0].level).toBe(2); // Second level
      expect(tree[0].children![0].children![0].level).toBe(3); // Third level
    });
  });

  describe('generateNewHierarchyId', () => {
    it('should generate next root level ID when no parent', () => {
      const newId = generateNewHierarchyId(null, mockGoals);
      expect(newId).toBe('3'); // Next after 1 and 2
    });

    it('should generate next child ID for parent node', () => {
      const tree = buildNavigationTree(mockGoals);
      const parentNode = tree[0]; // Root goal "1"
      
      const newId = generateNewHierarchyId(parentNode, mockGoals);
      expect(newId).toBe('1.3'); // Next after 1.1 and 1.2
    });

    it('should generate first child ID for parent with no children', () => {
      const tree = buildNavigationTree(mockGoals);
      const parentNode = tree[1]; // Root goal "2" with no children
      
      const newId = generateNewHierarchyId(parentNode, mockGoals);
      expect(newId).toBe('2.1'); // First child
    });

    it('should handle deep nesting', () => {
      const tree = buildNavigationTree(mockGoals);
      const deepParent = tree[0].children![0]; // Goal "1.1"
      
      const newId = generateNewHierarchyId(deepParent, mockGoals);
      expect(newId).toBe('1.1.2'); // Next after 1.1.1
    });
  });

  describe('getHierarchyPath', () => {
    it('should return root level for null node', () => {
      const path = getHierarchyPath(null);
      expect(path).toBe('Root Level');
    });

    it('should format hierarchy path correctly', () => {
      const mockNode: TreeNavigationNode = {
        ...mockGoals[1], // 1.1
        children: [],
        level: 2
      };
      
      const path = getHierarchyPath(mockNode);
      expect(path).toBe('1 > 1 (Child Goal 1.1)');
    });

    it('should handle deep hierarchy paths', () => {
      const mockNode: TreeNavigationNode = {
        ...mockGoals[3], // 1.1.1
        children: [],
        level: 3
      };
      
      const path = getHierarchyPath(mockNode);
      expect(path).toBe('1 > 1 > 1 (Grandchild Goal 1.1.1)');
    });
  });

  describe('hasChildren', () => {
    it('should return true for node with children', () => {
      const tree = buildNavigationTree(mockGoals);
      const nodeWithChildren = tree[0]; // Root goal with children
      
      expect(hasChildren(nodeWithChildren)).toBe(true);
    });

    it('should return false for node without children', () => {
      const tree = buildNavigationTree(mockGoals);
      const nodeWithoutChildren = tree[1]; // Root goal without children
      
      expect(hasChildren(nodeWithoutChildren)).toBe(false);
    });

    it('should return false for leaf node', () => {
      const tree = buildNavigationTree(mockGoals);
      const leafNode = tree[0].children![0].children![0]; // 1.1.1
      
      expect(hasChildren(leafNode)).toBe(false);
    });
  });

  describe('getAncestors', () => {
    it('should return empty array for root level hierarchy', () => {
      const ancestors = getAncestors('1', mockGoals);
      expect(ancestors).toHaveLength(0);
    });

    it('should return correct ancestors for second level', () => {
      const ancestors = getAncestors('1.1', mockGoals);
      expect(ancestors).toHaveLength(1);
      expect(ancestors[0].hierarchyId).toBe('1');
    });

    it('should return correct ancestors for third level', () => {
      const ancestors = getAncestors('1.1.1', mockGoals);
      expect(ancestors).toHaveLength(2);
      expect(ancestors[0].hierarchyId).toBe('1');
      expect(ancestors[1].hierarchyId).toBe('1.1');
    });

    it('should handle missing ancestors gracefully', () => {
      const ancestors = getAncestors('1.3.1', mockGoals); // 1.3 doesn't exist
      expect(ancestors).toHaveLength(1);
      expect(ancestors[0].hierarchyId).toBe('1');
    });
  });

  describe('edge cases', () => {
    it('should handle unsorted input goals', () => {
      const unsortedGoals = [...mockGoals].reverse();
      const tree = buildNavigationTree(unsortedGoals);
      
      // Should still build correct tree structure
      expect(tree).toHaveLength(2);
      expect(tree[0].hierarchyId).toBe('1');
      expect(tree[0].children![0].hierarchyId).toBe('1.1');
    });

    it('should handle orphaned goals gracefully', () => {
      const goalsWithOrphan = [
        ...mockGoals,
        {
          ...mockGoals[0],
          _id: '6',
          hierarchyId: '5.1', // Parent "5" doesn't exist
          description: 'Orphaned Goal'
        }
      ];
      
      const tree = buildNavigationTree(goalsWithOrphan);
      
      // Orphaned goal should be added to root
      expect(tree).toHaveLength(3);
      expect(tree[2].hierarchyId).toBe('5.1');
    });
  });
}); 