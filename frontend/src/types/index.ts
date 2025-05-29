export interface Goal {
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
  decayRate?: number;
  effectivePriority?: number;
  createdAt?: string;
  updatedAt?: string;
  link?: string;
  summary?: string;
  autoIngest?: boolean;
  tier?: string;
  domain?: string;
  subtopic?: string;
  tags?: string[];
  next_action_date?: string;
  action_note?: string;
  date_added?: string;
  lastSelected?: string;
}

export interface TreeNode extends Goal {
  children?: TreeNode[];
} 